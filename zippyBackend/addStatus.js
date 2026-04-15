import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const query = sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'ACTIVE';`;
    await db.execute(query);
    console.log("Column added successfully!");
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run().then(() => process.exit(0));
