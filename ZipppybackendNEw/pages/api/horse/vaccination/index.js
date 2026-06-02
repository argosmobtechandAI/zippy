import { getVaccinationRecords, logVaccination } from '../../../../controllers/horseController';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getVaccinationRecords(req, res);
    }
    
    if (req.method === 'POST') {
        return logVaccination(req, res);
    }
    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
