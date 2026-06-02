import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://argosmob.zlhpxehbcygykwqouwzb:argosmob@aws-0-ap-south-1.pooler.supabase.com:6543/postgres' });
pool.query('SELECT NOW()')
  .then(res => { console.log("DB SUCCESS:", res.rows); process.exit(0); })
  .catch(err => { console.error("DB ERROR:", err.message); process.exit(1); });
