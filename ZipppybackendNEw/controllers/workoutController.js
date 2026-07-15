import { supabase } from '../supabaseClient.js';

// Helper to convert frontend camelCase to db snake_case
const mapToDb = (data) => {
    const dbData = { ...data };
    if (dbData.horseId !== undefined) { dbData.horse_id = dbData.horseId; delete dbData.horseId; }
    if (dbData.trainerId !== undefined) { dbData.trainer_id = dbData.trainerId; delete dbData.trainerId; }
    if (dbData.workoutType !== undefined) { dbData.workout_type = dbData.workoutType; delete dbData.workoutType; }
    if (dbData.stableId !== undefined) { dbData.stable_id = dbData.stableId; delete dbData.stableId; }
    if (dbData.trainerComment !== undefined) { dbData.trainer_comment = dbData.trainerComment; delete dbData.trainerComment; }
    return dbData;
};

// Helper to convert db snake_case back to frontend camelCase
const mapToClient = (data) => {
    if (!data) return null;
    const clientData = { ...data };
    if (clientData.horse_id !== undefined) { clientData.horseId = clientData.horse_id; delete clientData.horse_id; }
    if (clientData.trainer_id !== undefined) { clientData.trainerId = clientData.trainer_id; delete clientData.trainer_id; }
    if (clientData.workout_type !== undefined) { clientData.workoutType = clientData.workout_type; delete clientData.workout_type; }
    if (clientData.stable_id !== undefined) { clientData.stableId = clientData.stable_id; delete clientData.stable_id; }
    if (clientData.trainer_comment !== undefined) { clientData.trainerComment = clientData.trainer_comment; delete clientData.trainer_comment; }
    return clientData;
};

export const getWorkouts = async (req, res) => {
    try {
        const { stableId, horseId, trainerId, date } = req.query;
        let query = supabase.from('horse_workouts').select('*');
        
        if (stableId) query = query.eq('stable_id', stableId);
        if (horseId) query = query.eq('horse_id', horseId);
        if (trainerId) query = query.eq('trainer_id', trainerId);
        if (date) query = query.eq('date', date);
        
        const { data: workouts, error } = await query.order('date', { ascending: false });
        if (error) throw error;
        
        // Enrich with horse name and trainer name
        const { data: horses } = await supabase.from('horse').select('id, name');
        const { data: users } = await supabase.from('users').select('id, name');
        
        const enriched = (workouts || []).map(w => {
            const horseObj = horses?.find(h => h.id === w.horse_id);
            const trainerObj = users?.find(u => u.id === w.trainer_id);
            return mapToClient({
                ...w,
                horseName: horseObj?.name || 'Unknown Horse',
                trainerName: trainerObj?.name || 'Unassigned'
            });
        });
        
        return res.status(200).json({ success: true, workouts: enriched });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createWorkout = async (req, res) => {
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
        const { data: newWorkout, error } = await supabase.from('horse_workouts').insert(dbData).select();
        if (error || !newWorkout || newWorkout.length === 0) {
            return res.status(400).json({ success: false, message: error?.message || 'Failed to create workout' });
        }
        return res.status(201).json({ success: true, workout: mapToClient(newWorkout[0]) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const dbData = mapToDb(data);
        const { data: updatedWorkout, error } = await supabase.from('horse_workouts').update(dbData).eq('id', id).select();
        if (error || !updatedWorkout || updatedWorkout.length === 0) {
            return res.status(400).json({ success: false, message: error?.message || 'Failed to update workout' });
        }
        return res.status(200).json({ success: true, workout: mapToClient(updatedWorkout[0]) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: deleted, error } = await supabase.from('horse_workouts').delete().eq('id', id).select();
        if (error || !deleted || deleted.length === 0) {
            return res.status(400).json({ success: false, message: error?.message || 'Failed to delete workout' });
        }
        return res.status(200).json({ success: true, message: 'Workout deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
