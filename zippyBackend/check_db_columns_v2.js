
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function checkColumns() {
  try {
    const tables = ['users', 'vet', 'trainers', 'rider'];
    for (const table of tables) {
      console.log(`\nColumns in '${table}' table:`);
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${table}
        ORDER BY ordinal_position;
      `);
      console.log(JSON.stringify(result.rows, null, 2));
    }
  } catch (error) {
    console.error("Error checking columns:", error);
  } finally {
    process.exit();
  }
}

checkColumns();
