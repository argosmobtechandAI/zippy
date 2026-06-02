import { getUser, createUser } from '../../../controllers/userController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        return getUser(req, res);
    }
    
    if (req.method === 'POST') {
        return createUser(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
