import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function checkTables() {
    try {
        const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables in database:", JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Error checking tables:", e);
    } finally {
        process.exit();
    }
}

checkTables();
