
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function debugData() {
    try {
        console.log("--- Checking Trainer ID ---");
        const trainerId = "fe744d89-debe-476c-96d2-3167dc4c4119";
        const user = await db.execute(sql`SELECT id, name, type FROM users WHERE id = ${trainerId}`);
        console.log("User for trainerId:", user.rows[0] || "NOT FOUND");

        console.log("--- Checking Horse Table Constraints ---");
        const constraints = await db.execute(sql`
            SELECT conname, contype, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND conrelid = 'horse'::regclass;
        `);
        console.log("Constraints on 'horse':");
        console.table(constraints.rows);

    } catch (e) {
        console.error("Debug stats failed:", e.message);
    } finally {
        process.exit();
    }
}

debugData();
