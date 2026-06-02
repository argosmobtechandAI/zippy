import { updateInventoryItem, deleteInventoryItem } from '../../../controllers/inventoryController';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'PUT') {
        return updateInventoryItem(req, res);
    }
    
    if (req.method === 'DELETE') {
        return deleteInventoryItem(req, res);
    }
    
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
