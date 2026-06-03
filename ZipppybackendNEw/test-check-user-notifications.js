import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const userId = "b2ab05db-3b33-472b-b0e4-abcd0b476d00";
    const { data: user } = await supabase.from('users').select('id, name, notifications').eq('id', userId).limit(1);
    console.log("User details:", user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
