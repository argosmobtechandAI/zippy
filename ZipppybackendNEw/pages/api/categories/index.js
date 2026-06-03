import { supabase } from '../../../supabaseClient';

// GET all categories, POST create category, DELETE by id
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('horse_categories')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return res.status(200).json({ success: true, categories: data || [] });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    if (req.method === 'POST') {
        const { name, description } = req.body.data || req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
        try {
            const { data, error } = await supabase
                .from('horse_categories')
                .insert({ name: name.trim(), description: description || '' })
                .select();
            if (error) throw error;
            return res.status(201).json({ success: true, category: data[0] });
        } catch (error) {
            if (error.message?.includes('duplicate')) {
                return res.status(400).json({ success: false, message: 'Category already exists' });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'Category ID is required' });
        try {
            const { error } = await supabase.from('horse_categories').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Category deleted' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
