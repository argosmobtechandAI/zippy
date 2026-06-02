import { getAllTrainers } from '../../../controllers/userController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    if (req.method === 'GET') {
        return getAllTrainers(req, res);
    }
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
