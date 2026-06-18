import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log('Fetching riders...');
    const { data: riders, error } = await supabase.from('rider').select('user_id, level');
    if (error) {
        console.error('Error fetching riders:', error);
        return;
    }
    
    let updatedCount = 0;
    for (const rider of riders) {
        if (!rider.level || rider.level === 'Novice' || rider.level !== 'Level 1') {
            await supabase.from('rider').update({ level: 'Level 1' }).eq('user_id', rider.user_id);
            updatedCount++;
        }
    }
    console.log(`Successfully updated ${updatedCount} riders to Level 1.`);
}

run();
