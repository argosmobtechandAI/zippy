const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:argosmob@db.zippyapp.online:5432/postgres'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Adding column stable_id to coupons table...");
    await client.query(`
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS stable_id UUID REFERENCES stable(id);
    `);
    console.log("Column stable_id added successfully!");
    
    // Also verify schema of coupons table
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'coupons';
    `);
    console.log("Updated columns:", res.rows);
  } catch (err) {
    console.error("Failed to run query:", err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
