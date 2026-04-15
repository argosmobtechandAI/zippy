import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function check() {
    try {
        console.log("Checking horse table columns...");
        const horseCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'horse'`);
        console.log("Horse columns:", horseCols.rows);

        console.log("\nChecking trainers table columns...");
        const trainerCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'trainers'`);
        console.log("Trainer columns:", trainerCols.rows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
