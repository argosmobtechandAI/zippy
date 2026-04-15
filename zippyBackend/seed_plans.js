
import { db } from './db.js';
import { planTable } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedPlans() {
    try {
        console.log("Seeding default rider plans...");
        
        const existingPlans = await db.select().from(planTable);
        
        if (existingPlans.length === 0) {
            await db.insert(planTable).values([
                {
                    name: 'Beginner Pack',
                    sessionsCount: 8,
                    validity: 'month',
                    amount: 100,
                    level: 'Beginner',
                    rules: ["8 professional sessions", "Basic stable access", "Equine care intro"]
                },
                {
                    name: 'Intermediate Pack',
                    sessionsCount: 12,
                    validity: 'month',
                    amount: 150,
                    level: 'Intermediate',
                    rules: ["12 advanced sessions", "Full stable access", "Competition prep"]
                },
                {
                    name: 'Elite Pack',
                    sessionsCount: 24,
                    validity: 'month',
                    amount: 300,
                    level: 'Advanced',
                    rules: ["24 elite sessions", "Unlimited stable access", "Tournament entry"]
                }
            ]);
            console.log("✓ 3 Plans created successfully.");
        } else {
            console.log("! Plans already exist in the database.");
        }
        
    } catch (error) {
        console.error("Seed plans failed:", error.message);
    } finally {
        process.exit();
    }
}

seedPlans();
