import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: levels, error } = await supabase.from('levels').select('*');
      if (error) throw error;
      return res.status(200).json({ success: true, levels: levels || [] });
    } catch (error) {
      console.error('Error fetching levels:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch levels', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const bodyData = req.body.data || req.body;
      const { name, description, category, monthlyPrice, weekdaysPrice, weekendPrice, sessions, status } = bodyData;
      
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      const { data: existing, error: findError } = await supabase.from('levels').select('id').eq('name', name);
      if (findError) throw findError;
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Level name already exists' });
      }

      const { data: newLevel, error: insertError } = await supabase.from('levels').insert({
        name,
        description: description || null,
        category: category || 'Level',
        monthly_price: monthlyPrice || null,
        weekdays_price: weekdaysPrice || null,
        weekend_price: weekendPrice || null,
        sessions: sessions || null,
        status: status || 'ACTIVE'
      }).select();

      if (insertError) throw insertError;

      return res.status(201).json({ success: true, level: newLevel[0] });
    } catch (error) {
      console.error('Error creating level:', error);
      return res.status(500).json({ success: false, message: 'Failed to create level', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
