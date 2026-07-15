import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.zippyapp.online';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const { data, error } = await supabase.from('sessions').update({ trainers: null }).eq('id', 'e62bd909-4f30-4fd2-8a91-55e258a89a8d');
  console.log("Update Error:", error);
  console.log("Update Data:", data);
}

testUpdate();
