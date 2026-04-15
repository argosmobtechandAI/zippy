import { db } from "./db.js";
import { horseTable, trainerTable } from "./schema.js";

async function run() {
  const h = await db.select().from(horseTable);
  console.log("Horses:", h.length);
  const t = await db.select().from(trainerTable);
  console.log("Trainers:", t.length);
  if (h.length === 0) {
    console.log("No horses. FK violation likely.");
  }
}
run().then(() => process.exit(0));
