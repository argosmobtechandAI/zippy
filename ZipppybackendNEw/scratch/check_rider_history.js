import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from the parent backend folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables not found. Make sure .env exists in ZipppybackendNEw/");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHistory() {
  console.log("=== CHECKING DATABASE RIDER HISTORY ===");
  
  // 1. Fetch all riders with their user profiles
  const { data: riders, error: riderErr } = await supabase
    .from('rider')
    .select('id, user_id, plan, plan_end_date, session_count, users(name, email, mobile)');
    
  if (riderErr) {
    console.error("Error fetching riders:", riderErr);
    return;
  }

  // Print riders currently showing session count of 0 but who have some plan
  console.log("\nRiders with 0 sessions but possessing a plan:");
  const ridersWithZero = riders.filter(r => (r.session_count === 0 || r.session_count === null) && r.plan);
  
  if (ridersWithZero.length === 0) {
    console.log("No riders found with 0 sessions and an assigned plan.");
  } else {
    ridersWithZero.forEach(r => {
      const user = r.users || {};
      console.log(`- Name: ${user.name || 'N/A'} | Email: ${user.email || 'N/A'} | Phone: ${user.mobile || 'N/A'}`);
      console.log(`  Rider ID: ${r.id} | User ID: ${r.user_id}`);
      console.log(`  Current Session Count: ${r.session_count}`);
      console.log(`  Plan Name: ${r.plan?.name || 'N/A'} | Plan Expiry: ${r.plan_end_date || 'null'}`);
      console.log("-----------------------------------------");
    });
  }

  // 2. Fetch recent transactions/status updates in the revenue table
  console.log("\n=== RECENT REVENUE / SUBSCRIPTION HISTORY ===");
  const { data: revenue, error: revErr } = await supabase
    .from('revenue')
    .select('id, amount, type, date, purchaserid, status, end_date')
    .order('date', { ascending: false })
    .limit(15);

  if (revErr) {
    console.error("Error fetching revenue history:", revErr);
    return;
  }

  console.log(`Found ${revenue ? revenue.length : 0} records in revenue table.`);

  revenue.forEach(rev => {
    // Cross-reference user name
    const matchingRider = riders.find(r => r.user_id === rev.purchaserid);
    const userName = matchingRider?.users?.name || 'Unknown User';
    
    console.log(`- User: ${userName} (${rev.purchaserid})`);
    console.log(`  Type: ${rev.type} | Amount: ₹${rev.amount} | Status: ${rev.status}`);
    console.log(`  Purchased On: ${rev.date} | Plan End Date: ${rev.end_date || 'N/A'}`);
    console.log("-----------------------------------------");
  });
}

checkHistory();
