import { clearNotifications } from '../../../../controllers/userController';
import { auth } from '../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    req.params = { id: req.query.id };
    
    if (req.method === 'DELETE' || req.method === 'PUT') {
        return clearNotifications(req, res);
    }
    res.setHeader('Allow', ['DELETE', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
