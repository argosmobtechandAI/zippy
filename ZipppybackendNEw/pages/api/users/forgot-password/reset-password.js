import { supabase } from '../../../../supabaseClient.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { data } = req.body;
    const { email, otp, newPassword } = data || {};

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, OTP, and new password are required', success: false });
    }

    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).limit(1);

        if (error || !user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (otp !== user[0].otp) {
            return res.status(400).json({ message: 'Invalid OTP', success: false });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        const updateRes = await supabase.from('users').update({ 
            password: hashedPassword,
            otp: null 
        }).eq('id', user[0].id);

        if (updateRes.error) {
            throw updateRes.error;
        }

        return res.status(200).json({ message: 'Password reset successfully', success: true });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}
