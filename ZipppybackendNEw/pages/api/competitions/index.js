import { getCompetitions, createCompetition } from '../../../controllers/riderController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    if (req.method === 'GET') {
        return getCompetitions(req, res);
    }
    
    if (req.method === 'POST') {
        return createCompetition(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
