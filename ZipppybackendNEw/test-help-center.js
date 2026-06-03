import { db } from './db.js';
import { helpCenterTable } from './schema.js';

async function test() {
  try {
    await db.insert(helpCenterTable).values({
      userId: null,
      subject: "test",
      message: "test",
      status: "Open"
    });
    console.log("Success");
  } catch (error) {
    console.error("Failed:", error);
  }
  process.exit();
}

test();
