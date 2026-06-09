import { deleteBroadcastNotification } from '../../../../controllers/userController';

export default function handler(req, res) {
    if (req.method === 'DELETE') {
        req.params = { ...req.params, id: req.query.id };
        deleteBroadcastNotification(req, res);
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
