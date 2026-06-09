import { supabase } from '../../../supabaseClient.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId, token } = req.body.data || {};

    if (!userId || !token) {
        return res.status(400).json({ success: false, message: 'User ID and FCM token are required' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ fcm_token: token })
            .eq('id', userId);

        if (error) throw error;

        return res.status(200).json({ success: true, message: 'FCM Token updated successfully' });
    } catch (error) {
        console.error("Error updating FCM token:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
