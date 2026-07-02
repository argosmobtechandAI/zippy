import { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit2, X, Check, ChevronRight, FolderOpen } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getCategoriesApi, createCategoryApi, deleteCategoryApi } from '../api/apis';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getCategoriesApi, [], {}, 'GET', false);
            if (res?.success) setCategories(res.categories || []);
        } catch (e) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const res = await apiFunction(createCategoryApi, [], { name: newName.trim(), description: newDesc.trim() }, 'POST', false);
            if (res?.success) {
                toast.success(`Category "${newName}" created!`);
                setNewName('');
                setNewDesc('');
                setShowForm(false);
                fetchCategories();
            } else {
                toast.error(res?.message || 'Failed to create');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete "${cat.name}"? Existing horses won't lose their category label.`)) return;
        setDeleting(cat.id);
        try {
            const res = await apiFunction(`${deleteCategoryApi}?id=${cat.id}`, [], {}, 'DELETE', false);
            if (res?.success) {
                toast.success(`"${cat.name}" deleted`);
                fetchCategories();
            } else {
                toast.error(res?.message || 'Failed to delete');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setDeleting(null);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditDesc(cat.description || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditDesc('');
    };

    const handleUpdate = async (cat) => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            // Reuse POST with same id — backend would need PATCH, for now we delete + recreate
            // Or just update via PUT if available; using a simple patch approach:
            const res = await apiFunction(`${deleteCategoryApi}?id=${cat.id}`, [], {}, 'DELETE', false);
            if (res?.success) {
                const createRes = await apiFunction(createCategoryApi, [], { name: editName.trim(), description: editDesc.trim() }, 'POST', false);
                if (createRes?.success) {
                    toast.success('Category updated!');
                    cancelEdit();
                    fetchCategories();
                } else {
                    toast.error(createRes?.message || 'Rename failed');
                }
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-[1000px] mx-auto min-h-full bg-[#fdfaf7] w-full font-sans">
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#964C2E]/60 mb-2 uppercase tracking-[0.2em]">
                        <span>Admin</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#964C2E]">Horse Categories</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#1e2330] tracking-tight mb-2">Manage Categories</h1>
                    <p className="text-sm font-medium text-gray-400">
                        Create and manage horse discipline categories. These appear in all add/edit horse forms.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="group bg-[#964C2E] text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-[#964C2E]/20 flex items-center gap-3 hover:bg-[#7D3F25] transition-all duration-300 transform hover:scale-[1.02] whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Add Category
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#964C2E]/10 p-2 rounded-xl">
                            <Tag className="w-5 h-5 text-[#964C2E]" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{categories.length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Categories</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <FolderOpen className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{categories.filter(c => c.description).length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">With Description</p>
                </div>
            </div>

            {/* Add Category Form (inline slide-in) */}
            {showForm && (
                <div className="bg-white rounded-[2rem] border-2 border-[#964C2E]/20 shadow-xl shadow-[#964C2E]/5 p-8 mb-8 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-[#964C2E] uppercase tracking-[0.2em]">New Entry</p>
                            <h3 className="text-2xl font-black text-[#1e2330]">Create Category</h3>
                        </div>
                        <button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#964C2E]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Category Name *</label>
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                required
                                autoFocus
                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/40 transition-all"
                                placeholder="e.g., Show Jumping, Polo, Western Riding..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Description (optional)</label>
                            <input
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/40 transition-all"
                                placeholder="Brief description of this horse discipline..."
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 rounded-2xl text-gray-400 text-xs font-black uppercase tracking-widest hover:text-[#1e2330] transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !newName.trim()}
                                className="bg-[#964C2E] text-white text-xs font-black uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-[#964C2E]/25 hover:bg-[#7D3F25] transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h2 className="text-xl font-black text-[#1e2330]">All Categories</h2>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#964C2E]/10 border-t-[#964C2E] rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-4 opacity-50">
                        <Tag className="w-14 h-14 text-[#964C2E]" />
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#1e2330]">No categories yet</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Click "Add Category" above to create your first one.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {categories.map((cat, index) => (
                            <div key={cat.id} className="px-8 py-5 flex items-center gap-6 group hover:bg-[#fdfaf7]/60 transition-colors">
                                {/* Index Badge */}
                                <div className="w-8 h-8 rounded-xl bg-[#964C2E]/5 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-[#964C2E]">{index + 1}</span>
                                </div>

                                {/* Content */}
                                {editingId === cat.id ? (
                                    <div className="flex-1 flex flex-col gap-3">
                                        <input
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            autoFocus
                                            className="w-full bg-[#fdfaf7] border border-[#964C2E]/30 rounded-xl px-4 py-3 text-sm font-bold text-[#1e2330] focus:outline-none"
                                            placeholder="Category name"
                                        />
                                        <input
                                            value={editDesc}
                                            onChange={e => setEditDesc(e.target.value)}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 focus:outline-none"
                                            placeholder="Description (optional)"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1.5 bg-[#F5EDDF] text-[#8C4A28] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#964C2E]/10">
                                                {cat.name}
                                            </span>
                                        </div>
                                        {cat.description && (
                                            <p className="text-[11px] font-medium text-gray-400 mt-1.5 ml-1">{cat.description}</p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className={`flex items-center gap-2 ${editingId === cat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                    {editingId === cat.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(cat)}
                                                disabled={saving}
                                                className="p-2.5 bg-green-50 hover:bg-green-100 rounded-xl text-green-600 transition-all"
                                                title="Save"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(cat)}
                                                className="p-2.5 hover:bg-[#964C2E]/10 rounded-xl text-gray-400 hover:text-[#964C2E] transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat)}
                                                disabled={deleting === cat.id}
                                                className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="px-8 py-5 bg-[#fdfaf7]/50 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'} registered</p>
                </div>
            </div>
        </div>
    );
};

export default Categories;
