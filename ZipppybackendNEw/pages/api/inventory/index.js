import { getInventory, createInventoryItem } from '../../../controllers/inventoryController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getInventory(req, res);
    }
    
    if (req.method === 'POST') {
        return createInventoryItem(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
