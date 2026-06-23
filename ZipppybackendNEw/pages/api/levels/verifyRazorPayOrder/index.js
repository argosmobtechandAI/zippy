import { supabase } from '../../../../supabaseClient.js';
import { auth } from '../../../../middleware/auth.js';
import crypto from 'crypto';

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months)
    return result;
};

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = req.userId;
    const { data } = req.body;
    const { orderId, paymentId, signature, levelId, pricingOption, couponCode, useWallet } = data;

    try {
        const { data: level, error: levelError } = await supabase.from('levels').select('*').eq('id', levelId).limit(1);
        if (levelError || !level || !level.length) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let originalAmount = 0;
        if (pricingOption === 'weekdaysPrice') { originalAmount = level[0].weekdays_price; }
        else if (pricingOption === 'weekendPrice') { originalAmount = level[0].weekend_price; }
        else if (pricingOption === 'monthlyPrice') { originalAmount = level[0].monthly_price; }

        if (!originalAmount) {
            return res.status(400).json({ success: false, message: 'Invalid pricing option' });
        }

        // Calculate final amount
        let finalAmount = originalAmount;
        let discount = 0;
        let appliedCoupon = null;
        
        if (couponCode) {
            const { data: coupons } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).limit(1);
            if (coupons && coupons.length > 0) {
                appliedCoupon = coupons[0];
                discount = appliedCoupon.discount_type === 'percentage' 
                    ? (finalAmount * appliedCoupon.discount_value) / 100 
                    : appliedCoupon.discount_value;
                finalAmount = Math.max(0, finalAmount - discount);
            }
        }

        const { data: rider, error: riderError } = await supabase.from('rider').select('*').eq('user_id', userId).limit(1);
        let walletBalance = rider && rider.length > 0 ? (rider[0].wallet || 0) : 0;
        let walletDeduction = 0;

        if (useWallet) {
            walletDeduction = Math.min(walletBalance, finalAmount);
            finalAmount = Math.max(0, finalAmount - walletDeduction);
        }

        if (finalAmount > 0) {
            if (!orderId || !paymentId || !signature) {
                return res.status(400).json({ success: false, message: 'Missing razorpay details' });
            }
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                            .update(body.toString())
                                            .digest('hex');
                                            
            if (expectedSignature !== signature) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }
        }

        const actualPaymentId = paymentId || `wallet_${Date.now()}`;
        const actualOrderId = orderId || `bypassed_${Date.now()}`;

        let paymentMethod = 'wallet';
        if (finalAmount > 0 && paymentId) {
            try {
                const paymentDetails = await instance.payments.fetch(paymentId);
                paymentMethod = paymentDetails.method || 'unknown';
            } catch (err) {
                console.error("Failed to fetch payment details:", err);
                paymentMethod = 'razorpay';
            }
        }

        const revenue = {
            amount: originalAmount,
            type: "level",
            date: new Date(),
            purchaserid: userId,
            purchasetype: "level",
            planid: levelId,
            plan_key: actualPaymentId,
            status: "Active",
            end_date: null,
        };

        // Proceed to update rider wallet
        if (useWallet && walletDeduction > 0) {
            await supabase.from('rider').update({ wallet: walletBalance - walletDeduction }).eq('user_id', userId);
        }

        if (appliedCoupon) {
            await supabase.from('coupons').update({ used_count: (appliedCoupon.used_count || 0) + 1 }).eq('id', appliedCoupon.id);
        }

        if (!riderError && rider && rider.length > 0) {
            const sessionsCount = (rider[0].session_count || rider[0].sessionCount || 0) + (level[0].sessions || 0);

            await supabase.from('rider').update({
                level: level[0].name,
                session_count: sessionsCount
            }).eq('user_id', userId);
        }

        // Create revenue record
        const { data: subscription, error: subError } = await supabase.from('revenue').insert(revenue).select();
        if (subError || !subscription || !subscription.length) {
            return res.status(500).json({ success: false, message: 'Failed to create subscription' });
        }

        // Log raw payment details
        await supabase.from('payments').insert({
            order_id: actualOrderId,
            payment_id: actualPaymentId,
            amount: originalAmount,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            wallet_amount_used: walletDeduction,
            payment_method: paymentMethod,
            status: 'captured',
            date: new Date().toISOString(),
            user_id: userId,
            plan_id: levelId
        });

        res.status(200).json({ success: true, subscription: subscription[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}
