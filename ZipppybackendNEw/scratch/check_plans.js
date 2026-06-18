import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlans() {
  console.log("=== MEMBERSHIP PLANS IN DATABASE ===");

  const { data: plans, error } = await supabase
    .from('plan')
    .select('*');
    
  if (error) {
    console.error("Error fetching plans:", error);
    return;
  }

  plans.forEach(p => {
    console.log(`- ID: ${p.id}`);
    console.log(`  Name: ${p.name}`);
    console.log(`  Sessions Count: ${p.sessions_count || p.sessionsCount || 0}`);
    console.log(`  Validity: ${p.validity}`);
    console.log(`  Amount: ${p.amount}`);
    console.log("-----------------------------------------");
  });
}

checkPlans();
