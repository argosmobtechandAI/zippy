import { supabase } from '../supabaseClient.js';

export const getAdminNotifications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ success: true, notifications: data || [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admin_notifications')
            .update({ unread: false })
            .eq('unread', true)
            .select();

        if (error) throw error;

        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('admin_notifications')
            .update({ unread: false })
            .eq('id', id)
            .select();

        if (error) throw error;

        return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};
