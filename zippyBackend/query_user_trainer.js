import { db } from "./db.js";
import { userTable, trainerTable } from "./schema.js";

async function run() {
  const users = await db.select().from(userTable);
  const trainers = await db.select().from(trainerTable);
  
  const testTrainerUser = users.find(u => u.name === "Test Trainer");
  console.log("Test Trainer User:", testTrainerUser);
  console.log("Does trainer ID exist in trainerTable?", trainers.some(t => t.id === testTrainerUser?.trainerId));
  
}
run().then(() => process.exit(0));
