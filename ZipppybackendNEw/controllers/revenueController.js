import { supabase } from '../supabaseClient.js';

export const getRevenueStats = async (req, res) => {
    try {
        const { data: stats, error } = await supabase.from('revenue').select('*');
        if (error) throw error;
        
        if (!stats || !stats.length) {
            return res.status(200).json({ success: true, revenueStats: { stats: [], totalRevenue: 0, totalActiveRevenue: 0, totalInactiveRevenue: 0, activePlans: [], expiredPlans: [] } });
        }

        const totalRevenue = stats.reduce((total, stat) => total + stat.amount, 0);
        const totalActiveRevenue = stats.filter(stat => stat.status === "Active").reduce((total, stat) => total + stat.amount, 0);
        const totalInactiveRevenue = stats.filter(stat => stat.status === "Inactive").reduce((total, stat) => total + stat.amount, 0);

        const activePlans = stats.filter(stat => stat.status === "Active");
        const expiredPlans = stats.filter(stat => stat.status === "Inactive");

        res.status(200).json({ success: true, revenueStats: { stats, totalRevenue, totalActiveRevenue, totalInactiveRevenue, activePlans, expiredPlans } });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}