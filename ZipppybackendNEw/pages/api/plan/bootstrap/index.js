import { bootstrapPlans } from '../../../../controllers/planController';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return bootstrapPlans(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
