
import { db } from "./db.js";
import { sessionTable, riderTable, userTable } from "./schema.js";
import { sql, eq } from "drizzle-orm";

async function repairBookings() {
    try {
        // 1. Find a valid rider
        const riders = await db.select({
            id: riderTable.id,
            name: userTable.name
        })
        .from(riderTable)
        .innerJoin(userTable, eq(riderTable.userId, userTable.id))
        .limit(1);

        if (riders.length === 0) {
            console.log("No riders found to repair bookings.");
            return;
        }

        const activeRider = riders[0];
        console.log(`Using Rider: ${activeRider.name} (${activeRider.id}) for repair.`);

        // 2. Fetch all sessions
        const sessions = await db.select().from(sessionTable);
        
        for (const session of sessions) {
            let changed = false;
            const updatedParticipants = (session.participants || []).map(p => {
                if (!p.riderId) {
                    console.log(`Repairing participant ${p.name} in session ${session.title}`);
                    changed = true;
                    return { ...p, riderId: activeRider.id };
                }
                return p;
            });

            if (changed) {
                await db.update(sessionTable)
                    .set({ participants: updatedParticipants })
                    .where(eq(sessionTable.id, session.id));
                console.log(`Updated session ${session.id}`);
            }
        }
        console.log("Repair completed successfully.");
    } catch (e) {
        console.error("Repair failed:", e);
    } finally {
        process.exit();
    }
}

repairBookings();
