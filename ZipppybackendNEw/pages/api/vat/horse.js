import { getHorseByVat } from '../../../controllers/vatController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const authorized = await auth(req, res);
        if (!authorized) return;
        return getHorseByVat(req, res);
    }
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
