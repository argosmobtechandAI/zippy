import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, Trash2, Edit2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getCouponsApi, createCouponApi, deleteCouponApi, updateCouponApi, getAllUsersApi } from '../api/apis';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewUsersModal, setViewUsersModal] = useState({ show: false, coupon: null });

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        usageLimit: '',
        expiryDate: '',
        targetUsers: [],
        targetAll: true
    });

    const [userSearchQuery, setUserSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        if (!userSearchQuery) return users;
        const q = userSearchQuery.toLowerCase();
        return users.filter(u => 
            (u.name || '').toLowerCase().includes(q) || 
            (u.mobile || '').toLowerCase().includes(q)
        );
    }, [users, userSearchQuery]);

    useEffect(() => {
        fetchCoupons();
        fetchUsers();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getCouponsApi, [], {}, "GET", true);
            if (res && res.success) {
                setCoupons(res.coupons || []);
            }
        } catch (error) {
            toast.error("Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await apiFunction(getAllUsersApi, [], {}, "GET", true);
            if (res && res.success) {
                // Filter only riders
                setUsers((res.users || []).filter(u => u.type === 'rider'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code || !formData.discountValue) {
            toast.error("Code and discount value are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                discountValue: parseInt(formData.discountValue),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                expiryDate: formData.expiryDate || null,
                targetUsers: formData.targetAll ? [] : formData.targetUsers
            };

            if (editId) {
                const res = await apiFunction(updateCouponApi(editId), [], payload, "PUT", true);
                if (res && res.success) {
                    toast.success("Coupon updated successfully!");
                    setShowForm(false);
                    setEditId(null);
                    setFormData({
                        code: '', discountType: 'percentage', discountValue: '',
                        usageLimit: '', expiryDate: '', targetUsers: [], targetAll: true
                    });
                    fetchCoupons();
                } else {
                    throw new Error(res?.message || "Failed to update coupon");
                }
            } else {
                const res = await apiFunction(createCouponApi, [], payload, "POST", true);
                if (res && res.success) {
                    toast.success("Coupon created successfully!");
                    setShowForm(false);
                    setFormData({
                        code: '', discountType: 'percentage', discountValue: '',
                        usageLimit: '', expiryDate: '', targetUsers: [], targetAll: true
                    });
                    fetchCoupons();
                } else {
                    throw new Error(res?.message || "Failed to create coupon");
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                const res = await apiFunction(deleteCouponApi(id), [], {}, "DELETE", true);
                if (res && res.success) {
                    toast.success("Coupon deleted");
                    fetchCoupons();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleEdit = (coupon) => {
        const tUsers = coupon.target_users || coupon.targetUsers || [];
        setFormData({
            code: coupon.code || '',
            discountType: coupon.discount_type || coupon.discountType || 'percentage',
            discountValue: coupon.discount_value || coupon.discountValue || '',
            usageLimit: coupon.usage_limit || coupon.usageLimit || '',
            expiryDate: coupon.expiry_date || coupon.expiryDate ? new Date(coupon.expiry_date || coupon.expiryDate).toISOString().split('T')[0] : '',
            targetUsers: tUsers,
            targetAll: tUsers.length === 0
        });
        setEditId(coupon.id);
        setShowForm(true);
    };

    const toggleStatus = async (coupon) => {
        try {
            const newStatus = coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const res = await apiFunction(updateCouponApi(coupon.id), [], { ...coupon, status: newStatus }, "PUT", true);
            if (res && res.success) {
                toast.success("Coupon status updated");
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleUserToggle = (userId) => {
        if (formData.targetUsers.includes(userId)) {
            setFormData({ ...formData, targetUsers: formData.targetUsers.filter(id => id !== userId) });
        } else {
            setFormData({ ...formData, targetUsers: [...formData.targetUsers, userId] });
        }
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight flex items-center gap-3">
                        <Tag className="w-8 h-8 text-[#964C2E]" />
                        Coupon Management
                    </h1>
                    <p className="text-[14px] font-medium text-gray-500">Create and manage discount coupons.</p>
                </div>
                <button 
                    onClick={() => {
                        if (showForm) {
                            setEditId(null);
                            setFormData({
                                code: '', discountType: 'percentage', discountValue: '',
                                usageLimit: '', expiryDate: '', targetUsers: [], targetAll: true
                            });
                        }
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-[#964C2E] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#7D3F25] transition-all"
                >
                    {showForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showForm ? 'Cancel' : 'Create Coupon'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] p-8 max-w-3xl mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SUMMER20"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all uppercase"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Discount Type</label>
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">
                                    {formData.discountType === 'percentage' ? 'Percentage Value' : 'Flat Amount'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 500"}
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="Total times it can be used"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Target Audience</label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="target" 
                                        checked={formData.targetAll} 
                                        onChange={() => setFormData({ ...formData, targetAll: true })}
                                        className="w-4 h-4 text-[#964C2E] focus:ring-[#964C2E]"
                                    />
                                    <span className="text-[14px] font-bold text-[#1e2330]">All Users</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="target" 
                                        checked={!formData.targetAll} 
                                        onChange={() => setFormData({ ...formData, targetAll: false })}
                                        className="w-4 h-4 text-[#964C2E] focus:ring-[#964C2E]"
                                    />
                                    <span className="text-[14px] font-bold text-[#1e2330]">Specific Users</span>
                                </label>
                            </div>

                            {!formData.targetAll && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Search user name or mobile..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-[13px] font-medium mb-3 focus:outline-none focus:border-[#964C2E] transition-all"
                                    />
                                    <div className="border border-gray-100 rounded-2xl p-4 max-h-48 overflow-y-auto bg-gray-50/50">
                                        {filteredUsers.length === 0 ? (
                                            <div className="text-[13px] text-gray-400 font-semibold p-2">No users found.</div>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                                                    <input 
                                                        type="checkbox"
                                                        checked={formData.targetUsers.includes(u.id)}
                                                        onChange={() => handleUserToggle(u.id)}
                                                        className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-[#1e2330]">{u.name}</span>
                                                        <span className="text-[11px] text-gray-500 font-semibold">{u.mobile}</span>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-6 border-t border-[#F0E6D8]">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#964C2E] text-white text-[15px] font-bold py-4 rounded-xl shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : (editId ? "Update Coupon" : "Create Coupon")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] overflow-hidden">
                <div className="grid grid-cols-[150px_100px_1fr_120px_120px_100px_100px] gap-4 py-4 px-8 bg-gray-50/50 border-b border-[#F0E6D8]">
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">CODE</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">DISCOUNT</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">AUDIENCE</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">USAGE</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">EXPIRY</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">STATUS</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                </div>

                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-400">Loading coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No coupons found.</div>
                    ) : (
                        coupons.map((c) => (
                            <div key={c.id} className="grid grid-cols-[150px_100px_1fr_120px_120px_100px_100px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-8 hover:bg-[#FDFBF9] transition-colors">
                                <div className="font-black text-[#964C2E] text-[15px]">{c.code}</div>
                                <div className="font-bold text-[#1e2330]">
                                    {(c.discount_type || c.discountType) === 'percentage' ? `${c.discount_value || c.discountValue}%` : `₹${c.discount_value || c.discountValue}`}
                                </div>
                                <div className="text-[12px] font-bold text-gray-500">
                                    {!(c.target_users || c.targetUsers) || (c.target_users || c.targetUsers).length === 0 ? (
                                        'All Users'
                                    ) : (
                                        <button 
                                            onClick={() => setViewUsersModal({ show: true, coupon: c })}
                                            className="text-[#964C2E] hover:underline flex items-center gap-1"
                                        >
                                            <Users className="w-3 h-3" />
                                            {(c.target_users || c.targetUsers).length} Users
                                        </button>
                                    )}
                                </div>
                                <div className="text-[13px] font-bold text-[#1e2330]">
                                    {c.used_count || c.usedCount || 0} {c.usage_limit || c.usageLimit ? `/ ${c.usage_limit || c.usageLimit}` : ' (Unltd)'}
                                </div>
                                <div className="text-[12px] font-bold text-gray-500">
                                    {c.expiry_date || c.expiryDate ? new Date(c.expiry_date || c.expiryDate).toLocaleDateString() : 'No expiry'}
                                </div>
                                <div>
                                    <button
                                        onClick={() => toggleStatus(c)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${c.status === 'ACTIVE' ? 'bg-[#E0F8EC] text-[#059669]' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {c.status}
                                    </button>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                        title="Edit Coupon"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete Coupon"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {viewUsersModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[20px] font-black text-[#1e2330]">Target Audience</h2>
                            <button onClick={() => setViewUsersModal({ show: false, coupon: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                            {(() => {
                                const tUsers = viewUsersModal.coupon.target_users || viewUsersModal.coupon.targetUsers || [];
                                const matchedUsers = users.filter(u => tUsers.includes(u.id));
                                if (matchedUsers.length === 0) return <div className="text-gray-500 font-semibold text-center py-4">No users found.</div>;
                                return matchedUsers.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-[#1e2330]">{u.name}</div>
                                        <div className="text-[12px] font-semibold text-gray-500">{u.mobile}</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
