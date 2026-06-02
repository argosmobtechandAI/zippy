import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://postgres:argosmob@db.zlhpxehbcygykwqouwzb.supabase.co:5432/postgres' });
pool.query('SELECT NOW()')
  .then(res => { console.log("DB SUCCESS:", res.rows); process.exit(0); })
  .catch(err => { console.error("DB ERROR:", err.message); process.exit(1); });
