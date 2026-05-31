import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log("Adding schedule_sessions column to horse table...");
    await db.execute(sql`ALTER TABLE "horse" ADD COLUMN IF NOT EXISTS "schedule_sessions" uuid[] DEFAULT '{}'`);
    console.log("schedule_sessions column added successfully!");
  } catch (error) {
    console.error("DB migration error:", error);
  }
  process.exit(0);
}

main();
