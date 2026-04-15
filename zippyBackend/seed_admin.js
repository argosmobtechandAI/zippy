
import { db } from './db.js';
import { userTable } from './schema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
    try {
        console.log("Seeding default admin user...");
        
        const hashedHash = await bcrypt.hash('admin123', 10);
        
        const existingAdmin = await db.select().from(userTable).where(userTable.email, 'admin@zippy.com');
        
        if (existingAdmin.length === 0) {
            await db.insert(userTable).values({
                name: 'Super Admin',
                email: 'admin@zippy.com',
                mobile: '0000000000',
                type: 'admin',
                password: hashedHash,
                status: 'Active'
            });
            console.log("✓ Admin created: admin@zippy.com / admin123");
        } else {
            console.log("! Admin user already exists.");
        }
        
    } catch (error) {
        console.error("Seed failed:", error.message);
    } finally {
        process.exit();
    }
}

seedAdmin();
