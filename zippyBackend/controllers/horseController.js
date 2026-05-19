import { db } from '../db.js';
import { horseTable, healthStatusTable, vaccinationRecordsTable, sessionTable, userTable } from '../schema.js';
import { eq, sql, arrayContains } from 'drizzle-orm';

export const createHorse = async (req, res) => {
    const { data } = req.body;
    console.log("Attempting to create horse with data:", data);
    try {
        const newHorse = await db.insert(horseTable).values(data).returning();
        if (!newHorse.length) {
            console.error("Insert failed: empty return");
            return res.status(400).json({ success: false, message: 'Failed to create horse' });
        }
        console.log("Horse created successfully:", newHorse[0].id);
        res.status(201).json({ success: true, horse: newHorse[0] });
    } catch (error) {
        console.error("Database Error during createHorse:", error);
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getHorses = async (req, res) => {

    const horses = await db.select().from(horseTable);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const last7DaysDate = new Date();
    last7DaysDate.setDate(now.getDate() - 7);

    const horsesWithStats = await Promise.all(horses.map(async horse => {
        const horseSessions = await db.select().from(sessionTable).where(arrayContains(sessionTable.horseId, [horse.id]));
        const vaccinationRecords = await db.select().from(vaccinationRecordsTable).where(eq(vaccinationRecordsTable.horseId, horse.id));
        const trainer = await db.select().from(userTable).where(eq(userTable.id, horse.trainerId));
        const healthRecords = await db.select().from(healthStatusTable).where(eq(healthStatusTable.horseId, horse.id));



        // Sessions Today
        const sessionsTodayCount = horseSessions.filter(s => s.date === todayStr).length;

        // Weekly Load (Last 7 days)
        const sessionsLast7Days = horseSessions.filter(s => {
            try {
                const sessionDate = new Date(s.date);
                return sessionDate >= last7DaysDate && sessionDate <= now;
            } catch (e) { return false; }
        }).length;

        // Target is 7 sessions per week for 100%
        const trainingAvg = Math.min(100, Math.round((sessionsLast7Days / 7) * 100));



        return {
            ...horse,
            sessionsToday: sessionsTodayCount,
            weeklyTrainingAvg: trainingAvg,
            trainer: trainer[0],
            vaccinationRecords: vaccinationRecords?.length > 0 ? vaccinationRecords : [],
            healthRecords: healthRecords?.length > 0 ? healthRecords : []
        };
    }));


    res.status(200).json({ success: true, horses: horsesWithStats });
    // } catch (error) {
    //     console.error("Error in getHorses stats aggregation:", error);
    //     res.status(500).json({ success: false, message: `Error: ${error.message}` });
    // }
};

export const getHorseById = async (req, res) => {
    const { id } = req.params;
    try {
        const horse = await db.select().from(horseTable).where(eq(horseTable.id, id));
        if (!horse.length) {
            return res.status(404).json({ success: false, message: 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: horse[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateHorse = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const updatedHorse = await db.update(horseTable).set(data).where(eq(horseTable.id, id)).returning();
        if (!updatedHorse.length) {
            return res.status(404).json({ success: false, message: 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: updatedHorse[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteHorse = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedHorse = await db.delete(horseTable).where(eq(horseTable.id, id)).returning();
        if (!deletedHorse.length) {
            return res.status(404).json({ success: false, message: 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: deletedHorse[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const logHealthStatus = async (req, res) => {
    const { data } = req.body;
    console.log("Logging health status for horse:", data.horseId);
    try {
        // Ensure medications is physically present to satisfy NotNull if Drizzle default is bypassed
        const statusData = {
            ...data,
            medications: data.medications || []
        };
        const newStatus = await db.insert(healthStatusTable).values(statusData).returning();
        if (newStatus.length > 0) {

            res.status(201).json({ success: true, healthStatus: newStatus[0] });
        } else {
            res.status(400).json({ success: false, message: "Failed to log health status" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const logVaccination = async (req, res) => {
    const { data } = req.body;
    console.log("Logging vaccination for horse:", data.horseId);
    try {
        // Fallback for nextDate if empty to avoid NOT NULL constraint failure
        const vaccData = {
            ...data,
            nextDate: data.nextDate || "None"
        };
        const newRecord = await db.insert(vaccinationRecordsTable).values(vaccData).returning();
        if (newRecord.length > 0) {
            await db.update(horseTable)
                .set({
                    vaccinationRecords: sql`array_append(vaccination_records, ${newRecord[0].id})`
                })
                .where(eq(horseTable.id, data.horseId));
        }
        res.status(201).json({ success: true, vaccinationRecord: newRecord[0] });
    } catch (error) {
        console.error("Vaccination log error:", error.message);
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getHealthRecords = async (req, res) => {
    const { horseId } = req.query;
    try {
        let query = db.select().from(healthStatusTable);
        if (horseId) {
            query = query.where(eq(healthStatusTable.horseId, horseId));
        }
        const records = await query;
        res.status(200).json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getVaccinationRecords = async (req, res) => {
    const { horseId } = req.query;
    try {
        let query = db.select().from(vaccinationRecordsTable);
        if (horseId) {
            query = query.where(eq(vaccinationRecordsTable.horseId, horseId));
        }
        const records = await query;
        res.status(200).json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const runHorseMigrations = async () => {
    try {
        // Table migrations
        const tableMigrations = [
            `CREATE TABLE IF NOT EXISTS health_status (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                horse UUID NOT NULL,
                date VARCHAR(50) NOT NULL,
                status VARCHAR(255) NOT NULL,
                notes VARCHAR(500),
                title VARCHAR(255) NOT NULL,
                treatment VARCHAR(255) NOT NULL,
                medications JSONB DEFAULT '[]'
            )`,
            `CREATE TABLE IF NOT EXISTS vaccination_records (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                horse UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                date VARCHAR(50) NOT NULL,
                next_date VARCHAR(50) NOT NULL,
                batch_number VARCHAR(255) NOT NULL,
                notes VARCHAR(500)
            )`
        ];

        for (const sqlQuery of tableMigrations) {
            try {
                await db.execute(sql.raw(sqlQuery));
            } catch (e) {
                console.error("Table creation failed:", e.message);
            }
        }

        const migrations = [
            { name: "weight", type: "INTEGER DEFAULT 0" },
            { name: "speed", type: "INTEGER DEFAULT 0" },
            { name: "age", type: "INTEGER DEFAULT 0" },
            { name: "image_url", type: "VARCHAR(1000)" },
            { name: "last_visit", type: "VARCHAR(50)" },
            { name: "status", type: "VARCHAR(50) DEFAULT 'Available'" },
            { name: "shoe_status", type: "VARCHAR(255) DEFAULT 'Standard'" },
            { name: "diet", type: "VARCHAR(255) DEFAULT 'Standard Diet'" },
            { name: "deworming_record", type: "VARCHAR(500)" },
            { name: "shoeing_remarks", type: "VARCHAR(500)" },
            { name: "health_remarks", type: "VARCHAR(500)" },
            { name: "vaccination_summary", type: "VARCHAR(500)" },
            { name: "sessions", type: "UUID[] DEFAULT '{}'" },
            { name: "health_status", type: "UUID[] DEFAULT '{}'" },
            { name: "vaccination_records", type: "UUID[] DEFAULT '{}'" }
        ];

        for (const col of migrations) {
            try {
                // First ensure column exists
                await db.execute(sql.raw(`ALTER TABLE horse ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`));
                // Then force default if it was already there without one
                if (col.type.includes("DEFAULT")) {
                    const defaultVal = col.type.split("DEFAULT")[1];
                    await db.execute(sql.raw(`ALTER TABLE horse ALTER COLUMN ${col.name} SET DEFAULT ${defaultVal}`));
                }
            } catch (e) {
                console.error(`Local migration failed for ${col.name}:`, e.message);
            }
        }
        console.log("Database schema synchronization complete.");
    } catch (error) {
        console.error("Migration fatal error:", error.message);
    }
};

export const migrateHorseTable = async (req, res) => {
    await runHorseMigrations();
    res.status(200).json({ success: true, message: "Migration check completed" });
};

export const seedHorses = async (req, res) => {
    try {
        const sampleHorses = [
            {
                name: "Midnight Star",
                location: "Lexington Stables",
                title: "Show Jumping",
                weight: 520,
                speed: 45,
                shoeStatus: "Standard",
                diet: "High-Protein",
                imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800",
                age: 8,
                status: "Available"
            },
            {
                name: "Thunder",
                location: "North Paddock",
                title: "Beginner Friendly",
                weight: 480,
                speed: 35,
                shoeStatus: "Aluminum",
                diet: "Fiber-Rich",
                imageUrl: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800",
                age: 6,
                status: "Resting"
            },
            {
                name: "Seraphina",
                location: "West Stable",
                title: "Dressage",
                weight: 500,
                speed: 40,
                shoeStatus: "Standard",
                diet: "Balanced Mix",
                imageUrl: "https://images.unsplash.com/photo-1534073737327-5ee72eff7895?auto=format&fit=crop&q=80&w=800",
                age: 7,
                status: "Training"
            }
        ];

        await db.insert(horseTable).values(sampleHorses);

        res.status(200).json({ success: true, message: "Sample fleet registry initialized" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHorsesByStable = async (req, res) => {
    const { stableId } = req.params;
    try {
        const horses = await db.select().from(horseTable).where(eq(horseTable.stableId, stableId));

        const completeHorses = await Promise.all(horses.map(async (horse) => {
            const healthRecords = await db.select().from(healthStatusTable).where(eq(healthStatusTable.horseId, horse.id));

            let latestHealthStatus = null;
            if (healthRecords.length > 0) {
                latestHealthStatus = healthRecords.reduce((a, b) =>
                    b.date > a.date ? b : a
                );
            }
            const vaccinationRecords = await db.select().from(vaccinationRecordsTable).where(eq(vaccinationRecordsTable.horseId, horse.id));

            const trainer = await db.select().from(userTable).where(eq(userTable.id, horse.trainerId));

            const sessions = await db.select().from(sessionTable).where(arrayContains(sessionTable.horseId, [horse.id]));


            return { ...horse, healthRecords: latestHealthStatus, vaccinationRecords, trainer, session: sessions };
        }));
        res.status(200).json({ success: true, horses: completeHorses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const assignVet = async (req, res) => {
    const { horseId } = req.params;
    const { data } = req.body;
    const { vatId } = data;

    console.log(horseId, vatId)
    try {
        const horse = await db.select().from(horseTable).where(eq(horseTable.id, horseId));
        if (horse.length === 0) {
            return res.status(404).json({ success: false, message: "Horse not found" });
        }

        const updatedHorse = await db.update(horseTable).set({ vatId }).where(eq(horseTable.id, horseId)).returning();
        console.log(updatedHorse)
        if (updatedHorse.length === 0) {
            return res.status(404).json({ success: false, message: "Horse could not update" });
        }
        res.status(200).json({ success: true, message: "Vet assigned successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const assignTrainer = async (req, res) => {
    const { horseId } = req.params;
    const { data } = req.body;
    const { trainerId } = data;

    console.log(horseId, trainerId)
    try {
        const horse = await db.select().from(horseTable).where(eq(horseTable.id, horseId));
        if (horse.length === 0) {
            return res.status(404).json({ success: false, message: "Horse not found" });
        }

        const updatedHorse = await db.update(horseTable).set({ trainerId }).where(eq(horseTable.id, horseId)).returning();
        console.log(updatedHorse)
        if (updatedHorse.length === 0) {
            return res.status(404).json({ success: false, message: "Horse could not update" });
        }
        res.status(200).json({ success: true, message: "Trainer assigned successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};