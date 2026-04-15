import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function diag() {
    try {
        const horseCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'horse'`);
        console.log("Horse Columns:", horseCols.rows);
        
        const trainerCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'trainers'`);
        console.log("Trainer Columns:", trainerCols.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
diag();
