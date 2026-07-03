import { supabase } from '../../../../supabaseClient';
import { mapToClient } from '../../../../controllers/horseController';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ success: false, message: 'ID parameter is required' });
    }

    if (req.method === 'PUT') {
        try {
            let bodyData = req.body.data || req.body;
            if (bodyData && bodyData.data) {
                bodyData = bodyData.data;
            }
            const updatePayload = { ...bodyData };
            if (updatePayload.horseId) {
                updatePayload.horse = updatePayload.horseId;
                delete updatePayload.horseId;
            }
            if (updatePayload.batchNumber) {
                updatePayload.batch_number = updatePayload.batchNumber;
                delete updatePayload.batchNumber;
            }
            if (updatePayload.nextDate) {
                updatePayload.next_date = updatePayload.nextDate;
                delete updatePayload.nextDate;
            }

            const { data: updatedRecord, error } = await supabase
                .from('vaccination_records')
                .update(updatePayload)
                .eq('id', id)
                .select();

            if (error) throw error;
            return res.status(200).json({ success: true, record: mapToClient(updatedRecord[0]) });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('vaccination_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Vaccination record deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
