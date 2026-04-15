
import { db } from "./db.js";
import { horseTable } from "./schema.js";

async function testInsert() {
    console.log("Starting debug insert test...");
    const testData = {
        name: "Debug Horse " + Date.now(),
        location: "Lexington Stables",
        title: "Test Entry",
        weight: 500,
        speed: 40,
        shoeStatus: "Test Shoe",
        diet: "Test Diet",
        age: 5
    };

    try {
        const result = await db.insert(horseTable).values(testData).returning();
        console.log("SUCCESS:", result[0]);
    } catch (e) {
        console.error("DEBUG INSERT FAILED:", e.message);
        console.error("Full error details:", JSON.stringify(e, null, 2));
    } finally {
        process.exit();
    }
}

testInsert();
