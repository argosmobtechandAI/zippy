import { updateStable, deleteStable } from '../../../controllers/stableController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'PUT') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        return updateStable(req, res);
    }
    
    if (req.method === 'DELETE') {
        return deleteStable(req, res);
    }
    
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
