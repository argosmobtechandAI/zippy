import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zlhpxehbcygykwqouwzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaHB4ZWhiY3lneWt3cW91d3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzQxMjMsImV4cCI6MjA5MDYxMDEyM30.AKwf94tx-ipFfG_T93gN2hTEQSUvH5aQGvO2C7mOX-g';

const supabase = createClient(supabaseUrl, supabaseKey);

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months)
    return result;
};

async function processMidnightCashback() {
    console.log("Starting midnight cashback process...");
    
    // Find all riders whose plan_end_date has passed
    const now = new Date().toISOString();
    
    // We fetch riders who have an active plan but their plan_end_date is in the past
    const { data: riders, error } = await supabase
        .from('rider')
        .select('*')
        .lt('plan_end_date', now);

    if (error) {
        console.error("Error fetching expired riders:", error);
        return;
    }

    console.log(`Found ${riders.length} riders with expired plans.`);

    for (const rider of riders) {
        // Only process if they actually have an active plan that needs clearing
        if (!rider.plan || (Array.isArray(rider.plan) && rider.plan.length === 0)) {
            continue;
        }

        console.log(`Processing rider: ${rider.user_id}`);

        let newWalletBalance = rider.wallet || 0;
        let unusedSessions = rider.session_count || 0;

        // Step A: Cashback
        if (unusedSessions > 0) {
            const cashbackAmount = unusedSessions * 500;
            newWalletBalance += cashbackAmount;
            console.log(`  Added ₹${cashbackAmount} to wallet for ${unusedSessions} unused sessions.`);
        }

        // Check for queued plans
        const { data: queuedPlans, error: qError } = await supabase
            .from('queued_plans')
            .select('*')
            .eq('user_id', rider.user_id)
            .eq('status', 'Queued')
            .order('created_at', { ascending: true })
            .limit(1);

        if (qError) {
            console.error(`  Error fetching queued plans for ${rider.user_id}:`, qError);
            continue;
        }

        if (queuedPlans && queuedPlans.length > 0) {
            // Step B: Activate Queued Plan
            const nextPlanRecord = queuedPlans[0];
            
            // Fetch the plan details
            const { data: planData } = await supabase
                .from('plan')
                .select('*')
                .eq('id', nextPlanRecord.plan_id)
                .limit(1);

            if (planData && planData.length > 0) {
                const newPlan = planData[0];
                const newSessions = newPlan.sessions_count || newPlan.sessionsCount || 0;
                let monthsToAdd = Number(newPlan.validity) || 1;
                const newEndDate = addMonths(new Date(), monthsToAdd).toISOString();

                // Update Rider
                await supabase.from('rider').update({
                    wallet: newWalletBalance,
                    session_count: newSessions,
                    plan: [newPlan], // Store as active
                    plan_end_date: newEndDate
                }).eq('user_id', rider.user_id);

                // Update Queued Plan Status
                await supabase.from('queued_plans').update({
                    status: 'Activated'
                }).eq('id', nextPlanRecord.id);

                console.log(`  Activated queued plan ${newPlan.name}. New sessions: ${newSessions}.`);
            }
        } else {
            // No queued plan, just clear the current plan
            await supabase.from('rider').update({
                wallet: newWalletBalance,
                session_count: 0,
                plan: null
            }).eq('user_id', rider.user_id);

            console.log(`  Cleared expired plan. Session count reset to 0.`);
        }
    }

    console.log("Midnight cashback process completed.");
}

processMidnightCashback();
