import { getStables } from '../../../controllers/stableController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getStables(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
