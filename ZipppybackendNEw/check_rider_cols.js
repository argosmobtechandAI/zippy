import { supabase } from './supabaseClient.js'; const check = async () => { const { data } = await supabase.from('rider').select('*').limit(1); console.log(data[0]); }; check();
