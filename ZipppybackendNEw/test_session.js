import { supabase } from './supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('sessions').insert({
    title: 'Test Session',
    timing: '10:00 AM',
    date: '2026-06-10',
    duration: '1 Hour',
    location: 'Zippy Equestrian Center',
    total_seats: 7
  }).select();
  console.log(error ? error.message : "Success");
}
test();
