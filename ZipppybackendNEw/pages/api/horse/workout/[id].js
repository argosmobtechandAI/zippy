import { updateWorkout, deleteWorkout } from '../../../../controllers/workoutController';
import { auth } from '../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    req.params = { id: req.query.id };

    if (req.method === 'PUT') {
        return updateWorkout(req, res);
    } else if (req.method === 'DELETE') {
        return deleteWorkout(req, res);
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
