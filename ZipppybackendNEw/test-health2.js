import { config } from 'dotenv';
config();
import { supabase } from './supabaseClient.js';

async function run() {
  const { data, error } = await supabase.from('health_status').select('*').order('date', { ascending: false }).limit(5);
  console.log("Error:", error);
  console.log("health_status columns:", data?.[0] ? Object.keys(data[0]) : "No data");
  console.log(JSON.stringify(data, null, 2));
}
run();
