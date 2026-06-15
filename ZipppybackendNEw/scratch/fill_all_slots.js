import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const trainerId = 'cc8b1a11-f685-48d1-baad-ba4ad9406fc5'; // Vishwa Premlal
const horseId = '7163f880-de30-468f-be99-338d44ff1eb3'; // Barringo
const location = 'Zippy Equestrian Center';
const totalSeats = 7;
const duration = '45 Min';
const status = 'ACTIVE';

const targetSlots = [
  { title: 'Morning 6:00 AM', timing: '06:00 - 06:45' },
  { title: 'Morning 7:00 AM', timing: '07:00 - 07:45' },
  { title: 'Morning 8:00 AM', timing: '08:00 - 08:45' },
  { title: 'Evening 4:00 PM', timing: '16:00 - 16:45' },
  { title: 'Evening 5:00 PM', timing: '17:00 - 17:45' },
  { title: 'Evening 6:00 PM', timing: '18:00 - 18:45' }
];

// Generate Mon-Fri dates for:
// Week 1: June 15 - June 19
// Week 2: June 22 - June 26
// Week 3: June 29 - July 3
function generateTargetDates() {
  const dates = [];
  const startWeeks = ['2026-06-15', '2026-06-22', '2026-06-29'];
  for (const startWeekStr of startWeeks) {
    const start = new Date(startWeekStr);
    for (let offset = 0; offset < 5; offset++) {
      const d = new Date(start);
      d.setDate(start.getDate() + offset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
  }
  return dates;
}

async function run() {
  try {
    const dates = generateTargetDates();
    console.log(`Checking ${dates.length} dates for missing slots...`);
    
    // Fetch all existing active sessions in this range first to do it in memory
    const { data: existingSessions, error } = await supabase
      .from('sessions')
      .select('*')
      .gte('date', '2026-06-15')
      .lte('date', '2026-07-05')
      .neq('status', 'ARCHIVED');
      
    if (error) {
      console.error("Failed to fetch existing sessions:", error);
      return;
    }
    
    console.log(`Loaded ${existingSessions.length} existing sessions from DB.`);
    
    const toInsert = [];
    
    for (const date of dates) {
      for (const slot of targetSlots) {
        // Look for exact match by date, timing, and location
        const match = existingSessions.find(s => 
          s.date === date && 
          s.timing.trim() === slot.timing.trim() && 
          s.location === location
        );
        
        if (!match) {
          toInsert.push({
            title: slot.title,
            timing: slot.timing,
            date: date,
            joining_amount: 0,
            trainers: trainerId,
            horse: horseId,
            participants: [],
            duration: duration,
            location: location,
            total_seats: totalSeats,
            status: status
          });
        }
      }
    }
    
    console.log(`Found ${toInsert.length} slots that need to be created.`);
    
    if (toInsert.length === 0) {
      console.log("All slots are already populated! Nothing to do.");
      return;
    }
    
    console.log("Inserting missing slots...");
    const { data: inserted, error: insertError } = await supabase
      .from('sessions')
      .insert(toInsert)
      .select();
      
    if (insertError) {
      console.error("Insertion error:", insertError);
    } else {
      console.log(`Successfully inserted ${inserted.length} missing slots!`);
    }
  } catch (err) {
    console.error("Process failed:", err);
  }
}

run();
