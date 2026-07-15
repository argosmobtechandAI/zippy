import { supabase } from '../../../supabaseClient.js';
import { auth } from '../../../middleware/auth.js';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*, user:users(id, name, email, mobile, rider(level, stable_id, stable(name)))')
            .order('date', { ascending: false });

        if (error) throw error;
        
        res.status(200).json({ success: true, payments: payments || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}
