import { getPlanById, updatePlan, deletePlan } from '../../../controllers/planController';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'GET') {
        return getPlanById(req, res);
    }
    
    if (req.method === 'PUT') {
        return updatePlan(req, res);
    }
    
    if (req.method === 'DELETE') {
        return deletePlan(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
