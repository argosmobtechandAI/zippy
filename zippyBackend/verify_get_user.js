import { db } from "./db.js";
import { riderTable, trainerTable, userTable, vetTable } from './schema.js';
import { eq } from 'drizzle-orm';

async function testGetUser() {
    // Find a rider user
    const riders = await db.select().from(userTable).where(eq(userTable.type, 'rider')).limit(5);
    console.log("Found riders:", riders.map(r => ({id: r.id, name: r.name})));

    if (riders.length > 0) {
        const userId = riders[0].id;
        console.log(`Testing getUser for ID: ${userId}`);

        const result = await db.select({
            id: userTable.id,
            name: userTable.name,
            type: userTable.type,
            trainerId: trainerTable.id,
            riderId: riderTable.id,
            vetId: vetTable.id
        })
        .from(userTable)
        .leftJoin(trainerTable, eq(userTable.id, trainerTable.userId))
        .leftJoin(riderTable, eq(userTable.id, riderTable.userId))
        .leftJoin(vetTable, eq(userTable.id, vetTable.userId))
        .where(eq(userTable.id, userId));

        console.log("Query Result:", JSON.stringify(result, null, 2));
    } else {
        console.log("No riders found to test.");
    }
    process.exit(0);
}

testGetUser();
