import { db } from "../db.js";
import { revenueTable } from "../schema.js";


export const getRevenueStats = async (req, res) => {

    console.log("Getting revenue stats")
    try {

        const stats = await db.select().from(revenueTable);
        if (!stats.length) {
            return res.status(200).json({ success: true, stats: [] });
        }

        console.log("Stats", stats)

        const totalRevenue = stats.reduce((total, stat) => total + stat.amount, 0);
        const totalActiveRevenue = stats.filter(stat => stat.status === "Active").reduce((total, stat) => total + stat.amount, 0);
        const totalInactiveRevenue = stats.filter(stat => stat.status === "Inactive").reduce((total, stat) => total + stat.amount, 0);

        const activePlans = stats.filter(stat => stat.status === "Active");
        const expiredPlans = stats.filter(stat => stat.status === "Inactive");

        res.status(200).json({ success: true, revenueStats: { stats, totalRevenue, totalActiveRevenue, totalInactiveRevenue, activePlans, expiredPlans } });

    } catch (error) {
        console.log("Error: ", error)
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
}