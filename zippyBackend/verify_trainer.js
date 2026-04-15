
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function verifyTrainer() {
    try {
        const targetId = "15d0d174-c8eb-4077-a717-fdb27f08ef64";
        const result = await db.execute(sql`SELECT id, name, type FROM users WHERE id = ${targetId}`);
        if (result.rows.length > 0) {
            console.log("TRAINER EXISTS:", result.rows[0]);
        } else {
            console.error("TRAINER NOT FOUND IN DATABASE!");
            const allUsers = await db.execute(sql`SELECT id, name, type FROM users LIMIT 5`);
            console.log("Sample users in DB:", allUsers.rows);
        }
    } catch (e) {
        console.error("Check failed:", e.message);
    } finally {
        process.exit();
    }
}

verifyTrainer();
