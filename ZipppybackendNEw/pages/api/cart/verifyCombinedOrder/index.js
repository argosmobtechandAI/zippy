import { supabase } from '../../../../supabaseClient.js';
import { instance } from '../../../../razorpay.js';
import { auth } from '../../../../middleware/auth.js';
import crypto from 'crypto';

/**
 * POST /api/cart/verifyCombinedOrder
 *
 * Body (wrapped in `data`):
 *   orderId       - Razorpay order ID (or 'bypassed_...' for wallet-only)
 *   paymentId     - Razorpay payment ID (or 'wallet_...' for wallet-only)
 *   signature     - Razorpay signature (or 'bypassed' for wallet-only)
 *   planId?       - Membership plan ID (optional)
 *   levelId?      - Rider level ID (optional)
 *   pricingOption - Required when levelId is present
 *   couponCode?   - Applied coupon code
 *   useWallet?    - Whether wallet was toggled on
 *
 * On success:
 *   - Verifies Razorpay signature (skipped for wallet-only)
 *   - Deducts wallet balance (if used)
 *   - Increments coupon used_count (if used)
 *   - Activates plan on rider (or queues if advance renewal)
 *   - Activates level on rider
 *   - Inserts revenue record(s)
 *   - Inserts payment log
 *
 * Response: { success: true }
 */
export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = req.userId;
    const { data } = req.body;
    const { orderId, paymentId, signature, planId, levelId, pricingOption, couponCode, useWallet } = data || {};

    if (!planId && !levelId) {
        return res.status(400).json({ success: false, message: 'At least one of planId or levelId is required.' });
    }

    try {
        // ── Load Resources ────────────────────────────────────────────────────
        let plan = null;
        let level = null;
        let planOriginalAmount = 0;
        let levelOriginalAmount = 0;

        if (planId) {
            const { data: planData, error: planError } = await supabase
                .from('plan')
                .select('*')
                .eq('id', planId)
                .limit(1);
            if (planError || !planData || !planData.length) {
                return res.status(404).json({ success: false, message: 'Plan not found.' });
            }
            plan = planData[0];
            planOriginalAmount = Number(plan.amount) || 0;
        }

        if (levelId) {
            const { data: levelData, error: levelError } = await supabase
                .from('levels')
                .select('*')
                .eq('id', levelId)
                .limit(1);
            if (levelError || !levelData || !levelData.length) {
                return res.status(404).json({ success: false, message: 'Level not found.' });
            }
            level = levelData[0];

            if (pricingOption === 'weekdaysPrice') levelOriginalAmount = level.weekdays_price || 0;
            else if (pricingOption === 'weekendPrice') levelOriginalAmount = level.weekend_price || 0;
            else if (pricingOption === 'monthlyPrice') levelOriginalAmount = level.monthly_price || 0;

            if (!levelOriginalAmount) {
                return res.status(400).json({ success: false, message: 'Invalid pricingOption or amount is zero.' });
            }
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const { data: rider, error: riderError } = await supabase
            .from('rider')
            .select('*')
            .eq('user_id', userId)
            .limit(1);

        const walletBalance = rider && rider.length > 0 ? (rider[0].wallet || 0) : 0;

        // ── Recalculate amounts (mirrors createCombinedOrder) ─────────────────
        let combinedTotal = planOriginalAmount + levelOriginalAmount;
        let discount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const { data: coupons } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('status', 'ACTIVE')
                .limit(1);

            if (coupons && coupons.length > 0) {
                const coupon = coupons[0];
                const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                if (!isExpired) {
                    appliedCoupon = coupon;
                    discount = coupon.discount_type === 'percentage'
                        ? (combinedTotal * coupon.discount_value) / 100
                        : coupon.discount_value;
                    combinedTotal = Math.max(0, combinedTotal - discount);
                }
            }
        }

        let walletDeduction = 0;
        if (useWallet) {
            walletDeduction = Math.min(walletBalance, combinedTotal);
            combinedTotal = Math.max(0, combinedTotal - walletDeduction);
        }

        const finalAmount = combinedTotal;

        // ── Verify Razorpay Signature (skip for bypassed / wallet-only) ───────
        const isBypassed = signature === 'bypassed' || finalAmount === 0;
        if (!isBypassed) {
            if (!orderId || !paymentId || !signature) {
                return res.status(400).json({ success: false, message: 'Missing Razorpay payment details.' });
            }
            const body = `${orderId}|${paymentId}`;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
            }
        }

        const actualPaymentId = paymentId || `wallet_${Date.now()}`;
        const actualOrderId   = orderId   || `bypassed_${Date.now()}`;

        // Determine payment method
        let paymentMethod = 'wallet';
        if (!isBypassed && paymentId) {
            try {
                const paymentDetails = await instance.payments.fetch(paymentId);
                paymentMethod = paymentDetails.method || 'razorpay';
            } catch {
                paymentMethod = 'razorpay';
            }
        }

        // ── Side-effects ──────────────────────────────────────────────────────

        // 1. Deduct wallet
        if (useWallet && walletDeduction > 0) {
            await supabase
                .from('rider')
                .update({ wallet: walletBalance - walletDeduction })
                .eq('user_id', userId);
        }

        // 2. Increment coupon usage
        if (appliedCoupon) {
            await supabase
                .from('coupons')
                .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
                .eq('id', appliedCoupon.id);
        }

        // 3. Activate / queue Plan
        // Track what session count the rider will have AFTER plan activation
        // so the level step below can safely stack on top.
        let sessionCountAfterPlan = rider && rider.length > 0
            ? (rider[0].session_count || rider[0].sessionCount || 0)
            : 0;

        if (plan && !riderError && rider && rider.length > 0) {
            const riderRow = rider[0];
            const now = new Date();

            // Check if advance renewal (current plan not yet expired)
            const currentEndDate = riderRow.plan_end_date ? new Date(riderRow.plan_end_date) : null;
            const isAdvanceRenewal = currentEndDate && currentEndDate > now;

            if (isAdvanceRenewal) {
                // Queue the plan — sessions not added yet (will be added when plan activates at month-end)
                await supabase.from('queued_plans').insert({
                    user_id: userId,
                    plan_id: planId,
                    plan_type: 'monthly_plan',
                    status: 'Queued',
                });
                // sessionCountAfterPlan stays unchanged (plan is queued, not active)
            } else {
                // Activate immediately
                const currentPlans = Array.isArray(riderRow.plan)
                    ? riderRow.plan
                    : riderRow.plan ? [riderRow.plan] : [];
                const updatedPlans = [...currentPlans, plan];

                const existingSessions = riderRow.session_count || riderRow.sessionCount || 0;
                const newSessions = plan.sessions_count || plan.sessionsCount || 0;

                let monthsToAdd = 1;
                if (!isNaN(Number(plan.validity))) monthsToAdd = Number(plan.validity);

                const planEndDate = addMonths(now, monthsToAdd).toISOString();

                await supabase.from('rider').update({
                    plan: updatedPlans,
                    session_count: existingSessions + newSessions,
                    plan_end_date: planEndDate,
                }).eq('user_id', userId);

                // Update our running count so level step sees the correct value
                sessionCountAfterPlan = existingSessions + newSessions;
            }

            // Revenue record for plan
            await supabase.from('revenue').insert({
                amount: planOriginalAmount,
                type: 'plan',
                date: new Date(),
                purchaserid: userId,
                purchasetype: 'cart_plan',
                planid: planId,
                plan_key: actualPaymentId,
                status: isAdvanceRenewal ? 'Queued' : 'Active',
                end_date: addMonths(new Date(), Number(plan.validity) || 1),
            });
        }

        // 4. Activate Level
        // Level is ALWAYS activated immediately (levels have no advance renewal / queue concept).
        // Sessions from the level are always stacked on top of whatever session count is current
        // (which already reflects the plan activation above via sessionCountAfterPlan).
        if (level && !riderError && rider && rider.length > 0) {
            const levelSessions = level.sessions || 0;

            const updatePayload = { level: level.name };
            if (levelSessions > 0) {
                updatePayload.session_count = sessionCountAfterPlan + levelSessions;
            }

            await supabase.from('rider')
                .update(updatePayload)
                .eq('user_id', userId);

            // Revenue record for level
            await supabase.from('revenue').insert({
                amount: levelOriginalAmount,
                type: 'level',
                date: new Date(),
                purchaserid: userId,
                purchasetype: 'cart_level',
                planid: levelId,
                plan_key: actualPaymentId,
                status: 'Active',
                end_date: null,
            });
        }

        // 5. Single payment log for the whole cart transaction
        const totalOriginalAmount = planOriginalAmount + levelOriginalAmount;
        await supabase.from('payments').insert({
            order_id: actualOrderId,
            payment_id: actualPaymentId,
            amount: totalOriginalAmount,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            wallet_amount_used: walletDeduction,
            payment_method: paymentMethod,
            status: 'captured',
            date: new Date().toISOString(),
            user_id: userId,
            // Store both IDs as JSON string in notes (payments table has plan_id col)
            plan_id: planId || levelId,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('verifyCombinedOrder error:', error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
