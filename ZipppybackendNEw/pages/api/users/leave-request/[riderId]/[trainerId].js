import { updateLeaveRequest } from '../../../../../controllers/userController';
import { auth } from '../../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;
    
    req.params = { riderId: req.query.riderId, trainerId: req.query.trainerId };
    
    if (req.method === 'PUT') {
        return updateLeaveRequest(req, res);
    }
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
