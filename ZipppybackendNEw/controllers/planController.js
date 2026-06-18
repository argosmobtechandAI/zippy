import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';
import { instance } from '../razorpay.js';
import dotenv from 'dotenv';
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
    const userId = req.userId
    const { data } = req.body;
    const { planId } = data;

    try {
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const amount = plan[0].amount;
        const currency = 'INR';
        const receipt = `order_${Date.now()}`;

        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const options = {
            amount,
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
    const userId = req.userId
    const { data } = req.body;
    const { orderId, paymentId, planId } = data;

    try {
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (userError || !user || !user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (orderId && paymentId) {
            const revenue = {
                amount: plan[0].amount,
                type: "plan",
                date: new Date(),
                purchaserId: userId,
                purchaseType: "plan",
                planId: planId,
                plan_key: paymentId,
                status: "Active",
                end_date: addMonths(new Date(), Number(plan[0].validity)),
            }

            // Payment is verified
            // Create the subscription
            const { data: subscription, error: subError } = await supabase.from('revenue').insert(revenue).select();
            if (subError || !subscription || !subscription.length) {
                return res.status(500).json({ success: false, message: 'Failed to create subscription' });
            }

            res.status(200).json({ success: true, subscription: subscription[0] });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
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