import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './supabaseClient.js';

async function run() {
  const { data } = await supabase.from('users').select('name, email, type');
  const types = [...new Set(data.map(u => u.type))];
  console.log("ALL USER TYPES IN DB:", types);
  console.log("VANSH TYPE:", data.find(u => u.email === 'vansh1@gmail.com')?.type);
}
run();
