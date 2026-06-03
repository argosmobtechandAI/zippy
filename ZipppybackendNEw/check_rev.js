import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zlhpxehbcygykwqouwzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaHB4ZWhiY3lneWt3cW91d3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzQxMjMsImV4cCI6MjA5MDYxMDEyM30.AKwf94tx-ipFfG_T93gN2hTEQSUvH5aQGvO2C7mOX-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('revenue').select('*').order('date', { ascending: false }).limit(5);
    console.log("Error:", error);
    console.log("Data:", JSON.stringify(data, null, 2));
}

check();
