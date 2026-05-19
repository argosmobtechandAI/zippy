import {db} from "../db.js";
import { batchTable } from "../schema.js";

export const createBatch = async (req, res) => {
    try {
        const { data } = req.body;
        console.log(data, "data")

        const batch = await db.insert(batchTable).values(data).returning();
        if (!batch || batch.length === 0) {
            return res.status(200).json({ success: true, message: "No batch created", batch: null });
        }
        res.status(201).json({ success: true, message: "Batch created successfully", batch: batch[0] });
    } catch (error) {
        console.error("Error in createBatch:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getAllBatches = async (req, res) => {
    try {
        const batch = await db.select().from(batchTable);
        res.status(200).json({ success: true, message: "Batches fetched successfully", batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const updateBatch = async (req, res) => {
    try {
        const { id } = req.params
        const { data } = req.body;
        const batch = await db.update(batchTable).set(data).where(eq(batchTable.id, id)).returning();
        res.status(200).json({ success: true, message: "Batch updated successfully", batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params
        const batch = await db.delete(batchTable).where(eq(batchTable.id, id)).returning();
        res.status(200).json({ success: true, message: "Batch deleted successfully", batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
