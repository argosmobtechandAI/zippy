const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://db.zippyapp.online';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: stables, error: err1 } = await supabase.from('stable').select('id, name');
  console.log("Stables:", stables, err1);

  const { data: sessions, error: err2 } = await supabase.from('sessions').select('id, title, location, trainers').limit(10);
  console.log("Sessions:", sessions, err2);
}

check();
