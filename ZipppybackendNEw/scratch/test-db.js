import { db } from '../db.js';
import { levelTable, couponTable } from '../schema.js';

async function testInsert() {
  try {
    console.log("Testing db connection and insert...");
    const newLevel = await db.insert(levelTable).values({
      name: "Test Level " + Date.now(),
      description: "Test",
      weekdaysPrice: 100,
      weekendPrice: 200,
      sessions: 10
    }).returning();
    console.log("Success:", newLevel);
  } catch (error) {
    console.error("DB Error:", error);
    console.log("Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
}

testInsert().then(() => process.exit(0));
