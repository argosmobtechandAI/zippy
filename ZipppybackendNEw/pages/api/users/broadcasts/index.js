import { getBroadcastNotifications } from '../../../../controllers/userController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        await getBroadcastNotifications(req, res);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
