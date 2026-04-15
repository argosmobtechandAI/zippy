
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function checkConstraints() {
  try {
    console.log(`\nUnique constraints on 'users' table:`);
    const result = await db.execute(sql`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'users'::regclass AND contype = 'u';
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    
    console.log(`\nChecking all NOT NULL columns for 'users':`);
    const result2 = await db.execute(sql`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public' AND is_nullable = 'NO';
    `);
    console.log(JSON.stringify(result2.rows, null, 2));

  } catch (error) {
    console.error("Error checking constraints:", error);
  } finally {
    process.exit();
  }
}

checkConstraints();
