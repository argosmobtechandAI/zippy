import { getHorseById, updateHorse, deleteHorse } from '../../../controllers/horseController';

export default async function handler(req, res) {
    req.params = { id: req.query.id };
    
    if (req.method === 'GET') {
        return getHorseById(req, res);
    }
    
    if (req.method === 'PUT') {
        return updateHorse(req, res);
    }
    
    if (req.method === 'DELETE') {
        return deleteHorse(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
