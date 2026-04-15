
import { db } from "./db.js";
import { horseTable } from "./schema.js";

async function checkAndSeedHorses() {
    try {
        const horses = await db.select().from(horseTable);
        console.log(`Current horse count: ${horses.length}`);

        if (horses.length === 0) {
            console.log("Seeding sample horses...");
            const sampleHorses = [
                {
                    name: "Midnight Star",
                    title: "Show Jumping",
                    location: "Lexington Stables",
                    status: "Available",
                    imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800",
                    age: 8,
                    weight: 520,
                    speed: 45
                },
                {
                    name: "Thunder",
                    title: "Dressage",
                    location: "North Paddock",
                    status: "Resting",
                    imageUrl: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800",
                    age: 6,
                    weight: 480,
                    speed: 38
                }
            ];
            await db.insert(horseTable).values(sampleHorses);
            console.log("Seeding complete.");
        }
    } catch (e) {
        console.error("Database check/seed failed:", e.message);
    } finally {
        process.exit();
    }
}

checkAndSeedHorses();
