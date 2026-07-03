import { supabase } from '../../../../supabaseClient.js';
import { instance } from '../../../../razorpay.js';
import { auth } from '../../../../middleware/auth.js';

/**
 * POST /api/cart/createCombinedOrder
 *
 * Body (wrapped in `data`):
 *   planId?       - Membership plan ID (optional)
 *   levelId?      - Rider level ID (optional)
 *   pricingOption - Required when levelId is provided ('weekdaysPrice' | 'weekendPrice' | 'monthlyPrice')
 *   couponCode?   - Coupon code to apply against the combined total
 *   useWallet?    - Boolean: deduct from rider wallet
 *
 * At least one of planId or levelId must be supplied.
 *
 * Response:
 *   { success: true, order: { ...razorpayOrder, razorpayKeyId, userName, userEmail, userPhone } }
 *   OR
 *   { success: true, bypassedRazorpay: true }  — when wallet / coupon covers the full amount
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
    const { planId, levelId, pricingOption, couponCode, useWallet } = data || {};

    if (!planId && !levelId) {
        return res.status(400).json({ success: false, message: 'At least one of planId or levelId is required.' });
    }

    try {
        let planAmount = 0;
        let levelAmount = 0;

        // ── Fetch Plan ────────────────────────────────────────────────────────
        if (planId) {
            const { data: plan, error: planError } = await supabase
                .from('plan')
                .select('*')
                .eq('id', planId)
                .limit(1);

            if (planError || !plan || !plan.length) {
                return res.status(404).json({ success: false, message: 'Plan not found.' });
            }
            planAmount = Number(plan[0].amount) || 0;
        }

        // ── Fetch Level ───────────────────────────────────────────────────────
        if (levelId) {
            if (!pricingOption) {
                return res.status(400).json({ success: false, message: 'pricingOption is required when levelId is provided.' });
            }

            const { data: level, error: levelError } = await supabase
                .from('levels')
                .select('*')
                .eq('id', levelId)
                .limit(1);

            if (levelError || !level || !level.length) {
                return res.status(404).json({ success: false, message: 'Level not found.' });
            }

            if (pricingOption === 'weekdaysPrice') levelAmount = level[0].weekdays_price || 0;
            else if (pricingOption === 'weekendPrice') levelAmount = level[0].weekend_price || 0;
            else if (pricingOption === 'monthlyPrice') levelAmount = level[0].monthly_price || 0;

            if (!levelAmount) {
                return res.status(400).json({ success: false, message: 'Invalid pricingOption or level price is zero.' });
            }
        }

        let combinedTotal = planAmount + levelAmount;

        // ── Apply Coupon (on combined total) ──────────────────────────────────
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
                    const discount = coupon.discount_type === 'percentage'
                        ? (combinedTotal * coupon.discount_value) / 100
                        : coupon.discount_value;
                    combinedTotal = Math.max(0, combinedTotal - discount);
                }
            }
        }

        // ── Apply Wallet ──────────────────────────────────────────────────────
        if (useWallet) {
            const { data: rider } = await supabase
                .from('rider')
                .select('wallet')
                .eq('user_id', userId)
                .limit(1);

            const walletBalance = rider && rider.length > 0 ? (rider[0].wallet || 0) : 0;
            const walletDeduction = Math.min(walletBalance, combinedTotal);
            combinedTotal = Math.max(0, combinedTotal - walletDeduction);
        }

        // ── Bypass Razorpay if nothing left to pay ────────────────────────────
        if (combinedTotal === 0) {
            return res.status(200).json({ success: true, bypassedRazorpay: true });
        }

        // ── Fetch user for Razorpay prefill ───────────────────────────────────
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, email, mobile')
            .eq('id', userId)
            .limit(1);

        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // ── Create Razorpay Order ─────────────────────────────────────────────
        const options = {
            amount: Math.round(combinedTotal) * 100, // paise
            currency: 'INR',
            receipt: `cart_order_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        return res.status(200).json({
            success: true,
            order: {
                ...order,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
                userName:  user[0].name,
                userEmail: user[0].email,
                userPhone: user[0].mobile,
            },
        });
    } catch (error) {
        console.error('createCombinedOrder error:', error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}
