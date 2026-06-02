import { supabase } from '../supabaseClient.js';

export const getRider = async (req, res) => {
    const userId = req.userId;

    console.log("Fetching rider for userId:", userId);

    try {
        const { data: rider, error } = await supabase
            .from('rider')
            .select('*')
            .eq('user_id', userId)
            .limit(1);

        if (error || !rider || rider.length === 0) {
            return res.status(404).json({
                message: 'Rider not found',
                success: false
            });
        }

        const planLastDate = rider[0].plan_end_date || rider[0].planEndDate;

        if (planLastDate) {
            const lastDate = new Date(planLastDate).getTime();
            const currentDate = Date.now();

            console.log("Last:", lastDate, "Current:", currentDate);

            // Expired
            if (lastDate < currentDate) {
                await supabase
                    .from('rider')
                    .update({
                        session_count: 0,
                        plan_end_date: null,
                    })
                    .eq('user_id', userId);

                await supabase.from('revenue').update({ status: "expired" }).eq('purchaser_id', userId);
            }
        }

        return res.status(200).json({
            rider: rider[0],
            message: 'Rider fetched successfully',
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Error: ${error.message}`,
            success: false
        });
    }
};

export const enrollPack = async (req, res) => {
    const userId = req.userId;
    const { planId, paymentEndDate } = req.body.data;

    try {
        // 1. Get Plan Details
        const { data: plan, error: planError } = await supabase.from('plan').select('*').eq('id', planId).limit(1);
        if (planError || !plan || !plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const p = plan[0];

        // 2. Get Rider Details
        const { data: rider, error: riderError } = await supabase.from('rider').select('*').eq('user_id', userId).limit(1);
        if (riderError || !rider || !rider.length) {
            return res.status(404).json({ success: false, message: 'Rider record not found' });
        }

        // 3. Update Rider Plan and Session Count
        const currentPlans = rider[0].plan || [];
        const plans = [...currentPlans, p];
        const sessionsCount = (rider[0].session_count || rider[0].sessionCount || 0) + (p.sessions_count || p.sessionsCount || 0);
        
        const { data: updatedRider, error: updateError } = await supabase
            .from('rider')
            .update({
                plan: plans,
                session_count: sessionsCount,
                plan_end_date: paymentEndDate,
            })
            .eq('user_id', userId)
            .select();

        if (updateError || !updatedRider || !updatedRider.length) {
            throw new Error('Failed to update rider');
        }

        // 4. Send Confirmation Notification
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Plan Enrolled Successfully!",
            desc: `You are now enrolled in the ${p.name} pack with ${p.sessions_count || p.sessionsCount || 0} sessions.`,
            type: 'success',
            time: "Just Now",
            unread: true,
            date: new Date().toISOString()
        };

        const { data: user } = await supabase.from('users').select('notifications').eq('id', userId).limit(1);
        if (user && user.length > 0) {
            const notifs = user[0].notifications || [];
            await supabase.from('users').update({ notifications: [...notifs, notification] }).eq('id', userId);
        }

        return res.status(200).json({
            success: true,
            message: `Successfully enrolled in ${p.name}`,
            rider: updatedRider[0]
        });

    } catch (error) {
        console.error("Enrollment error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};