import { supabase } from '../supabaseClient.js';

async function checkOrMakePayments() {
    const { data, error } = await supabase.from('payments').select('id').limit(1);
    
    if (error && error.code === '42P01') {
        console.log("payments table does not exist. We need to create it in supabase dashboard or via SQL.");
    } else if (error) {
        console.error("Error checking payments table:", error);
    } else {
        console.log("Payments table exists!");
    }
}

checkOrMakePayments();
