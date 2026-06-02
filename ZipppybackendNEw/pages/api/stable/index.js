import { createStable, getStable } from '../../../controllers/stableController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return createStable(req, res);
    }
    
    if (req.method === 'GET') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        return getStable(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
