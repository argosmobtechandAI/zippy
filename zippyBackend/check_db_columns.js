
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'horse'
        `);
        console.log("Columns in 'horse' table:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Error checking columns:", e.message);
    } finally {
        process.exit();
    }
}

checkColumns();
