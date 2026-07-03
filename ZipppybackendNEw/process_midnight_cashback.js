import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zlhpxehbcygykwqouwzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaHB4ZWhiY3lneWt3cW91d3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzQxMjMsImV4cCI6MjA5MDYxMDEyM30.AKwf94tx-ipFfG_T93gN2hTEQSUvH5aQGvO2C7mOX-g';

const supabase = createClient(supabaseUrl, supabaseKey);

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

async function processMidnightCashback() {
    console.log("Starting midnight cashback process...");

    // Find all riders whose plan_end_date has passed AND have an active plan
    const now = new Date().toISOString();

    const { data: riders, error } = await supabase
        .from('rider')
        .select('*')
        .lt('plan_end_date', now)
        .not('plan', 'is', null);

    if (error) {
        console.error("Error fetching expired riders:", error);
        return;
    }

    console.log(`Found ${riders.length} riders with expired plans.`);

    for (const rider of riders) {
        // Skip if plan is empty array
        if (Array.isArray(rider.plan) && rider.plan.length === 0) {
            continue;
        }

        console.log(`Processing rider: ${rider.user_id}`);

        let newWalletBalance = rider.wallet || 0;
        const totalSessionCount = rider.session_count || 0;

        // ── Separate plan sessions from level sessions ─────────────────────────
        // The plan's sessions_count field tells us how many plan sessions were
        // originally granted. Anything beyond that number belongs to the level
        // purchase and must NOT be cashed back or cleared on plan expiry.
        const activePlan = Array.isArray(rider.plan)
            ? rider.plan[rider.plan.length - 1]   // most recent plan
            : rider.plan;

        const planSessionsGranted = activePlan
            ? (Number(activePlan.sessions_count) || Number(activePlan.sessionsCount) || 0)
            : 0;

        // Level sessions = whatever exceeds the plan's original allocation
        const levelSessionsToKeep = Math.max(0, totalSessionCount - planSessionsGranted);
        const unusedPlanSessions  = Math.max(0, totalSessionCount - levelSessionsToKeep);

        console.log(
            `  Total sessions: ${totalSessionCount} | ` +
            `Unused plan sessions: ${unusedPlanSessions} | ` +
            `Level sessions kept: ${levelSessionsToKeep}`
        );

        // ── Check for queued plan ─────────────────────────────────────────────
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

        const hasQueuedPlan = queuedPlans && queuedPlans.length > 0;

        // ── Step A: Cashback for UNUSED PLAN SESSIONS only ────────────────────
        // ₹1000/session if rider pre-renewed (has a queued plan), ₹500/session otherwise
        if (unusedPlanSessions > 0) {
            const cashbackPerClass = hasQueuedPlan ? 1000 : 500;
            const cashbackAmount   = unusedPlanSessions * cashbackPerClass;
            newWalletBalance += cashbackAmount;
            console.log(
                `  Cashback: ${unusedPlanSessions} × ₹${cashbackPerClass} = ₹${cashbackAmount} ` +
                `(Pre-renewed: ${hasQueuedPlan})`
            );
        }

        if (hasQueuedPlan) {
            // ── Step B: Activate the queued plan ─────────────────────────────
            const nextPlanRecord = queuedPlans[0];

            const { data: planData } = await supabase
                .from('plan')
                .select('*')
                .eq('id', nextPlanRecord.plan_id)
                .limit(1);

            if (planData && planData.length > 0) {
                const newPlan       = planData[0];
                const newPlanSess   = Number(newPlan.sessions_count) || Number(newPlan.sessionsCount) || 0;
                const monthsToAdd   = Number(newPlan.validity) || 1;
                const newEndDate    = addMonths(new Date(), monthsToAdd).toISOString();

                // Final session count = new plan's sessions + preserved level sessions
                const finalSessionCount = newPlanSess + levelSessionsToKeep;

                await supabase.from('rider').update({
                    wallet:        newWalletBalance,
                    session_count: finalSessionCount,
                    plan:          [newPlan],
                    plan_end_date: newEndDate,
                }).eq('user_id', rider.user_id);

                await supabase.from('queued_plans').update({
                    status: 'Activated',
                }).eq('id', nextPlanRecord.id);

                console.log(
                    `  Activated queued plan "${newPlan.name}". ` +
                    `Sessions: ${newPlanSess} (plan) + ${levelSessionsToKeep} (level) = ${finalSessionCount} total.`
                );
            }
        } else {
            // ── Step C: No queued plan — clear expired plan, keep level sessions
            await supabase.from('rider').update({
                wallet:        newWalletBalance,
                session_count: levelSessionsToKeep, // level sessions survive plan expiry
                plan:          null,
                plan_end_date: null,
            }).eq('user_id', rider.user_id);

            console.log(
                `  Cleared expired plan. ` +
                `Session count set to ${levelSessionsToKeep} (level sessions preserved).`
            );
        }
    }

    console.log("Midnight cashback process completed.");
}

processMidnightCashback();
