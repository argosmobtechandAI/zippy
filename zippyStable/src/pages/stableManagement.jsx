import { useState, useEffect } from 'react';
import { MapPin, Tag, Archive, ExternalLink, RotateCw, Settings2, MoreHorizontal, Plus, Trash2, Activity, Edit, Camera, X, Info, HeartPulse } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getHorsesByStableApi, getStableApi, inventoryApi, baseUrl, getAllTrainersApi } from '../api/apis';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const getImageUrl = (url) => url?.startsWith('/') ? `${baseUrl.replace('/api', '')}${url}` : url;

const StableManagement = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer)
    const [activeTab, setActiveTab] = useState('horses');
    const [activeCategory, setActiveCategory] = useState('All Horses');
    const [activeStockCategory, setActiveStockCategory] = useState('All Items');
    const [horses, setHorses] = useState([]);
    const [stableData, setStableData] = useState({ stocks: [] });
    const [loading, setLoading] = useState(true);
    const [selectedHorse, setSelectedHorse] = useState(null);
    const [stocks, setStocks] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [horseToEdit, setHorseToEdit] = useState(null);
    const [trainers, setTrainers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Discover active stable
                const horseRes = await apiFunction(getHorsesByStableApi, [selectedStable], {}, "GET", true)
                const statsRes = await apiFunction(getStableApi, [], {}, "GET", true)
                const stockRes = await apiFunction(inventoryApi, [], {}, "GET", true)
                const trainersRes = await apiFunction(getAllTrainersApi, [], {}, "GET", true)

                if (horseRes && horseRes.success) {
                    setHorses(horseRes.horses || []);
                }
                if (statsRes && statsRes.success) {
                    setStableData(statsRes.stables);
                }
                if (stockRes && stockRes.success) {
                    console.log(stockRes);
                    setStocks(stockRes.items || []);
                }
                if (trainersRes && trainersRes.success) {
                    setTrainers(trainersRes.trainers || []);
                }
            } catch (err) {
                console.error("Stable Management fetch failed:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedStable]);

    const handleSuccess = async () => {
        const horseRes = await apiFunction(getHorsesByStableApi, [selectedStable], {}, "GET", true);
        if (horseRes && horseRes.success) {
            setHorses(horseRes.horses || []);
        }
    };

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
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${activeTab === 'horses'
                            ? 'bg-[#964C2E] text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Equine Roster
                    </button>
                    <button
                        onClick={() => setActiveTab('stocks')}
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${activeTab === 'stocks'
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
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all ${activeCategory === cat
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
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all ${activeStockCategory === cat
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
                                            src={(horse.imageUrl && horse.imageUrl.trim()) ? getImageUrl(horse.imageUrl) : "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"}
                                            alt={horse.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            onError={e => { e.target.src = "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"; }}
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
                                            <button onClick={() => { setHorseToEdit(horse); setShowEditModal(true); }} className="text-gray-400 hover:text-[#964C2E] p-1 transition-colors z-10 relative"><Edit className="w-5 h-5" /></button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <button
                                                onClick={() => setSelectedHorse(horse)}
                                                className="py-4 border-2 border-[#F9EEE5] rounded-[18px] text-[#964C2E] text-[14px] font-bold hover:bg-[#F9EEE5] transition-colors flex justify-center items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Profile
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
                                src={(selectedHorse.imageUrl && selectedHorse.imageUrl.trim()) ? getImageUrl(selectedHorse.imageUrl) : "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"}
                                onError={e => { e.target.src = "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"; }}
                                alt={selectedHorse.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2330] via-transparent to-transparent"></div>
                            <button
                                onClick={() => setSelectedHorse(null)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                            >
                                <Plus className="w-6 h-6 rotate-45" color='black' />
                            </button>

                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                <div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black tracking-widest uppercase bg-[#964C2E] text-white mb-4 shadow-lg">
                                        <Tag className="w-4 h-4" /> {selectedHorse.title}
                                    </span>
                                    <h2 className="text-white text-[56px] font-black leading-none tracking-tighter shadow-sm">{selectedHorse.name}</h2>
                                    <p className="text-[#EACDBA] text-[18px] font-bold mt-2 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> Assigned to You - Slot {selectedHorse.location || '04'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 flex-1 overflow-y-auto bg-[#F9EEE5]/30">
                            <div className="grid grid-cols-12 gap-10">
                                {/* Left Side: Bio & Details & Vaccinations */}
                                <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EACDBA]/20">
                                            <p className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Age</p>
                                            <p className="text-[20px] font-black text-[#1e2330]">{selectedHorse.age || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EACDBA]/20">
                                            <p className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Speed</p>
                                            <p className="text-[20px] font-black text-[#1e2330]">{selectedHorse.speed || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EACDBA]/20">
                                            <p className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Shoe Status</p>
                                            <p className="text-[20px] font-black text-[#1e2330]">{selectedHorse.shoeStatus || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Vaccination Records Section */}
                                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#EACDBA]/20">
                                        <h4 className="text-[14px] font-black text-[#1e2330] tracking-tight mb-6 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-[#964C2E]" /> Vaccination history
                                        </h4>
                                        {selectedHorse.vaccinationRecords && selectedHorse.vaccinationRecords.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {selectedHorse.vaccinationRecords.map((record, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-5 rounded-2xl bg-[#FCFAF8] border border-[#EACDBA]/30">
                                                        <div>
                                                            <p className="text-[15px] font-black text-[#1e2330]">{record.name}</p>
                                                            <p className="text-[12px] font-bold text-gray-400 mt-1">Administered: {record.date}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                                                Completed
                                                            </span>
                                                            <p className="text-[11px] font-bold text-[#964C2E] mt-2">Next: {record.nextDate}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <p className="text-[14px] font-semibold text-gray-400">No vaccination records found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Health Logs */}
                                <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                                    <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-[#964C2E]/5 border border-[#EACDBA]/30 flex flex-col h-full min-h-[400px]">
                                        <h4 className="text-[14px] font-black text-[#1e2330] tracking-tight mb-8 flex items-center gap-2">
                                            <Archive className="w-5 h-5 text-[#964C2E]" /> Recent Health Logs
                                        </h4>

                                        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
                                            {selectedHorse.healthRecords && selectedHorse.healthRecords.length > 0 ? (
                                                selectedHorse.healthRecords.map((log, idx) => (
                                                    <div key={idx} className="relative pl-6 border-l-2 border-[#EACDBA]">
                                                        {/* Timeline Dot */}
                                                        <div className="absolute w-3 h-3 bg-[#964C2E] rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]"></div>

                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-[15px] font-black text-[#1e2330]">{log.title}</p>
                                                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{log.date}</span>
                                                        </div>

                                                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase mb-3 ${log.status.toLowerCase() === 'critical' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                                                                log.status.toLowerCase() === 'recovering' ? 'bg-[#FEF3C7] text-[#92400E]' :
                                                                    'bg-[#E0F8EC] text-[#059669]'
                                                            }`}>
                                                            {log.status}
                                                        </span>

                                                        <p className="text-[13px] font-semibold text-gray-500 leading-relaxed bg-[#FCFAF8] p-3 rounded-xl border border-[#EACDBA]/20">
                                                            {log.notes || "No notes provided."}
                                                        </p>

                                                        {log.treatment && (
                                                            <p className="text-[12px] font-bold text-[#964C2E] mt-3 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#964C2E]"></span>
                                                                Treatment: {log.treatment}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
                                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                                                        <Activity className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-[15px] font-black text-gray-400 mb-1">No health logs</p>
                                                    <p className="text-[12px] font-semibold text-gray-400">This horse has a clean bill of health.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && <HorseModal horseToEdit={horseToEdit} setShowModal={setShowEditModal} onSuccess={handleSuccess} trainers={trainers} selectedStable={selectedStable} />}
        </div>
    );
};

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
                stableId: horseToEdit ? horseToEdit.stableId : selectedStable, 
                diet: formData.diet || "Standard Alfalfa Mix",
                location: formData.location || "Stable Facility"
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
        <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-[#fdfaf7] rounded-[2.5rem] w-full max-w-[900px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/3 bg-white p-12 border-r border-gray-100 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-[2rem] overflow-hidden mb-8 shadow-2xl shadow-[#964C2E]/10 bg-gray-50 group relative">
                        <img
                            src={formData.imageUrl ? getImageUrl(formData.imageUrl) : "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt="preview"
                            onError={e => { e.target.src = "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800"; }}
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
                            <h3 className="text-4xl font-black text-[#1e2330] tracking-tight">{horseToEdit ? "Modify Registry" : "Register Horse"}</h3>
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
                                        {trainers?.map(t => {
                                            const val = t.id;
                                            return <option key={val} value={val}>{t.name}</option>;
                                        })}
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
};

export default StableManagement;
