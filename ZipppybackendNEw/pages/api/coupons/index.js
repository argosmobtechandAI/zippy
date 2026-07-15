import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: coupons, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, coupons: coupons || [] });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch coupons', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const bodyData = req.body.data || req.body;
      const { code, discountType, discountValue, targetUsers, usageLimit, expiryDate, status, stableId } = bodyData;
      
      if (!code || !discountType || discountValue === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const { data: existing, error: findError } = await supabase.from('coupons').select('id').eq('code', code);
      if (findError) throw findError;
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }

      const { data: newCoupon, error: insertError } = await supabase.from('coupons').insert({
        code,
        discount_type: discountType,
        discount_value: discountValue,
        target_users: targetUsers || [],
        usage_limit: usageLimit || null,
        expiry_date: expiryDate || null,
        status: status || 'ACTIVE',
        stable_id: stableId,
        created_at: new Date().toISOString()
      }).select();

      if (insertError) throw insertError;

      return res.status(201).json({ success: true, coupon: newCoupon[0] });
    } catch (error) {
      console.error('Error creating coupon:', error);
      return res.status(500).json({ success: false, message: 'Failed to create coupon', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
