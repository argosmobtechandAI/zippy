import { useState, useEffect } from 'react';
import { Plus, Activity, CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, BellRing, Wrench, Eye, BedDouble, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getStableStatsApi, getAllStablesApi, getAllHorsesApi, createHorseApi } from '../api/apis';

const Inventory = () => {
    const [stats, setStats] = useState({
        statusCounts: {
            total: 0,
            fit: 0,
            nearLimit: 0,
            restRequired: 0
        }
    });

    const [horses, setHorses] = useState([]);
    const [filteredHorses, setFilteredHorses] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Horses');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHorse, setNewHorse] = useState({
        name: '',
        title: 'Show Jumping',
        location: '',
        age: '',
        status: 'Available',
        diet: 'Standard'
    });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Discover active stable
                const stableListRes = await apiFunction(getAllStablesApi, [], {}, "GET", true);
                let stableId = "00000000-0000-0000-0000-000000000001";
                if (stableListRes && stableListRes.success && stableListRes.stables.length > 0) {
                    stableId = stableListRes.stables[0].id;
                }

                const [statsRes, horseRes] = await Promise.all([
                    apiFunction(getStableStatsApi, [stableId], {}, "GET", true),
                    apiFunction(getAllHorsesApi, [], {}, "GET", true)
                ]);

                if (statsRes && statsRes.success) {
                    setStats(statsRes.stable);
                }
                if (horseRes && horseRes.success) {
                    const fetchedHorses = horseRes.horses || [];
                    setHorses(fetchedHorses);
                    setFilteredHorses(fetchedHorses);
                }
            } catch (err) {
                console.error("Inventory data fetch failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAllData();
    }, []);

    const handleCreateHorse = async (e) => {
        e.preventDefault();
        try {
            const res = await apiFunction(createHorseApi, [], newHorse, "POST", true);
            if (res && res.success) {
                const updatedHorses = [...horses, res.horse];
                setHorses(updatedHorses);
                // Apply current filter to updated list
                if (activeCategory === 'All Horses' || res.horse.title === activeCategory) {
                    setFilteredHorses(prev => [...prev, res.horse]);
                }
                setShowAddModal(false);
                setNewHorse({ name: '', title: 'Show Jumping', location: '', age: '', status: 'Available', diet: 'Standard' });
            }
        } catch (err) {
            console.error("Create horse failed:", err);
        }
    };

    const applyFilter = (category) => {
        setActiveCategory(category);
        if (category === 'All Horses') {
            setFilteredHorses(horses);
        } else {
            setFilteredHorses(horses.filter(h => h.title === category));
        }
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Header section */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[32px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Horse Workload & Health</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Monitor daily sessions, weekly training averages, and fitness status.</p>
                </div>

                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    Add New Horse
                </button>
            </div>

            {/* Add Horse Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-[24px] font-black text-[#1e2330]">Register New Horse</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateHorse} className="p-8 flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Name</label>
                                <input 
                                    type="text" required
                                    value={newHorse.name}
                                    onChange={(e) => setNewHorse({...newHorse, name: e.target.value})}
                                    className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                    placeholder="Enter horse name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Category</label>
                                    <select 
                                        value={newHorse.title}
                                        onChange={(e) => setNewHorse({...newHorse, title: e.target.value})}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors appearance-none"
                                    >
                                        <option>Show Jumping</option>
                                        <option>Dressage</option>
                                        <option>Beginner Friendly</option>
                                        <option>Elite Stallion</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Age</label>
                                    <input 
                                        type="number" required
                                        value={newHorse.age}
                                        onChange={(e) => setNewHorse({...newHorse, age: parseInt(e.target.value)})}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                        placeholder="Age"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Location</label>
                                <input 
                                    type="text" required
                                    value={newHorse.location}
                                    onChange={(e) => setNewHorse({...newHorse, location: e.target.value})}
                                    className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                    placeholder="e.stall Slot 04"
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-[#964C2E] text-white rounded-2xl text-[15px] font-black shadow-lg shadow-[#964C2E]/20 hover:bg-[#7D3F25] transition-all mt-4">
                                Add to Roster
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Total Horses */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#F5EBE1] flex items-center justify-center text-[#964C2E]">
                        <Activity className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">TOTAL HORSES</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">{stats.statusCounts.total}</p>
                    </div>
                </div>

                {/* Fit for Work */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#E0F8EC] flex items-center justify-center text-[#059669]">
                        <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">FIT FOR WORK</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">{stats.statusCounts.fit}</p>
                    </div>
                </div>

                {/* Near Limits */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                        <AlertTriangle className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">NEAR LIMITS</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">{stats.statusCounts.nearLimit}</p>
                    </div>
                </div>

                {/* Rest Required */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                        <AlertCircle className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">REST REQUIRED</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">{stats.statusCounts.restRequired}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-6">
                {[
                    { label: 'All Horses', icon: <ChevronDown className="w-4 h-4" /> },
                    { label: 'Schooling', icon: <span className="text-[10px]">🐴</span> },
                    { label: 'Bridging', icon: <span className="text-[10px]">🔗</span> },
                    { label: 'Competitive', icon: <span className="text-[10px]">🏆</span> },
                    { label: 'Show Jumping', icon: <span className="text-[10px]">🐎</span> }
                ].map((cat) => (
                    <button 
                        key={cat.label}
                        onClick={() => applyFilter(cat.label)}
                        className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm flex items-center gap-2 transition-all ${
                            activeCategory === cat.label 
                            ? 'bg-[#964C2E] text-white' 
                            : 'bg-white text-gray-600 border border-[#EACDBA]/40 hover:bg-white/70'
                        }`}
                    >
                        {cat.label} {cat.icon}
                    </button>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EACDBA]/40 overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 py-5 px-8 border-b border-[#EACDBA]/40 bg-[#FAFAFA]/50">
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">HORSE NAME</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">CATEGORY</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-center leading-tight">SESSIONS<br />TODAY</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-left leading-tight">WEEKLY TRAINING<br />AVG</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-4">HEALTH STATUS</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">SYSTEM ALERTS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-20 font-bold text-gray-400">Loading roster...</div>
                    ) : filteredHorses.length === 0 ? (
                        <div className="text-center py-20 font-bold text-gray-400">No horses match the selected criteria.</div>
                    ) : (
                        filteredHorses.map((horse, idx) => {
                            // Heuristic health logic
                            const isSick = horse.diet === 'Sick' || horse.status === 'Medical';
                            const isResting = horse.status === 'Resting';
                            const isFit = !isSick && !isResting;
                            
                            const trainingAvg = horse.weeklyTrainingAvg || 0;
                            const sessionsToday = horse.sessionsToday || 0;

                            return (
                                <div key={horse.id || idx} className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                            <img src={horse.imageUrl || "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} alt={horse.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">{horse.name}</h4>
                                            <div className="text-[11px] font-bold text-gray-400">{horse.location || 'Stall N/A'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-[#E0E7FF] text-[#4338CA]">
                                            {horse.title || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className={`text-[18px] font-black mb-1 ${sessionsToday >= 3 ? 'text-[#DC2626]' : 'text-[#1e2330]'}`}>
                                            {sessionsToday}/4
                                        </div>
                                        <div className="w-10 h-[3px] bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${sessionsToday >= 3 ? 'bg-red-500' : 'bg-[#964C2E]'}`} style={{ width: `${(sessionsToday/4)*100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-[#F5EBE1] h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#964C2E] h-full" style={{ width: `${trainingAvg}%` }}></div>
                                        </div>
                                        <span className="text-[13px] font-black text-[#1e2330]">{trainingAvg}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-4">
                                        {isFit ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-[#059669]" strokeWidth={2.5} />
                                                <span className="text-[13px] font-bold text-[#059669]">Fit for Work</span>
                                            </>
                                        ) : isSick ? (
                                            <>
                                                <AlertCircle className="w-4 h-4 text-[#DC2626]" strokeWidth={2.5} />
                                                <span className="text-[13px] font-bold text-[#DC2626]">Medical Review</span>
                                            </>
                                        ) : (
                                            <>
                                                <BedDouble className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
                                                <span className="text-[13px] font-bold text-amber-600">Rest Required</span>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        {isSick ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
                                                <Ban className="w-3.5 h-3.5" /> CRITICAL
                                            </span>
                                        ) : isResting ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                                <Activity className="w-3.5 h-3.5" /> RECOVERING
                                            </span>
                                        ) : sessionsToday >= 3 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                                <AlertTriangle className="w-3.5 h-3.5" /> NEAR LIMIT
                                            </span>
                                        ) : (
                                            <div className="text-[12px] font-semibold text-gray-400 pl-2">
                                                No alerts
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30 rounded-b-[24px]">
                    <div className="text-[12px] font-semibold text-gray-400 tracking-wide">
                        Showing <span className="text-[#964C2E] font-bold">4</span> of <span className="text-[#964C2E] font-bold">42</span> horses
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-[#964C2E] font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
