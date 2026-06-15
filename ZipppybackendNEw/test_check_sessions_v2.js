import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('date', 'daily');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Archived daily sessions detailed:", JSON.stringify(sessions, null, 2));
}

check();
