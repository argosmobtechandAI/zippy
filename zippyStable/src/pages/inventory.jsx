import { useState, useEffect } from 'react';
import { Plus, Activity, CheckCircle2, AlertTriangle, AlertCircle, X, ChevronDown, BellRing, Wrench, Eye, BedDouble, UserPlus, User, Ban, Camera, Info, HeartPulse, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getStableStatsApi, getAllStablesApi, getAllHorsesApi, createHorseApi, getHorsesByStableApi, getAllUsersApi, getAllVatsApi, assignVetApi, baseUrl } from '../api/apis';
import { useSelector } from 'react-redux';

const Inventory = () => {
    const [stats, setStats] = useState({
        statusCounts: {
            total: 0,
            fit: 0,
            nearLimit: 0,
            restRequired: 0
        }
    });
    const { selectedStable } = useSelector((state) => state.getDataReducer)

    const [horses, setHorses] = useState([]);
    const [filteredHorses, setFilteredHorses] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Horses');
    const [loading, setLoading] = useState(true);
    const [vats, setVats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAllVetsModal, setShowAllVetsModal] = useState(false);
    const [selectedHorse, setSelectedHorse] = useState(null);
    const [horseToEdit, setHorseToEdit] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);



    const fetchAllData = async () => {
        try {
            const horseRes = await apiFunction(getHorsesByStableApi, [selectedStable], {}, "GET", true);

            const usersRes = await apiFunction(getAllUsersApi, [], {}, "GET", true);
            const vatsRes = await apiFunction(getAllVatsApi, [], {}, "GET", true);
            if (horseRes && horseRes.success) {
                const fetchedHorses = horseRes.horses || [];
                setHorses(fetchedHorses);
                setFilteredHorses(fetchedHorses);
            }

            if (usersRes && usersRes.success) {
                const fetchedUsers = usersRes.users || [];
                const vatsList = fetchedUsers.filter(u => u.type === 'vet');
                const trainersList = fetchedUsers.filter(u => u.type === 'trainer');
                setAllUsers(vatsList);
                setTrainers(trainersList);
            }

            if (vatsRes && vatsRes.success) {
                const fetchedVats = vatsRes.vats || [];
                setVats(fetchedVats);
            }
        } catch (err) {
            console.error("Inventory data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);


    const getVatName = (id) => {
        console.log(id, vats)
        const vat = vats.find(v => v.id === id);
        console.log(vat)
        const user = allUsers.find(u => u.id === vat?.userId);
        return user ? user.name : '';
    }

    useEffect(() => {
        if (horses) {
            const totalHorses = horses.length;
            const fitHorses = horses.filter(h => h.healthRecords?.status?.toLowerCase() === 'fit').length;
            const nearLimitHorses = horses.filter(h => h.healthRecords?.status?.toLowerCase() === 'light work').length;
            const restRequiredHorses = horses.filter(h => h.healthRecords?.status?.toLowerCase() === 'unfit').length;
            setStats({
                statusCounts: {
                    total: totalHorses,
                    fit: fitHorses,
                    nearLimit: nearLimitHorses,
                    restRequired: restRequiredHorses
                }
            })
        }
    }, [horses])

    const handleAssignVet = async (horseId, userId) => {

        try {
            const vatId = vats.find(v => v.userId === userId)?.id;
            const res = await apiFunction(assignVetApi, [horseId], { vatId }, "PUT", true);
            if (res && res.success) {
                const updatedHorses = horses.map(h => h.id === horseId ? { ...h, vatId } : h);
                setHorses(updatedHorses);
                // Apply current filter to updated list
                if (activeCategory === 'All Horses' || updatedHorses.find(h => h.id === horseId).title === activeCategory) {
                    setFilteredHorses(prev => [...prev, updatedHorses.find(h => h.id === horseId)]);
                }
                setShowAddModal(false);
                setShowAllVetsModal(false);
                toast.success("Vet assigned successfully");
            }
        } catch (err) {
            console.error("Vet assignment failed:", err);
            toast.error("Failed to assign vet");
        }
    }





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

    console.log(horses);

    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Header section */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[32px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Horse Workload & Health</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Monitor daily sessions, weekly training averages, and fitness status.</p>
                </div>

                <button
                    onClick={() => { setHorseToEdit(null); setShowAddModal(true); }}
                    className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    Add New Horse
                </button>
            </div>

            {/* Add Horse Modal */}
            {showAddModal && <HorseModal horseToEdit={horseToEdit} setShowModal={setShowAddModal} onSuccess={fetchAllData} trainers={trainers} selectedStable={selectedStable} />}

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
                        className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm flex items-center gap-2 transition-all ${activeCategory === cat.label
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
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-center leading-tight">SESSIONS</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-left leading-tight">Assigned Vat</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-4">HEALTH STATUS</div>

                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">ACTIONS</div>
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
                            const isSick = horse.healthRecords?.status?.toLowerCase() === 'unfit';
                            const isResting = horse.healthRecords?.status?.toLowerCase() === 'light work';
                            const isFit = horse.healthRecords?.status?.toLowerCase() === 'fit';

                            const trainingAvg = horse.weeklyTrainingAvg || 0;
                            const sessionsToday = horse.sessions?.length || 0;

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
                                            <div className={`h-full ${sessionsToday >= 3 ? 'bg-red-500' : 'bg-[#964C2E]'}`} style={{ width: `${(sessionsToday / 4) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">

                                        <span className="text-[13px] font-black text-[#1e2330]">{getVatName(horse.vatId)}</span>
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
                                            isResting ?
                                                <>
                                                    <BedDouble className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
                                                    <span className="text-[13px] font-bold text-amber-600">Rest Required</span>
                                                </>
                                                :
                                                <>
                                                    <AlertTriangle className="w-4 h-4 text-[#059669]" strokeWidth={2.5} />
                                                    <span className="text-[13px] font-bold text-[#059669]">No Health Status</span>
                                                </>
                                        )}
                                    </div>


                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedHorse(horse);
                                                setShowAllVetsModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Assign Vet
                                        </button>

                                        <button onClick={() => { setHorseToEdit(horse); setShowAddModal(true); }} className="p-2 hover:bg-[#964C2E]/10 rounded-lg text-gray-400 hover:text-[#964C2E] transition-all"><Plus className="w-5 h-5 rotate-45" /></button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30 rounded-b-[24px]">
                    <div className="text-[12px] font-semibold text-gray-400 tracking-wide">
                        Showing <span className="text-[#964C2E] font-bold">4</span> of <span className="text-[#964C2E] font-bold">{horses?.length}</span> horses
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


                {/* All Vets Modal */}
                {showAllVetsModal && (
                    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-[#1e2330]">All Vets</h2>
                                    <button
                                        onClick={() => setShowAllVetsModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {allUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-[#1e2330]">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssignVet(selectedHorse.id, user.id)}
                                                className="text-xs font-bold text-[#964C2E] hover:text-[#7D3F25]"
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

// =====================================
// HORSE MODAL (Add/Edit)
// =====================================
const HorseModal = ({ horseToEdit, setShowModal, onSuccess, trainers, selectedStable }) => {
    const [formData, setFormData] = useState({
        name: horseToEdit?.name || "",
        location: horseToEdit?.location || "Lexington Stables",
        title: horseToEdit?.title || "",
        weight: horseToEdit?.weight || "",
        speed: horseToEdit?.speed || "",
        status: horseToEdit?.status || "Available",
        imageUrl: horseToEdit?.imageUrl || "",
        age: horseToEdit?.age || "",
        trainerId: horseToEdit?.trainerId || "",
        diet: horseToEdit?.diet || "Standard Alfalfa Mix",
        shoeStatus: horseToEdit?.shoeStatus || "Regular",
        lastVisit: horseToEdit?.lastVisit || "",
        vaccinationSummary: horseToEdit?.vaccinationSummary || "",
        dewormingRecord: horseToEdit?.dewormingRecord || "",
        shoeingRemarks: horseToEdit?.shoeingRemarks || "",
        healthRemarks: horseToEdit?.healthRemarks || ""
    });

    const calculateProgress = () => {
        const fields = ["name", "title", "weight", "age", "imageUrl", "diet", "shoeStatus", "vaccinationSummary", "dewormingRecord", "healthRemarks"];
        const filled = fields.filter(f => formData[f] && formData[f].toString().trim().length > 0).length;
        return Math.round((filled / fields.length) * 100);
    };

    const progress = calculateProgress();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const horseData = {
                ...formData,
                weight: parseInt(formData.weight) || 500,
                speed: parseInt(formData.speed) || 40,
                age: parseInt(formData.age) || 0,
                trainerId: formData.trainerId || null,
                shoeStatus: formData.shoeStatus || "Regular",
                stableId: horseToEdit ? horseToEdit.stableId : selectedStable // crucial to attach horse to the stable
            };

            let res;
            if (horseToEdit) {
                res = await apiFunction(`${baseUrl}/horse/${horseToEdit.id}`, [], horseData, "PUT", true);
            } else {
                res = await apiFunction(`${baseUrl}/horse`, [], horseData, "POST", true);
            }

            if (res && res.success) {
                toast.success(horseToEdit ? "Horse details updated" : "Horse registered successfully");
                setShowModal(false);
                onSuccess();
            } else {
                toast.error(res?.message || "Failed to save horse details");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#fdfaf7] rounded-[2.5rem] w-full max-w-[900px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/3 bg-white p-12 border-r border-gray-100 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-[2rem] overflow-hidden mb-8 shadow-2xl shadow-[#964C2E]/10 bg-gray-50 group relative">
                        <img
                            src={formData.imageUrl || "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt="preview"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="text-center w-full px-4">
                        <p className="text-[10px] font-black text-[#964C2E] uppercase tracking-[0.2em] mb-4">Live Preview</p>
                        <h4 className="text-2xl font-black text-[#1e2330] mb-3 leading-tight break-words line-clamp-3 min-h-[3rem] items-center flex justify-center">{formData.name || "New Specimen"}</h4>
                        <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.title ? 'bg-[#964C2E]/5 text-[#964C2E] border-[#964C2E]/20' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                                {formData.title || "Category Not Set"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 w-full space-y-4 pt-12 border-t border-gray-50">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration</span>
                            <span className="text-[10px] font-black text-[#1e2330]">{progress}% COMPLETE</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#964C2E] rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-12 overflow-y-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <p className="text-[10px] font-bold text-[#964C2E] uppercase tracking-[0.2em] mb-1">New Entry</p>
                            <h3 className="text-4xl font-black text-[#1e2330] tracking-tight">Register Horse</h3>
                        </div>
                        <button onClick={() => setShowModal(false)} className="bg-white text-gray-400 hover:text-[#964C2E] p-4 rounded-2xl transition-all shadow-sm border border-gray-50">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-[#964C2E]/10 rounded-lg"><Info className="w-4 h-4 text-[#964C2E]" /></div>
                                <h5 className="text-sm font-black text-[#1e2330] uppercase tracking-widest">Basic Information</h5>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Unique Horse Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="e.g., Midnight Star" />
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
                                    <select value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm appearance-none">
                                        <option value="">Select Category</option>
                                        <option value="Show Jumping">Show Jumping</option>
                                        <option value="Beginner Friendly">Beginner Friendly</option>
                                        <option value="Dressage">Dressage</option>
                                        <option value="Eventing">Eventing</option>
                                        <option value="Training Only">Training Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Initial Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm appearance-none">
                                        <option value="Available">Available</option>
                                        <option value="Resting">Resting</option>
                                        <option value="Competition">Competition</option>
                                        <option value="Medical">Medical/Injury</option>
                                        <option value="Training">Training Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Profile Image URL</label>
                                <input value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="Paste high-res link..." />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Age (Yrs)</label>
                                    <input type="number" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Weight (Kg)</label>
                                    <input type="number" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Trainer ID</label>
                                    <select value={formData.trainerId} onChange={e => setFormData({ ...formData, trainerId: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm appearance-none">
                                        <option value="">No Trainer</option>
                                        {trainers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Dietary Plan</label>
                                    <input required value={formData.diet} onChange={e => setFormData({ ...formData, diet: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="e.g., Alfalfa Mix + High Protein" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Shoeing Type</label>
                                    <input required value={formData.shoeStatus} onChange={e => setFormData({ ...formData, shoeStatus: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="e.g., Aluminum Racing Shoes" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-red-50 rounded-lg"><HeartPulse className="w-4 h-4 text-red-500" /></div>
                                <h5 className="text-sm font-black text-[#1e2330] uppercase tracking-widest">Health & Maintenance</h5>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Last Shoeing Date</label>
                                    <input type="date" value={formData.lastVisit} onChange={e => setFormData({ ...formData, lastVisit: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Vaccination Record</label>
                                    <input value={formData.vaccinationSummary} onChange={e => setFormData({ ...formData, vaccinationSummary: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="e.g., Influenza Boost (Jan 2024)" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Deworming Record</label>
                                <input value={formData.dewormingRecord} onChange={e => setFormData({ ...formData, dewormingRecord: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm" placeholder="Last deworming date and product used" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Shoeing Remarks</label>
                                    <textarea value={formData.shoeingRemarks} onChange={e => setFormData({ ...formData, shoeingRemarks: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm min-h-[100px]" placeholder="Notes about gait or specific shoe types..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">General Health Remarks</label>
                                    <textarea value={formData.healthRemarks} onChange={e => setFormData({ ...formData, healthRemarks: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all shadow-sm min-h-[100px]" placeholder="Allergies, chronic conditions, or temperament..." />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-6 pt-12 border-t border-gray-100">
                            <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 rounded-2xl text-gray-400 text-xs font-black uppercase tracking-widest hover:text-[#1e2330] transition-colors">Dismiss</button>
                            <button disabled={submitting} type="submit" className="bg-[#964C2E] text-white text-xs font-black uppercase tracking-[0.2em] px-12 py-5 rounded-[1.5rem] shadow-2xl shadow-[#964C2E]/30 hover:bg-[#7D3F25] transition-all transform active:scale-95 disabled:opacity-50">
                                {submitting ? "Processing..." : (horseToEdit ? "Update Registry" : "Save Registration")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Inventory;
