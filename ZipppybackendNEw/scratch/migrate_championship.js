const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL || 'postgresql://argosmob:argosmob@db.zippyapp.online:5432/postgres',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Running migration SQL queries...");
    
    // 1. Alter rider table to add championship_points and championship_records
    await client.query(`
      ALTER TABLE rider ADD COLUMN IF NOT EXISTS championship_points integer DEFAULT 0;
    `);
    console.log("Column championship_points checked/added.");
    
    await client.query(`
      ALTER TABLE rider ADD COLUMN IF NOT EXISTS championship_records jsonb DEFAULT '[]'::jsonb;
    `);
    console.log("Column championship_records checked/added.");
    
    // 2. Create competitions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name varchar(255) NOT NULL UNIQUE,
        date varchar(50),
        created_at varchar(50) DEFAULT CURRENT_TIMESTAMP::text
      );
    `);
    console.log("Table competitions checked/created.");
    
    console.log("Migration complete successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
