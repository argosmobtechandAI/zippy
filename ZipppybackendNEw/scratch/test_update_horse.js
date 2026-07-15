import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.zippyapp.online';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateHorse() {
  const { data, error } = await supabase.from('horse').update({ trainer_id: null }).eq('id', 'c637a8b4-82a9-4b6d-a77b-bbcc340ff490'); // Random ID just to see if schema allows it
  console.log("Update Horse Error:", error);
}

testUpdateHorse();
