import { uploadNotificationImage } from '../../../controllers/userController';
import multer from 'multer';

// Disable Next.js default body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default function handler(req, res) {
    if (req.method === 'POST') {
        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
            }
            uploadNotificationImage(req, res);
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
