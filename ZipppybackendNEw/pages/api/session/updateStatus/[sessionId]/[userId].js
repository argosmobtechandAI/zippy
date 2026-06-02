import { updateSessionStatus } from '../../../../../controllers/sessionController';
import { auth } from '../../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    req.params = { sessionId: req.query.sessionId, userId: req.query.userId };
    
    if (req.method === 'PUT') {
        return updateSessionStatus(req, res);
    }
    
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
