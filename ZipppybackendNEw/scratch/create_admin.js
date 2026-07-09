import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { userTable } from '../schema.js';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Use the connection string found in the project's test files
const pool = new Pool({
  connectionString: 'postgresql://postgres:argosmob@db.zlhpxehbcygykwqouwzb.supabase.co:5432/postgres'
});

const db = drizzle(pool);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const randomMobile = '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  const adminData = {
    name: 'Admin 3',
    email: 'admin3@zippy.com',
    mobile: randomMobile,
    password: hashedPassword,
    type: 'admin',
    status: 'ACTIVE'
  };

  try {
    const result = await db.insert(userTable).values(adminData).returning();
    console.log('Created new admin user:', result[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
