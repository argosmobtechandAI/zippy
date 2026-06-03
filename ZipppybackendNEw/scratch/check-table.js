import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const dbData = {
      title: "test session generated",
      timing: "09:00 - 10:30",
      duration: "90 Min",
      date: "2026-06-03",
      location: "Main Arena",
      total_seats: 10,
      status: "ACTIVE",
      joining_amount: 0
    };
    const { data, error } = await supabase.from('sessions').insert(dbData).select();
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Insert Success:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
