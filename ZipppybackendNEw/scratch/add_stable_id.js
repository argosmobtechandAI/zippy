import { supabase } from './supabaseClient.js';

async function main() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: 'ALTER TABLE rider ADD COLUMN stable_id UUID REFERENCES stable(id);'
  });
  console.log('Result:', data, error);
}

main();
