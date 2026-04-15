import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function patch() {
    try {
        console.log("Patching database: Adding trainer_id to horse table...");
        await db.execute(sql`ALTER TABLE horse ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES users(id)`);
        console.log("Patch applied successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Patch failed:", e);
        process.exit(1);
    }
}

patch();
