import { getPlans, createPlan } from '../../../controllers/planController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getPlans(req, res);
    }
    
    if (req.method === 'POST') {
        return createPlan(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
