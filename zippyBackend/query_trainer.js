import { db } from "./db.js";
import { trainerTable, userTable } from "./schema.js";

async function run() {
  const trainers = await db.select().from(trainerTable);
  console.log("Trainers:", trainers);
}
run().then(() => process.exit(0));
