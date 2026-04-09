import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { riderTable } from "../schema.js";

export const getRider = async (req, res) => {
    const userId = req.userId;
    try {
        const rider = await db.select().from(riderTable).where(eq(riderTable.userId, userId))
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found', success: false });
        }
        return res.status(200).json({ rider: rider[0], message: 'Rider fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}