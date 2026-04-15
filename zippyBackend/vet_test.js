
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function vetTest() {
  try {
     // 1. Create a dummy user
     const mobile = "9" + Math.floor(Math.random() * 900000000);
     const userRes = await pool.query(`INSERT INTO users (name, email, mobile, type) VALUES ($1, $2, $3, $4) RETURNING id`, ['Vet Test', 'vettest@example.com', mobile, 'vet']);
     const userId = userRes.rows[0].id;
     console.log("User created:", userId);

     // 2. Try to insert into vet table
     const vetRes = await pool.query(`INSERT INTO vet (user_id) VALUES ($1) RETURNING *`, [userId]);
     console.log("Vet record created:", vetRes.rows[0]);

  } catch (error) {
    console.error("VET TABLE ERROR:", error);
  } finally {
    await pool.end();
  }
}

vetTest();
