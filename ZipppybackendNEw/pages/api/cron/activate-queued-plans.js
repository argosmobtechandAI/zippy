import { supabase } from '../../../supabaseClient';

// Helper to add months to date
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const nowStr = new Date().toISOString();

        // 1. Find all riders whose plans are expired (plan_end_date <= current timestamp)
        // AND who have queued plans waiting
        const { data: expiredRiders, error: ridersError } = await supabase
            .from('rider')
            .select('*, users(name)')
            .lte('plan_end_date', nowStr);

        if (ridersError) throw ridersError;

        if (!expiredRiders || expiredRiders.length === 0) {
            return res.status(200).json({ success: true, message: 'No expired plans found today.' });
        }

        const activatedRecords = [];

        // 2. Process each expired rider
        for (const rider of expiredRiders) {
            // Find if there is a queued plan for this user
            const { data: queuedList, error: queueError } = await supabase
                .from('queued_plans')
                .select('*')
                .eq('user_id', rider.user_id)
                .eq('status', 'Queued')
                .order('created_at', { ascending: true })
                .limit(1);

            if (queueError) continue;

            if (queuedList && queuedList.length > 0) {
                const queuedPlanItem = queuedList[0];

                // Fetch the plan details to calculate validity months and session increments
                const { data: planDetails, error: planError } = await supabase
                    .from('plan')
                    .select('*')
                    .eq('id', queuedPlanItem.plan_id)
                    .limit(1);

                if (planError || !planDetails || planDetails.length === 0) continue;
                const targetPlan = planDetails[0];

                // Calculate parameters
                const currentPlans = Array.isArray(rider.plan) ? rider.plan : (rider.plan ? [rider.plan] : []);
                const updatedPlansList = [...currentPlans, targetPlan];
                
                // Add new session count to any remaining sessions they had
                const newSessionsTotal = (rider.session_count || 0) + (targetPlan.sessions_count || targetPlan.sessionsCount || 0);

                let monthsToAdd = 1;
                if (!isNaN(Number(targetPlan.validity))) {
                    monthsToAdd = Number(targetPlan.validity);
                }

                // Expiry starts from today (since their previous plan is already expired)
                const newPlanEndDate = addMonths(new Date(), monthsToAdd).toISOString();

                // Start Transaction updates
                // A. Update Rider profile with new session balance and end date
                const { error: riderUpdateError } = await supabase
                    .from('rider')
                    .update({
                        plan: updatedPlansList,
                        session_count: newSessionsTotal,
                        plan_end_date: newPlanEndDate
                    })
                    .eq('id', rider.id);

                if (riderUpdateError) {
                    console.error(`Failed to update rider ${rider.id}:`, riderUpdateError);
                    continue;
                }

                // B. Mark the queued plan status as Activated
                await supabase
                    .from('queued_plans')
                    .update({ status: 'Activated' })
                    .eq('id', queuedPlanItem.id);

                // C. Update corresponding queued revenue to Active
                await supabase
                    .from('revenue')
                    .update({ status: 'Active', end_date: newPlanEndDate })
                    .eq('purchaserId', rider.user_id)
                    .eq('planId', targetPlan.id)
                    .eq('status', 'Queued');

                activatedRecords.push({
                    riderId: rider.id,
                    riderName: rider.users?.name || 'Unknown',
                    activatedPlan: targetPlan.name,
                    newSessionsTotal,
                    newPlanEndDate
                });
            }
        }

        return res.status(200).json({
            success: true,
            activatedCount: activatedRecords.length,
            activatedRecords
        });

    } catch (error) {
        console.error("ERROR IN queued-plans cron handler:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
