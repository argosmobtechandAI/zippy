import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { stableTable, trainerTable } from "../schema.js";

export const updateTrainer = async (req, res) => {
    // try {
    const { id } = req.params;
    const { data } = req.body;
    const { stableId, title } = data;


    const trainer = await db.update(trainerTable).set({ title, stableId }).where(eq(trainerTable.id, id));
    if (trainer) {
        const stable = await db.select().from(stableTable).where(eq(stableTable.id, stableId));

        if (stable) {
            

            const trainers = stable[0].trainers.length > 0 ? [...stable[0].trainers, id] : [id];

            if (title === "Head Trainer") {
                const updated = await db.update(stableTable).set({ trainers, headTrainer: id }).where(eq(stableTable.id, stable[0].id)).returning();
                
            } else {
                const updated = await db.update(stableTable).set({ trainers }).where(eq(stableTable.id, stable[0].id)).returning();
                
            }
        }
        return res.status(200).json({ success: true, message: "Trainer updated successfully", trainer });
    }
    else {
        return res.status(400).json({ success: false, message: "Trainer not updated" });
    }

    // } catch (error) {
    //     console.log(error);
    //     res.status(500).json({ success: false, message: "Failed to update trainer", error });
    // }
}

