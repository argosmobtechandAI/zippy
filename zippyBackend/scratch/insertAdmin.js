import { db } from '../db.js';
import { userTable } from '../schema.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const mobile = "1234567890";
    const email = "admin@zippy.com";
    const password = "admin";
    
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("Inserting admin user...");
    const [user] = await db.insert(userTable).values({
      name: "Admin User",
      email: email,
      mobile: mobile,
      password: hashedPassword,
      type: "admin",
      status: "ACTIVE"
    }).returning();
    
    console.log("Successfully created admin user!");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    process.exit(0);
  }
}

main();
