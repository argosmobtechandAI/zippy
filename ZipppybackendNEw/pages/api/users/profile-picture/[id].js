import { IncomingForm } from 'formidable';
import fs from 'fs';
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
        const form = new IncomingForm({ keepExtensions: true });

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
                const fileBuffer = fs.readFileSync(file.filepath);
                const ext = file.originalFilename ? file.originalFilename.split('.').pop() : 'jpg';
                const fileName = `profile-pictures/${id}_${Date.now()}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from('zippy')
                    .upload(fileName, fileBuffer, {
                        contentType: file.mimetype || 'image/jpeg',
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Supabase upload error:", uploadError);
                    return res.status(500).json({ success: false, message: 'Upload failed: ' + uploadError.message });
                }

                const { data: publicUrlData } = supabase.storage.from('zippy').getPublicUrl(fileName);
                const url = publicUrlData.publicUrl;

                // Save URL to users table
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ profile_picture: url })
                    .eq('id', id);

                if (updateError) {
                    console.error("DB update error:", updateError);
                    return res.status(500).json({ success: false, message: 'Failed to update user record' });
                }

                // Cleanup
                if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);

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
