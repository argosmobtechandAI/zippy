import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createPaymentsTable() {
    const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id TEXT,
                payment_id TEXT,
                amount NUMERIC,
                status TEXT,
                date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                user_id UUID REFERENCES users(id),
                plan_id UUID
            );
        `
    });

    if (error) {
        // If execute_sql rpc doesn't exist, we'll try a simple insert to auto-create if we have privileges, but usually we just log.
        console.error("RPC failed, maybe missing execute_sql function.", error.message);
        
        // Let's just create a dummy row to see if it exists
        const check = await supabase.from('payments').select('id').limit(1);
        if (check.error) {
            console.log("TABLE DOES NOT EXIST AND WE CANNOT CREATE IT AUTOMATICALLY. PLEASE RUN THE FOLLOWING SQL IN SUPABASE DASHBOARD:");
            console.log(`
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT,
    payment_id TEXT,
    amount NUMERIC,
    status TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    plan_id UUID
);
            `);
        } else {
            console.log("Table exists!");
        }
    } else {
        console.log("Payments table created or already exists via RPC!");
    }
}

createPaymentsTable();
