import { db } from '../db.js';
import { sessionTable, riderTable, userTable, trainerTable, horseTable, stableTable } from '../schema.js';
import { sql, eq, arrayContains } from 'drizzle-orm';

export const createSession = async (req, res) => {
    const { data } = req.body;

    console.log(data, "data")

    try {
        const newSession = await db.insert(sessionTable).values(data).returning();
        if (!newSession.length) {
            return res.status(400).json({ success: false, message: 'Failed to create session' });
        }

        if (data.horseId && data.horseId.length > 0) {

            const updatedHorses = Promise.all(data.horseId.map(async (horseId) => {

                const horse = await db.select().from(horseTable).where(eq(horseTable.id, horseId));

                if (!horse.length) {
                    return res.status(404).json({ success: false, message: 'Horse not found' });
                }
                const sessions = horse[0].sessions ? [...horse[0].sessions, newSession[0].id] : [newSession[0].id]
                const updateHorse = await db.update(horseTable).set({ sessions }).where(eq(horseTable.id, horseId)).returning();
                if (!updateHorse.length) {
                    return res.status(400).json({ success: false, message: 'Failed to update horse status' });
                }
                return horse[0];
            }));

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

        res.status(201).json({ success: true, session: newSession[0] });
    } catch (error) {
        console.log(error, "error")
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getSessions = async (req, res) => {
    try {
        let { trainerId, riderId, location, horseId } = req.query;

        console.log(req.query, "req.query");

        if (riderId) {
            riderId = riderId.replace(/\/$/, "").trim();
        }

        if (horseId) {
            horseId = horseId.replace(/\/$/, "").trim();
        }

        const conditions = [];

        if (trainerId) {

            const trainer = await db
                .select()
                .from(trainerTable)
                .where(eq(trainerTable.id, trainerId));

            if (!trainer.length) {
                return res.status(404).json({
                    success: false,
                    message: "Trainer not found",
                });
            }

            const trainerData = trainer[0];

            console.log(trainerData, "trainerData");

            if (trainerData.title === "Head Trainer") {

                const stableForTrainer = await db
                    .select()
                    .from(stableTable)
                    .where(eq(stableTable.id, trainerData.stableId));



                if (
                    stableForTrainer.length &&
                    stableForTrainer[0].name
                ) {

                    conditions.push(
                        eq(
                            sessionTable.location,
                            stableForTrainer[0].name
                        )
                    );

                } else {

                    conditions.push(
                        eq(sessionTable.trainerId, trainerId)
                    );
                }

            } else {

                conditions.push(
                    eq(sessionTable.trainerId, trainerId)
                );
            }
        }

        if (horseId) {
            conditions.push(
                arrayContains(sessionTable.horseId, [horseId])
            );
        }

        if (riderId) {
            conditions.push(
                sql`${sessionTable.participants} @> ${JSON.stringify([
                    { riderId }
                ])}::jsonb`
            );
        }

        if (location) {
            conditions.push(
                eq(sessionTable.location, location)
            );
        }

        let query = db.select().from(sessionTable);

        if (conditions.length > 0) {
            query = query.where(
                sql.join(conditions, sql` AND `)
            );
        }

        const sessions = await query;

        return res.status(200).json({
            success: true,
            sessions,
        });

    } catch (error) {

        console.log(error, "error");

        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`,
        });
    }
};

export const getSessionById = async (req, res) => {
    const { id } = req.params;
    console.log(id, "id")
    try {
        const session = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
        if (!session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: session[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const { riderId, date } = req.body.data || {};

    if (!riderId || !date) {
        return res.status(400).json({ success: false, message: 'Rider ID and date are required' });
    }

    try {
        const session = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
        if (!session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const participants = session[0].participants || [];
        const updatedParticipants = participants.filter(p =>
            !(String(p.riderId).toLowerCase() === String(riderId).toLowerCase() && p.date === date)
        );

        const updatedSession = await db.update(sessionTable)
            .set({ participants: updatedParticipants })
            .where(eq(sessionTable.id, id))
            .returning();

        // Increment rider's session count by 1 and remove session id from joinedSessions
        const rider = await db.select().from(riderTable).where(eq(riderTable.id, riderId));
        if (!rider.length) {
            return res.status(404).json({ success: false, message: 'Rider not found' });
        }

        const newSessionCount = (rider[0].sessionCount || 0) + 1;
        const joinedSessions = rider[0].joinedSessions || [];
        const pendingSessions = rider[0].pendingSessions || [];
        const updatedJoinedSessions = joinedSessions.filter(sid => sid !== id);
        const updatedPendingSessions = pendingSessions.filter(sid => sid !== id);

        const updatedRider = await db.update(riderTable)
            .set({
                sessionCount: newSessionCount,
                joinedSessions: updatedJoinedSessions,
                pendingSessions: updatedPendingSessions
            })
            .where(eq(riderTable.id, riderId))
            .returning();

        console.log(updatedRider, "updatedRider");

        if (!updatedRider.length) {
            return res.status(404).json({ success: false, message: 'Failed to update rider info' });
        }

        return res.status(200).json({ success: true, session: updatedSession[0], rider: updatedRider[0] });
    } catch (error) {
        console.log(error, "error");
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};


export const updateSession = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.userId;
    try {
        if (data && data.participants && req.userType === 'rider') {
            const user = await db.select().from(riderTable).where(eq(riderTable.userId, userId));
            if (!user.length) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            if (user[0]?.sessionCount <= 0) {

                return res.status(200).json({ success: false, message: 'Please purchase the plan first' });
            }

            const planLastDate = user[0].planEndDate;
            if (planLastDate) {
                const lastDate = new Date(planLastDate).getTime();
                if (lastDate < Date.now()) {
                    await db.update(riderTable).set({ sessionCount: 0, planEndDate: null }).where(eq(riderTable.userId, userId));
                    return res.status(200).json({ success: false, message: 'Please renew your plan' });
                }
            }

            const session = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
            if (!session.length) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }

            // Enforce 8:00 PM previous-day booking deadline
            const existingParticipants = session[0].participants || [];
            const newParticipants = data.participants || [];
            const riderId = user[0].id;

            // Find newly added participants for this rider
            const addedBookings = newParticipants.filter(np =>
                String(np.riderId).toLowerCase() === String(riderId).toLowerCase() &&
                !existingParticipants.some(ep =>
                    String(ep.riderId).toLowerCase() === String(riderId).toLowerCase() &&
                    ep.date === np.date
                )
            );

            for (const booking of addedBookings) {
                const bookingDateStr = booking.date;
                if (!bookingDateStr) continue;

                const [year, month, day] = bookingDateStr.split('-').map(Number);
                const slotDate = new Date(year, month - 1, day);
                const deadline = new Date(slotDate);
                deadline.setDate(deadline.getDate() - 1);
                deadline.setHours(20, 0, 0, 0); // 8:00 PM of previous day

                if (Date.now() > deadline.getTime()) {
                    return res.status(400).json({
                        success: false,
                        message: `Booking deadline has passed. You cannot book slot for ${bookingDateStr} after 8:00 PM of the previous day.`
                    });
                }
            }

            const updatedSession = await db.update(sessionTable).set(data).where(eq(sessionTable.id, id)).returning();
            if (!updatedSession.length) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }

            const updatedRider = await db.update(riderTable)
                .set({
                    sessionCount: user[0].sessionCount - 1,
                    pendingSessions: [...(user[0].pendingSessions || []), id]
                })
                .where(eq(riderTable.userId, userId))
                .returning();

            if (!updatedRider.length) {
                return res.status(404).json({ success: false, message: 'Rider not found' });
            }

            return res.status(200).json({
                success: true,
                message: "Rider Updated successfully",
                session: updatedSession[0],
                rider: updatedRider[0]
            });
        }

        // Standard session update (for admins/stables)
        const updatedSession = await db.update(sessionTable).set(data).where(eq(sessionTable.id, id)).returning();
        if (!updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        return res.status(200).json({ success: true, session: updatedSession[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSession = await db.delete(sessionTable).where(eq(sessionTable.id, id)).returning();
        if (!deletedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateSessionStatus = async (req, res) => {
    const { userId, sessionId } = req.params;
    const { data } = req.body;
    const { status } = data
    console.log(status, "status", userId, sessionId)
    try {

        const session = await db.select().from(sessionTable).where(eq(sessionTable.id, sessionId));
        if (!session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const allParticipants = session[0].participants;
        allParticipants.map(async (participant) => {
            if (participant.riderId === userId) {
                participant.status = status;

            }
        })

        if (status.toLowerCase() === "confirmed") {
            const rider = await db.select().from(riderTable).where(eq(riderTable.id, userId));
            console.log(rider, "rider");
            const updatedRider = await db.update(riderTable).set({
                joinedSessions: [...(rider[0].joinedSessions || []), sessionId],
                pendingSessions: rider[0].pendingSessions.filter((p) => p !== sessionId)
            }).where(eq(riderTable.id, userId)).returning();

            if (!updatedRider.length) {
                return res.status(404).json({ success: false, message: 'Rider not found' });
            }
        }
        const updatedSession = await db.update(sessionTable).set({ participants: allParticipants }).where(eq(sessionTable.id, sessionId)).returning();
        if (!updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: updatedSession[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateAttendance = async (req, res) => {
    const { riderId, sessionId } = req.params;
    const { data } = req.body;
    console.log(data)
    const { status } = data
    console.log(status, "status")
    try {

        const session = await db.select().from(sessionTable).where(eq(sessionTable.id, sessionId));
        if (!session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const allParticipants = session[0].participants;
        allParticipants.map((participant) => {
            if (participant.riderId === riderId) {
                participant.attendance = status;
            }
        })
        const updatedSession = await db.update(sessionTable).set({ participants: allParticipants }).where(eq(sessionTable.id, sessionId)).returning();
        if (!updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: updatedSession[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};