import { eq, sql } from "drizzle-orm";
import { db } from "../db.js";
import { riderTable, planTable, userTable } from "../schema.js";

export const getRider = async (req, res) => {
    const userId = req.userId;
    try {
        const rider = await db.select().from(riderTable).where(eq(riderTable.userId, userId))
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found', success: false });
        }
        return res.status(200).json({ rider: rider[0], message: 'Rider fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}

export const enrollPack = async (req, res) => {
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

        // 3. Update Rider Plan and Session Count
        const updatedRider = await db.update(riderTable)
            .set({ 
                plan: [p], // Store snapshot of current plan
                sessionCount: p.sessionsCount 
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