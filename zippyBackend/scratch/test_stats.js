
import { db } from "./db.js";
import { userTable, horseTable, stableTable, sessionTable } from "./schema.js";
import { count, sum, eq } from "drizzle-orm";

async function test() {
  try {
    console.log("Testing Stats logic...");
    
    // 1. Total Riders
    const ridersResult = await db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.type, "rider"));
    console.log("Riders:", ridersResult[0].count);

    // 2. Active Horses
    const horsesResult = await db
      .select({ count: count() })
      .from(horseTable);
    console.log("Horses:", horsesResult[0].count);

    // 3. Total Revenue
    try {
        const revenueResult = await db
          .select({ total: sum(stableTable.totalRevenue) })
          .from(stableTable);
        console.log("Revenue:", revenueResult[0].total);
    } catch (e) {
        console.error("Revenue select failed:", e.message);
    }

    // 4. Stables
    const stables = await db.select().from(stableTable);
    console.log("Stables Count:", stables.length);

    console.log("Test Complete");
    process.exit(0);
  } catch (error) {
    console.error("Stats Test CRASHED:", error);
    process.exit(1);
  }
}

test();
