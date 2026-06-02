import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function main() {
  const liveUrl = 'postgresql://postgres:argosmob@db.zippyapp.online:5432/postgres';
  
  console.log('Testing connection to db.zippyapp.online...');
  const client = new Client({ connectionString: liveUrl });

  try {
    await client.connect();
    const res = await client.query("SELECT COUNT(*) FROM users");
    console.log('✅ Connected! Users count:', res.rows[0].count);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
