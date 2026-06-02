import { getSessions, createSession } from '../../../controllers/sessionController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getSessions(req, res);
    }
    
    if (req.method === 'POST') {
        return createSession(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
