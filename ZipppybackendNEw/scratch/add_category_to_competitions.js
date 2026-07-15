const pg = require('pg');

const connectionStrings = [
  'postgresql://postgres:argosmob@db.zippyapp.online:6543/postgres',
  'postgresql://postgres:argosmob@db.zippyapp.online:5432/postgres',
  'postgresql://postgres.zlhpxehbcygykwqouwzb:argosmob@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:argosmob@db.zlhpxehbcygykwqouwzb.supabase.co:5432/postgres'
];

async function runMigration() {
  for (const connStr of connectionStrings) {
    console.log(`Trying connection string: ${connStr.split('@')[1]}`);
    const pool = new pg.Pool({ connectionString: connStr });
    try {
      const client = await pool.connect();
      console.log("Connected successfully! Running migration...");
      await client.query(`
        ALTER TABLE competitions ADD COLUMN IF NOT EXISTS category varchar(255);
      `);
      console.log("Column 'category' added/checked on competitions table successfully!");
      client.release();
      await pool.end();
      break; // Stop after first successful migration
    } catch (error) {
      console.error(`Failed with connection string: ${connStr.split('@')[1]} - Error: ${error.message}`);
      await pool.end();
    }
  }
}

runMigration();
