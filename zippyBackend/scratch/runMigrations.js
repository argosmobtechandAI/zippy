import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const migrations = [
  // users table - add missing columns
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications jsonb DEFAULT '[]'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS leaves jsonb DEFAULT '[]'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture varchar(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS otp varchar(10)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS dob varchar(50)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS age integer`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS weight integer`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_name varchar(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact varchar(20)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'ACTIVE'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at varchar(50)`,

  // rider table
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS code varchar(50)`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS rider_type varchar(50) DEFAULT 'Regular'`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS allergies varchar(255)`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS instructions varchar(500)`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS plan jsonb DEFAULT '[]'`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS signature varchar(255)`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS session_count integer DEFAULT 0`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS joined_sessions uuid[]`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS safety_briefing jsonb DEFAULT '[]'`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS trophies jsonb DEFAULT '[]'`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS pending_sessions uuid[]`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS medical varchar(255)`,
  `ALTER TABLE rider ADD COLUMN IF NOT EXISTS plan_end_date varchar(50) DEFAULT ''`,

  // trainers table
  `ALTER TABLE trainers ADD COLUMN IF NOT EXISTS stable_id uuid`,
  `ALTER TABLE trainers ADD COLUMN IF NOT EXISTS "leaveRequests" jsonb DEFAULT '[]'`,
  `ALTER TABLE trainers ADD COLUMN IF NOT EXISTS "pendingSessions" uuid[]`,

  // stable table
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS code varchar(255) DEFAULT 'ZE'`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS logo varchar(255)`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS horses varchar[]`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS trainers uuid[]`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS head_trainer uuid`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS stocks jsonb DEFAULT '[]'`,
  `ALTER TABLE stable ADD COLUMN IF NOT EXISTS total_revenue integer DEFAULT 0`,
];

async function main() {
  const liveUrl = 'postgresql://postgres:argosmob@db.zippyapp.online:5432/postgres';
  
  console.log('Connecting to live database at db.zippyapp.online...');
  const client = new Client({ connectionString: liveUrl });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    let passed = 0, skipped = 0;
    for (const sql of migrations) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql.substring(0, 90)}`);
        passed++;
      } catch (err) {
        console.log(`ℹ️  Already exists or skipped: ${sql.substring(0, 70)}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Done! ${passed} applied, ${skipped} skipped.`);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
