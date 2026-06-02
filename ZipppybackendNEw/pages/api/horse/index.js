import { getHorses, createHorse } from '../../../controllers/horseController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getHorses(req, res);
    }
    
    if (req.method === 'POST') {
        // Warning: The original express code used multer here for file uploads.
        // We will need to implement a next.js compatible file upload if this route is used for images.
        return createHorse(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
