import { db } from "../db.js";
import { healthStatusTable, horseTable, vetTable } from "../schema.js";
import { eq } from "drizzle-orm";

export const getHorseByVat = async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Get vet
    const vet = await db
      .select()
      .from(vetTable)
      .where(eq(vetTable.userId, userId));

    if (vet.length === 0) {
      return res.json({ success: false, message: "Vet not found" });
    }

    // 2. Get horses
    const horses = await db
      .select()
      .from(horseTable)
      .where(eq(horseTable.vatId, vet[0].id));

    if (horses.length === 0) {
      return res.json({ success: false, message: "Horse not found" });
    }

    // 3. Process horses properly
    const updatedHorses = await Promise.all(
      horses.map(async (h) => {
        const healthStatus = await db
          .select()
          .from(healthStatusTable)
          .where(eq(healthStatusTable.horseId, h.id));

        if (healthStatus.length === 0) {
          return {
            ...h,
            healthStatus: null,
          };
        }

        const latestHealthStatus = healthStatus.reduce((a, b) =>
          b.date > a.date ? b : a
        );

        return {
          ...h,
          healthStatus: latestHealthStatus,
        };
      })
    );

    // 4. Final response
    res.json({ success: true, horses: updatedHorses });

  } catch (error) {
    console.error("Error fetching horse by VAT:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};