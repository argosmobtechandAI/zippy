
import { db } from "./db.js";
import { sessionTable } from "./schema.js";

async function checkSessions() {
    try {
        const sessions = await db.select().from(sessionTable);
        console.log("Current Sessions and Participants:");
        sessions.forEach(s => {
            console.log(`- Session ID: ${s.id}, Title: ${s.title}`);
            console.log(`  Participants: ${JSON.stringify(s.participants)}`);
        });
    } catch (e) {
        console.error("Error checking sessions:", e);
    } finally {
        process.exit();
    }
}

checkSessions();
