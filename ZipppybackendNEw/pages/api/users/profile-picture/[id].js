import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../../../supabaseClient';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = new IncomingForm({ 
            keepExtensions: true,
            uploadDir: uploadDir
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Formidable error:", err);
                return res.status(500).json({ success: false, message: 'Error parsing form data' });
            }

            const fileArray = Array.isArray(files.photo) ? files.photo : (files.photo ? [files.photo] : []);
            const file = fileArray[0];

            if (!file) {
                return res.status(400).json({ success: false, message: 'No photo provided' });
            }

            try {
                const ext = file.originalFilename ? file.originalFilename.split('.').pop() : 'jpg';
                const fileName = `${id}_${Date.now()}.${ext}`;
                const newFilePath = path.join(uploadDir, fileName);

                fs.renameSync(file.filepath, newFilePath);

                const url = `/uploads/profile-pictures/${fileName}`;

                // Save URL to users table
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ profile_picture: url })
                    .eq('id', id);

                if (updateError) {
                    console.error("DB update error:", updateError);
                    return res.status(500).json({ success: false, message: 'Failed to update user record' });
                }

                return res.status(200).json({ success: true, url, message: 'Profile picture updated' });
            } catch (processingErr) {
                console.error("Upload processing error:", processingErr);
                return res.status(500).json({ success: false, message: 'Error processing image' });
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
    }
}

