import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getLevelsApi, createLevelApi, deleteLevelApi, updateLevelApi } from '../api/apis';
import toast from 'react-hot-toast';

const Levels = () => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Level',
        monthlyPrice: '',
        weekdaysPrice: '',
        weekendPrice: '',
        sessions: ''
    });

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getLevelsApi, [], {}, "GET", true);
            if (res && res.success) {
                setLevels(res.levels || []);
            }
        } catch (error) {
            toast.error("Failed to fetch levels");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Level name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                monthlyPrice: formData.monthlyPrice ? parseInt(formData.monthlyPrice) : null,
                weekdaysPrice: formData.weekdaysPrice ? parseInt(formData.weekdaysPrice) : null,
                weekendPrice: formData.weekendPrice ? parseInt(formData.weekendPrice) : null,
                sessions: formData.sessions ? parseInt(formData.sessions) : null
            };

            if (editId) {
                const res = await apiFunction(updateLevelApi(editId), [], payload, "PUT", true);
                if (res && res.success) {
                    toast.success("Level updated successfully!");
                    setShowForm(false);
                    setEditId(null);
                    setFormData({
                        name: '', description: '', category: 'Level', monthlyPrice: '', weekdaysPrice: '', weekendPrice: '', sessions: ''
                    });
                    fetchLevels();
                } else {
                    throw new Error(res?.message || "Failed to update level");
                }
            } else {
                const res = await apiFunction(createLevelApi, [], payload, "POST", true);
                if (res && res.success) {
                    toast.success("Level created successfully!");
                    setShowForm(false);
                    setFormData({
                        name: '', description: '', category: 'Level', monthlyPrice: '', weekdaysPrice: '', weekendPrice: '', sessions: ''
                    });
                    fetchLevels();
                } else {
                    throw new Error(res?.message || "Failed to create level");
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this level?")) {
            try {
                const res = await apiFunction(deleteLevelApi(id), [], {}, "DELETE", true);
                if (res && res.success) {
                    toast.success("Level deleted");
                    fetchLevels();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleEdit = (level) => {
        setFormData({
            name: level.name || '',
            description: level.description || '',
            category: level.category || 'Level',
            monthlyPrice: level.monthly_price || level.monthlyPrice || '',
            weekdaysPrice: level.weekdays_price || level.weekdaysPrice || '',
            weekendPrice: level.weekend_price || level.weekendPrice || '',
            sessions: level.sessions || ''
        });
        setEditId(level.id);
        setShowForm(true);
    };

    const toggleStatus = async (level) => {
        try {
            const newStatus = level.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const res = await apiFunction(updateLevelApi(level.id), [], { ...level, status: newStatus }, "PUT", true);
            if (res && res.success) {
                toast.success("Level status updated");
                fetchLevels();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight flex items-center gap-3">
                        <Layers className="w-8 h-8 text-[#964C2E]" />
                        Level Management
                    </h1>
                    <p className="text-[14px] font-medium text-gray-500">Create and manage rider levels and pricing.</p>
                </div>
                <button 
                    onClick={() => {
                        if (showForm) {
                            setEditId(null);
                            setFormData({ name: '', description: '', category: 'Level', monthlyPrice: '', weekdaysPrice: '', weekendPrice: '', sessions: '' });
                        }
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-[#964C2E] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#7D3F25] transition-all"
                >
                    {showForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showForm ? 'Cancel' : 'Create Level'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] p-8 max-w-3xl mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Level Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Beginner, Intermediate"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Description (Outcome)</label>
                            <textarea
                                placeholder="Describe the outcome of this level..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all min-h-[100px] resize-y"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Program Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                            >
                                <option value="Level">Level</option>
                                <option value="Riding Program">Riding Program</option>
                                <option value="Lease Program">Lease Program</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {formData.category === 'Level' ? (
                                <>
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Weekdays Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Optional"
                                            value={formData.weekdaysPrice}
                                            onChange={(e) => setFormData({ ...formData, weekdaysPrice: e.target.value })}
                                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Weekend Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Optional"
                                            value={formData.weekendPrice}
                                            onChange={(e) => setFormData({ ...formData, weekendPrice: e.target.value })}
                                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Monthly Fee (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Optional"
                                        value={formData.monthlyPrice}
                                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                        className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Sessions Included</label>
                                <input
                                    type="number"
                                    placeholder="Optional"
                                    value={formData.sessions}
                                    onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#F0E6D8]">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#964C2E] text-white text-[15px] font-bold py-4 rounded-xl shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : (editId ? "Update Level" : "Create Level")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] overflow-hidden">
                <div className="grid grid-cols-[1.5fr_2fr_100px_100px_100px_80px_100px_100px] gap-4 py-4 px-8 bg-gray-50/50 border-b border-[#F0E6D8]">
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">NAME/CATEGORY</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">OUTCOME</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">WEEKDAYS</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">WEEKEND</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">MONTHLY</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">SESSIONS</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">STATUS</div>
                    <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                </div>

                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-400">Loading levels...</div>
                    ) : levels.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No levels found.</div>
                    ) : (
                        levels.map((l) => (
                            <div key={l.id} className="grid grid-cols-[1.5fr_2fr_100px_100px_100px_80px_100px_100px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-8 hover:bg-[#FDFBF9] transition-colors">
                                <div>
                                    <div className="font-black text-[#1e2330] text-[15px]">{l.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{l.category || 'Level'}</div>
                                </div>
                                <div className="text-[12px] font-bold text-gray-500 line-clamp-2 pr-4">{l.description || '-'}</div>
                                <div className="font-bold text-[#1e2330]">{(!l.category || l.category === 'Level') && (l.weekdays_price || l.weekdaysPrice) ? `₹${l.weekdays_price || l.weekdaysPrice}` : '-'}</div>
                                <div className="font-bold text-[#1e2330]">{(!l.category || l.category === 'Level') && (l.weekend_price || l.weekendPrice) ? `₹${l.weekend_price || l.weekendPrice}` : '-'}</div>
                                <div className="font-bold text-[#1e2330]">{l.category && l.category !== 'Level' && (l.monthly_price || l.monthlyPrice) ? `₹${l.monthly_price || l.monthlyPrice}` : '-'}</div>
                                <div className="font-bold text-[#1e2330]">{l.sessions || '-'}</div>
                                <div>
                                    <button
                                        onClick={() => toggleStatus(l)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${l.status === 'ACTIVE' ? 'bg-[#E0F8EC] text-[#059669]' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {l.status}
                                    </button>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(l)}
                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                        title="Edit Level"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete Level"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Levels;
