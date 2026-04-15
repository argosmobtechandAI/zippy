import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function applyMigrations() {
    try {
        console.log("Applying database schema updates...");
        
        // 1. Add user_id to vet table
        await db.execute(sql`ALTER TABLE vet ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)`);
        console.log("✓ Added user_id to vet table");
        
        // 2. Add trainer_id to sessions table
        await db.execute(sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES trainers(id)`);
        console.log("✓ Added trainer_id to sessions table");

        // 3. Add status to users table
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'Active'`);
        console.log("✓ Added status to users table");

        // 4. Add password to users table
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR`);
        console.log("✓ Added password column to users table");
        
        console.log("Database schema synchronization complete!");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        process.exit();
    }
}

applyMigrations();
