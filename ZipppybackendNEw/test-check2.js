import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './supabaseClient.js';
async function run() {
  const { data: users } = await supabase.from('users').select('*, vet(*)').eq('type', 'vet');
  console.log("VETS:", users?.map(u => ({ id: u.id, name: u.name, vet: u.vet })));
  const { data: horses } = await supabase.from('horse').select('id, name, vat_id');
  console.log("HORSES:", horses);
}
run();
