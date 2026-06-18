import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRiderBookings() {
  console.log("=== CALCULATING RIDER BOOKING HISTORY ===");

  // 1. Fetch riders
  const { data: riders, error: rErr } = await supabase
    .from('rider')
    .select('id, user_id, plan, plan_end_date, session_count, users(name)');

  if (rErr) {
    console.error("Error fetching riders:", rErr);
    return;
  }

  // 2. Fetch all sessions
  const { data: sessions, error: sErr } = await supabase
    .from('sessions')
    .select('id, title, date, participants');

  if (sErr) {
    console.error("Error fetching sessions:", sErr);
    return;
  }

  console.log("\nSummary of Rider Bookings (to help you estimate yesterday's session count):");
  console.log("========================================================================\n");

  riders.forEach(r => {
    const name = r.users?.name || 'Unknown';
    const riderId = r.id;
    
    // Count bookings for this rider
    let totalBooked = 0;
    let confirmedBookings = 0;
    let pendingBookings = 0;
    let attended = 0;

    sessions.forEach(s => {
      const participants = s.participants || [];
      const match = participants.find(p => String(p.riderId).toLowerCase() === riderId.toLowerCase());
      if (match) {
        totalBooked++;
        if (match.status?.toLowerCase() === 'confirmed') confirmedBookings++;
        if (match.status?.toLowerCase() === 'pending') pendingBookings++;
        if (match.attendance?.toLowerCase() === 'present') attended++;
      }
    });

    // We only print riders who have active plans AND 0 sessions
    if (r.plan && (r.session_count === 0 || r.session_count === null)) {
      console.log(`Rider: ${name}`);
      console.log(`- Active Plan: ${r.plan.name} (Valid until: ${r.plan_end_date || 'N/A'})`);
      console.log(`- Current Session Balance: ${r.session_count || 0}`);
      console.log(`- Booking Stats:`);
      console.log(`  * Total Bookings in DB: ${totalBooked}`);
      console.log(`  * Confirmed Bookings: ${confirmedBookings}`);
      console.log(`  * Pending Bookings: ${pendingBookings}`);
      console.log(`  * Attended (Present): ${attended}`);
      console.log("--------------------------------------------------");
    }
  });
}

listRiderBookings();
