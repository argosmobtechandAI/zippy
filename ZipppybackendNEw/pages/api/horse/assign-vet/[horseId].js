import { assignVet } from '../../../../controllers/horseController';

export default async function handler(req, res) {
    req.params = { horseId: req.query.horseId };
    
    if (req.method === 'PUT') {
        return assignVet(req, res);
    }
    
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
