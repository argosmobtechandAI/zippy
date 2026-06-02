import { supabase } from '../supabaseClient.js';

// Helper to map DB snake_case to frontend camelCase
const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.horse_id !== undefined) { clientData.horseId = clientData.horse_id; delete clientData.horse_id; }
    if (clientData.trainers !== undefined) { clientData.trainerId = clientData.trainers; delete clientData.trainers; }
    if (clientData.total_seats !== undefined) { clientData.totalSeats = clientData.total_seats; delete clientData.total_seats; }
    if (clientData.batchs_id !== undefined) { clientData.batchsId = clientData.batchs_id; delete clientData.batchs_id; }
    if (clientData.joining_amount !== undefined) { clientData.joiningAmount = clientData.joining_amount; delete clientData.joining_amount; }
    return clientData;
};

// Helper to map frontend camelCase to DB snake_case
const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.horseId !== undefined) { dbData.horse_id = dbData.horseId; delete dbData.horseId; }
    if (dbData.trainerId !== undefined) { dbData.trainers = dbData.trainerId; delete dbData.trainerId; }
    if (dbData.totalSeats !== undefined) { dbData.total_seats = dbData.totalSeats; delete dbData.totalSeats; }
    if (dbData.batchsId !== undefined) { dbData.batchs_id = dbData.batchsId; delete dbData.batchsId; }
    if (dbData.joiningAmount !== undefined) { dbData.joining_amount = dbData.joiningAmount; delete dbData.joiningAmount; }
    return dbData;
};

export const createSession = async (req, res) => {
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
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
        let { trainerId, riderId, location, horseId } = req.query;
        if (riderId) riderId = riderId.replace(/\/$/, "").trim();
        if (horseId) horseId = horseId.replace(/\/$/, "").trim();

        let query = supabase.from('sessions').select('*');

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
            query = query.contains('horse_id', [horseId]);
        }

        if (location) {
            query = query.eq('location', location);
        }

        const { data: sessions, error } = await query;
        if (error) throw error;
        
        let filteredSessions = sessions;
        if (riderId) {
            filteredSessions = sessions.filter(session => {
                if (!session.participants) return false;
                return session.participants.some(p => p.riderId === riderId);
            });
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
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', id).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const participants = session[0].participants || [];
        const updatedParticipants = participants.filter(p =>
            !(String(p.riderId).toLowerCase() === String(riderId).toLowerCase() && p.date === date)
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
            
            const sessionCount = user[0].session_count || user[0].sessionCount;
            if (sessionCount <= 0) {
                return res.status(200).json({ success: false, message: 'Please purchase the plan first' });
            }

            const planLastDate = user[0].plan_end_date || user[0].planEndDate;
            if (planLastDate) {
                const lastDate = new Date(planLastDate).getTime();
                if (lastDate < Date.now()) {
                    await supabase.from('rider').update({ session_count: 0, plan_end_date: null }).eq('user_id', userId);
                    return res.status(200).json({ success: false, message: 'Please renew your plan' });
                }
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

            for (const booking of addedBookings) {
                const bookingDateStr = booking.date;
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

            const dbData = mapToDb(data);
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

            return res.status(200).json({
                success: true,
                message: "Rider Updated successfully",
                session: mapToClient(updatedSession[0]),
                rider: updatedRider[0]
            });
        }

        const dbData = mapToDb(data);
        const { data: updatedSession, error } = await supabase.from('sessions').update(dbData).eq('id', id).select();
        if (error || !updatedSession || !updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        return res.status(200).json({ success: true, session: mapToClient(updatedSession[0]) });

    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: deletedSession, error } = await supabase.from('sessions').delete().eq('id', id).select();
        if (error || !deletedSession || !deletedSession.length) {
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
    const { riderId, sessionId } = req.params;
    const { data } = req.body;
    const { status } = data;
    try {
        const { data: session, error } = await supabase.from('sessions').select('*').eq('id', sessionId).limit(1);
        if (error || !session || !session.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const allParticipants = session[0].participants || [];
        allParticipants.forEach(participant => {
            if (participant.riderId === riderId) {
                participant.attendance = status;
            }
        });
        
        const { data: updatedSession, error: updateError } = await supabase.from('sessions').update({ participants: allParticipants }).eq('id', sessionId).select();
        if (updateError || !updatedSession || !updatedSession.length) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, session: mapToClient(updatedSession[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};