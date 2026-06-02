import { verifyRazorPayOrder } from '../../../../controllers/planController';
import { auth } from '../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    if (req.method === 'POST') {
        return verifyRazorPayOrder(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
