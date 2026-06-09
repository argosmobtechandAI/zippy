import { supabase } from './supabaseClient.js';

async function test() {
    try {
        console.log("Testing insert into broadcast_notifications...");
        const { data, error } = await supabase.from('broadcast_notifications').insert({
            title: "Test",
            desc: "Test Desc",
            target_type: "rider",
            image: null
        }).select();

        if (error) {
            console.error("SUPABASE ERROR:", error);
        } else {
            console.log("SUCCESS!", data);
        }
    } catch (e) {
        console.error("CATCH ERROR:", e.message);
    }
}

test();
