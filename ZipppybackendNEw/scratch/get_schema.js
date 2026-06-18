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

async function checkTables() {
  console.log("=== CHECKING DATABASE TABLES AND ROW COUNTS ===");

  const tables = ['users', 'rider', 'trainers', 'sessions', 'plan', 'revenue', 'admin_notifications'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log(`- Table "${table}": Error or doesn't exist (${error.message})`);
    } else {
      console.log(`- Table "${table}": ${count} rows`);
    }
  }
}

checkTables();
