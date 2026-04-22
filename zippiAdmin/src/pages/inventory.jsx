import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Bell, 
    Plus, 
    MoreHorizontal, 
    Filter, 
    ArrowUpDown, 
    Download, 
    Edit, 
    Trash2, 
    AlertCircle, 
    Package, 
    ChevronRight,
    ChevronDown,
    Loader2, 
    ShieldCheck, 
    Clipboard, 
    Activity, 
    Droplets, 
    Zap, 
    Wrench, 
    LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFunction } from '../api/apiFunction';
import { 
    getAllInventoryApi, 
    createInventoryApi, 
    updateInventoryApi, 
    deleteInventoryApi,
    seedInventoryApi, 
    getAllStablesApi
} from '../api/apis';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All Items");
    const [activeStable, setActiveStable] = useState("All Stables");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [allStables, setAllStables] = useState([])

    const categories = ["All Items", "Feed", "Medicines", "Equipment", "Consumables"];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAllInventoryApi, [], {}, "GET", true);
            if (res && res.success) {
                setInventory(res.items);
            }

            const stables = await apiFunction(getAllStablesApi, [], {}, "GET", true);
            if (stables && stables.success) {
                setAllStables(stables.stables);
            }
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSeed = async () => {
        try {
            const res = await apiFunction(seedInventoryApi, [], {}, "GET", true);
            if (res && res.success) {
                toast.success("Inventory initialized");
                fetchData();
            }
        } catch (error) {
            toast.error("Seeding failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this inventory item?")) return;
        try {
            const res = await apiFunction(`${deleteInventoryApi}/${id}`, [], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("Item removed");
                fetchData();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredItems = inventory.filter(item => {
        const matchesCategory = activeCategory === "All Items" || item.category === activeCategory;
        const matchesStable = activeStable === "All Stables" || item.stable?.name === activeStable;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStable && matchesSearch;
    });

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Feed': return <Droplets className="w-5 h-5 text-orange-400" />;
            case 'Medicines': return <Activity className="w-5 h-5 text-blue-400" />;
            case 'Equipment': return <Wrench className="w-5 h-5 text-purple-400" />;
            case 'Consumables': return <Zap className="w-5 h-5 text-teal-400" />;
            default: return <Package className="w-5 h-5 text-gray-400" />;
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            "In Stock": "bg-green-50 text-green-600 border-green-100",
            "Low Stock": "bg-amber-50 text-amber-600 border-amber-100",
            "Out of Stock": "bg-red-50 text-red-600 border-red-100"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
                • {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#fcfaf8] p-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                        <span>Dashboard</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#964C2E]">Inventory</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#1e2330] tracking-tight mb-2">Stable Inventory</h1>
                    <p className="text-gray-400 text-sm font-medium">Real-time tracking of feed, medicines, and stable supplies.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#964C2E] transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button 
                        onClick={() => { setEditingItem(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#964C2E] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#964C2E]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Stock
                    </button>
                    <button 
                        onClick={handleSeed}
                        className="p-3.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#964C2E] transition-all shadow-sm"
                        title="Seed Demo Data"
                    >
                        <ShieldCheck className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative w-full md:w-64">
                    <select 
                        value={activeCategory} 
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-100 rounded-[1.2rem] py-4 pl-6 pr-12 text-[13px] font-bold text-gray-500 hover:text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/20 shadow-sm transition-all"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative w-full md:w-64">
                    <select 
                        value={activeStable} 
                        onChange={(e) => setActiveStable(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-100 rounded-[1.2rem] py-4 pl-6 pr-12 text-[13px] font-bold text-gray-500 hover:text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/20 shadow-sm transition-all"
                    >
                        {["All Stables", ...new Set(allStables.map(s => s.name).filter(Boolean))].map(stableName => (
                            <option key={stableName} value={stableName}>{stableName}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm placeholder:text-gray-300"
                    />
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 p-2 flex items-center justify-center gap-4 shadow-sm">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sort:</span>
                    <button className="text-[11px] font-black text-[#964C2E] uppercase tracking-widest flex items-center gap-1">Quantity <ArrowUpDown className="w-3 h-3" /></button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stable Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-[#964C2E] mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Synchronizing Inventory...</p>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-gray-400 font-bold">No items matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className={`hover:bg-[#fdfaf7]/50 transition-all group ${item.currentStock <= item.minThreshold ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-8 py-6 flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all ${item.currentStock <= item.minThreshold ? 'bg-red-100 border-red-200' : 'bg-[#fdfaf7] border-gray-100'}`}>
                                                {getCategoryIcon(item.category)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1e2330] text-sm">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">ID: {item.id.slice(0,8)}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.category}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.stable?.name || "N/A"}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl font-black ${item.currentStock <= item.minThreshold ? 'text-red-600 animate-pulse' : 'text-[#1e2330]'}`}>{item.currentStock}</span>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            const newStock = item.currentStock + 10;
                                                            const res = await apiFunction(`${updateInventoryApi}/${item.id}`, [], { currentStock: newStock }, "PUT", true);
                                                            if (res && res.success) {
                                                                toast.success(`+10 added to ${item.name}`);
                                                                fetchData();
                                                            }
                                                        } catch (err) {
                                                            toast.error("Restock failed");
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg bg-[#964C2E]/5 text-[#964C2E] hover:bg-[#964C2E] hover:text-white transition-all"
                                                    title="Quick Restock (+10)"
                                                >
                                                    <Plus className="w-3 h-3" strokeWidth={3} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{item.unit}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={item.currentStock === 0 ? "Out of Stock" : item.currentStock <= item.minThreshold ? "Low Stock" : "In Stock"} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setEditingItem(item); setShowModal(true); }}
                                                    className="p-2.5 hover:bg-[#964C2E]/10 rounded-xl text-gray-400 hover:text-[#964C2E] transition-all"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-[#fdfaf7]/30 flex justify-between items-center border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredItems.length} of {inventory.length} entries</p>
                    <div className="flex gap-2">
                        <button className="px-5 py-2 rounded-xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#964C2E] transition-all">Prev</button>
                        <button className="px-5 py-2 rounded-xl bg-[#964C2E] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#964C2E]/20">1</button>
                        <button className="px-5 py-2 rounded-xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#964C2E] transition-all">Next</button>
                    </div>
                </div>
            </div>

            {/* Inventory Modal */}
            {showModal && (
                <InventoryModal 
                    item={editingItem} 
                    onClose={() => setShowModal(false)} 
                    onSuccess={() => { setShowModal(false); fetchData(); }} 
                />
            )}
        </div>
    );
};

const InventoryModal = ({ item, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: item?.name || "",
        category: item?.category || "Feed",
        currentStock: item?.currentStock || "",
        unit: item?.unit || "",
        minThreshold: item?.minThreshold || 10
    });

    const categories = ["Feed", "Medicines", "Equipment", "Consumables"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                currentStock: parseInt(formData.currentStock),
                minThreshold: parseInt(formData.minThreshold)
            };

            let res;
            if (item) {
                res = await apiFunction(`${updateInventoryApi}/${item.id}`, [], payload, "PUT", true);
            } else {
                res = await apiFunction(createInventoryApi, [], payload, "POST", true);
            }

            if (res && res.success) {
                toast.success(item ? "Stock updated" : "Item added to inventory");
                onSuccess();
            }
        } catch (error) {
            toast.error("Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#fdfaf7] rounded-[2.5rem] w-full max-w-[550px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[#1e2330] tracking-tight">{item ? 'Edit Stock' : 'Add New Entry'}</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Inventory Management</p>
                            </div>
                            <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Item Description</label>
                                <input 
                                    required 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all" 
                                    placeholder="e.g., Premium Alfalfa" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
                                    <select 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all appearance-none"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Display Unit</label>
                                    <input 
                                        required 
                                        value={formData.unit} 
                                        onChange={e => setFormData({...formData, unit: e.target.value})}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all" 
                                        placeholder="e.g., Bales, Vials" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Current Stock Level</label>
                                    <input 
                                        type="number"
                                        required 
                                        value={formData.currentStock} 
                                        onChange={e => setFormData({...formData, currentStock: e.target.value})}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all" 
                                        placeholder="0" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Low Stock Alert at</label>
                                    <input 
                                        type="number"
                                        required 
                                        value={formData.minThreshold} 
                                        onChange={e => setFormData({...formData, minThreshold: e.target.value})}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all" 
                                        placeholder="10" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white/50 border-t border-gray-50 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 text-gray-500 text-[11px] font-black uppercase tracking-widest transition-all">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-[2] px-8 py-4 rounded-2xl bg-[#964C2E] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#964C2E]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : item ? "Update Records" : "Confirm Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inventory;
