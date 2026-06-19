import { supabase } from '../../../../supabaseClient.js';
import { instance } from '../../../../razorpay.js';
import { auth } from '../../../../middleware/auth.js';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = req.userId;
    const { data } = req.body;
    const { levelId, pricingOption, couponCode, useWallet } = data; // pricingOption: 'weekdaysPrice', 'weekendPrice', 'monthlyPrice'

    try {
        const { data: level, error: levelError } = await supabase.from('levels').select('*').eq('id', levelId).limit(1);
        if (levelError || !level || !level.length) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        
        let amount = 0;
        let originalAmount = 0;
        if (pricingOption === 'weekdaysPrice') { amount = level[0].weekdays_price; originalAmount = level[0].weekdays_price; }
        else if (pricingOption === 'weekendPrice') { amount = level[0].weekend_price; originalAmount = level[0].weekend_price; }
        else if (pricingOption === 'monthlyPrice') { amount = level[0].monthly_price; originalAmount = level[0].monthly_price; }

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Invalid pricing option or amount is zero.' });
        }

        // Apply Coupon
        if (couponCode) {
            const { data: coupons } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).limit(1);
            if (coupons && coupons.length > 0) {
                const appliedCoupon = coupons[0];
                let discount = appliedCoupon.discount_type === 'percentage' 
                    ? (amount * appliedCoupon.discount_value) / 100 
                    : appliedCoupon.discount_value;
                amount = Math.max(0, amount - discount);
            }
        }

        // Apply Wallet
        if (useWallet) {
            const { data: rider } = await supabase.from('rider').select('wallet').eq('user_id', userId).limit(1);
            const walletBalance = rider && rider.length > 0 ? (rider[0].wallet || 0) : 0;
            const walletDeduction = Math.min(walletBalance, amount);
            amount = Math.max(0, amount - walletDeduction);
        }

        if (amount === 0) {
            return res.status(200).json({ success: true, bypassedRazorpay: true, levelDetails: { amount: originalAmount, name: level[0].name } });
        }

        const currency = 'INR';
        const receipt = `order_lvl_${Date.now()}`;

        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const options = {
            amount: amount * 100, // Razorpay takes amount in paise
            currency,
            receipt,
        };
        const order = await instance.orders.create(options);
        
        // Pass the actual database amount to the frontend so we don't have to divide by 100 on frontend for saving if needed
        res.status(200).json({ 
            success: true, 
            order: { 
                ...order, 
                razorpayKeyId: process.env.RAZORPAY_KEY_ID, 
                userName: user[0].name, 
                userEmail: user[0].email, 
                userPhone: user[0].mobile 
            },
            levelDetails: {
                id: level[0].id,
                name: level[0].name,
                amount: amount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}
