import { db } from "../db.js";
import { inventoryTable, stableTable } from "../schema.js";
import { eq, sql } from "drizzle-orm";

export const getInventory = async (req, res) => {
    try {
        const items = await db.select().from(inventoryTable);

        const inventory = await Promise.all(items.map(async item => {
            const stable = await db.select().from(stableTable).where(eq(stableTable.id, item.stableId));
            return { ...item, stable: stable[0] };
        }))
        res.status(200).json({ success: true, items: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInventoryByStableId = async (req, res) => {
    try {
        const { stableId } = req.params;
        const items = await db.select().from(inventoryTable).where(eq(inventoryTable.stableId, stableId));
        res.status(200).json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createInventoryItem = async (req, res) => {
    console.log("INVENTORY_CREATE: Received body:", JSON.stringify(req.body, null, 2));
    const { data } = req.body;

    if (!data || !data.name) {
        console.error("INVENTORY_CREATE: Invalid data received!");
        return res.status(400).json({ success: false, message: "Invalid item data" });
    }

    try {
        // Calculate initial status
        const status = Number(data.currentStock) <= 0 ? "Out of Stock" :
            Number(data.currentStock) <= (Number(data.minThreshold) || 10) ? "Low Stock" : "In Stock";

        // Defensive field extraction
        const insertData = {
            name: data.name,
            category: data.category,
            currentStock: Number(data.currentStock) || 0,
            unit: data.unit,
            minThreshold: Number(data.minThreshold) || 10,
            status,
            lastUpdated: new Date().toISOString(),
            stableId: data.stableId
        };

        console.log("INVENTORY_CREATE: Inserting with:", JSON.stringify(insertData, null, 2));
        const newItem = await db.insert(inventoryTable).values(insertData).returning();
        console.log("INVENTORY_CREATE: Insertion success! New item:", JSON.stringify(newItem[0], null, 2));

        const stable = await db.select().from(stableTable).where(eq(stableTable.id, data.stableId));
        if (!stable.length) {
            return res.status(404).json({ success: false, message: 'Stable not found' });
        }

        const inventory = stable[0].stocks ? [...stable[0].stocks, newItem[0].id] : [newItem[0].id]

        const updateStable = await db.update(stableTable).set({ stocks: inventory }).where(eq(stableTable.id, data.stableId)).returning();
        if (!updateStable.length) {
            return res.status(404).json({ success: false, message: 'Failed to update stable' });
        }

        res.status(201).json({ success: true, item: newItem[0] });
    } catch (error) {
        console.error("INVENTORY_CREATE: Error during insertion:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        // Re-calculate status if stock changed
        let updateData = { ...data, lastUpdated: new Date().toISOString() };
        if (data.currentStock !== undefined) {
            updateData.status = data.currentStock <= 0 ? "Out of Stock" :
                data.currentStock <= (data.minThreshold || 10) ? "Low Stock" : "In Stock";
        }

        const updated = await db.update(inventoryTable).set(updateData).where(eq(inventoryTable.id, id)).returning();
        res.status(200).json({ success: true, item: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteInventoryItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
        res.status(200).json({ success: true, message: "Item removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const seedInventory = async (req, res) => {
    try {
        const samples = [
            { name: "Premium Timothy Hay", category: "Feed", currentStock: 124, unit: "Bales", minThreshold: 20 },
            { name: "Equine Flu Vaccine", category: "Medicines", currentStock: 8, unit: "Vials", minThreshold: 10 },
            { name: "Antiseptic Shampoo", category: "Consumables", currentStock: 0, unit: "Bottles", minThreshold: 5 },
            { name: "Leather Saddle Soap", category: "Consumables", currentStock: 42, unit: "Tins", minThreshold: 10 },
            { name: "Stirrup Irons (Adult)", category: "Equipment", currentStock: 15, unit: "Pairs", minThreshold: 5 }
        ];

        for (const item of samples) {
            const status = item.currentStock <= 0 ? "Out of Stock" :
                item.currentStock <= item.minThreshold ? "Low Stock" : "In Stock";
            await db.insert(inventoryTable).values({ ...item, status });
        }

        res.status(200).json({ success: true, message: "Inventory seeded" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const runInventoryMigrations = async () => {
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS inventory (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                current_stock INTEGER NOT NULL DEFAULT 0,
                unit VARCHAR(50) NOT NULL,
                min_threshold INTEGER DEFAULT 10,
                status VARCHAR(50) DEFAULT 'In Stock',
                last_updated VARCHAR(50)
            )
        `);
        console.log("Inventory table migration complete.");
    } catch (e) {
        console.error("Inventory migration failed:", e.message);
    }
};
