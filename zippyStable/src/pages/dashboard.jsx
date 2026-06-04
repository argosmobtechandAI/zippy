import { useState, useEffect } from 'react';
import { ChevronRight, Download, Plus, Wheat, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getStableStatsApi, getAllStablesApi, inventoryApi, getInventoryByStableApi } from '../api/apis';
import { useSelector } from 'react-redux';

const Dashboard = () => {
    // ... rest of state ...
    const [stocks, setStocks] = useState([]);
    const { selectedStable } = useSelector((state) => state.getDataReducer)
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All Items');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: 'Feed', currentStock: 0, unit: '', minThreshold: 10 });
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);



    const handleDeleteStock = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await apiFunction(inventoryApi, [id], {}, "DELETE", true);
            if (res && res.success) {
                setStocks(stocks.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error("Delete stock failed:", err);
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        try {
            const res = await apiFunction(inventoryApi, [editingItem.id], {
                name: editingItem.name,
                category: editingItem.category,
                currentStock: Number(editingItem.currentStock),
                unit: editingItem.unit,
                minThreshold: Number(editingItem.minThreshold)
            }, "PUT", true);

            if (res && res.success) {
                setStocks(stocks.map(s => s.id === editingItem.id ? { ...res.item, stock: res.item.currentStock } : s));
                setShowEditModal(false);
                setEditingItem(null);
            }
        } catch (err) {
            console.error("Update stock failed:", err);
        }
    };


    useEffect(() => {
        const fetchStats = async () => {
            try {
                if(selectedStable){

                    const inventoryRes = await apiFunction(getInventoryByStableApi, [selectedStable], {}, "GET", true);
                 
                    if (inventoryRes && inventoryRes.success) {
                        const mappedItems = (inventoryRes.items || []).map(item => ({
                            ...item,
                            stock: item.currentStock || 0
                        })).sort((a, b) => b.id.localeCompare(a.id)); 
                        setStocks(mappedItems);
                    }
                }
                
            } catch (err) {
                console.error("Dashboard data fetch failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            // FIX: Pass [] instead of {} and use inventoryApi constant
            const stableId = selectedStable;

            const res = await apiFunction(inventoryApi, [], { ...newItem, stableId }, "POST", true);
            console.log("DASHBOARD_ADD_STOCK: Response from API:", res);
            if (res && res.success) {
                console.log("DASHBOARD_ADD_STOCK: Success! New item added to state.");
                setStocks([...stocks, { ...res.item, stock: res.item.currentStock }]);
                setShowAddModal(false);
                setNewItem({ name: '', category: 'Feed', currentStock: 0, unit: '', minThreshold: 10 });
            } else {
                console.error("DASHBOARD_ADD_STOCK: Backend returned success: false or invalid response.");
            }
        } catch (err) {
            console.error("Add stock failed:", err);
        }
    };

    const filteredStocks = activeCategory === 'All Items'
        ? stocks
        : stocks.filter(item => item.category === activeCategory);

    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Breadcrumb & Header section */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                    <span className="text-[#649BA8]">Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[#964C2E] font-black">Inventory</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[32px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Stable Inventory</h1>
                        <p className="text-[14px] font-semibold text-gray-500">Real-time tracking of feed, medicines, and stable supplies.</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="bg-white text-[#964C2E] border border-[#EACDBA]/50 text-[13px] font-bold px-6 py-3.5 rounded-xl flex items-center gap-2.5 shadow-sm hover:bg-white/70 transition-all">
                            <Download className="w-4 h-4" strokeWidth={2.5} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                        >
                            <Plus className="w-4 h-4 bg-transparent border border-white rounded-[4px] p-0.5" strokeWidth={3} />
                            Add Stock
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-6">
                {['All Items', 'Feed', 'Medicines', 'Equipment', 'Consumables'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all ${activeCategory === cat
                            ? 'bg-[#964C2E] text-white'
                            : 'bg-white text-gray-600 border border-[#EACDBA]/40 hover:bg-white/70'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EACDBA]/40 overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 py-5 px-8 border-b border-gray-100 bg-[#FAFAFA]">
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase">ITEM NAME</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase">CATEGORY</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-center">CURRENT<br />STOCK</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-left pl-4">UNIT</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-400">Loading inventory...</div>
                    ) : filteredStocks.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No {activeCategory.toLowerCase()} available.</div>
                    ) : (
                        filteredStocks.map((item, idx) => {
                            const isLow = item.stock <= 10 && item.stock > 0;
                            const isOut = item.stock === 0;

                            const statusStyle = isOut
                                ? "bg-[#FEE2E2] text-[#B91C1C]"
                                : isLow
                                    ? "bg-[#FEF3C7] text-[#92400E]"
                                    : "bg-[#E0F8EC] text-[#059669]";

                            const statusLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";
                            const dotColor = isOut ? "bg-[#B91C1C]" : isLow ? "bg-[#92400E]" : "bg-[#059669]";

                            return (
                                <div key={idx} className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                            <Wheat className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">{item.name}</h4>
                                    </div>
                                    <div className="text-[13px] font-semibold text-gray-500">{item.category}</div>
                                    <div className="text-center text-[16px] font-black text-[#1e2330]">{item.stock}</div>
                                    <div className="text-[13px] font-semibold text-gray-500 pl-4">{item.unit}</div>
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${statusStyle}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span> {statusLabel}
                                        </span>
                                    </div>
                                    <div className="flex justify-end gap-3 pr-2">
                                        <button
                                            onClick={() => {
                                                setEditingItem({ ...item, currentStock: item.stock });
                                                setShowEditModal(true);
                                            }}
                                            className="text-gray-400 hover:text-[#964C2E] transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStock(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30 rounded-b-[24px]">
                    <div className="text-[12px] font-semibold text-gray-400 tracking-wide">
                        Showing <span className="text-[#964C2E] font-bold">1</span> to <span className="text-[#964C2E] font-bold">{Math.min(5, stocks.length)}</span> of <span className="text-[#964C2E] font-bold">{stocks.length}</span> items
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-[12px] font-bold shadow-sm flex items-center justify-center">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                            2
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                            3
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Stock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
                            <h2 className="text-[24px] font-black text-[#1e2330] tracking-tight">Add New Stock</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStock} className="p-8 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Item Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Premium Timothy Hay"
                                    className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Category</label>
                                    <select
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors appearance-none"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option>Feed</option>
                                        <option>Medicines</option>
                                        <option>Equipment</option>
                                        <option>Consumables</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Unit</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Bales, Vials"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Initial Stock</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={newItem.currentStock}
                                        onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Min Threshold</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={newItem.minThreshold}
                                        onChange={(e) => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 border-2 border-[#F9EEE5] rounded-2xl text-[#964C2E] text-[14px] font-bold hover:bg-[#F9EEE5] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#964C2E] rounded-2xl text-white text-[14px] font-bold hover:bg-[#7D3F25] transition-colors shadow-lg shadow-[#964C2E]/20"
                                >
                                    Create Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Stock Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
                            <h2 className="text-[24px] font-black text-[#1e2330] tracking-tight">Edit Stock Item</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStock} className="p-8 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Item Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Category</label>
                                    <select
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors appearance-none"
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    >
                                        <option>Feed</option>
                                        <option>Medicines</option>
                                        <option>Equipment</option>
                                        <option>Consumables</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Unit</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={editingItem.unit}
                                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Current Stock</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={editingItem.currentStock}
                                        onChange={(e) => setEditingItem({ ...editingItem, currentStock: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase ml-1">Min Threshold</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/30 rounded-2xl px-5 py-4 text-[14px] font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E] transition-colors"
                                        value={editingItem.minThreshold}
                                        onChange={(e) => setEditingItem({ ...editingItem, minThreshold: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-[#964C2E] text-white rounded-[20px] text-[15px] font-black shadow-lg shadow-[#964C2E]/20 hover:bg-[#7D3F25] transition-all mt-2 transform active:scale-[0.98]">
                                Update Item Details
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
