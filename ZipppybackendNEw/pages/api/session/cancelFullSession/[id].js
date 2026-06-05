import { cancelFullSession } from '../../../../controllers/sessionController';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const userId = req.headers.authorization;
        req.userId = userId;
        req.userType = req.headers.usertype;
        
        // Convert query id to params id for compatibility with controller
        req.params = { id: req.query.id };
        
        await cancelFullSession(req, res);
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
