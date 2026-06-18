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

async function checkAnnushka() {
  const targetRiderId = "e551f600-19c4-4efd-a722-3ff787d516a2";
  console.log(`=== DIAGNOSING RIDER: Annushka Florence E (${targetRiderId}) ===`);

  // 1. Get current rider record
  const { data: rider, error: rErr } = await supabase
    .from('rider')
    .select('*')
    .eq('id', targetRiderId)
    .limit(1);

  if (rErr || !rider || rider.length === 0) {
    console.error("Rider not found:", rErr);
    return;
  }

  const r = rider[0];
  console.log("\n[Rider Record]");
  console.log("Current session_count:", r.session_count);
  console.log("Plan end date:", r.plan_end_date);
  console.log("Plan JSON:", JSON.stringify(r.plan, null, 2));

  // 2. Search for any session bookings this rider has
  console.log("\n[Scanning Booked Sessions]");
  const { data: sessions, error: sErr } = await supabase
    .from('sessions')
    .select('id, title, date, timing, participants');

  if (sErr) {
    console.error("Error fetching sessions:", sErr);
    return;
  }

  let bookingCount = 0;
  sessions.forEach(s => {
    const participants = s.participants || [];
    const match = participants.find(p => String(p.riderId).toLowerCase() === targetRiderId.toLowerCase());
    if (match) {
      bookingCount++;
      console.log(`- Session: "${s.title}" on ${s.date} (${s.timing})`);
      console.log(`  Rider Status: ${match.status || 'N/A'} | Attendance: ${match.attendance || 'N/A'}`);
    }
  });

  console.log(`\nTotal booked sessions found: ${bookingCount}`);
}

checkAnnushka();
