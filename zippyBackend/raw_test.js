
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function rawTest() {
  try {
    const res = await pool.query(`
      INSERT INTO users (name, email, mobile, type, dob, age, weight, emergency_contact, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, ['Vansh Test', 'vanshtest@example.com', '9876543210', 'vet', '2026-04-08', 22, 22, '1231234123', 'ACTIVE']);
    console.log("Success:", res.rows[0]);
  } catch (error) {
    console.error("RAW ERROR:", error);
  } finally {
    await pool.end();
  }
}

rawTest();
