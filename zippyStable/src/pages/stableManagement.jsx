import { useState, useEffect } from 'react';
import { MapPin, Tag, Archive, ExternalLink, RotateCw, Settings2, MoreHorizontal } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getStableStatsApi, getAllStablesApi } from '../api/apis';

const StableManagement = () => {
    const [activeTab, setActiveTab] = useState('horses');
    const [activeCategory, setActiveCategory] = useState('All Horses');
    const [activeStockCategory, setActiveStockCategory] = useState('All Items');
    const [horses, setHorses] = useState([]);
    const [stableData, setStableData] = useState({ stocks: [] });
    const [loading, setLoading] = useState(true);
    const [selectedHorse, setSelectedHorse] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Discover active stable
                const stableListRes = await apiFunction(getAllStablesApi, [], {}, "GET", true);
                let stableId = "00000000-0000-0000-0000-000000000001";
                if (stableListRes && stableListRes.success && stableListRes.stables.length > 0) {
                    stableId = stableListRes.stables[0].id;
                }

                const [horseRes, statsRes] = await Promise.all([
                    apiFunction(getAllHorsesApi, [], {}, "GET", true),
                    apiFunction(getStableStatsApi, [stableId], {}, "GET", true)
                ]);
                
                if (horseRes && horseRes.success) {
                    setHorses(horseRes.horses || []);
                }
                if (statsRes && statsRes.success) {
                    setStableData(statsRes.stable);
                }
            } catch (err) {
                console.error("Stable Management fetch failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const stocks = stableData.stocks || [];

    const filteredHorses = activeCategory === 'All Horses' 
        ? horses 
        : horses.filter(h => h.title === activeCategory);

    const filteredStocks = activeStockCategory === 'All Items' 
        ? stocks 
        : stocks.filter(s => s.category === activeStockCategory);

    const handleRestock = (itemName) => {
        alert(`Restock request issued for: ${itemName}. Local logistics notified.`);
    };

    return (
        <div className="w-full min-h-full flex flex-col bg-[#F9EEE5] p-10 font-sans max-w-[1400px] mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Stable General Registry</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Comprehensive directory view for all structural assets and rostered horses.</p>
                </div>
                
                {/* Custom Toggle Switch Tab */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-[#EACDBA]/40 inline-flex">
                    <button 
                        onClick={() => setActiveTab('horses')}
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${
                            activeTab === 'horses' 
                            ? 'bg-[#964C2E] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Equine Roster
                    </button>
                    <button 
                        onClick={() => setActiveTab('stocks')}
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${
                            activeTab === 'stocks' 
                            ? 'bg-[#964C2E] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Master Inventory
                    </button>
                </div>
            </div>

            {/* Filter Tabs Bar - Context Aware */}
            <div className="flex items-center gap-3 mb-8">
                {activeTab === 'horses' ? (
                    ['All Horses', 'Show Jumping', 'Dressage', 'Beginner Friendly', 'Elite Stallion'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all ${
                                activeCategory === cat 
                                    ? 'bg-[#964C2E] text-white shadow-[#964C2E]/20' 
                                    : 'bg-white text-gray-600 border border-[#EACDBA]/40 hover:bg-white/70'
                            }`}
                        >
                            {cat}
                        </button>
                    ))
                ) : (
                    ['All Items', 'Feed', 'Medicines', 'Equipment', 'Consumables'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveStockCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all ${
                                activeStockCategory === cat 
                                    ? 'bg-[#964C2E] text-white shadow-[#964C2E]/20' 
                                    : 'bg-white text-gray-600 border border-[#EACDBA]/40 hover:bg-white/70'
                            }`}
                        >
                            {cat}
                        </button>
                    ))
                )}
            </div>

            {/* Dynamic Content Views */}
            <div className="mt-2">
                {activeTab === 'horses' ? (
                    
                    <div className="grid grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center py-10 font-bold text-gray-400">Loading horses...</div>
                        ) : filteredHorses.length === 0 ? (
                            <div className="col-span-3 text-center py-10 font-bold text-gray-400">No {activeCategory.toLowerCase()} available.</div>
                        ) : (
                            filteredHorses.map((horse, idx) => (
                                <div key={horse.id || idx} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#EACDBA]/30 flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                                    
                                    <div className="h-[260px] w-full overflow-hidden relative">
                                        <img 
                                            src={horse.imageUrl || "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"} 
                                            alt={horse.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e2330]/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-7 right-7">
                                            <h3 className="text-white text-[28px] font-black leading-tight drop-shadow-md mb-1.5">{horse.name}</h3>
                                            <div className="flex items-center gap-1.5 text-[#F9EEE5] text-[13px] font-bold drop-shadow-md">
                                                <MapPin className="w-4 h-4 text-[#EACDBA]" /> Location {horse.location || 'Oceania View'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-7 flex flex-col gap-6 bg-white">
                                        <div className="flex justify-between items-center">
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#F9EEE5] text-[#964C2E]">
                                                <Tag className="w-3.5 h-3.5" /> {horse.title || 'General Horse'}
                                            </span>
                                            <button className="text-gray-400 hover:text-[#964C2E] p-1 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => setSelectedHorse(horse)}
                                                className="py-4 border-2 border-[#F9EEE5] rounded-[18px] text-[#964C2E] text-[14px] font-bold hover:bg-[#F9EEE5] transition-colors flex justify-center items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Profile
                                            </button>
                                            <button 
                                                onClick={() => setSelectedHorse(horse)}
                                                className="py-4 bg-[#964C2E] rounded-[18px] text-white text-[14px] font-bold hover:bg-[#7D3F25] transition-colors flex justify-center items-center gap-2 shadow-lg shadow-[#964C2E]/20"
                                            >
                                                <Settings2 className="w-4 h-4" /> Manage
                                            </button>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))
                        )}
                    </div>
                    
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {/* --- STOCKS / INVENTORY Metrics Grid View --- */}
                        {filteredStocks.length === 0 ? (
                            <div className="col-span-3 text-center py-10 font-bold text-gray-400">No {activeStockCategory.toLowerCase()} found.</div>
                        ) : filteredStocks.map((item, idx) => {
                            const isLow = item.stock <= 10 && item.stock > 0;
                            const isOut = item.stock === 0;
                            
                            const bgAccent = isOut ? 'bg-[#FEE2E2]' : isLow ? 'bg-[#FEF3C7]' : 'bg-[#E0F8EC]';
                            const textAccent = isOut ? 'text-[#DC2626]' : isLow ? 'text-[#D97706]' : 'text-[#059669]';
                            const borderAccent = isOut ? 'border-l-[#FCA5A5]' : isLow ? 'border-l-[#FCD34D]' : 'border-l-[#6EE7B7]';
                            
                            return (
                                <div key={idx} className={`bg-white rounded-[32px] p-8 shadow-sm border-l-[10px] border-y border-r border-y-[#EACDBA]/30 border-r-[#EACDBA]/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[260px] ${borderAccent}`}>
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="pr-4">
                                                <h3 className="text-[20px] font-black text-[#1e2330] leading-tight mb-2.5">{item.name}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[10px] font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-[18px] ${bgAccent} ${textAccent} flex-shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                                                <Archive className="w-5 h-5" />
                                            </div>
                                        </div>
 
                                        <div className="flex items-end gap-2 mb-8">
                                            <span className={`text-[58px] font-black leading-none tracking-tighter ${textAccent}`}>
                                                {item.stock}
                                            </span>
                                            <span className="text-[15px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                                                {item.unit}
                                            </span>
                                        </div>
                                    </div>
 
                                    <div className="flex gap-3 mt-auto">
                                        <button 
                                            onClick={() => handleRestock(item.name)}
                                            className="flex-1 py-4 bg-[#F9EEE5] rounded-[18px] text-[#964C2E] text-[14px] font-bold hover:bg-[#EACDBA]/30 transition-all flex justify-center items-center gap-2 active:scale-95"
                                        >
                                            <RotateCw className="w-4 h-4" /> Issue Restock
                                        </button>
                                        <button className="p-4 bg-white border border-[#EACDBA]/50 rounded-[18px] text-gray-500 hover:text-[#964C2E] hover:border-[#964C2E]/30 transition-all active:scale-95">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Horse Profile Modal */}
            {selectedHorse && (
                <div className="fixed inset-0 bg-[#1e2330]/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
                        {/* Hero Header */}
                        <div className="h-[350px] w-full relative overflow-hidden">
                            <img 
                                src={selectedHorse.imageUrl || "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"} 
                                alt={selectedHorse.name} 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2330] via-transparent to-transparent"></div>
                            <button 
                                onClick={() => setSelectedHorse(null)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                            
                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                <div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black tracking-widest uppercase bg-[#964C2E] text-white mb-4 shadow-lg">
                                        <Tag className="w-4 h-4" /> {selectedHorse.title}
                                    </span>
                                    <h2 className="text-white text-[56px] font-black leading-none tracking-tighter shadow-sm">{selectedHorse.name}</h2>
                                    <p className="text-[#EACDBA] text-[18px] font-bold mt-2 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> Assigned to Stable Wing A - Slot {selectedHorse.location || '04'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 flex-1 overflow-y-auto bg-[#F9EEE5]/30">
                            <div className="grid grid-cols-12 gap-10">
                                {/* Left Side: Bio & Details */}
                                <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EACDBA]/20">
                                            <p className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Age</p>
                                            <p className="text-[20px] font-black text-[#1e2330]">7 Years</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EACDBA]/20">
                                            <p className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Breed</p>
                                            <p className="text-[20px] font-black text-[#1e2330]">Arabian Mixed</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#EACDBA]/20">
                                        <h4 className="text-[14px] font-black text-[#1e2330] tracking-tight mb-4 flex items-center gap-2">
                                            <Archive className="w-5 h-5 text-[#964C2E]" /> Stable Notes
                                        </h4>
                                        <p className="text-[15px] font-semibold text-gray-500 leading-relaxed">
                                            Currently undergoing intensive training for the upcoming regional championships. Shows great spirit and responsiveness. Diet is strictly monitored with premium feed.
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Fitness & Quick Actions */}
                                <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                                    <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-[#964C2E]/5 border border-[#EACDBA]/30">
                                        <h4 className="text-[14px] font-black text-[#1e2330] tracking-tight mb-6">Fitness Snapshot</h4>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-[#E0F8EC] flex items-center justify-center text-[#059669]">
                                                <Activity className="w-8 h-8" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="text-[18px] font-black text-[#059669]">Fit for Work</p>
                                                <p className="text-[12px] font-bold text-gray-400">Last Checked: Today, 08:30 AM</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#F5EBE1] h-3 rounded-full overflow-hidden">
                                            <div className="bg-[#059669] h-full w-[95%]"></div>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400 mt-2 text-right">95% Readiness Score</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button className="w-full py-5 bg-[#964C2E] rounded-[24px] text-white text-[16px] font-black hover:bg-[#7D3F25] transition-all shadow-xl shadow-[#964C2E]/20 flex items-center justify-center gap-3">
                                            <RotateCw className="w-5 h-5" /> Log Session Info
                                        </button>
                                        <button className="w-full py-5 border-2 border-[#964C2E] rounded-[24px] text-[#964C2E] text-[16px] font-black hover:bg-[#964C2E] hover:text-white transition-all flex items-center justify-center gap-3">
                                            <ExternalLink className="w-5 h-5" /> Detailed Health History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StableManagement;
