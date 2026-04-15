import { db } from "./db.js";
import { sessionTable } from './schema.js';
import { sql } from 'drizzle-orm';

async function testQuery() {
    const riderId = 'c8db602a-13dc-4307-9dfc-ae501710e460';
    console.log(`Testing query for riderId: ${riderId}`);
    
    // Exact logic from sessionController.js
    const searchJson = JSON.stringify([{ riderId }]);
    console.log(`Search JSON: ${searchJson}`);
    
    const results = await db.select()
        .from(sessionTable)
        .where(sql`${sessionTable.participants} @> ${searchJson}::jsonb`);
        
    console.log(`Found ${results.length} sessions.`);
    if (results.length > 0) {
        results.forEach(s => console.log(` - ${s.title} (ID: ${s.id})` ));
    }
    
    process.exit(0);
}

testQuery();
