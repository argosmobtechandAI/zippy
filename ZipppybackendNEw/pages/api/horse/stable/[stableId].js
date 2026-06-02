import { getHorsesByStable } from '../../../../controllers/horseController';

export default async function handler(req, res) {
    req.params = { stableId: req.query.stableId };
    
    if (req.method === 'GET') {
        return getHorsesByStable(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
