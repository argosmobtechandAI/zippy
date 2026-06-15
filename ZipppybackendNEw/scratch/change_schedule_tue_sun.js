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

const mondays = ['2026-06-15', '2026-06-22', '2026-06-29'];
const weekends = [
  '2026-06-20', '2026-06-21', // Sat, Sun of Week 1
  '2026-06-27', '2026-06-28', // Sat, Sun of Week 2
  '2026-07-04', '2026-07-05'  // Sat, Sun of Week 3
];

async function removeMondays() {
  console.log("Checking and removing empty Monday sessions...");
  for (const date of mondays) {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', date)
      .neq('status', 'ARCHIVED');
      
    if (error) {
      console.error(`Error fetching sessions for Monday ${date}:`, error);
      continue;
    }
    
    for (const session of sessions) {
      const participants = session.participants || [];
      if (participants.length === 0) {
        console.log(`Deleting empty session: ${session.title} (${session.timing}) on ${date}`);
        const { error: delError } = await supabase
          .from('sessions')
          .delete()
          .eq('id', session.id);
          
        if (delError) {
          console.error(`Error deleting session ${session.id}:`, delError);
        }
      } else {
        console.warn(`WARNING: Skipping deletion of session ${session.title} on ${date} because it has ${participants.length} bookings!`);
      }
    }
  }
}

async function insertWeekends() {
  console.log("Checking and inserting Saturday & Sunday sessions...");
  for (const date of weekends) {
    const { data: existingSessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', date)
      .neq('status', 'ARCHIVED');
      
    if (error) {
      console.error(`Error fetching sessions for date ${date}:`, error);
      continue;
    }
    
    const toInsert = [];
    for (const slot of targetSlots) {
      const match = existingSessions.find(s => 
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
    
    if (toInsert.length > 0) {
      console.log(`Inserting ${toInsert.length} slots for ${date}...`);
      const { data, error: insError } = await supabase
        .from('sessions')
        .insert(toInsert)
        .select();
        
      if (insError) {
        console.error(`Error inserting slots for date ${date}:`, insError);
      } else {
        console.log(`Successfully created ${data.length} slots for ${date}.`);
      }
    } else {
      console.log(`All slots already exist for date ${date}.`);
    }
  }
}

async function run() {
  try {
    await removeMondays();
    await insertWeekends();
    console.log("Schedule adjustment complete!");
  } catch (err) {
    console.error("Adjustment failed:", err);
  }
}

run();
