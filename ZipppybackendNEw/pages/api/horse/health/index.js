import { getHealthRecords, logHealthStatus } from '../../../../controllers/horseController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getHealthRecords(req, res);
    }
    
    if (req.method === 'POST') {
        return logHealthStatus(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
