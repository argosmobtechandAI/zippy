
import {
    Plus, Search, Edit, Ban, Info, ChevronRight, Activity,
    Droplets, Zap, Weight, MapPin, UserPlus, X, Camera, Clipboard,
    ShieldCheck, HeartPulse, Trash2, Bell, Send, AlertTriangle
} from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import {
    getAllHorsesApi, getAllUsersApi, updateUserApi, updateHorseApi,
    deleteHorseApi, createHorseApi, notifyUserApi, logHealthApi, logVaccinationApi,
    getHealthRecordsByHorseApi, getVaccinationRecordsByHorseApi
} from '../api/apis';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const DEFAULT_HORSE_IMAGE = "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800";

const Horses = () => {
    const [horses, setHorses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [horseToEdit, setHorseToEdit] = useState(null);
    const [selectedHorse, setSelectedHorse] = useState(null);
    const [notifHorse, setNotifHorse] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
            if (res && res.success) {
                setHorses(res.horses || []);
            }
            const uRes = await apiFunction(getAllUsersApi, [], {}, "GET", true);
            if (uRes && uRes.success) {
                setTrainers(uRes.users.filter(u => u.type === 'trainer'));
            }
        } catch (error) {
            console.error("Error fetching horse data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const seedFleet = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(`${getAllHorsesApi}/seed`, [], {}, "GET", true);
            if (res && res.success) {
                toast.success("Sample fleet initialized!");
                fetchData();
            } else {
                toast.error("Seeding failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this horse? This action cannot be undone.")) return;

        try {
            const res = await apiFunction(`${deleteHorseApi}/${id}`, [], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("Horse deleted successfully");
                fetchData();
            } else {
                toast.error("Failed to delete horse");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const filteredHorses = horses.filter(h => {
        const search = searchQuery.toLowerCase();
        return (h.name?.toLowerCase() || "").includes(search) ||
               (h.title?.toLowerCase() || "").includes(search);
    });

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-full bg-[#fdfaf7] w-full font-sans">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#964C2E]/60 mb-2 uppercase tracking-[0.2em]">
                        <span>Registry</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#964C2E]">Equestrian Fleet</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#1e2330] tracking-tight mb-2">My Stables</h1>
                    <p className="text-sm font-medium text-gray-400">Manage your active horses and assignments</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setHorseToEdit(null); setShowModal(true); }}
                        className="group bg-[#964C2E] text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-[#964C2E]/20 flex items-center gap-3 hover:bg-[#7D3F25] transition-all duration-300 transform hover:scale-[1.02] whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        Add New Horse
                    </button>
                </div>
            </div>

            {/* Quick Stats Dashboard (Simplified) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-2 rounded-xl"><Activity className="w-5 h-5 text-green-600" /></div>
                        <span className="text-[10px] font-black text-green-500 uppercase">+2% this week</span>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{horses.filter(h => h.status === 'Available').length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Available / Ready</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-100 p-2 rounded-xl"><Droplets className="w-5 h-5 text-amber-600" /></div>
                        <span className="text-[10px] font-black text-amber-500 uppercase">-1% this week</span>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{horses.filter(h => h.status === 'Resting').length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Unavailable / Resting</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-2 rounded-xl"><Zap className="w-5 h-5 text-blue-600" /></div>
                        <span className="text-[10px] font-black text-blue-400 uppercase">Stable</span>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{horses.filter(h => h.status === 'Training').length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">In Training Only</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-100 p-2 rounded-xl"><HeartPulse className="w-5 h-5 text-red-600" /></div>
                        <span className="text-[10px] font-black text-red-500 uppercase">+1 new today</span>
                    </div>
                    <p className="text-3xl font-black text-[#1e2330]">{horses.filter(h => h.status === 'Medical').length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Medical / Injury</p>
                </div>
            </div>

            {/* Roster Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-xl font-black text-[#1e2330]">Current Roster</h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="w-4 h-4 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-[#964C2E] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full bg-[#fdfaf7] border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/40"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fdfaf7]/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Horse Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Update Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#964C2E]/10 border-t-[#964C2E] rounded-full animate-spin"></div>
                                            <p className="text-xs font-bold text-gray-400">Updating roster registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHorses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <ShieldCheck className="w-12 h-12 text-[#964C2E]" />
                                            <div>
                                                <p className="text-sm font-bold text-[#1e2330]">No horses found in active registry.</p>
                                                <p className="text-xs font-medium text-gray-400 mt-1">Add your first horse or initialize sample data.</p>
                                            </div>
                                            <button 
                                                onClick={seedFleet}
                                                className="mt-4 px-6 py-3 rounded-xl bg-[#964C2E]/10 text-[#964C2E] text-[10px] font-black uppercase tracking-widest hover:bg-[#964C2E] hover:text-white transition-all"
                                            >
                                                Seed Sample Fleet
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHorses.map((horse) => (
                                    <tr key={horse.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                    <img src={horse.imageUrl || DEFAULT_HORSE_IMAGE} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1e2330]">{horse.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">ID: #EQ-{horse.id.substring(0,4).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 rounded-lg bg-[#F5EDDF] text-[#8C4A28] text-[10px] font-black uppercase tracking-wider border border-[#964C2E]/10">
                                                {horse.title}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    horse.status === 'Available' ? 'bg-green-500' : 
                                                    horse.status === 'Resting' ? 'bg-amber-500' :
                                                    horse.status === 'Medical' ? 'bg-red-500' :
                                                    horse.status === 'Competition' ? 'bg-blue-500' : 'bg-gray-400'
                                                }`} />
                                                <p className="text-sm font-bold text-[#1e2330]">{horse.status}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select 
                                                value={horse.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        const res = await apiFunction(`${updateHorseApi}/${horse.id}`, [], { status: newStatus }, "PUT", true);
                                                        if (res && res.success) {
                                                            toast.success(`${horse.name} status updated to ${newStatus}`);
                                                            fetchData();
                                                        }
                                                    } catch (err) {
                                                        toast.error("Status update failed");
                                                    }
                                                }}
                                                className="bg-[#fdfaf7] border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/40"
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Resting">Resting</option>
                                                <option value="Competition">Competition</option>
                                                <option value="Medical">Medical/Injury</option>
                                                <option value="Training">Training Only</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedHorse(horse)} className="p-2 hover:bg-[#964C2E]/10 rounded-lg text-gray-400 hover:text-[#964C2E] transition-all"><Info className="w-5 h-5" /></button>
                                                <button onClick={() => { setHorseToEdit(horse); setShowModal(true); }} className="p-2 hover:bg-[#964C2E]/10 rounded-lg text-gray-400 hover:text-[#964C2E] transition-all"><Edit className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(horse.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-8 bg-[#fdfaf7]/30 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filteredHorses.length} of {horses.length} entries</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-white border border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:text-[#964C2E] transition-all">Prev</button>
                        <button className="px-4 py-2 rounded-lg bg-[#964C2E] text-[10px] font-black uppercase text-white shadow-lg shadow-[#964C2E]/20">1</button>
                        <button className="px-4 py-2 rounded-lg bg-white border border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:text-[#964C2E] transition-all">Next</button>
                    </div>
                </div>
            </div>

            {showModal && <HorseModal horseToEdit={horseToEdit} setShowModal={setShowModal} onSuccess={fetchData} trainers={trainers} />}
            {selectedHorse && <HorseProfileModal horse={selectedHorse} trainers={trainers} onClose={() => setSelectedHorse(null)} />}
            {notifHorse && <NotificationModal horse={notifHorse} trainers={trainers} onClose={() => setNotifHorse(null)} />}
            
            <footer className="mt-12 py-8 border-t border-gray-100 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <div className="flex gap-6">
                    <span className="hover:text-[#964C2E] cursor-pointer">Quick Select: All Active</span>
                    <span className="hover:text-[#964C2E] cursor-pointer">All Medical</span>
                    <span className="hover:text-[#964C2E] cursor-pointer">All Resting</span>
                </div>
                <div>Last status update recorded Just Now by Admin Suite</div>
            </footer>
        </div>
    );
};

// =====================================
// HORSE MODAL (Add/Edit)
// =====================================
const HorseModal = ({ horseToEdit, setShowModal, onSuccess, trainers }) => {
    const assignedTrainer = trainers?.find(t => t.horseId?.includes(horseToEdit?.id));
    const [formData, setFormData] = useState({
        name: horseToEdit?.name || "",
        location: horseToEdit?.location || "Lexington Stables",
        title: horseToEdit?.title || "",
        weight: horseToEdit?.weight || "",
        speed: horseToEdit?.speed || "",
        status: horseToEdit?.status || "Available",
        imageUrl: horseToEdit?.imageUrl || "",
        age: horseToEdit?.age || "",
        trainerId: horseToEdit?.trainerId || assignedTrainer?.id || "",
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
                shoeStatus: formData.shoeStatus || "Regular"
            };

            console.log("Submitting horse data:", horseData);
            let res;
            if (horseToEdit) {
                res = await apiFunction(`${updateHorseApi}/${horseToEdit.id}`, [], horseData, "PUT", true);
            } else {
                res = await apiFunction(createHorseApi, [], horseData, "POST", true);
            }
            console.log("Server response:", res);

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
                
                {/* Left Panel - Bio Preview */}
                <div className="md:w-1/3 bg-white p-12 border-r border-gray-100 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-[2rem] overflow-hidden mb-8 shadow-2xl shadow-[#964C2E]/10 bg-gray-50 group relative">
                        <img 
                            src={formData.imageUrl || DEFAULT_HORSE_IMAGE} 
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

                {/* Right Panel - Form Fields */}
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
                        {/* Section 1: Basic Information */}
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
                                        {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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

                        {/* Section 2: Health & Maintenance */}
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

                        {/* Form Actions */}
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

// =====================================
// COMPLETE HORSE PROFILE MODAL
// =====================================
const HorseProfileModal = ({ horse, trainers, onClose }) => {
    const [selectedTrainerId, setSelectedTrainerId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [activeTab, setActiveTab] = useState("Bio"); // Bio, Health, Vaccination
    const [healthRecords, setHealthRecords] = useState([]);
    const [vaccinationRecords, setVaccinationRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);

    const [maintenanceForm, setMaintenanceForm] = useState({
        title: "",
        status: "Checked",
        notes: "",
        date: new Date().toISOString().split('T')[0],
        treatment: "",
        type: "Health" // Health, Vaccination
    });

    const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
            const hRes = await apiFunction(getHealthRecordsByHorseApi(horse.id), [], {}, "GET", true);
            if (hRes && hRes.success) setHealthRecords(hRes.records || []);
            
            const vRes = await apiFunction(getVaccinationRecordsByHorseApi(horse.id), [], {}, "GET", true);
            if (vRes && vRes.success) setVaccinationRecords(vRes.records || []);
        } catch (error) {
            console.error("Error fetching records", error);
        } finally {
            setLoadingRecords(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [horse.id]);

    const handleLogMaintenance = async (e) => {
        e.preventDefault();
        setAssigning(true);
        try {
            let res;
            if (maintenanceForm.type === 'Health') {
                const payload = {
                    horseId: horse.id,
                    title: maintenanceForm.title,
                    status: maintenanceForm.status,
                    notes: maintenanceForm.notes,
                    date: maintenanceForm.date,
                    treatment: maintenanceForm.treatment,
                    medications: []
                };
                res = await apiFunction(logHealthApi, [], { data: payload }, "POST", true);
            } else {
                const payload = {
                    horseId: horse.id,
                    name: maintenanceForm.title,
                    date: maintenanceForm.date,
                    nextDate: new Date(new Date(maintenanceForm.date).setMonth(new Date(maintenanceForm.date).getMonth() + 6)).toISOString().split('T')[0],
                    batchNumber: "B" + Date.now().toString().slice(-6),
                    notes: maintenanceForm.notes
                };
                res = await apiFunction(logVaccinationApi, [], { data: payload }, "POST", true);
            }

            if (res && res.success) {
                toast.success("Maintenance record logged successfully");
                setShowLogForm(false);
                fetchRecords();
            }
        } catch (error) {
            toast.error("Failed to log maintenance");
        } finally {
            setAssigning(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTrainerId) return;
        setAssigning(true);
        try {
            const horseRes = await apiFunction(`${updateHorseApi}/${horse.id}`, [], { trainerId: selectedTrainerId }, "PUT", true);
            const trainerRes = await apiFunction(`${updateUserApi}/${selectedTrainerId}`, [], { addHorseId: horse.id }, "PUT", true);
            if (horseRes && horseRes.success) {
                toast.success("Trainer assigned successfully");
                onClose();
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex justify-end z-50">
            <div className="w-full max-w-[550px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Visual Header */}
                <div className="h-[280px] relative shrink-0">
                    <img src={horse.imageUrl || DEFAULT_HORSE_IMAGE} className="w-full h-full object-cover" alt={horse.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fdfaf7] via-transparent to-transparent"></div>

                    <button onClick={onClose} className="absolute top-8 left-8 bg-white/10 hover:bg-white/30 backdrop-blur-xl p-4 rounded-3xl text-white transition-all transform hover:rotate-90 shadow-2xl">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-6 left-10 right-10">
                        <span className="bg-[#964C2E] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 inline-block shadow-xl">
                            Elite Specimen
                        </span>
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{horse.name}</h2>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex bg-white px-8 border-b border-gray-100">
                    {["Bio", "Health", "Vaccination"].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === t ? 'border-[#964C2E] text-[#964C2E]' : 'border-transparent text-gray-400 hover:text-[#964C2E]'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#fdfaf7]">
                    
                    {activeTab === "Bio" && (
                        <>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm"><ShieldCheck className="w-5 h-5 text-[#964C2E]" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                                            <p className="text-sm font-bold text-[#1e2330]">{horse.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm"><Weight className="w-5 h-5 text-[#964C2E]" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Weight</p>
                                            <p className="text-sm font-bold text-[#1e2330]">{horse.weight} Kg</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm"><MapPin className="w-5 h-5 text-[#964C2E]" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-sm font-bold text-[#1e2330]">{horse.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm"><Zap className="w-5 h-5 text-[#964C2E]" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Speed</p>
                                            <p className="text-sm font-bold text-[#1e2330]">{horse.speed} Kmph</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-[#964C2E]/10 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-10%] opacity-5 transform group-hover:scale-110 transition-transform duration-700">
                                    <UserPlus className="w-64 h-64 text-[#964C2E]" />
                                </div>
                                <div className="relative">
                                    <h3 className="text-xl font-black text-[#1e2330] mb-2">Trainer Assignment</h3>
                                    <p className="text-sm font-medium text-gray-400 mb-8 max-w-[300px]">Designate a specific trainer for daily oversight.</p>
                                    <div className="space-y-4">
                                        <select
                                            value={selectedTrainerId || horse.trainerId || ""}
                                            onChange={(e) => setSelectedTrainerId(e.target.value)}
                                            className="w-full bg-[#fdfaf7] border border-gray-100 outline-none rounded-2xl p-5 text-sm font-bold text-[#1e2330] appearance-none"
                                        >
                                            <option value="">{horse.trainerId ? trainers.find(t=>t.id===horse.trainerId)?.name : "Choose designated trainer..."}</option>
                                            {trainers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssign}
                                            disabled={assigning}
                                            className="w-full bg-[#1e2330] text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#964C2E] transition-all duration-300 disabled:opacity-50"
                                        >
                                            {assigning ? "Linking..." : "Confirm Assignment"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {(activeTab === "Health" || activeTab === "Vaccination") && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-[#1e2330]">{activeTab} History</h3>
                                <button 
                                    onClick={() => {
                                        setMaintenanceForm({ ...maintenanceForm, type: activeTab });
                                        setShowLogForm(!showLogForm);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-[#964C2E] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#964C2E]/20"
                                >
                                    {showLogForm ? "Cancel" : `Log ${activeTab}`}
                                </button>
                            </div>

                            {showLogForm && (
                                <div className="bg-white p-8 rounded-[2rem] border border-[#964C2E]/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
                                    <form onSubmit={handleLogMaintenance} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Description / Title</label>
                                            <input required value={maintenanceForm.title} onChange={e => setMaintenanceForm({...maintenanceForm, title: e.target.value})} className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e2330]" placeholder={activeTab === 'Health' ? 'e.g., General Wellness Check' : 'e.g., Influenza Boost'} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Date</label>
                                                <input type="date" value={maintenanceForm.date} onChange={e => setMaintenanceForm({...maintenanceForm, date: e.target.value})} className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e2330]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{activeTab === 'Health' ? 'Status' : 'Validity (Months)'}</label>
                                                <input value={maintenanceForm.status} onChange={e => setMaintenanceForm({...maintenanceForm, status: e.target.value})} className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e2330]" placeholder={activeTab === 'Health' ? 'Healthy, Resting...' : '6'} />
                                            </div>
                                        </div>
                                        {activeTab === 'Health' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Treatment / Recommendations</label>
                                                <input value={maintenanceForm.treatment} onChange={e => setMaintenanceForm({...maintenanceForm, treatment: e.target.value})} className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e2330]" placeholder="Prescribed rest or meds..." />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Notes</label>
                                            <textarea value={maintenanceForm.notes} onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})} className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1e2330] min-h-[100px]" placeholder="Detailed observations..." />
                                        </div>
                                        <button disabled={assigning} type="submit" className="w-full bg-[#1e2330] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            {assigning ? "Saving..." : `Confirm ${activeTab} Entry`}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {loadingRecords ? (
                                <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-[#964C2E] mx-auto mb-4" /></div>
                            ) : (activeTab === "Health" ? healthRecords : vaccinationRecords).length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                                    <Clipboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No records found for this specimen</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(activeTab === "Health" ? healthRecords : vaccinationRecords).map((rec, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm group hover:border-[#964C2E]/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-xs font-black text-[#1e2330]">{rec.title || rec.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{rec.date}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-[#F5EDDF] text-[#8C4A28] text-[8px] font-black uppercase rounded-full">
                                                    {rec.status || "Verified"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{rec.notes || rec.treatment || "Routine maintenance complete."}</p>
                                            {rec.nextDate && (
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase">
                                                    <Activity className="w-3 h-3" /> Next Due: {rec.nextDate}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// =====================================
// NOTIFICATION MODAL
// =====================================
const NotificationModal = ({ horse, trainers, onClose }) => {
    const trainer = trainers.find(t => t.id === horse.trainerId) || trainers.find(t => t.horseId?.includes(horse.id));
    const [title, setTitle] = useState(`Update regarding ${horse.name}`);
    const [desc, setDesc] = useState("");
    const [type, setType] = useState("alert");
    const [sending, setSending] = useState(false);

    if (!trainer) {
        return (
            <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-10 rounded-[2.5rem] text-center max-w-sm">
                    <div className="bg-amber-100 text-amber-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black mb-2">No Trainer Assigned</h3>
                    <p className="text-sm text-gray-400 mb-8">This horse isn't linked to a trainer yet. Assign one first to send notifications.</p>
                    <button onClick={onClose} className="w-full bg-[#1e2330] text-white py-4 rounded-2xl font-bold">Dismiss</button>
                </div>
            </div>
        );
    }

    const handleSend = async () => {
        if (!desc) return toast.error("Write a message first");
        setSending(true);
        try {
            const payload = {
                title,
                desc,
                type,
                horseName: horse.name,
                horseBreed: horse.title
            };
            const res = await apiFunction(`${notifyUserApi}/${trainer.id}`, [], payload, "POST", true);
            if (res && res.success) {
                toast.success(`Alert sent to ${trainer.name}`);
                onClose();
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-[#8C4A28] p-8 flex justify-between items-center text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Direct Outreach</p>
                        <h3 className="text-2xl font-black tracking-tight">Notify {trainer.name}</h3>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-10 space-y-6">
                    <div className="flex items-center gap-4 bg-[#fdfaf7] p-4 rounded-2xl border border-gray-100">
                        <img src={horse.imageUrl || DEFAULT_HORSE_IMAGE} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject Context</p>
                            <p className="text-sm font-bold text-[#1e2330]">{horse.name} • {horse.title}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase pl-1">Message Type</label>
                        <div className="flex gap-2">
                            {['alert', 'booking', 'reminder', 'success'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-[#8C4A28] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase pl-1">Alert Content</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full bg-[#fdfaf7] border border-gray-100 rounded-2xl p-5 text-sm font-bold min-h-[120px] outline-none focus:border-[#8C4A28]/20 transition-all"
                            placeholder="Type your message to the trainer here..."
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full bg-[#1e2330] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#8C4A28] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {sending ? "Transmitting..." : <><Send className="w-4 h-4" /> Dispatch Notification</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Horses;

