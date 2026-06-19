import { supabase } from '../../../supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const bodyData = req.body.data || req.body;
      const { code, discountType, discountValue, targetUsers, usageLimit, expiryDate, status } = bodyData;
      
      const { data: updatedCoupon, error: updateError } = await supabase.from('coupons').update({
        code,
        discount_type: discountType,
        discount_value: discountValue,
        target_users: targetUsers,
        usage_limit: usageLimit,
        expiry_date: expiryDate,
        status
      }).eq('id', id).select();

      if (updateError) throw updateError;
      if (!updatedCoupon || updatedCoupon.length === 0) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      return res.status(200).json({ success: true, coupon: updatedCoupon[0] });
    } catch (error) {
      console.error('Error updating coupon:', error);
      return res.status(500).json({ success: false, message: 'Failed to update coupon', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { data: deletedCoupon, error: deleteError } = await supabase.from('coupons').delete().eq('id', id).select();
      
      if (deleteError) throw deleteError;
      if (!deletedCoupon || deletedCoupon.length === 0) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete coupon', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
