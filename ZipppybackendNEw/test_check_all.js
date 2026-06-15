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
    .gte('date', '2026-06-15')
    .lte('date', '2026-07-10')
    .neq('status', 'ARCHIVED')
    .order('date', { ascending: true });
    
  if (error) {
    console.error(error);
    return;
  }
  
  const dateMap = {};
  sessions.forEach(s => {
    if (!dateMap[s.date]) {
      dateMap[s.date] = [];
    }
    dateMap[s.date].push(`${s.title} (${s.timing})`);
  });
  
  console.log("Slots per date:");
  Object.keys(dateMap).sort().forEach(date => {
    console.log(`\nDate: ${date} (${dateMap[date].length} slots):`);
    dateMap[date].forEach(slot => {
      console.log(`  - ${slot}`);
    });
  });
}

check();
