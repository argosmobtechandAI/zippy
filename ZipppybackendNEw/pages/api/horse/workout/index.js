import { getWorkouts, createWorkout } from '../../../../controllers/workoutController';
import { auth } from '../../../../middleware/auth';

export default async function handler(req, res) {
    const authorized = await auth(req, res);
    if (!authorized) return;

    if (req.method === 'GET') {
        return getWorkouts(req, res);
    } else if (req.method === 'POST') {
        return createWorkout(req, res);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
