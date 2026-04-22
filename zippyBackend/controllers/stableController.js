import { db } from '../db.js';
import { horseTable, inventoryTable, stableTable } from '../schema.js';
import { inArray, eq } from "drizzle-orm";

export const createStable = async (req, res) => {
    const { data } = req.body;

    try {
        // 1. Create stable
        const newStable = await db
            .insert(stableTable)
            .values(data)
            .returning();

        if (!newStable.length) {
            return res.status(400).json({
                success: false,
                message: "Failed to create stable",
            });
        }

        const stableId = newStable[0].id;

        // 2. Update all horses in ONE query (best way)
        if (data.horses?.length) {
            await db
                .update(horseTable)
                .set({ stableId })
                .where(inArray(horseTable.id, data.horses));
        }

        // 3. Response
        res.status(201).json({
            success: true,
            stable: newStable[0],
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getStable = async (req, res) => {
    console.log(req.userId)
    try {
        const id = req.userId;
        console.log(id)
        const stables = await db.select().from(stableTable).where(eq(stableTable.userId, id));


        res.status(200).json({ success: true, stables });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}

export const updateStable = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const updatedStable = await db.update(stableTable).set(data).where(eq(stableTable.id, id)).returning();
        if (!updatedStable.length) {
            return res.status(404).json({ success: false, message: 'Stable not found' });
        }
        res.status(200).json({ success: true, stable: updatedStable[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getStables = async (req, res) => {
    try {
        const stables = await db.select().from(stableTable);
        res.status(200).json({ success: true, stables });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteStable = async (req, res) => {
    console.log("hello")
    try {
        const { id } = req.params;

        console.log(id)

        const horses = await db
            .update(horseTable)
            .set({ stableId: null })
            .where(eq(horseTable.stableId, id));

        const inventory = await db
            .update(inventoryTable)
            .set({ stableId: null })
            .where(eq(inventoryTable.stableId, id));

        const stable = await db.delete(stableTable).where(eq(stableTable.id, id)).returning();
        res.status(200).json({ success: true, stable });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};
