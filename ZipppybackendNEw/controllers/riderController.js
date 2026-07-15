import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';

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
            const lastDate = new Date(planLastDate);
            // Set to end of the expiration day to prevent premature expiration
            lastDate.setHours(23, 59, 59, 999);
            const lastDateTime = lastDate.getTime();
            const currentDate = Date.now();

            console.log("Last:", lastDateTime, "Current:", currentDate);

            // Expired
            if (lastDateTime < currentDate) {
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
    const { planId } = req.body.data;

    const addMonths = (date, months) => {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    };

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

        // 3. Wallet Check
        const walletBalance = rider[0].wallet || 0;
        const planAmount = p.amount || 0;

        if (walletBalance < planAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        const newWalletBalance = walletBalance - planAmount;

        // 4. Update Rider Plan and Session Count
        const currentPlans = Array.isArray(rider[0].plan) ? rider[0].plan : (rider[0].plan ? [rider[0].plan] : []);
        const plans = [...currentPlans, p];
        const sessionsCount = (rider[0].session_count || rider[0].sessionCount || 0) + (p.sessions_count || p.sessionsCount || 0);
        
        let monthsToAdd = 1;
        if (!isNaN(Number(p.validity))) {
            monthsToAdd = Number(p.validity);
        }
        const paymentEndDate = addMonths(new Date(), monthsToAdd).toISOString();

        const { data: updatedRider, error: updateError } = await supabase
            .from('rider')
            .update({
                plan: plans,
                session_count: sessionsCount,
                plan_end_date: paymentEndDate,
                wallet: newWalletBalance
            })
            .eq('user_id', userId)
            .select();

        if (updateError || !updatedRider || !updatedRider.length) {
            throw new Error('Failed to update rider');
        }

        // 4. Create Revenue Record
        const revenue = {
            amount: p.amount,
            type: "plan",
            date: new Date(),
            purchaserId: userId,
            purchaseType: "plan",
            planId: planId,
            plan_key: `wallet_${Date.now()}`,
            status: "Active",
            end_date: paymentEndDate,
        };

        const { error: revenueError } = await supabase.from('revenue').insert(revenue);
        if (revenueError) {
            console.error("Failed to insert revenue record:", revenueError);
        }

        // 5. Send Confirmation Notification
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Plan Enrolled Successfully!",
            desc: `You are now enrolled in the ${p.name} pack with ${p.sessions_count || p.sessionsCount || 0} sessions.`,
            type: 'success',
            time: "Just Now",
            unread: true,
            date: new Date().toISOString()
        };

        const { data: user } = await supabase.from('users').select('name, notifications').eq('id', userId).limit(1);
        if (user && user.length > 0) {
            const notifs = user[0].notifications || [];
            await supabase.from('users').update({ notifications: [...notifs, notification] }).eq('id', userId);
                        await sendPushToUser(userId, notification.title, notification.desc, { type: notification.type });

            // Send admin notification
            try {
                const userName = user[0].name || "A rider";
                await supabase.from('admin_notifications').insert({
                    title: "💰 New Plan Purchase",
                    desc: `${userName} purchased the "${p.name}" plan.`,
                    type: "plan"
                });
            } catch (adminNotifError) {
                console.error("Admin notification failed on plan buy:", adminNotifError);
            }
        }

        return res.status(200).json({
            success: true,
            message: `Successfully enrolled in ${p.name}`,
            rider: updatedRider[0],
            newWalletBalance
        });

    } catch (error) {
        console.error("Enrollment error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const { data: riders, error } = await supabase
            .from('rider')
            .select('id, user_id, championship_points, championship_records, users!user_id(name, profile_picture)')
            .order('championship_points', { ascending: false });

        if (error) throw error;

        const leaderboard = (riders || [])
            .filter(r => r.users)
            .map(r => ({
                id: r.id,
                userId: r.user_id,
                name: r.users.name,
                profilePicture: r.users.profile_picture,
                championshipPoints: r.championship_points || 0,
                championshipRecords: r.championship_records || []
            }));

        return res.status(200).json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getCompetitions = async (req, res) => {
    try {
        const { data: competitions, error } = await supabase
            .from('competitions')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            competitions: competitions || []
        });
    } catch (error) {
        console.error("Fetch competitions error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const createCompetition = async (req, res) => {
    const { name, date, category } = req.body.data || req.body || {};
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Competition name is required' });
    }
    try {
        const { data: newComp, error } = await supabase
            .from('competitions')
            .insert({ name, date: date || null, category: category || null })
            .select();

        if (error) {
            if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
                return res.status(400).json({ success: false, message: 'A competition with this name already exists' });
            }
            throw error;
        }

        return res.status(200).json({
            success: true,
            competition: newComp[0],
            message: 'Competition created successfully'
        });
    } catch (error) {
        console.error("Create competition error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};