import { supabase } from './supabaseClient.js';

async function check() {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .gte('date', '2026-06-12')
      .lte('date', '2026-07-15')
      .order('date', { ascending: true })
      .order('timing', { ascending: true });
      
    if (error) {
      console.error("Supabase error:", error);
      return;
    }
    
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach(s => {
      console.log(`ID: ${s.id} | Date: ${s.date} | Title: ${s.title} | Timing: ${s.timing} | Location: ${s.location} | Trainer: ${s.trainers} | Status: ${s.status}`);
    });
  } catch (err) {
    console.error("Error running query:", err);
  }
}

check();
