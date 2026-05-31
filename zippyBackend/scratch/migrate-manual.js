import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log("Adding wallet column to rider table...");
    await db.execute(sql`ALTER TABLE "rider" ADD COLUMN IF NOT EXISTS "wallet" integer DEFAULT 0`);
    console.log("Wallet column added successfully!");
    
    const res = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rider'`);
    console.log("Rider table columns now:", res.rows);
  } catch (error) {
    console.error("DB migration error:", error);
  }
  process.exit(0);
}

main();
