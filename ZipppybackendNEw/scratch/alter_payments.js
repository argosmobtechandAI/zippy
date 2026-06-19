import { supabase } from './supabaseClient.js';

async function alterPaymentsTable() {
    try {
        const { error: error1 } = await supabase.rpc('execute_sql', {
            sql_query: `
                ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;
                ALTER TABLE payments ADD COLUMN IF NOT EXISTS wallet_amount_used NUMERIC DEFAULT 0;
            `
        });
        if (error1) {
            console.log("Error running RPC (maybe it doesn't exist). Trying standard insert workaround if needed, or you should run this SQL manually:", error1);
        } else {
            console.log("Successfully altered payments table via RPC");
        }
    } catch (err) {
        console.error("Caught error:", err);
    }
}

alterPaymentsTable();
