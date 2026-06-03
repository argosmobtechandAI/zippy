import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ success: false, message: "Subject and message are required" });
      }

      const { error } = await supabase.from('help_center').insert({
        user_id: userId || null,
        subject,
        message,
        status: "Open",
      });

      if (error) throw error;

      return res.status(201).json({ success: true, message: "Support request submitted successfully" });
    } catch (error) {
      console.error("Error submitting help center request:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else if (req.method === 'GET') {
    try {
      const { data: requests, error } = await supabase
        .from('help_center')
        .select('*, users(name)');
        
      if (error) throw error;

      // Map the nested users object to a flat userName property to match the frontend expectations
      const mappedRequests = requests.map(req => ({
        ...req,
        userName: req.users ? req.users.name : 'Unknown User'
      }));
      
      return res.status(200).json({ success: true, data: mappedRequests });
    } catch (error) {
      console.error("Error fetching help center requests:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
