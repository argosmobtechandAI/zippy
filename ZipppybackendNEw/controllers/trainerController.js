import { supabase } from '../supabaseClient.js';

export const updateTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;
        const { stableId, title } = data;

        const { data: trainer, error: trainerError } = await supabase
            .from('trainers')
            .update({ title, stable_id: stableId })
            .eq('id', id)
            .select();

        if (trainerError || !trainer || trainer.length === 0) {
            return res.status(400).json({ success: false, message: "Trainer not updated" });
        }

        if (stableId) {
            const { data: stable } = await supabase.from('stable').select('*').eq('id', stableId).limit(1);

            if (stable && stable.length > 0) {
                const trainers = stable[0].trainers && stable[0].trainers.length > 0 ? [...stable[0].trainers, id] : [id];

                if (title === "Head Trainer") {
                    await supabase.from('stable').update({ trainers, head_trainer: id }).eq('id', stable[0].id);
                } else {
                    await supabase.from('stable').update({ trainers }).eq('id', stable[0].id);
                }
            }
        }
        return res.status(200).json({ success: true, message: "Trainer updated successfully", trainer: trainer[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update trainer", error: error.message });
    }
}
