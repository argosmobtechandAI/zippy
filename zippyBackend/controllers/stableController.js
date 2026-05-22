import { db } from '../db.js';
import { horseTable, inventoryTable, stableTable } from '../schema.js';
import { inArray, eq } from "drizzle-orm";
import supabase from '../supabase.js';
import fs from 'fs';

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
        return res.status(201).json({
            success: true,
            stable: newStable[0],
        });

    } catch (error) {
        return res.status(500).json({
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


        return res.status(200).json({ success: true, stables });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
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
        return res.status(200).json({ success: true, stable: updatedStable[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getStables = async (req, res) => {
    try {
        console.log("hello")
        const stables = await db.select().from(stableTable);
        return res.status(200).json({ success: true, stables });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
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
        return res.status(200).json({ success: true, stable });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};


export const uploadLogo = async (req, res) => {
    try {
        const file = req.file;
        const { stableId } = req.body;

        console.log(file, "file")
        console.log(stableId, "stableId")

        if (!file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        // Read file from disk
        const fileBuffer = fs.readFileSync(file.path);
        const fileName = `logos/${Date.now()}_${file.originalname}`;

        // Upload to supabase bucket 'zippy'
        const { data, error } = await supabase.storage.from('zippy').upload(fileName, fileBuffer, {
            contentType: file.mimetype
        });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('zippy').getPublicUrl(fileName);
        const url = publicUrlData.publicUrl;

        // Update the stable table with the logo URL
        if (stableId) {
            await db.update(stableTable).set({ logo: url }).where(eq(stableTable.id, stableId));
        } else if (req.userId) {
            await db.update(stableTable).set({ logo: url }).where(eq(stableTable.userId, req.userId));
        }

        // Clean up the local file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Failed to upload file: " + error.message });
    }
};

export const deleteLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const stable = await db.select().from(stableTable).where(eq(stableTable.id, id));
        if (!stable.length) {
            return res.status(404).json({ success: false, message: 'Stable not found' });
        }
        const url = stable[0].logo;
        const fileName = url.split('/').pop();
        const { error } = await supabase.storage.from('zippy').remove([`logos/${fileName}`]);
        if (error) {
            throw error;
        }
        await db.update(stableTable).set({ logo: null }).where(eq(stableTable.id, id));
        return res.status(200).json({ success: true, message: "Logo deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete logo: " + error.message });
    }
};