
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'horse'
            ORDER BY ordinal_position
        `);
        console.log("Current columns in 'horse' table:");
        console.table(result.rows);
        
        const count = await db.execute(sql`SELECT COUNT(*) FROM horse`);
        console.log("Row count:", count.rows[0].count);
        
    } catch (e) {
        console.error("Database check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkColumns();
