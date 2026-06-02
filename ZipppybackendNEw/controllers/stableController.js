import { supabase } from '../supabaseClient.js';
import fs from 'fs';

// Helper to convert frontend camelCase to db snake_case
const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.totalRevenue !== undefined) { dbData.total_revenue = dbData.totalRevenue; delete dbData.totalRevenue; }
    if (dbData.userId !== undefined) { dbData.user_id = dbData.userId; delete dbData.userId; }
    if (dbData.headTrainer !== undefined) { dbData.head_trainer = dbData.headTrainer; delete dbData.headTrainer; }
    return dbData;
};

// Helper to convert db snake_case back to frontend camelCase
const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.total_revenue !== undefined) { clientData.totalRevenue = clientData.total_revenue; delete clientData.total_revenue; }
    if (clientData.user_id !== undefined) { clientData.userId = clientData.user_id; delete clientData.user_id; }
    if (clientData.head_trainer !== undefined) { clientData.headTrainer = clientData.head_trainer; delete clientData.head_trainer; }
    return clientData;
};

export const createStable = async (req, res) => {
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
        const { data: newStable, error } = await supabase
            .from('stable')
            .insert(dbData)
            .select();

        if (error || !newStable || newStable.length === 0) {
            return res.status(400).json({ success: false, message: error ? error.message : "Failed to create stable" });
        }

        const stableId = newStable[0].id;

        if (data.horses?.length) {
            await supabase
                .from('horse')
                .update({ stable_id: stableId })
                .in('id', data.horses);
        }

        return res.status(201).json({ success: true, stable: mapToClient(newStable[0]) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getStable = async (req, res) => {
    try {
        const id = req.userId;
        const { data: stables, error } = await supabase.from('stable').select('*').eq('user_id', id);
        if (error) throw error;
        
        return res.status(200).json({ success: true, stables: stables.map(mapToClient) });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}

export const updateStable = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const dbData = mapToDb(data);
        const { data: updatedStable, error } = await supabase.from('stable').update(dbData).eq('id', id).select();
        if (error || !updatedStable || updatedStable.length === 0) {
            return res.status(404).json({ success: false, message: error ? error.message : 'Stable not found' });
        }
        return res.status(200).json({ success: true, stable: mapToClient(updatedStable[0]) });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getStables = async (req, res) => {
    try {
        const { data: stables, error } = await supabase.from('stable').select('*');
        if (error) throw error;
        
        return res.status(200).json({ success: true, stables: stables.map(mapToClient) });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteStable = async (req, res) => {
    try {
        const { id } = req.params;

        await supabase.from('horse').update({ stable_id: null }).eq('stable_id', id);
        await supabase.from('inventory').update({ stable_id: null }).eq('stable_id', id);

        const { data: stable, error } = await supabase.from('stable').delete().eq('id', id).select();
        if (error) throw error;
        
        return res.status(200).json({ success: true, stable: stable ? stable.map(mapToClient) : [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const uploadLogo = async (req, res) => {
    try {
        const file = req.file;
        const { stableId } = req.body;

        if (!file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const fileBuffer = fs.readFileSync(file.path);
        const fileName = `logos/${Date.now()}_${file.originalname}`;

        // Upload to supabase bucket 'zippy' using auth token if needed, or anon
        // Note: I assume 'zippy' bucket is public and allows anon uploads based on original code
        const { data, error } = await supabase.storage.from('zippy').upload(fileName, fileBuffer, {
            contentType: file.mimetype
        });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage.from('zippy').getPublicUrl(fileName);
        const url = publicUrlData.publicUrl;

        if (stableId) {
            await supabase.from('stable').update({ logo: url }).eq('id', stableId);
        } else if (req.userId) {
            await supabase.from('stable').update({ logo: url }).eq('user_id', req.userId);
        }

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return res.status(200).json({ success: true, message: "File uploaded successfully", url });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to upload file: " + error.message });
    }
};

export const deleteLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: stable, error: fetchError } = await supabase.from('stable').select('*').eq('id', id).limit(1);
        if (fetchError || !stable || !stable.length) {
            return res.status(404).json({ success: false, message: 'Stable not found' });
        }
        
        const url = stable[0].logo;
        if (url) {
            const fileName = url.split('/').pop();
            const { error } = await supabase.storage.from('zippy').remove([`logos/${fileName}`]);
            if (error) throw error;
        }
        
        await supabase.from('stable').update({ logo: null }).eq('id', id);
        return res.status(200).json({ success: true, message: "Logo deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete logo: " + error.message });
    }
};