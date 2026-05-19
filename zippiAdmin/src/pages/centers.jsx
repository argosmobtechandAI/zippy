import {
    Plus, TrendingUp, Building2, PawPrint, Banknote,
    Filter, ChevronDown, Trees, Droplet, Hammer, Star,
    ArrowRight, ChevronLeft, ChevronRight, Edit2, Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi, getGlobalStatsApi, createStableApi, getAllHorsesApi, getAllUsersApi, deleteStableApi, updateStableApi, uploadFileApi, deleteStableLogoApi } from '../api/apis';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const Centers = () => {
    const [centers, setCenters] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        totalRevenue: 0,
        horse: [],
        userId: ""
    });

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        // Fetch Centers
        const centerRes = await apiFunction(getAllStablesApi, [], {}, "GET", true);
        if (centerRes && centerRes.success) {
            setCenters(centerRes.stables || []);
        }

        // Fetch Global Stats
        const statsRes = await apiFunction(getGlobalStatsApi, [], {}, "GET", true);
        if (statsRes && statsRes.success) {
            setStats(statsRes.stats);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this center?")) {
            const res = await apiFunction(deleteStableApi, [id], {}, "DELETE", true);
            console.log(res)
            if (res && res.success) {
                toast.success("Center deleted successfully");
                fetchData();
            } else {
                toast.error(res?.message || "Failed to delete center");
            }
        }
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Equestrian Centers</h1>
                    <p className="text-[14px] font-medium text-gray-500">Monitor performance across your facility network.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-4 rounded-xl shadow-md flex items-center gap-2 hover:bg-[#7D3F25] transition-all"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Add New Center
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                {/* Total Centers */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Total Centers</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">{centers.length.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22C55E]">
                        <TrendingUp className="w-4 h-4" />
                        Live Status Active
                    </div>
                </div>

                {/* Active Horses */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Active Horses</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">{stats?.totalHorses || 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                            <PawPrint className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                        Across all regional facilities
                    </div>
                </div>

                {/* Daily Revenue */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Daily Revenue</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">${Number(stats?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#22C55E]">
                            <Banknote className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22C55E]">
                        <TrendingUp className="w-4 h-4" />
                        {stats?.revenueGrowth || '+0%'}
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] flex flex-col">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8F9FA] text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8F9FA] text-[13px] font-bold text-[#1e2330] hover:bg-gray-100 transition-colors">
                                Region: All <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-400">
                            Showing 4 centers
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 pb-4 border-b border-[#F0E6D8] px-4">
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">CENTER DETAILS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">OCCUPANCY</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">TRAINERS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center leading-tight">REVENUE<br />(DAILY)</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-400">Loading centers...</div>
                    ) : centers.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No centers found.</div>
                    ) : (
                        centers.map((center, idx) => (
                            <div key={center.id || idx} className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] flex-shrink-0 overflow-hidden border border-gray-100">
                                        {center.logo ? <img src={center.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">{center.name}</h4>
                                        <p className="text-[11px] font-semibold text-gray-400 leading-tight truncate w-32">{center.location}</p>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex max-w-[80px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                        ACTIVE
                                    </span>
                                </div>
                                <div className="text-center text-[14px] font-bold text-[#1e2330]">{center.horseCount || 0}</div>
                                <div className="text-center text-[14px] font-bold text-[#1e2330]">{center.trainerCount || 0}</div>
                                <div className="text-center text-[14px] font-black text-[#1e2330] tracking-wide">${center.totalRevenue || 0}</div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setEditing(true);
                                            setShowModal(true);
                                            setFormData(center);
                                        }}
                                        className="p-2 rounded-xl bg-[#FAF0EB] text-[#964C2E] hover:bg-[#964C2E] hover:text-white transition-all shadow-sm group"
                                        title="Edit Center"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(center.id)}
                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                                        title="Delete Center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 px-10 flex justify-between items-center bg-white rounded-b-[24px]">
                    <div className="text-[12px] font-bold text-gray-400">
                        Page 1 of 1
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-[12px] font-bold shadow-sm flex items-center justify-center">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {showModal && <CreateCenterModal setShowModal={setShowModal} editing={editing} formDataa={formData} onSuccess={fetchData} stables={centers} />}
            </div>
        </div>
    );
};

const CreateCenterModal = ({ setShowModal, editing, formDataa, onSuccess, stables }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        totalRevenue: 0,
        horses: [],
        userId: "",
        logo: ""
    });

    useEffect(() => {
        if (editing && formDataa) {
            console.log(formDataa, "formDataa");

            setFormData(formDataa);
        }
    }, [editing, formDataa]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [horses, setHorses] = useState([]);
    const [users, setUsers] = useState([]);

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0];
        if (!file || !formData.id) return;
        
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("stableId", formData.id);
        
        try {
            const res = await axios.post(uploadFileApi, uploadData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res && res.data && res.data.success) {
                toast.success("Logo uploaded successfully");
                setFormData({ ...formData, logo: res.data.url });
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.data?.message || "Failed to upload logo");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload logo");
        }
    };

    const handleDeleteLogo = async () => {
        if (!formData.id) return;
        try {
            const res = await apiFunction(deleteStableLogoApi, [formData.id], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("Logo deleted successfully");
                setFormData({ ...formData, logo: null });
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to delete logo");
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    };


    useEffect(() => {
        const fetchHorses = async () => {
            const res = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
            if (res && res.success) {
                setHorses(res.horses);
            }
        }
        const fetchUsers = async () => {
            const res = await apiFunction(getAllUsersApi, [], {}, "GET", true);
            if (res && res.success) {
                const users = res.users.filter((user) => user.type === "stableStaff");
                setUsers(users);
            }
        }
        fetchHorses();
        fetchUsers();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let res;
        if (editing) {
            res = await apiFunction(updateStableApi, [formData.id], formData, "PUT", true);
        } else {
            res = await apiFunction(createStableApi, [], formData, "POST", true);
        }
        if (res && res.success) {
            toast.success("Center created successfully");
            setShowModal(false);
            if (onSuccess) onSuccess();
        } else {
            toast.error(res?.message || "Failed to create center");
        }
        setIsSubmitting(false);
    };

    const getStableName = (id) => {
        const stable = stables.find((stable) => stable.id === id);
        return stable ? stable.name : "";
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white max-h-[80vh] overflow-y-auto rounded-3xl p-8 w-[500px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">Add New Center</h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Register a new equestrian facility.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {editing && (
                        <div className="mb-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 block px-1">Center Logo</label>
                            {formData.logo ? (
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <img src={formData.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                        <span className="text-[12px] font-bold text-gray-600">Current Logo</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => document.getElementById('logo-upload').click()} className="p-2 bg-gray-50 text-gray-600 hover:text-[#964C2E] hover:bg-[#F9EFE5] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button type="button" onClick={handleDeleteLogo} className="p-2 bg-gray-50 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full">
                                    <button type="button" onClick={() => document.getElementById('logo-upload').click()} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:bg-[#F9EFE5] hover:border-[#964C2E] hover:text-[#964C2E] transition-all text-[13px] font-bold bg-white">
                                        <Plus className="w-4 h-4" />
                                        Upload Logo
                                    </button>
                                </div>
                            )}
                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleUploadLogo} />
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Center Name</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                            placeholder="e.g. Lexington Stables"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Location / Address</label>
                        <input
                            required
                            name="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                            placeholder="e.g. Kentucky, USA"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Stable Staff</label>
                        <select
                            required
                            name="userId"
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                        >
                            <option value="">Select Stable Staff</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>

                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Horses</label>

                        <div className="flex flex-row gap-2">
                            {formData.horses.map((horse) => (
                                <div key={horse} className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold">{horses.find((h) => h.id === horse)?.name}</span>
                                    <button onClick={() => setFormData({ ...formData, horses: formData.horses.filter((h) => h !== horse) })}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <select
                            name="horse"
                            value={formData.horse}
                            onChange={(e) => setFormData({ ...formData, horses: [...formData.horses, formData.horses.includes(e.target.value) ? "" : e.target.value] })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                        >
                            <option value="">Select Horse</option>
                            {horses.map((horse) => (
                                <option key={horse.id} value={horse.id}>
                                    <div className='flex flex-row w-full justify-between gap-6 items-center px-4'>
                                        <span>{horse.name}</span>
                                        {horse.stableId && <span>

                                            {`(${getStableName(horse.stableId)})`}
                                        </span>}


                                    </div>
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Initial Revenue ($)</label>
                        <input
                            type="number"
                            name="totalRevenue"
                            value={formData.totalRevenue}
                            onChange={(e) => setFormData({ ...formData, totalRevenue: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                        />
                    </div>

                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Creating..." : editing ? "Update Center" : "Add Center"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Centers;