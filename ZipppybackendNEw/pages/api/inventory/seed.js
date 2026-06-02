import { seedInventory } from '../../../controllers/inventoryController';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return seedInventory(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
