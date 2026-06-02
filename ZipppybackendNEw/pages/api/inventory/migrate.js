import { runInventoryMigrations } from '../../../controllers/inventoryController';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return runInventoryMigrations(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
