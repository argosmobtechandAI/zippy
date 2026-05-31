import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rider'`);
    console.log("Rider table columns:", res.rows);
  } catch (error) {
    console.error("DB Query error:", error);
  }
  process.exit(0);
}

main();
