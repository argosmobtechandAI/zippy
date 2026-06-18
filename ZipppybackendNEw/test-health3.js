import { config } from 'dotenv';
config();
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { supabase } from './supabaseClient.js';

async function run() {
  const { data, error } = await supabase.from('health_status').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
