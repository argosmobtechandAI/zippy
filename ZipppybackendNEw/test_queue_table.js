import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlhpxehbcygykwqouwzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaHB4ZWhiY3lneWt3cW91d3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzQxMjMsImV4cCI6MjA5MDYxMDEyM30.AKwf94tx-ipFfG_T93gN2hTEQSUvH5aQGvO2C7mOX-g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('queued_plans').select('*').limit(1);
    if (error) {
        console.error("Table Error:", error.message);
    } else {
        console.log("Table exists! Data:", data);
    }
}
test();
