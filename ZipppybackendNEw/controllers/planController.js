import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';
import { instance } from '../razorpay.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export const createPlan = async (req, res) => {
    const { data } = req.body;
    try {
        const { data: newPlan, error } = await supabase.from('plan').insert(data).select();
        if (error || !newPlan || !newPlan.length) {
            return res.status(400).json({ success: false, message: 'Failed to create plan' });
        }
        res.status(201).json({ success: true, plan: newPlan[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getPlans = async (req, res) => {
    try {
        const { data: plans, error } = await supabase.from('plan').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, plans: plans || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const bootstrapPlans = async (req, res) => {
    try {
        const { data: existingPlans, error } = await supabase.from('plan').select('*');
        if (error) throw error;

        if (!existingPlans || existingPlans.length === 0) {
            const defaultPlans = [
                {
                    name: 'Beginner Pack',
                    sessions_count: 8,
                    validity: 'month',
                    amount: 100,
                    level: 'Beginner',
                    rules: ["8 professional sessions", "Basic stable access", "Equine care intro"]
                },
                {
                    name: 'Intermediate Pack',
                    sessions_count: 12,
                    validity: 'month',
                    amount: 150,
                    level: 'Intermediate',
                    rules: ["12 advanced sessions", "Full stable access", "Competition prep"]
                },
                {
                    name: 'Elite Pack',
                    sessions_count: 24,
                    validity: 'month',
                    amount: 300,
                    level: 'Advanced',
                    rules: ["24 elite sessions", "Unlimited stable access", "Tournament entry"]
                }
            ];
            await supabase.from('plan').insert(defaultPlans);
            return res.status(200).json({ success: true, message: 'Plans bootstrapped successfully' });
        }
        res.status(200).json({ success: true, message: 'Plans already exist' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Bootstrap failed: ${error.message}` });
    }
};

export const getPlanById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: plan, error } = await supabase.from('plan').select('*').eq('id', id).limit(1);
        if (error || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, plan: plan[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updatePlan = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const { data: updatedPlan, error } = await supabase.from('plan').update(data).eq('id', id).select();
        if (error || !updatedPlan || !updatedPlan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, plan: updatedPlan[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: deletedPlan, error } = await supabase.from('plan').delete().eq('id', id).select();
        if (error || !deletedPlan || !deletedPlan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, plan: deletedPlan[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const createRazorPayOrder = async (req, res) => {
    const userId = req.userId;
    const { data } = req.body;
    const { planId, couponCode, useWallet } = data;

    try {
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        let amount = plan[0].amount;

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
            return res.status(200).json({ success: true, bypassedRazorpay: true });
        }

        const currency = 'INR';
        const receipt = `order_${Date.now()}`;

        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const options = {
            amount: amount * 100,
            currency,
            receipt,
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order: { ...order, razorpayKeyId: process.env.RAZORPAY_KEY_ID, userName: user[0].name, userEmail: user[0].email, userPhone: user[0].mobile } });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months)
    return result;
};

export const verifyRazorPayOrder = async (req, res) => {
    const userId = req.userId;
    const { data } = req.body;
    const { orderId, paymentId, signature, planId, couponCode, useWallet } = data;

    try {
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate amount to deduct wallet and coupon
        let originalAmount = plan[0].amount;
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

        // Verify Razorpay signature if amount > 0
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

        let baseDate = new Date();
        let isAdvanceRenewal = false;
        if (!riderError && rider && rider.length > 0 && rider[0].plan_end_date) {
            const currentEndDate = new Date(rider[0].plan_end_date);
            if (currentEndDate > baseDate) {
                isAdvanceRenewal = true;
            }
        }

        const revenue = {
            amount: originalAmount,
            type: "plan",
            date: new Date(),
            purchaserid: userId,
            purchasetype: "plan",
            planid: planId,
            plan_key: actualPaymentId,
            status: isAdvanceRenewal ? "Queued" : "Active",
            end_date: addMonths(new Date(), Number(plan[0].validity)),
        };

        // Proceed to update rider
        if (useWallet && walletDeduction > 0) {
            await supabase.from('rider').update({ wallet: walletBalance - walletDeduction }).eq('user_id', userId);
        }

        if (appliedCoupon) {
            await supabase.from('coupons').update({ used_count: (appliedCoupon.used_count || 0) + 1 }).eq('id', appliedCoupon.id);
        }

        if (!riderError && rider && rider.length > 0) {
            if (isAdvanceRenewal) {
                // Queue the plan
                await supabase.from('queued_plans').insert({
                    user_id: userId,
                    plan_id: planId,
                    plan_type: 'monthly_plan',
                    status: 'Queued'
                });
            } else {
                // Activate immediately
                const currentPlans = Array.isArray(rider[0].plan) ? rider[0].plan : (rider[0].plan ? [rider[0].plan] : []);
                const plans = [...currentPlans, plan[0]];
                const sessionsCount = (rider[0].session_count || rider[0].sessionCount || 0) + (plan[0].sessions_count || plan[0].sessionsCount || 0);
                
                let monthsToAdd = 1;
                if (!isNaN(Number(plan[0].validity))) {
                    monthsToAdd = Number(plan[0].validity);
                }
                
                const paymentEndDate = addMonths(new Date(), monthsToAdd).toISOString();

                await supabase.from('rider').update({
                    plan: plans,
                    session_count: sessionsCount,
                    plan_end_date: paymentEndDate
                }).eq('user_id', userId);
            }
        }

        // Create the subscription / revenue
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
            plan_id: planId
        });

        res.status(200).json({ success: true, subscription: subscription[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const assignPlanToRider = async (req, res) => {
    const { data } = req.body;
    const { userId, planId, startDate } = data;

    try {
        // Fetch plan
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        // Fetch user
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const selectedPlan = plan[0];
        const validityMonths = Number(selectedPlan.validity) || 1;
        const start = startDate ? new Date(startDate) : new Date();
        const endDate = addMonths(start, validityMonths);
        const endDateStr = endDate.toISOString().split('T')[0];

        // Update rider record with plan info + session count (only if session count is defined in the plan)
        const updateData = {
            plan: selectedPlan,
            plan_end_date: endDateStr
        };
        if (selectedPlan.sessions_count !== undefined && selectedPlan.sessions_count !== null && selectedPlan.sessions_count !== '') {
            const parsedSessions = Number(selectedPlan.sessions_count);
            if (!isNaN(parsedSessions) && parsedSessions > 0) {
                updateData.session_count = parsedSessions;
            }
        }

        const { error: riderUpdateError } = await supabase
            .from('rider')
            .update(updateData)
            .eq('user_id', userId);

        if (riderUpdateError) throw riderUpdateError;

        // Create revenue record (free admin assignment - amount 0)
        await supabase.from('revenue').insert({
            amount: 0,
            type: 'plan',
            date: new Date().toISOString(),
            purchaserId: userId,
            purchaseType: 'admin_assign',
            planId: planId,
            plan_key: `admin_${Date.now()}`,
            status: 'Active',
            end_date: endDateStr
        });

        // Add payment log for admin plan assignment
        await supabase.from('payments').insert({
            order_id: `admin_plan_${Date.now()}`,
            amount: 0,
            status: 'captured',
            date: new Date().toISOString(),
            user_id: userId,
            plan_id: planId,
            payment_method: 'admin',
            coupon_code: null,
            wallet_amount_used: 0
        });

        return res.status(200).json({
            success: true,
            message: `Plan "${selectedPlan.name}" assigned successfully`,
            planEndDate: endDateStr,
            plan: selectedPlan
        });
    } catch (error) {
        console.error('ASSIGN PLAN ERROR:', error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};