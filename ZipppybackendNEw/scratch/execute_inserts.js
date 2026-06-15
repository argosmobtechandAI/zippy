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

const morningSlots = [
  { title: 'Morning 6:00 AM', timing: '06:00 - 06:45' },
  { title: 'Morning 7:00 AM', timing: '07:00 - 07:45' },
  { title: 'Morning 8:00 AM', timing: '08:00 - 08:45' }
];

const eveningSlots = [
  { title: 'Evening 4:00 PM', timing: '16:00 - 16:45' },
  { title: 'Evening 5:00 PM', timing: '17:00 - 17:45' },
  { title: 'Evening 6:00 PM', timing: '18:00 - 18:45' }
];

const allSlots = [...morningSlots, ...eveningSlots];

function generateDates(tuesdayToFridayOnly) {
  const dates = [];
  const weekStartDates = ['2026-06-22', '2026-06-29'];
  
  for (const startDateStr of weekStartDates) {
    const start = new Date(startDateStr);
    const daysToInclude = tuesdayToFridayOnly ? [1, 2, 3, 4] : [0, 1, 2, 3, 4];
    
    for (const offset of daysToInclude) {
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

async function execute(tuesdayToFridayOnly) {
  const dates = generateDates(tuesdayToFridayOnly);
  const records = [];
  
  dates.forEach(date => {
    allSlots.forEach(slot => {
      records.push({
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
    });
  });
  
  console.log(`Preparing to insert ${records.length} slots...`);
  
  const { data, error } = await supabase
    .from('sessions')
    .insert(records)
    .select();
    
  if (error) {
    console.error("Insertion failed:", error);
  } else {
    console.log(`Success! Inserted ${data.length} slots in the database.`);
  }
}

const arg = process.argv[2];
if (arg === 'tue-fri') {
  execute(true);
} else if (arg === 'mon-fri') {
  execute(false);
} else {
  console.log("Usage: node scratch/execute_inserts.js <tue-fri|mon-fri>");
}
