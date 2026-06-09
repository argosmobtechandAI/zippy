import { supabase } from '../../../../supabaseClient.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { data } = req.body;
    const { email, otp } = data || {};

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required', success: false });
    }

    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).limit(1);

        if (error || !user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (otp !== user[0].otp) {
            return res.status(400).json({ message: 'Invalid OTP', success: false });
        }

        // OTP is correct
        return res.status(200).json({ message: 'OTP verified successfully', success: true });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}
