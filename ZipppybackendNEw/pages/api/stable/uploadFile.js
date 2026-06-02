import { IncomingForm } from 'formidable';
import fs from 'fs';
import { supabase } from '../../../supabaseClient';
import { auth } from '../../../middleware/auth';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const form = new IncomingForm({ keepExtensions: true });
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Formidable error:", err);
                return res.status(500).json({ success: false, message: 'Error parsing form data' });
            }

            // formidable v3 puts files in arrays
            const fileArray = Array.isArray(files.file) ? files.file : (files.file ? [files.file] : []);
            const file = fileArray[0];

            if (!file) {
                return res.status(400).json({ success: false, message: 'No file provided' });
            }

            const stableId = Array.isArray(fields.stableId) ? fields.stableId[0] : fields.stableId;
            const horseId = Array.isArray(fields.horseId) ? fields.horseId[0] : fields.horseId;

            try {
                const fileBuffer = fs.readFileSync(file.filepath);
                const fileName = `uploads/${Date.now()}_${file.originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

                const { data, error } = await supabase.storage.from('zippy').upload(fileName, fileBuffer, {
                    contentType: file.mimetype
                });

                if (error) {
                    console.error("Supabase upload error:", error);
                    return res.status(500).json({ success: false, message: 'Supabase upload failed: ' + error.message });
                }

                const { data: publicUrlData } = supabase.storage.from('zippy').getPublicUrl(fileName);
                const url = publicUrlData.publicUrl;

                if (stableId) {
                    await supabase.from('stable').update({ logo: url }).eq('id', stableId);
                }
                if (horseId) {
                    await supabase.from('horse').update({ imageUrl: url }).eq('id', horseId);
                }

                // Cleanup local file
                if (fs.existsSync(file.filepath)) {
                    fs.unlinkSync(file.filepath);
                }

                return res.status(200).json({ success: true, message: 'File uploaded successfully', url });
            } catch (err) {
                console.error("Upload processing error:", err);
                return res.status(500).json({ success: false, message: 'Error processing file' });
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to upload file: ' + error.message });
    }
}
