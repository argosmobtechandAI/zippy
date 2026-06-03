import { getAdminNotifications, markAllAsRead } from '../../../controllers/adminNotificationController';
import { auth } from '../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method === 'GET') {
        return getAdminNotifications(req, res);
    } else if (req.method === 'PUT') {
        return markAllAsRead(req, res);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
