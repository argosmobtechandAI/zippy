import { db } from '../db.js';
import { sessionTable, riderTable, userTable } from '../schema.js';
import { sql, eq } from 'drizzle-orm';

export const createSession = async (req, res) => {
    const {data} = req.body;
    try {
        const newSession = await db.insert(sessionTable).values(data).returning();
        if(!newSession.length) {
            return res.status(400).json({success: false, message: 'Failed to create session'});
        }

        // AUTOMATED NOTIFICATION to Trainer
        if (data.trainerId) {
            try {
                // Find the user associated with this trainer
                const trainerRes = await db.select({ userId: userTable.id })
                    .from(userTable)
                    .innerJoin(trainerTable, eq(userTable.id, trainerTable.userId))
                    .where(eq(trainerTable.id, data.trainerId));

                if (trainerRes.length) {
                    const userId = trainerRes[0].userId;
                    const newNotif = {
                        id: Date.now().toString(),
                        title: "New Session Scheduled",
                        desc: `You have a new training session: ${data.title} scheduled for ${data.date}.`,
                        time: "Just Now",
                        type: "booking",
                        unread: true
                    };
                    
                    // Correct JSONB concatenation for PostgreSQL
                    await db.execute(sql`
                        UPDATE users 
                        SET notifications = COALESCE(notifications, '[]'::jsonb) || ${JSON.stringify([newNotif])}::jsonb 
                        WHERE id = ${userId}
                    `);
                }
            } catch (notifError) {
                console.error("Notification failed but session created:", notifError);
                // We don't want to fail the whole request if only notification fails, 
                // but currently it was crashing here causing the 500.
            }
        }

        res.status(201).json({success: true, session: newSession[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getSessions = async (req, res) => {
    let { trainerId, riderId, location, horseId } = req.query;
    if (riderId) {
        riderId = riderId.replace(/\/$/, "").trim();
    }
    if (horseId) {
        horseId = horseId.replace(/\/$/, "").trim();
    }
    try {
        let query = db.select().from(sessionTable);
        
        const conditions = [];
        if (trainerId) {
            conditions.push(eq(sessionTable.trainerId, trainerId));
        }
        if (horseId) {
            conditions.push(eq(sessionTable.horseId, horseId));
        }
        if (riderId) {
            conditions.push(sql`${sessionTable.participants} @> ${JSON.stringify([{ riderId }])}::jsonb`);
        }
        if (location) {
            conditions.push(eq(sessionTable.location, location));
        }

        if (conditions.length > 0) {
            query = query.where(sql.join(conditions, sql` AND `));
        }

        const sessions = await query;
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getSessionById = async (req, res) => {
    const {id} = req.params;
    try {
        const session = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
        if(!session.length) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, session: session[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const updateSession = async (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    try {
        const updatedSession = await db.update(sessionTable).set(data).where(eq(sessionTable.id, id)).returning();
        if(!updatedSession.length) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, session: updatedSession[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const deleteSession = async (req, res) => {
    const {id} = req.params;
    try {
        const deletedSession = await db.delete(sessionTable).where(eq(sessionTable.id, id)).returning();
        if(!deletedSession.length) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, message: 'Session deleted successfully'});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};
