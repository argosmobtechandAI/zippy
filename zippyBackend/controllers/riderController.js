import { eq, sql } from "drizzle-orm";
import { db } from "../db.js";
import { riderTable, planTable, userTable, revenueTable } from "../schema.js";

export const getRider = async (req, res) => {
    const userId = req.userId;

    console.log("Fetching rider for userId:", userId);

    try {
        const rider = await db
            .select()
            .from(riderTable)
            .where(eq(riderTable.userId, userId));

        if (!rider || rider.length === 0) {
            return res.status(404).json({
                message: 'Rider not found',
                success: false
            });
        }

        const planLastDate = rider[0].planEndDate;

        if (planLastDate) {
            const lastDate = new Date(planLastDate).getTime();
            const currentDate = Date.now();

            console.log("Last:", lastDate, "Current:", currentDate);

            // ✅ Expired
            if (lastDate < currentDate) {
                await db.update(riderTable)
                    .set({
                        sessionCount: 0,
                        planEndDate: null,
                    })
                    .where(eq(riderTable.userId, userId));

                await db.update(revenueTable).set({ status: "expired" }).where(eq(revenueTable.purchaserId, userId))
            }
        }

        console.log(rider[0], "rider")

        return res.status(200).json({
            rider: rider[0],
            message: 'Rider fetched successfully',
            success: true
        });

    } catch (error) {
        console.log(error)
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
        const plan = await db.select().from(planTable).where(eq(planTable.id, planId));
        if (!plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const p = plan[0];

        // 2. Get Rider Details
        const rider = await db.select().from(riderTable).where(eq(riderTable.userId, userId));
        if (!rider.length) {
            return res.status(404).json({ success: false, message: 'Rider record not found' });
        }

        // 3. Update Rider Plan and Session Count

        const plans = [...rider[0].plan, p]
        const sessionsCount = rider[0].sessionCount + p.sessionsCount;
        const updatedRider = await db.update(riderTable)
            .set({
                plan: plans,
                sessionCount: sessionsCount,
                planEndDate: paymentEndDate,
            })
            .where(eq(riderTable.userId, userId))
            .returning();

        // 4. Send Confirmation Notification (Idempotent JSONB append)
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Plan Enrolled Successfully!",
            desc: `You are now enrolled in the ${p.name} pack with ${p.sessionsCount} sessions.`,
            type: 'success',
            time: "Just Now",
            unread: true,
            date: new Date().toISOString()
        };

        await db.execute(sql`UPDATE users SET "notifications" = COALESCE("notifications", '[]'::jsonb) || ${JSON.stringify([notification])}::jsonb WHERE id = ${userId}`);

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

const addMonths = (date, months) => {
    const result = new Date(date);
    const m = isNaN(Number(months)) ? 1 : Number(months);
    result.setMonth(result.getMonth() + m);
    return result;
};

export const purchasePlanWithWallet = async (req, res) => {
    const userId = req.userId;
    const { planId } = req.body.data;

    try {
        // 1. Get Plan Details
        const plan = await db.select().from(planTable).where(eq(planTable.id, planId));
        if (!plan.length) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const p = plan[0];

        // 2. Get Rider Details
        const rider = await db.select().from(riderTable).where(eq(riderTable.userId, userId));
        if (!rider.length) {
            return res.status(404).json({ success: false, message: 'Rider record not found' });
        }
        const r = rider[0];

        // 3. Check Wallet Balance
        if ((r.wallet || 0) < p.amount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        const newWallet = (r.wallet || 0) - p.amount;
        const paymentEndDate = addMonths(new Date(), p.validity).toISOString();

        // 4. Record the revenue/subscription
        const revenue = {
            amount: p.amount,
            type: "plan",
            date: new Date().toISOString(),
            purchaserId: userId,
            purchaseType: "plan",
            planId,
            plan_key: "wallet",
            status: "Active",
            endDate: paymentEndDate,
        };

        const subscription = await db.insert(revenueTable).values(revenue).returning();

        // 5. Update Rider Plan, Session Count, Wallet, and endDate
        const plans = [...r.plan, p];
        const sessionsCount = r.sessionCount + p.sessionsCount;
        const updatedRider = await db.update(riderTable)
            .set({
                plan: plans,
                sessionCount: sessionsCount,
                planEndDate: paymentEndDate,
                wallet: newWallet,
            })
            .where(eq(riderTable.userId, userId))
            .returning();

        // 6. Send Confirmation Notification (Idempotent JSONB append)
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Plan Purchased via Wallet!",
            desc: `You have successfully purchased the ${p.name} pack using ₹${p.amount} from your wallet.`,
            type: 'success',
            time: "Just Now",
            unread: true,
            date: new Date().toISOString()
        };

        await db.execute(sql`UPDATE users SET "notifications" = COALESCE("notifications", '[]'::jsonb) || ${JSON.stringify([notification])}::jsonb WHERE id = ${userId}`);

        return res.status(200).json({
            success: true,
            message: `Successfully purchased ${p.name} using wallet balance.`,
            rider: updatedRider[0]
        });

    } catch (error) {
        console.error("Wallet purchase error:", error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};