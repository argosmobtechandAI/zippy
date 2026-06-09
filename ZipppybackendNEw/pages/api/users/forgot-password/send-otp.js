import { supabase } from '../../../../supabaseClient.js';
import { sendEmail } from '../../../../utils/emailHelper.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { data } = req.body;
    const { email } = data || {};

    if (!email) {
        return res.status(400).json({ message: 'Email is required', success: false });
    }

    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).limit(1);

        if (error || !user || user.length === 0) {
            return res.status(404).json({ message: 'User with this email not found', success: false });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const updateRes = await supabase.from('users').update({ otp }).eq('id', user[0].id);
        
        if (updateRes.error) {
            throw updateRes.error;
        }

        const emailSent = await sendEmail({
            to: email,
            subject: 'Zippy Equestrian - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user[0].name || 'User'},</p>
                    <p>We received a request to reset your password. Here is your 6-digit OTP:</p>
                    <h1 style="color: #8C4A28; letter-spacing: 2px;">${otp}</h1>
                    <p>This OTP will be valid for a short period. Please do not share it with anyone.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <br/>
                    <p>Best regards,<br/>Zippy Equestrian Team</p>
                </div>
            `
        });

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email', success: false });
        }

        return res.status(200).json({ message: 'OTP sent successfully to your email', success: true });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}
