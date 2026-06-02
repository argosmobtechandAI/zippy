import { getInventoryByStableId } from '../../../../controllers/inventoryController';

export default async function handler(req, res) {
    req.params = { stableId: req.query.stableId };
    
    if (req.method === 'GET') {
        return getInventoryByStableId(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
