import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';

const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.currentStock !== undefined) { dbData.current_stock = dbData.currentStock; delete dbData.currentStock; }
    if (dbData.minThreshold !== undefined) { dbData.min_threshold = dbData.minThreshold; delete dbData.minThreshold; }
    if (dbData.lastUpdated !== undefined) { dbData.last_updated = dbData.lastUpdated; delete dbData.lastUpdated; }
    if (dbData.stableId !== undefined) { delete dbData.stableId; }
    if (dbData.stable_id !== undefined) { delete dbData.stable_id; }
    return dbData;
};

const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.current_stock !== undefined) { clientData.currentStock = clientData.current_stock; delete clientData.current_stock; }
    if (clientData.min_threshold !== undefined) { clientData.minThreshold = clientData.min_threshold; delete clientData.min_threshold; }
    if (clientData.last_updated !== undefined) { clientData.lastUpdated = clientData.last_updated; delete clientData.last_updated; }
    return clientData;
};

export const getInventory = async (req, res) => {
    try {
        const { data: items, error } = await supabase.from('inventory').select('*');
        if (error) throw error;

        const { data: stables } = await supabase.from('stable').select('*');

        const inventory = items.map(item => {
            const mappedItem = mapToClient(item);
            if (stables) {
                const itemStable = stables.find(s => s.stocks && s.stocks.includes(item.id));
                if (itemStable) {
                    mappedItem.stable = itemStable;
                }
            }
            return mappedItem;
        });
        res.status(200).json({ success: true, items: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInventoryByStableId = async (req, res) => {
    try {
        const { stableId } = req.params;
        const { data: stable, error: stableError } = await supabase.from('stable').select('stocks').eq('id', stableId).single();
        
        if (stableError && stableError.code !== 'PGRST116') throw stableError;
        if (!stable || !stable.stocks || stable.stocks.length === 0) {
            return res.status(200).json({ success: true, items: [] });
        }

        const { data: items, error } = await supabase.from('inventory').select('*').in('id', stable.stocks);
        if (error) throw error;

        res.status(200).json({ success: true, items: items.map(mapToClient) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createInventoryItem = async (req, res) => {
    const { data } = req.body;
    if (!data || !data.name) {
        return res.status(400).json({ success: false, message: "Invalid item data" });
    }
    try {
        const status = Number(data.currentStock) <= 0 ? "Out of Stock" :
            Number(data.currentStock) <= (Number(data.minThreshold) || 10) ? "Low Stock" : "In Stock";

        const insertData = mapToDb({
            name: data.name,
            category: data.category,
            currentStock: Number(data.currentStock) || 0,
            unit: data.unit,
            minThreshold: Number(data.minThreshold) || 10,
            status,
            lastUpdated: new Date().toISOString(),
            stableId: data.stableId
        });

        const { data: newItem, error } = await supabase.from('inventory').insert(insertData).select();
        if (error || !newItem || !newItem.length) throw error || new Error('Failed to create inventory item');

        const { data: stable } = await supabase.from('stable').select('*').eq('id', data.stableId).limit(1);
        if (stable && stable.length) {
            const stocks = stable[0].stocks ? [...stable[0].stocks, newItem[0].id] : [newItem[0].id];
            await supabase.from('stable').update({ stocks }).eq('id', data.stableId);
        }

        res.status(201).json({ success: true, item: mapToClient(newItem[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        let updateData = { ...data, lastUpdated: new Date().toISOString() };
        if (data.currentStock !== undefined) {
            updateData.status = data.currentStock <= 0 ? "Out of Stock" :
                data.currentStock <= (data.minThreshold || 10) ? "Low Stock" : "In Stock";
        }

        const dbData = mapToDb(updateData);
        
        // Remove stableId from dbData before update just in case
        delete dbData.stableId;
        delete dbData.stable_id;

        const { data: updated, error } = await supabase.from('inventory').update(dbData).eq('id', id).select();
        if (error || !updated || !updated.length) throw error || new Error('Failed to update inventory item');

        // Handle stable association change if stableId was provided in request
        if (data.stableId !== undefined) {
            const { data: allStables } = await supabase.from('stable').select('*');
            if (allStables) {
                // Remove from any stable that currently has it (if it's not the new one)
                for (let s of allStables) {
                    if (s.stocks && s.stocks.includes(id)) {
                        if (s.id !== data.stableId) {
                            const newStocks = s.stocks.filter(itemId => itemId !== id);
                            await supabase.from('stable').update({ stocks: newStocks }).eq('id', s.id);
                        }
                    }
                }
                
                // Add to new stable if not already there
                if (data.stableId) {
                    const newStable = allStables.find(s => s.id === data.stableId);
                    if (newStable) {
                        const hasStock = newStable.stocks && newStable.stocks.includes(id);
                        if (!hasStock) {
                            const newStocks = newStable.stocks ? [...newStable.stocks, id] : [id];
                            await supabase.from('stable').update({ stocks: newStocks }).eq('id', data.stableId);
                        }
                    }
                }
            }
        }

        res.status(200).json({ success: true, item: mapToClient(updated[0]) });
    } catch (error) {
        console.error("Update Inventory Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteInventoryItem = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
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
            await supabase.from('inventory').insert(mapToDb({ ...item, status }));
        }
        res.status(200).json({ success: true, message: "Inventory seeded" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const runInventoryMigrations = async () => {};