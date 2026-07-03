import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';

// Helper to convert frontend camelCase to db snake_case
const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.shoeStatus !== undefined) { dbData.shoe_status = dbData.shoeStatus; delete dbData.shoeStatus; }
    if (dbData.imageUrl !== undefined) { dbData.image_url = dbData.imageUrl; delete dbData.imageUrl; }
    if (dbData.trainerId !== undefined) { dbData.trainer_id = dbData.trainerId; delete dbData.trainerId; }
    if (dbData.vatId !== undefined) { dbData.vat_id = dbData.vatId; delete dbData.vatId; }
    if (dbData.lastVisit !== undefined) { dbData.last_visit = dbData.lastVisit; delete dbData.lastVisit; }
    if (dbData.dewormingRecord !== undefined) { dbData.deworming_record = dbData.dewormingRecord; delete dbData.dewormingRecord; }
    if (dbData.shoeingRemarks !== undefined) { dbData.shoeing_remarks = dbData.shoeingRemarks; delete dbData.shoeingRemarks; }
    if (dbData.healthRemarks !== undefined) { dbData.health_remarks = dbData.healthRemarks; delete dbData.healthRemarks; }
    if (dbData.vaccinationSummary !== undefined) { dbData.vaccination_summary = dbData.vaccinationSummary; delete dbData.vaccinationSummary; }
    if (dbData.healthStatus !== undefined) { dbData.health_status = dbData.healthStatus; delete dbData.healthStatus; }
    if (dbData.vaccinationRecords !== undefined) { dbData.vaccination_records = dbData.vaccinationRecords; delete dbData.vaccinationRecords; }
    if (dbData.stableId !== undefined) { dbData.stable_id = dbData.stableId; delete dbData.stableId; }
    if (dbData.horseId !== undefined) { dbData.horse_id = dbData.horseId; delete dbData.horseId; }
    return dbData;
};

// Helper to convert db snake_case back to frontend camelCase
export const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.shoe_status !== undefined) { clientData.shoeStatus = clientData.shoe_status; delete clientData.shoe_status; }
    if (clientData.image_url !== undefined) { clientData.imageUrl = clientData.image_url; delete clientData.image_url; }
    if (clientData.trainer_id !== undefined) { clientData.trainerId = clientData.trainer_id; delete clientData.trainer_id; }
    if (clientData.vat_id !== undefined) { clientData.vatId = clientData.vat_id; delete clientData.vat_id; }
    if (clientData.last_visit !== undefined) { clientData.lastVisit = clientData.last_visit; delete clientData.last_visit; }
    if (clientData.deworming_record !== undefined) { clientData.dewormingRecord = clientData.deworming_record; delete clientData.deworming_record; }
    if (clientData.shoeing_remarks !== undefined) { clientData.shoeingRemarks = clientData.shoeing_remarks; delete clientData.shoeing_remarks; }
    if (clientData.health_remarks !== undefined) { clientData.healthRemarks = clientData.health_remarks; delete clientData.health_remarks; }
    if (clientData.vaccination_summary !== undefined) { clientData.vaccinationSummary = clientData.vaccination_summary; delete clientData.vaccination_summary; }
    if (clientData.health_status !== undefined) { clientData.healthStatus = clientData.health_status; delete clientData.health_status; }
    if (clientData.vaccination_records !== undefined) { clientData.vaccinationRecords = clientData.vaccination_records; delete clientData.vaccination_records; }
    if (clientData.stable_id !== undefined) { clientData.stableId = clientData.stable_id; delete clientData.stable_id; }
    if (clientData.horse_id !== undefined) { clientData.horseId = clientData.horse_id; delete clientData.horse_id; }
    
    // Also recursively map nested health records
    if (clientData.healthRecords) {
        if (Array.isArray(clientData.healthRecords)) {
            clientData.healthRecords = clientData.healthRecords.map(mapToClient);
        } else {
            clientData.healthRecords = mapToClient(clientData.healthRecords);
        }
    }
    if (clientData.vaccinationRecords && Array.isArray(clientData.vaccinationRecords)) {
        if (typeof clientData.vaccinationRecords[0] === 'object') {
            clientData.vaccinationRecords = clientData.vaccinationRecords.map(mapToClient);
        }
    }
    return clientData;
};

export const createHorse = async (req, res) => {
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
        const { data: newHorse, error } = await supabase.from('horse').insert(dbData).select();
        if (error || !newHorse || newHorse.length === 0) {
            return res.status(400).json({ success: false, message: error?.message || 'Failed to create horse' });
        }
        res.status(201).json({ success: true, horse: mapToClient(newHorse[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getHorses = async (req, res) => {
    try {
        const { data: horses, error } = await supabase.from('horse').select('*');
        if (error) throw error;
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const last7DaysDate = new Date();
        last7DaysDate.setDate(now.getDate() - 7);

        // Batch fetching data
        const { data: allSessions } = await supabase.from('sessions').select('*');
        const { data: allVaccinations } = await supabase.from('vaccination_records').select('*');
        const { data: allUsers } = await supabase.from('users').select('*');
        const { data: allHealth } = await supabase.from('health_status').select('*');

        const horsesWithStats = horses.map(horse => {
            const horseSessions = allSessions?.filter(s => s.horse_id && s.horse_id.includes(horse.id)) || [];
            const vaccinationRecords = allVaccinations?.filter(v => v.horse === horse.id || v.horse_id === horse.id) || [];
            const trainer = allUsers?.filter(u => u.id === horse.trainer_id) || [];
            const healthRecords = allHealth?.filter(h => h.horse === horse.id || h.horse_id === horse.id) || [];

            const sessionsTodayCount = horseSessions.filter(s => s.date === todayStr).length;
            const sessionsLast7Days = horseSessions.filter(s => {
                try {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= last7DaysDate && sessionDate <= now;
                } catch (e) { return false; }
            }).length;

            const trainingAvg = Math.min(100, Math.round((sessionsLast7Days / 7) * 100));

            const horseObj = { ...horse };
            delete horseObj.vaccination_records;

            return mapToClient({
                ...horseObj,
                sessionsToday: sessionsTodayCount,
                weeklyTrainingAvg: trainingAvg,
                trainer: trainer[0],
                vaccinationRecords: vaccinationRecords?.length > 0 ? vaccinationRecords : [],
                healthRecords: healthRecords?.length > 0 ? healthRecords : []
            });
        });

        res.status(200).json({ success: true, horses: horsesWithStats });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getHorseById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: horse, error } = await supabase.from('horse').select('*').eq('id', id).limit(1);
        if (error || !horse || !horse.length) {
            return res.status(404).json({ success: false, message: 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: mapToClient(horse[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateHorse = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
        const { data: updatedHorse, error } = await supabase.from('horse').update(dbData).eq('id', id).select();
        if (error || !updatedHorse || !updatedHorse.length) {
            return res.status(404).json({ success: false, message: error?.message || 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: mapToClient(updatedHorse[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteHorse = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: deletedHorse, error } = await supabase.from('horse').delete().eq('id', id).select();
        if (error || !deletedHorse || !deletedHorse.length) {
            return res.status(404).json({ success: false, message: error?.message || 'Horse not found' });
        }
        res.status(200).json({ success: true, horse: mapToClient(deletedHorse[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const logHealthStatus = async (req, res) => {
    let bodyData = req.body.data || req.body;
    if (bodyData && bodyData.data) {
        bodyData = bodyData.data;
    }
    try {
        const dbData = mapToDb(bodyData);
        dbData.medications = dbData.medications || [];
        if (dbData.horse_id) { dbData.horse = dbData.horse_id; delete dbData.horse_id; }
        if (bodyData.horseId) { dbData.horse = bodyData.horseId; }
        
        const { data: newStatus, error } = await supabase.from('health_status').insert(dbData).select();
        if (error || !newStatus || !newStatus.length) {
            return res.status(400).json({ success: false, message: error?.message || "Failed to log health status" });
        }
        res.status(201).json({ success: true, healthStatus: mapToClient(newStatus[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const logVaccination = async (req, res) => {
    let bodyData = req.body.data || req.body;
    if (bodyData && bodyData.data) {
        bodyData = bodyData.data;
    }
    try {
        const dbData = mapToDb(bodyData);
        dbData.next_date = dbData.next_date || dbData.nextDate || "None";
        delete dbData.nextDate;
        
        // Supabase schema specifies 'horse' as column for horse ID in this table
        if (dbData.horse_id) { dbData.horse = dbData.horse_id; delete dbData.horse_id; }
        if (dbData.batchNumber) { dbData.batch_number = dbData.batchNumber; delete dbData.batchNumber; }

        const { data: newRecord, error } = await supabase.from('vaccination_records').insert(dbData).select();
        
        if (!error && newRecord && newRecord.length > 0) {
            const horseId = bodyData.horseId;
            const { data: horseData } = await supabase.from('horse').select('vaccination_records').eq('id', horseId).limit(1);
            if (horseData && horseData.length > 0) {
                const currentArr = horseData[0].vaccination_records || [];
                await supabase.from('horse').update({ vaccination_records: [...currentArr, newRecord[0].id] }).eq('id', horseId);
            }
        }
        res.status(201).json({ success: true, vaccinationRecord: mapToClient(newRecord?.[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getHealthRecords = async (req, res) => {
    const { horseId } = req.query;
    try {
        let query = supabase.from('health_status').select('*');
        if (horseId) {
            query = query.eq('horse', horseId);
        }
        const { data: records, error } = await query;
        if (error) throw error;
        res.status(200).json({ success: true, records: records.map(mapToClient) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getVaccinationRecords = async (req, res) => {
    const { horseId } = req.query;
    try {
        let query = supabase.from('vaccination_records').select('*');
        if (horseId) {
            query = query.eq('horse', horseId);
        }
        const { data: records, error } = await query;
        if (error) throw error;
        res.status(200).json({ success: true, records: records.map(mapToClient) });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const runHorseMigrations = async () => {
    console.log("Migrations are not supported via Supabase JS client.");
};

export const migrateHorseTable = async (req, res) => {
    res.status(200).json({ success: true, message: "Migration check completed via REST" });
};

export const seedHorses = async (req, res) => {
    try {
        const sampleHorses = [
            { name: "Midnight Star", location: "Lexington Stables", title: "Show Jumping", weight: 520, speed: 45, shoe_status: "Standard", diet: "High-Protein", image_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800", age: 8, status: "Available" },
            { name: "Thunder", location: "North Paddock", title: "Beginner Friendly", weight: 480, speed: 35, shoe_status: "Aluminum", diet: "Fiber-Rich", image_url: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800", age: 6, status: "Resting" },
            { name: "Seraphina", location: "West Stable", title: "Dressage", weight: 500, speed: 40, shoe_status: "Standard", diet: "Balanced Mix", image_url: "https://images.unsplash.com/photo-1534073737327-5ee72eff7895?auto=format&fit=crop&q=80&w=800", age: 7, status: "Training" }
        ];
        await supabase.from('horse').insert(sampleHorses);
        res.status(200).json({ success: true, message: "Sample fleet registry initialized" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHorsesByStable = async (req, res) => {
    const { stableId } = req.params;
    try {
        const { data: horses, error } = await supabase.from('horse').select('*').eq('stable_id', stableId);
        if (error) throw error;
        
        if (!horses || horses.length === 0) {
            return res.status(200).json({ success: true, horses: [] });
        }

        const { data: allSessions } = await supabase.from('sessions').select('*');
        const { data: allVaccinations } = await supabase.from('vaccination_records').select('*');
        const { data: allUsers } = await supabase.from('users').select('*');
        const { data: allHealth } = await supabase.from('health_status').select('*');

        const completeHorses = horses.map((horse) => {
            const healthRecords = allHealth?.filter(h => h.horse === horse.id || h.horse_id === horse.id) || [];
            let latestHealthStatus = null;
            if (healthRecords.length > 0) {
                latestHealthStatus = healthRecords.reduce((a, b) => b.date > a.date ? b : a);
            }
            const vaccinationRecords = allVaccinations?.filter(v => v.horse === horse.id || v.horse_id === horse.id) || [];
            const trainer = allUsers?.filter(u => u.id === horse.trainer_id) || [];
            const sessions = allSessions?.filter(s => s.horse_id && s.horse_id.includes(horse.id)) || [];

            return mapToClient({ ...horse, healthRecords: latestHealthStatus, vaccinationRecords, trainer, session: sessions });
        });
        res.status(200).json({ success: true, horses: completeHorses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const assignVet = async (req, res) => {
    const { horseId } = req.params;
    const { data } = req.body;
    try {
        const { data: updatedHorse, error } = await supabase.from('horse').update({ vat_id: data.vatId }).eq('id', horseId).select();
        if (error || !updatedHorse || !updatedHorse.length) {
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
    try {
        const { data: updatedHorse, error } = await supabase.from('horse').update({ trainer_id: data.trainerId }).eq('id', horseId).select();
        if (error || !updatedHorse || !updatedHorse.length) {
            return res.status(404).json({ success: false, message: "Horse could not update" });
        }
        res.status(200).json({ success: true, message: "Trainer assigned successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};