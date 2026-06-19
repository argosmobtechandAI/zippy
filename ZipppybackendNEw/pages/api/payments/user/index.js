import { supabase } from '../../../../supabaseClient.js';
import { auth } from '../../../../middleware/auth.js';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const userId = req.userId;

        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;

        // Note: we fetch plan data manually or expect the frontend to resolve it
        // since we're using plan_id to store either plan or level UUID
        res.status(200).json({ success: true, payments: payments || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}
