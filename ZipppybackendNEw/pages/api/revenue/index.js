import { getRevenueStats } from '../../../controllers/revenueController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        return getRevenueStats(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
