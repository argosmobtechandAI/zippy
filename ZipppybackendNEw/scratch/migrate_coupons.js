const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://db.zippyapp.online';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Calling execute_sql RPC with sql_query parameter...");
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE coupons ADD COLUMN IF NOT EXISTS stable_id UUID REFERENCES stable(id);'
  });
  console.log('Result:', data, error);
}

main();
