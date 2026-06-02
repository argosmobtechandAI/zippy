import { seedHorses } from '../../../controllers/horseController';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return seedHorses(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
