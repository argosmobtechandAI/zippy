import { db } from '../db.js';
import { userTable, riderTable } from '../schema.js';

async function main() {
  try {
    const mobile = "8439993033";
    const password = "12345678";
    
    console.log("Inserting user...");
    const [user] = await db.insert(userTable).values({
      name: "Test Rider",
      email: `${mobile}@example.com`,
      mobile: mobile,
      password: password, // Note: In a real app this should be hashed if the app hashes passwords. Looking at schema, maybe it's plain or hashed by controller.
      type: "RIDER",
    }).returning();
    
    console.log("Inserted user:", user.id);
    
    console.log("Inserting rider...");
    const [rider] = await db.insert(riderTable).values({
      level: "Beginner",
      userId: user.id,
      code: `RIDER-${mobile}`,
    }).returning();
    
    console.log("Inserted rider:", rider.id);
    
    console.log("Successfully created user and rider directly in DB.");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    process.exit(0);
  }
}

main();
