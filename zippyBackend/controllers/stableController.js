import { db } from '../db.js';
import { stableTable } from '../schema.js';
import { eq } from 'drizzle-orm';

export const createStable = async (req, res) => {
    const {data} = req.body;
    try {
        const newStable = await db.insert(stableTable).values(data).returning();
        if(!newStable.length) return res.status(400).json({success: false, message: 'Failed to create stable'});
        res.status(201).json({success: true, stable: newStable[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getStables = async (req, res) => {
    try {
        const stables = await db.select().from(stableTable);
        res.status(200).json({success: true, stables});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};
