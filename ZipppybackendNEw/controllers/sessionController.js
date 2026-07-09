import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';
import jwt from 'jsonwebtoken';

// Helper to map DB snake_case to frontend camelCase
const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.horse !== undefined) { clientData.horseId = clientData.horse; delete clientData.horse; }
    if (clientData.horse_id !== undefined) { clientData.horseId = clientData.horseId || clientData.horse_id; delete clientData.horse_id; }
    if (clientData.trainers !== undefined) { clientData.trainerId = clientData.trainers; delete clientData.trainers; }
    if (clientData.total_seats !== undefined) { clientData.totalSeats = clientData.total_seats; delete clientData.total_seats; }
    if (clientData.batchs_id !== undefined) { clientData.batchsId = clientData.batchs_id; delete clientData.batchs_id; }
    if (clientData.joining_amount !== undefined) { clientData.joiningAmount = clientData.joining_amount; delete clientData.joining_amount; }
    return clientData;
};

// Helper to map frontend camelCase to DB snake_case
const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.horseId !== undefined) {
        // DB 'horse' column is a single UUID - take first element if array
        const horseVal = Array.isArray(dbData.horseId) ? (dbData.horseId[0] || null) : dbData.horseId;
        dbData.horse = horseVal;
        delete dbData.horseId;
    }
    if (dbData.horse_id !== undefined) {
        const horseVal = Array.isArray(dbData.horse_id) ? (dbData.horse_id[0] || null) : dbData.horse_id;
        dbData.horse = dbData.horse || horseVal;
        delete dbData.horse_id;
    }
    if (dbData.trainerId !== undefined) { dbData.trainers = dbData.trainerId; delete dbData.trainerId; }
    if (dbData.totalSeats !== undefined) { dbData.total_seats = dbData.totalSeats; delete dbData.totalSeats; }
    if (dbData.batchsId !== undefined) { dbData.batchs_id = dbData.batchsId; delete dbData.batchsId; }
    if (dbData.joiningAmount !== undefined) { dbData.joining_amount = dbData.joiningAmount; delete dbData.joiningAmount; }
    if (dbData.joining_amount === undefined && data.joining_amount !== undefined) { dbData.joining_amount = data.joining_amount; }
    
    // Prevent NOT NULL constraint violations by removing null values
    if (dbData.horse === null) delete dbData.horse;
    if (dbData.trainers === null) delete dbData.trainers;
    
    return dbData;
};

// Allowed columns in the sessions table (DB snake_case)
const SESSION_ALLOWED_COLS = [
    'title', 'timing', 'date', 'trainers', 'horse', 'participants',
    'duration', 'location', 'total_seats', 'note', 'status', 'joining_amount'
];

const sanitizeSessionData = (data) => {
    const result = {};
    for (const key of SESSION_ALLOWED_COLS) {
        if (data[key] !== undefined) result[key] = data[key];
    }
    return result;
};

export const createSession = async (req, res) => {
    const { data } = req.body;
    try {
        const dbData = sanitizeSessionData(mapToDb(data));
        const { data: newSession, error } = await supabase.from('sessions').insert(dbData).select();
        
        if (error || !newSession || newSession.length === 0) {
            return res.status(400).json({ success: false, message: error?.message || 'Failed to create session' });
        }

        const sessionId = newSession[0].id;

        if (data.horseId && data.horseId.length > 0) {
            for (const horseId of data.horseId) {
                const { data: horse } = await supabase.from('horse').select('*').eq('id', horseId).limit(1);
                if (horse && horse.length > 0) {
                    const sessions = horse[0].sessions ? [...horse[0].sessions, sessionId] : [sessionId];
                    await supabase.from('horse').update({ sessions }).eq('id', horseId);
                }
            }
        }

        if (data.trainerId) {
            try {
                const { data: trainer } = await supabase.from('trainers').select('user_id').eq('id', data.trainerId).limit(1);
                if (trainer && trainer.length > 0) {
                    const userId = trainer[0].user_id;
                    const { data: user } = await supabase.from('users').select('notifications').eq('id', userId).limit(1);
                    if (user && user.length > 0) {
                        const newNotif = {
                            id: Date.now().toString(),
                            title: "New Session Scheduled",
                            desc: `You have a new training session: ${data.title} scheduled for ${data.date}.`,
                            time: "Just Now",
                            type: "booking",
                            unread: true
                        };
                        const notifs = user[0].notifications || [];
                        await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', userId);
                        await sendPushToUser(userId, newNotif.title, newNotif.desc, { type: newNotif.type });
                    }
                }
            } catch (notifError) {
                console.error("Notification failed but session created:", notifError);
            }
        }

        res.status(201).json({ success: true, session: mapToClient(newSession[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getSessions = async (req, res) => {
    try {
        let { trainerId, riderId, location, horseId, includeArchived } = req.query;
        if (riderId) riderId = riderId.replace(/\/$/, "").trim();
        if (horseId) horseId = horseId.replace(/\/$/, "").trim();

        if (!req.userId && req.headers && req.headers.authorization) {
            try {
                const tokenWithoutBearer = req.headers.authorization.split(' ')[1];
                const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
                req.userId = decodedToken.id;
                req.userType = decodedToken.type;
            } catch (err) { }
        }

        let query = supabase.from('sessions').select('*');

        // By default exclude archived (soft-deleted) sessions
        if (!includeArchived || includeArchived === 'false') {
            query = query.neq('status', 'ARCHIVED');
        }

        // Hide BLOCKED and CANCELLED sessions for non-admins
        if (req.userType !== 'admin' && req.userType !== 'Admin' && req.userType !== 'ADMIN') {
            query = query.neq('status', 'BLOCKED').neq('status', 'CANCELLED');
        }

        if (trainerId) {
            const { data: trainer } = await supabase.from('trainers').select('*').eq('id', trainerId).limit(1);
            if (!trainer || trainer.length === 0) {
                return res.status(404).json({ success: false, message: "Trainer not found" });
            }
            const trainerData = trainer[0];
            
            if (trainerData.title === "Head Trainer" && trainerData.stable_id) {
                const { data: stable } = await supabase.from('stable').select('name').eq('id', trainerData.stable_id).limit(1);
                if (stable && stable.length > 0 && stable[0].name) {
                    query = query.eq('location', stable[0].name);
                } else {
                    query = query.eq('trainers', trainerId);
                }
            } else {
                query = query.eq('trainers', trainerId);
            }
        }

        if (horseId) {
            query = query.eq('horse', horseId);
        }

        if (location) {
            query = query.eq('location', location);
        }

        const { data: sessions, error } = await query;
        if (error) throw error;
        
        let filteredSessions = sessions;
        if (riderId) {
            filteredSessions = filteredSessions.filter(session => {
                if (!session.participants) return false;
                return session.participants.some(p => p.riderId === riderId);
            });
        }

        // Apply stable_id filtering for logged-in riders
        if (req.userType === 'rider' && req.userId) {
            try {
                const { data: riderProfile } = await supabase.from('rider').select('stable_id').eq('user_id', req.userId).limit(1);
                if (riderProfile && riderProfile.length > 0 && riderProfile[0].stable_id) {
                    const riderStableId = riderProfile[0].stable_id;
                    
                    // Fetch the stable name to match against session.location
                    const { data: stableData } = await supabase.from('stable').select('name').eq('id', riderStableId).limit(1);
                    const stableName = stableData && stableData.length > 0 ? stableData[0].name : null;
                    
                    // Fetch all trainers belonging to this stable
                    const { data: stableTrainers } = await supabase.from('trainers').select('id').eq('stable_id', riderStableId);
                    
                    if ((stableTrainers && stableTrainers.length > 0) || stableName) {
                        const validTrainerIds = new Set((stableTrainers || []).map(t => t.id));
                        filteredSessions = filteredSessions.filter(session => {
                            if (stableName && session.location === stableName) return true;
                            if (session.trainers && validTrainerIds.has(session.trainers)) return true;
                            return false;
                        });
                    } else {
                        // If the stable has no trainers and no name, there are no valid sessions
                        filteredSessions = [];
                    }
                }
            } catch (riderFilterErr) {
                console.error("Failed to filter sessions by rider stableId:", riderFilterErr);
            }
        }

        return res.status(200).json({ success: true, sessions: filteredSessions.map(mapToClient) });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};


export const getSessionById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: mapToClient(session[0]) });
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
        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day);
        const deadline = new Date(slotDate);
        deadline.setDate(deadline.getDate() - 1);
        deadline.setHours(20, 0, 0, 0); 

        if (Date.now() > deadline.getTime()) {
            return res.status(400).json({
                success: false,
                message: `Cancellation deadline has passed. You cannot cancel the slot for ${date} after 8:00 PM of the previous day.`
            });
        }

        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const participants = session[0].participants || [];
        const updatedParticipants = participants.filter(p =>
            !(String(p.riderId).toLowerCase() === String(riderId).toLowerCase() && (!p.date || p.date === date))
        );

        const { data: updatedSession, error: updateError } = await supabase.from('sessions').update({ participants: updatedParticipants }).eq('id', id).select();
        if (updateError || !updatedSession || !updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Failed to update session' });
        }

        const { data: rider, error: riderError } = await supabase.from('rider').select('*').eq('id', riderId).limit(1);
        if (riderError || !rider || !rider.length) {
            return res.status(404).json({ success: false, message: 'Rider not found' });
        }

        const newSessionCount = (rider[0].session_count || rider[0].sessionCount || 0) + 1;
        const joinedSessions = rider[0].joined_sessions || rider[0].joinedSessions || [];
        const pendingSessions = rider[0].pending_sessions || rider[0].pendingSessions || [];
        
        const updatedJoinedSessions = joinedSessions.filter(sid => sid !== id);
        const updatedPendingSessions = pendingSessions.filter(sid => sid !== id);

        const { data: updatedRider, error: riderUpdateError } = await supabase.from('rider').update({
            session_count: newSessionCount,
            joined_sessions: updatedJoinedSessions,
            pending_sessions: updatedPendingSessions
        }).eq('id', riderId).select();

        if (riderUpdateError || !updatedRider || !updatedRider.length) {
            return res.status(404).json({ success: false, message: 'Failed to update rider info' });
        }

        // Notify admin + rider + trainer
        try {
            const userId = rider[0].user_id;
            const { data: userData } = await supabase.from('users').select('name, notifications').eq('id', userId).limit(1);
            const userName = userData && userData.length > 0 ? userData[0].name : "A rider";
            const sessionTitle = session[0].title || "a session";

            // Admin notification
            await supabase.from('admin_notifications').insert({
                title: "🔄 Booking Cancelled",
                desc: `${userName} cancelled their booking for "${sessionTitle}" on ${date}.`,
                type: "booking"
            });

            // Rider notification
            const riderNotif = {
                id: Math.random().toString(36).substr(2, 9),
                title: "🔄 Booking Cancelled",
                desc: `Your booking for "${sessionTitle}" on ${date} has been cancelled. Your session credit has been restored.`,
                type: "booking",
                time: "Just Now",
                unread: true,
                date: new Date().toISOString()
            };
            const notifs = userData && userData.length > 0 ? (userData[0].notifications || []) : [];
            await supabase.from('users').update({ notifications: [...notifs, riderNotif] }).eq('id', userId);
                        await sendPushToUser(userId, riderNotif.title, riderNotif.desc, { type: riderNotif.type });

            // Trainer notification
            const trainerRowId = session[0].trainers;
            if (trainerRowId) {
                const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', trainerRowId).limit(1);
                if (trainerRow && trainerRow.length > 0) {
                    const trainerUserId = trainerRow[0].user_id;
                    const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                    const tNotifs = trainerUser && trainerUser.length > 0 ? (trainerUser[0].notifications || []) : [];
                    const trainerNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "🔄 Booking Cancelled",
                        desc: `${userName} cancelled their booking for "${sessionTitle}" on ${date}.`,
                        time: "Just Now",
                        type: "booking",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                }
            }
        } catch (notifErr) {
            console.error("Failed to send cancellation notifications:", notifErr);
        }

        return res.status(200).json({ success: true, session: mapToClient(updatedSession[0]), rider: updatedRider[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateSession = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.userId;
    try {
        if (data && data.participants && req.userType === 'rider') {
            const { data: user, error: userError } = await supabase.from('rider').select('*').eq('user_id', userId).limit(1);
            if (userError || !user || !user.length) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            // 1. Membership Date Validity Check (First check)
            const planLastDate = user[0].plan_end_date || user[0].planEndDate;
            if (planLastDate) {
                const lastDate = new Date(planLastDate);
                // Set to end of the expiration day to prevent premature expiration
                lastDate.setHours(23, 59, 59, 999);
                if (lastDate.getTime() < Date.now()) {
                    return res.status(200).json({ success: false, message: 'Your membership has expired. Please renew your plan.' });
                }
            } else {
                return res.status(200).json({ success: false, message: 'Please purchase a membership plan first' });
            }

            // 2. Session Balance Check (Second check)
            const sessionCount = user[0].session_count ?? user[0].sessionCount ?? 0;
            if (sessionCount <= 0) {
                return res.status(200).json({ success: false, message: 'You have no remaining sessions. Please add more sessions.' });
            }

            const { data: session, error: sessionError } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
            if (sessionError || !session || !session.length) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }

            const existingParticipants = session[0].participants || [];
            const newParticipants = data.participants || [];
            const riderId = user[0].id;

            const addedBookings = newParticipants.filter(np =>
                String(np.riderId).toLowerCase() === String(riderId).toLowerCase() &&
                !existingParticipants.some(ep =>
                    String(ep.riderId).toLowerCase() === String(riderId).toLowerCase() &&
                    ep.date === np.date
                )
            );

            let bookingDateStr = "";
            for (const booking of addedBookings) {
                bookingDateStr = booking.date;
                if (!bookingDateStr) continue;

                const [year, month, day] = bookingDateStr.split('-').map(Number);
                const slotDate = new Date(year, month - 1, day);
                const deadline = new Date(slotDate);
                deadline.setDate(deadline.getDate() - 1);
                deadline.setHours(20, 0, 0, 0); 

                if (Date.now() > deadline.getTime()) {
                    return res.status(400).json({
                        success: false,
                        message: `Booking deadline has passed. You cannot book slot for ${bookingDateStr} after 8:00 PM of the previous day.`
                    });
                }
            }

            const dbData = sanitizeSessionData(mapToDb(data));
            const { data: updatedSession, error: updateError } = await supabase.from('sessions').update(dbData).eq('id', id).select();
            if (updateError || !updatedSession || !updatedSession.length) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }

            const pendingSessions = user[0].pending_sessions || user[0].pendingSessions || [];
            const { data: updatedRider, error: riderUpdateError } = await supabase.from('rider').update({
                session_count: sessionCount - 1,
                pending_sessions: [...pendingSessions, id]
            }).eq('user_id', userId).select();

            if (riderUpdateError || !updatedRider || !updatedRider.length) {
                return res.status(404).json({ success: false, message: 'Rider not found' });
            }

            // Notify admin
            try {
                const { data: userData } = await supabase.from('users').select('name').eq('id', userId).limit(1);
                const userName = userData && userData.length > 0 ? userData[0].name : "A rider";
                const sessionTitle = session[0].title || "a session";
                await supabase.from('admin_notifications').insert({
                    title: "🆕 New Booking Request",
                    desc: `${userName} has requested to book "${sessionTitle}"${bookingDateStr ? ' for ' + bookingDateStr : ''}.`,
                    type: "booking"
                });
            } catch (notifErr) {
                console.error("Failed to insert admin notification for booking request:", notifErr);
            }

            return res.status(200).json({
                success: true,
                message: "Rider Updated successfully",
                session: mapToClient(updatedSession[0]),
                rider: updatedRider[0]
            });
        }

        const { data: oldSession } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
        const dbData = sanitizeSessionData(mapToDb(data));

        // === BACKEND DEBUG ===
        console.log('=== updateSession BACKEND DEBUG ===');
        console.log('Session id:', id);
        console.log('Input data keys:', Object.keys(data || {}));
        console.log('dbData being written:', JSON.stringify(dbData));
        // ====================

        const { data: updatedSession, error } = await supabase.from('sessions').update(dbData).eq('id', id).select();
        console.log('updateSession DB result - count:', updatedSession?.length, '| error:', error?.message || 'none');
        if (error || !updatedSession || !updatedSession.length) {
            return res.status(404).json({ success: false, message: `Session not found. id="${id}" dbError="${error ? error.message : 'no rows returned'}"` });
        }


        // Notify trainer if assigned or changed
        try {
            const oldTrainerId = oldSession && oldSession.length > 0 ? oldSession[0].trainers : null;
            const newTrainerId = updatedSession[0].trainers;
            if (newTrainerId && newTrainerId !== oldTrainerId) {
                const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', newTrainerId).limit(1);
                if (trainerRow && trainerRow.length > 0) {
                    const trainerUserId = trainerRow[0].user_id;
                    const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                    const tNotifs = trainerUser && trainerUser.length > 0 ? (trainerUser[0].notifications || []) : [];
                    const trainerNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "🆕 Assigned to Session",
                        desc: `You have been assigned to session "${updatedSession[0].title || 'Training'}" scheduled on ${updatedSession[0].date}.`,
                        time: "Just Now",
                        type: "booking",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                }
            }
        } catch (notifErr) {
            console.error("Failed to notify trainer of session assignment change:", notifErr);
        }

        return res.status(200).json({ success: true, session: mapToClient(updatedSession[0]) });

    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        // SOFT DELETE: archive the session instead of destroying it
        // This preserves full history (participants, attendance, remarks)
        const { data: session, error: fetchError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', id)
            .limit(1);

        if (fetchError || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const { data: archivedSession, error: archiveError } = await supabase
            .from('sessions')
            .update({
                status: 'ARCHIVED',
                note: `${session[0].note ? session[0].note + ' | ' : ''}[Deleted by admin on ${new Date().toISOString().split('T')[0]}]`
            })
            .eq('id', id)
            .select();

        if (archiveError || !archivedSession || !archivedSession.length) {
            return res.status(500).json({ success: false, message: 'Failed to archive session' });
        }

        // Notify trainer (same as before)
        try {
            const trainerRowId = session[0].trainers;
            if (trainerRowId) {
                const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', trainerRowId).limit(1);
                if (trainerRow && trainerRow.length > 0) {
                    const trainerUserId = trainerRow[0].user_id;
                    const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                    const tNotifs = trainerUser && trainerUser.length > 0 ? (trainerUser[0].notifications || []) : [];
                    const trainerNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "🚫 Session Cancelled",
                        desc: `Session "${session[0].title || 'Training'}" scheduled on ${session[0].date} has been deleted/cancelled by admin.`,
                        time: "Just Now",
                        type: "alert",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                }
            }
        } catch (notifErr) {
            console.error("Failed to notify trainer of deleted session:", notifErr);
        }

        res.status(200).json({ success: true, message: 'Session archived (soft-deleted) successfully', session: mapToClient(archivedSession[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};


export const updateSessionStatus = async (req, res) => {
    const { userId, sessionId } = req.params;
    const { data } = req.body;
    const { status } = data;
    try {
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', sessionId).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const allParticipants = session[0].participants || [];
        allParticipants.forEach(participant => {
            if (participant.riderId === userId) {
                participant.status = status;
            }
        });

        if (status.toLowerCase() === "confirmed") {
            const { data: rider, error: riderError } = await supabase.from('rider').select('*').eq('id', userId).limit(1);
            if (!riderError && rider && rider.length > 0) {
                const joinedSessions = rider[0].joined_sessions || rider[0].joinedSessions || [];
                const pendingSessions = rider[0].pending_sessions || rider[0].pendingSessions || [];
                await supabase.from('rider').update({
                    joined_sessions: [...joinedSessions, sessionId],
                    pending_sessions: pendingSessions.filter(p => p !== sessionId)
                }).eq('id', userId);

                // Send confirmation notification to rider
                try {
                    const riderUserId = rider[0].user_id;
                    const { data: user } = await supabase.from('users').select('name, notifications').eq('id', riderUserId).limit(1);
                    const riderNameVal = user && user.length > 0 ? user[0].name : "A rider";
                    const notifs = user && user.length > 0 ? (user[0].notifications || []) : [];
                    const newNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "✅ Booking Confirmed!",
                        desc: `Your session "${session[0].title || 'Training'}" has been confirmed. See you at the stable!`,
                        time: "Just Now",
                        type: "booking",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', riderUserId);
                        await sendPushToUser(riderUserId, newNotif.title, newNotif.desc, { type: newNotif.type });

                    // Trainer notification
                    const trainerRowId = session[0].trainers;
                    if (trainerRowId) {
                        const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', trainerRowId).limit(1);
                        if (trainerRow && trainerRow.length > 0) {
                            const trainerUserId = trainerRow[0].user_id;
                            const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                            const tNotifs = trainerUser && trainerUser.length > 0 ? (trainerUser[0].notifications || []) : [];
                            const trainerNotif = {
                                id: Math.random().toString(36).substr(2, 9),
                                title: "✅ Booking Confirmed",
                                desc: `Booking request of ${riderNameVal} for session "${session[0].title || 'Training'}" has been confirmed.`,
                                time: "Just Now",
                                type: "booking",
                                unread: true,
                                date: new Date().toISOString()
                            };
                            await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                        }
                    }
                } catch (err) {
                    console.error("Confirmation notification failed:", err);
                }
            }
        }

        if (status.toLowerCase() === "rejected") {
            const { data: rider, error: riderError } = await supabase.from('rider').select('*').eq('id', userId).limit(1);
            if (!riderError && rider && rider.length > 0) {
                const currentCount = rider[0].session_count || 0;
                const joinedSessions = rider[0].joined_sessions || rider[0].joinedSessions || [];
                const pendingSessions = rider[0].pending_sessions || rider[0].pendingSessions || [];
                await supabase.from('rider').update({
                    session_count: currentCount + 1,
                    joined_sessions: joinedSessions.filter(s => s !== sessionId),
                    pending_sessions: pendingSessions.filter(s => s !== sessionId),
                }).eq('id', userId);

                // Send rejection notification to rider
                try {
                    const riderUserId = rider[0].user_id;
                    const { data: user } = await supabase.from('users').select('name, notifications').eq('id', riderUserId).limit(1);
                    const riderNameVal = user && user.length > 0 ? user[0].name : "A rider";
                    const notifs = user && user.length > 0 ? (user[0].notifications || []) : [];
                    const newNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "❌ Booking Rejected",
                        desc: `Your booking for "${session[0].title || 'Training'}" was rejected. Your session credit has been restored.`,
                        time: "Just Now",
                        type: "booking",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', riderUserId);
                        await sendPushToUser(riderUserId, newNotif.title, newNotif.desc, { type: newNotif.type });

                    // Trainer notification
                    const trainerRowId = session[0].trainers;
                    if (trainerRowId) {
                        const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', trainerRowId).limit(1);
                        if (trainerRow && trainerRow.length > 0) {
                            const trainerUserId = trainerRow[0].user_id;
                            const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                            const tNotifs = trainerUser && trainerUser.length > 0 ? (trainerUser[0].notifications || []) : [];
                            const trainerNotif = {
                                id: Math.random().toString(36).substr(2, 9),
                                title: "❌ Booking Rejected",
                                desc: `Booking request of ${riderNameVal} for session "${session[0].title || 'Training'}" was rejected.`,
                                time: "Just Now",
                                type: "alert",
                                unread: true,
                                date: new Date().toISOString()
                            };
                            await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                        }
                    }
                } catch (err) {
                    console.error("Rejection notification failed:", err);
                }
            }
        }
        
        const { data: updatedSession, error: updateError } = await supabase.from('sessions').update({ participants: allParticipants }).eq('id', sessionId).select();
        if (updateError || !updatedSession || !updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: mapToClient(updatedSession[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateAttendance = async (req, res) => {
    // Trim to avoid trailing-slash or whitespace issues from URL params
    const sessionId = (req.params.sessionId || '').trim().replace(/\/$/, '');
    const riderId = (req.params.riderId || '').trim().replace(/\/$/, '');
    const { data } = req.body;
    const { status } = data || {};

    // === BACKEND DEBUG LOGS ===
    console.log('=== updateAttendance BACKEND DEBUG ===');
    console.log('req.query (raw):', JSON.stringify(req.query));
    console.log('req.params (set):', JSON.stringify(req.params));
    console.log('Parsed sessionId:', sessionId);
    console.log('Parsed riderId:', riderId);
    console.log('Parsed status:', status);
    console.log('req.body:', JSON.stringify(req.body));
    // ==========================

    if (!sessionId || !riderId || !status) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields. sessionId: "${sessionId}", riderId: "${riderId}", status: "${status}"`
        });
    }

    try {
        console.log('Querying DB for session id:', sessionId);
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', sessionId).limit(1);
        console.log('DB query result - session count:', session?.length, '| error:', error?.message || 'none');
        if (error || !session || !session.length) {
            return res.status(404).json({
                success: false,
                message: `Session not found. sessionId="${sessionId}" dbError="${error ? error.message : 'none'}"`
            });
        }

        const allParticipants = session[0].participants || [];
        let matched = false;
        allParticipants.forEach(participant => {
            // Case-insensitive match to handle any casing inconsistencies
            if (String(participant.riderId || '').toLowerCase() === riderId.toLowerCase()) {
                participant.attendance = status;
                matched = true;
            }
        });

        if (!matched) {
            // Rider not found in participants — still update gracefully
            console.warn(`updateAttendance: riderId "${riderId}" not found in session participants. Participants:`, allParticipants.map(p => p.riderId));
        }

        const { data: updatedSession, error: updateError } = await supabase
            .from('sessions')
            .update({ participants: allParticipants })
            .eq('id', sessionId)
            .select();

        if (updateError || !updatedSession || !updatedSession.length) {
            return res.status(500).json({
                success: false,
                message: `Failed to update attendance. ${updateError ? updateError.message : 'No data returned'}`
            });
        }

        res.status(200).json({ success: true, session: mapToClient(updatedSession[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const cancelFullSession = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const currentSession = session[0];
        if (currentSession.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'Session is already cancelled.' });
        }

        const participants = currentSession.participants || [];
        
        // 1. Refund riders and update their sessions array
        for (const p of participants) {
            if (p.riderId) {
                const { data: riderData, error: rErr } = await supabase.from('rider').select('*').eq('id', p.riderId).limit(1);
                if (!rErr && riderData && riderData.length) {
                    const rider = riderData[0];
                    const newSessionCount = (rider.session_count || rider.sessionCount || 0) + 1;
                    const joinedSessions = rider.joined_sessions || rider.joinedSessions || [];
                    const pendingSessions = rider.pending_sessions || rider.pendingSessions || [];
                    
                    const updatedJoinedSessions = joinedSessions.filter(sid => sid !== id);
                    const updatedPendingSessions = pendingSessions.filter(sid => sid !== id);

                    await supabase.from('rider').update({
                        session_count: newSessionCount,
                        joined_sessions: updatedJoinedSessions,
                        pending_sessions: updatedPendingSessions
                    }).eq('id', p.riderId);

                    // Send notification to rider
                    const userId = rider.user_id;
                    const { data: userData } = await supabase.from('users').select('notifications').eq('id', userId).limit(1);
                    if (userData && userData.length) {
                        const riderNotif = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: "⚠️ Session Cancelled",
                            desc: `The session "${currentSession.title || 'Training Session'}" on ${currentSession.date} has been cancelled by the admin. Your session credit has been refunded.`,
                            type: "booking",
                            time: "Just Now",
                            unread: true,
                            date: new Date().toISOString()
                        };
                        const notifs = userData[0].notifications || [];
                        await supabase.from('users').update({ notifications: [...notifs, riderNotif] }).eq('id', userId);
                        await sendPushToUser(userId, riderNotif.title, riderNotif.desc, { type: riderNotif.type });
                    }
                }
            }
        }

        // 2. Notify Trainer
        const trainerRowId = currentSession.trainers;
        if (trainerRowId) {
            const { data: trainerRow } = await supabase.from('trainers').select('user_id').eq('id', trainerRowId).limit(1);
            if (trainerRow && trainerRow.length > 0) {
                const trainerUserId = trainerRow[0].user_id;
                const { data: trainerUser } = await supabase.from('users').select('notifications').eq('id', trainerUserId).limit(1);
                if (trainerUser && trainerUser.length) {
                    const tNotifs = trainerUser[0].notifications || [];
                    const trainerNotif = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "⚠️ Session Cancelled",
                        desc: `Admin has cancelled your session "${currentSession.title || 'Training Session'}" on ${currentSession.date}.`,
                        time: "Just Now",
                        type: "booking",
                        unread: true,
                        date: new Date().toISOString()
                    };
                    await supabase.from('users').update({ notifications: [...tNotifs, trainerNotif] }).eq('id', trainerUserId);
                        await sendPushToUser(trainerUserId, trainerNotif.title, trainerNotif.desc, { type: trainerNotif.type });
                }
            }
        }

        // 3. Update session status
        const { data: updatedSession, error: updateError } = await supabase
            .from('sessions')
            .update({ status: 'CANCELLED' })
            .eq('id', id)
            .select();

        if (updateError || !updatedSession || !updatedSession.length) {
            return res.status(500).json({ success: false, message: 'Failed to update session status' });
        }

        return res.status(200).json({ success: true, message: "Session successfully cancelled and refunded.", session: mapToClient(updatedSession[0]) });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const bulkCreateSessions = async (req, res) => {
    const { data } = req.body;
    const { startDate, endDate, trainerId, horseId, location, totalSeats, slots } = data || {};
    
    try {
        if (!startDate || !endDate || !location) {
            return res.status(400).json({ success: false, message: "Start date, end date, and location are required." });
        }
        
        // Generate list of dates between startDate and endDate
        const dates = [];
        let start = new Date(startDate);
        const end = new Date(endDate);
        
        while (start <= end) {
            const dayOfWeek = start.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
            if (dayOfWeek !== 1) { // Skip Monday
                const year = start.getFullYear();
                const month = String(start.getMonth() + 1).padStart(2, '0');
                const day = String(start.getDate()).padStart(2, '0');
                dates.push(`${year}-${month}-${day}`);
            }
            start.setDate(start.getDate() + 1);
        }
        
        // Define active slots
        const slotsToCreate = slots && slots.length > 0 ? slots : [
            { title: 'Morning 6:00 AM', timing: '06:00 - 06:45' },
            { title: 'Morning 7:00 AM', timing: '07:00 - 07:45' },
            { title: 'Morning 8:00 AM', timing: '08:00 - 08:45' },
            { title: 'Evening 4:00 PM', timing: '16:00 - 16:45' },
            { title: 'Evening 5:00 PM', timing: '17:00 - 17:45' },
            { title: 'Evening 6:00 PM', timing: '18:00 - 18:45' }
        ];
        
        // Load existing sessions in range to prevent duplicates
        const { data: existingSessions, error: fetchError } = await supabase
            .from('sessions')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .neq('status', 'ARCHIVED');
            
        if (fetchError) {
            return res.status(400).json({ success: false, message: fetchError.message });
        }
        
        const recordsToInsert = [];
        
        for (const date of dates) {
            for (const slot of slotsToCreate) {
                // Check if already exists
                const exists = existingSessions.some(s => 
                    s.date === date && 
                    s.timing.trim() === slot.timing.trim() && 
                    s.location === location
                );
                
                if (!exists) {
                    // Calculate duration
                    const startStr = slot.timing.split("-")[0]?.trim();
                    const endStr = slot.timing.split("-")[1]?.trim();
                    let durationVal = "45 Min";
                    if (startStr && endStr) {
                        const [sh, sm] = startStr.split(":").map(Number);
                        const [eh, em] = endStr.split(":").map(Number);
                        let diff = (eh * 60 + em) - (sh * 60 + sm);
                        if (diff < 0) diff += 24 * 60;
                        durationVal = `${diff} Min`;
                    }
                    
                    const newSession = {
                        title: slot.title,
                        timing: slot.timing,
                        date: date,
                        joiningAmount: 0,
                        trainerId: trainerId || null,
                        horseId: horseId || [],
                        participants: [],
                        duration: durationVal,
                        location: location,
                        totalSeats: totalSeats || 7,
                        status: 'ACTIVE'
                    };
                    
                    recordsToInsert.push(sanitizeSessionData(mapToDb(newSession)));
                }
            }
        }
        
        if (recordsToInsert.length === 0) {
            return res.status(200).json({ success: true, message: "All slots already populated. No sessions inserted.", sessions: [] });
        }
        
        const { data: newSessions, error: insertError } = await supabase
            .from('sessions')
            .insert(recordsToInsert)
            .select();
            
        if (insertError) {
            return res.status(400).json({ success: false, message: insertError.message });
        }
        
        // Notify trainer only once if trainer assigned
        if (trainerId && newSessions.length > 0) {
            try {
                const { data: trainer } = await supabase.from('trainers').select('user_id').eq('id', trainerId).limit(1);
                if (trainer && trainer.length > 0) {
                    const userId = trainer[0].user_id;
                    const { data: user } = await supabase.from('users').select('notifications').eq('id', userId).limit(1);
                    if (user && user.length > 0) {
                        const newNotif = {
                            id: Date.now().toString(),
                            title: "Bulk Sessions Scheduled",
                            desc: `You have been assigned to multiple training sessions scheduled between ${startDate} and ${endDate}.`,
                            time: "Just Now",
                            type: "booking",
                            unread: true
                        };
                        const notifs = user[0].notifications || [];
                        await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', userId);
                        await sendPushToUser(userId, newNotif.title, newNotif.desc, { type: newNotif.type });
                    }
                }
            } catch (notifError) {
                console.error("Trainer notification failed:", notifError);
            }
        }
        
        return res.status(201).json({ success: true, message: `Successfully created ${newSessions.length} sessions.`, sessions: newSessions.map(mapToClient) });
    } catch (err) {
        return res.status(500).json({ success: false, message: `Error: ${err.message}` });
    }
};