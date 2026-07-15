import { db } from '../../../db';
import { sql } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    console.log("Running migrations...");
    
    // 1. Add stable_id to coupons table
    console.log("Adding stable_id to coupons...");
    await db.execute(sql`
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS stable_id UUID REFERENCES stable(id);
    `);
    
    // 2. Create horse_workouts table
    console.log("Creating horse_workouts table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS horse_workouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        horse_id UUID NOT NULL REFERENCES horse(id) ON DELETE CASCADE,
        trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        date VARCHAR(50) NOT NULL,
        workout_type VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL,
        intensity VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
        notes TEXT,
        trainer_comment TEXT,
        stable_id UUID NOT NULL REFERENCES stable(id) ON DELETE CASCADE,
        created_at VARCHAR(50) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // 3. Add trainer_comment to horse_workouts table if not exists
    console.log("Adding trainer_comment column to horse_workouts if not exists...");
    await db.execute(sql`
      ALTER TABLE horse_workouts ADD COLUMN IF NOT EXISTS trainer_comment TEXT;
    `);
    
    console.log("Migrations successful!");
    return res.status(200).json({ success: true, message: "Migrations completed successfully!" });
  } catch (error) {
    console.error("Migrations failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
