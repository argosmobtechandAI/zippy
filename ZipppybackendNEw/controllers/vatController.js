import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';

export const getHorseByVat = async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Get vet
    const { data: vet, error: vetError } = await supabase.from('vet').select('*').eq('user_id', userId).limit(1);

    if (vetError || !vet || vet.length === 0) {
      return res.json({ success: false, message: "Vet not found" });
    }

    // 2. Get horses
    const { data: horses, error: horseError } = await supabase.from('horse').select('*').eq('vat_id', vet[0].id);

    if (horseError || !horses || horses.length === 0) {
      return res.json({ success: false, message: "Horse not found" });
    }

    // 3. Process horses properly
    const updatedHorses = await Promise.all(
      horses.map(async (h) => {
        const { data: healthStatus, error: healthError } = await supabase.from('health_status').select('*').eq('horse', h.id);
        console.log("healthStatus fetch for horse", h.id, ":", healthStatus, "error:", healthError);

        if (!healthStatus || healthStatus.length === 0) {
          return {
            ...h,
            imageUrl: h.image_url,
            healthStatus: null,
          };
        }

        const latestHealthStatus = healthStatus.reduce((a, b) =>
          b.date > a.date ? b : a
        );
        console.log("latestHealthStatus for", h.id, ":", latestHealthStatus);

        return {
          ...h,
          imageUrl: h.image_url,
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


export const getAllVets = async (req, res) => {
    try {
        const { data: vats, error } = await supabase.from('vet').select('*');
        if (error) throw error;
        res.json({ success: true, vats });
    } catch (error) {
        console.error("Error fetching all vets:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};