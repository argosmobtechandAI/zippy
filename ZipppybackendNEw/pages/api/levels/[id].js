import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const bodyData = req.body.data || req.body;
      const { name, description, category, monthlyPrice, weekdaysPrice, weekendPrice, sessions, status, gst } = bodyData;
      
      const { data: updatedLevel, error: updateError } = await supabase.from('levels').update({
        name,
        description,
        category,
        monthly_price: monthlyPrice,
        weekdays_price: weekdaysPrice,
        weekend_price: weekendPrice,
        sessions,
        gst: gst != null ? Number(gst) : null,
        status
      }).eq('id', id).select();

      if (updateError) throw updateError;
      if (!updatedLevel || updatedLevel.length === 0) {
        return res.status(404).json({ success: false, message: 'Level not found' });
      }

      return res.status(200).json({ success: true, level: updatedLevel[0] });
    } catch (error) {
      console.error('Error updating level:', error);
      return res.status(500).json({ success: false, message: 'Failed to update level', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { data: deletedLevel, error: deleteError } = await supabase.from('levels').delete().eq('id', id).select();
      
      if (deleteError) throw deleteError;
      if (!deletedLevel || deletedLevel.length === 0) {
        return res.status(404).json({ success: false, message: 'Level not found' });
      }
      return res.status(200).json({ success: true, message: 'Level deleted successfully' });
    } catch (error) {
      console.error('Error deleting level:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete level', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
