import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
    // Only allow GET/POST requests. Usually crons hit via GET/POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Fetch all active riders with user details
        const { data: riders, error: ridersError } = await supabase
            .from('rider')
            .select('*, users(name)');
        
        if (ridersError) throw ridersError;

        if (!riders || riders.length === 0) {
            return res.status(200).json({ success: true, message: 'No riders found to snapshot.' });
        }

        // Prevent duplicates: Delete any existing snapshots for todayStr before generating new ones.
        // This acts as an upsert pattern so multiple manual runs or cron execution errors don't cause double entries.
        const { error: deleteError } = await supabase
            .from('rider_daily_snapshots')
            .delete()
            .eq('snapshot_date', todayStr);

        if (deleteError) {
            console.warn("Delete warning: failed to clear old snapshots", deleteError);
        }

        // 2. Fetch all sessions that contain bookings for today
        const { data: todaySessions, error: sessionsError } = await supabase
            .from('sessions')
            .select('*')
            .eq('date', todayStr);

        if (sessionsError) throw sessionsError;

        const snapshotsToInsert = [];

        // 3. Process each rider
        for (const rider of riders) {
            const riderName = rider.users?.name || rider.name || 'Unknown Rider';
            const sessionsLeft = rider.session_count ?? rider.sessionCount ?? 0;

            // Check if rider has joined any session today
            let bookedToday = false;
            let bookingDate = null;
            let bookingTime = null;

            if (todaySessions && todaySessions.length > 0) {
                // Look for the rider in session participants
                const joinedSession = todaySessions.find(s => {
                    const participants = s.participants || [];
                    return participants.some(p => String(p.riderId) === String(rider.id));
                });

                if (joinedSession) {
                    bookedToday = true;
                    bookingDate = joinedSession.date;
                    bookingTime = joinedSession.timing;
                }
            }

            snapshotsToInsert.push({
                rider_id: rider.id,
                rider_name: riderName,
                sessions_left: sessionsLeft,
                booking_date: bookingDate,
                booking_time: bookingTime,
                has_booked_today: bookedToday ? "true" : "false",
                snapshot_date: todayStr
            });
        }

        // 4. Bulk insert snapshots into database
        const { error: insertError } = await supabase
            .from('rider_daily_snapshots')
            .insert(snapshotsToInsert);

        if (insertError) throw insertError;

        return res.status(200).json({
            success: true,
            message: `Successfully generated ${snapshotsToInsert.length} rider daily snapshots for ${todayStr}.`
        });

    } catch (error) {
        console.error("CRITICAL ERROR IN take-daily-snapshot CRON:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
