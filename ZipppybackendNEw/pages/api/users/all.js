import { getAllUsers } from '../../../controllers/userController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getAllUsers(req, res);
    }
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
