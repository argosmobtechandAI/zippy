import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../ZipppybackendNEw/.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
async function run() {
  const { data: sessions } = await supabase.from('sessions').select('*');
  const pending = sessions.filter(s => s.participants && s.participants.some(p => p.status === 'PENDING' || p.status === 'pending'));
  console.log("Pending sessions count:", pending.length);
  for (const s of pending) {
    console.log(`Session: ${s.id}, Title: ${s.title}, Trainer: ${s.trainers}`);
  }
}
run();
