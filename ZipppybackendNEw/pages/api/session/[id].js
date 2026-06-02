import { getSessionById, updateSession, deleteSession } from '../../../controllers/sessionController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'GET') {
        return getSessionById(req, res);
    }
    
    if (req.method === 'PUT' || req.method === 'DELETE') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        
        if (req.method === 'PUT') {
            return updateSession(req, res);
        }
        
        if (req.method === 'DELETE') {
            return deleteSession(req, res);
        }
    }
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
