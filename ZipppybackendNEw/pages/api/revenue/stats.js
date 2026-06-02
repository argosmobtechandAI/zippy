import { getRevenueStats } from '../../../controllers/statsController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getRevenueStats(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
