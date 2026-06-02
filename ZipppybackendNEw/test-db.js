import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.SUPABASE_URL });
pool.query('SELECT NOW()')
  .then(res => { console.log("DB SUCCESS:", res.rows); process.exit(0); })
  .catch(err => { console.error("DB ERROR:", err); process.exit(1); });
