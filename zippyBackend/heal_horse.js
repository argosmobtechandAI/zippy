import { db } from "./db.js";
import { horseTable } from "./schema.js";

async function run() {
  try {
    const horses = await db.select().from(horseTable);
    if (horses.length === 0) {
      console.log("No horses found. Creating a generic horse...");
      await db.insert(horseTable).values({
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "General Horse",
        location: "Lexington Stables",
        title: "Test Horse",
        weight: 500,
        speed: 40,
        shoeStatus: "Good",
        diet: "Standard",
        healthStatus: [],
        vaccinationRecords: []
      });
      console.log("Horse created successfully.");
    } else {
      console.log(`Found ${horses.length} horses.`);
    }
  } catch (error) {
    console.error("Error finding or creating horse:", error);
  } finally {
    process.exit(0);
  }
}
run();
