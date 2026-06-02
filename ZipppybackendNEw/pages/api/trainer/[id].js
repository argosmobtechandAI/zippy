import { updateTrainer } from '../../../controllers/trainerController';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'PUT') {
        return updateTrainer(req, res);
    }
    
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
