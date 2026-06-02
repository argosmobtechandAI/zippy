import { supabase } from './supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('users').select('*, trainers(*), rider(*), vet(*)').limit(1);
  if (error) console.error("HTTP ERROR:", error);
  else console.log("HTTP SUCCESS:", JSON.stringify(data, null, 2));
}
test();
