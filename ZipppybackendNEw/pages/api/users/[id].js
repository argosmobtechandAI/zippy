import { updateUser, deleteUser } from '../../../controllers/userController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    // Inject the query id into req.params to match Express behavior
    req.params = { id: req.query.id };
    
    if (req.method === 'PUT') {
        return updateUser(req, res);
    }
    
    if (req.method === 'DELETE') {
        return deleteUser(req, res);
    }
    
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
