import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { date, name, page, limit } = req.query;

        // Default parameters
        const snapshotDate = date || new Date().toISOString().split('T')[0];
        const pageNumber = parseInt(page) || 1;
        const pageLimit = parseInt(limit) || 20;
        const offset = (pageNumber - 1) * pageLimit;

        // Base query
        let query = supabase
            .from('rider_daily_snapshots')
            .select('*', { count: 'exact' })
            .eq('snapshot_date', snapshotDate);

        // Name filter
        if (name && name.trim() !== '') {
            query = query.ilike('rider_name', `%${name.trim()}%`);
        }

        // Ordering and pagination
        const { data: snapshots, count, error } = await query
            .order('rider_name', { ascending: true })
            .range(offset, offset + pageLimit - 1);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            snapshots: snapshots || [],
            totalCount: count || 0,
            currentPage: pageNumber,
            totalPages: Math.ceil((count || 0) / pageLimit)
        });

    } catch (error) {
        console.error("ERROR IN get-snapshots API:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
