import { deleteLogo } from '../../../../controllers/stableController';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'DELETE') {
        return deleteLogo(req, res);
    }
    
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
