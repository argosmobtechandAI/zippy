import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, message: "ID is required" });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const status = req.body?.data?.status || req.body?.status;
    try {
      const { data, error } = await supabase
        .from('help_center')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: "Status updated successfully", data });
    } catch (error) {
      console.error("Error updating status:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { data, error } = await supabase
        .from('help_center')
        .delete()
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return res.status(200).json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting request:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
