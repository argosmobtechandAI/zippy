import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .gte('date', '2026-06-22')
    .lte('date', '2026-07-05')
    .order('date', { ascending: true })
    .order('timing', { ascending: true });
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`VERIFICATION RESULT: Found ${sessions.length} sessions in the target date range.`);
  
  const dates = [...new Set(sessions.map(s => s.date))];
  console.log("Dates populated:", dates);
  
  const timingCounts = {};
  sessions.forEach(s => {
    timingCounts[s.timing] = (timingCounts[s.timing] || 0) + 1;
  });
  console.log("Timing slots counts:", timingCounts);
}

check();
