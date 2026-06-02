import { getGlobalStats } from '../../../controllers/statsController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getGlobalStats(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
