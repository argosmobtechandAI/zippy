import { supabase } from './supabaseClient.js';

async function checkSchema() {
    const { data, error } = await supabase.from('rider').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

checkSchema();
