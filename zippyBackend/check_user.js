
import { db } from "./db.js";
import { userTable } from "./schema.js";
import { eq } from "drizzle-orm";

async function checkMobile(mobile) {
  try {
    const users = await db.select().from(userTable).where(eq(userTable.mobile, mobile));
    console.log("Users with mobile " + mobile + ":", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error checking mobile:", error);
  } finally {
    process.exit();
  }
}

checkMobile("8439993033");
