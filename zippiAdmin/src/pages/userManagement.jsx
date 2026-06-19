import {
    ChevronRight, Zap, Edit2, MoreVertical, Star,
    ChevronLeft, MoreHorizontal, UserCheck, Activity, Award, X, BellRing, Send, Megaphone, Search,
    Edit,
    Trash2,
    Plus,
    Download, Wallet, AlertTriangle, CreditCard, Calendar, CheckCircle2, Clock, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFunction } from '../api/apiFunction';
import { createUserApi, getAllUsersApi, notifyUserApi, notifyAllUsersApi, updateUserApi, updateUserLeaveApi, getAllTrainersApi, updateTrainerApi, getAllStablesApi, deleteStableLogoApi, uploadFileApi, deleteUserApi, plansApi, assignPlanApi, getAllHorsesApi } from '../api/apis';
import toast from 'react-hot-toast';
import axios from 'axios';

const TrainerCard = ({ user, trainers, stables, onNotify, onEdit, onStatusUpdate, onDelete, onUpdateCenterClick, navigate }) => {

    console.log(user, "userr")
    console.log(trainers, "trainerr")
    const trainer = trainers.find((trainer) => (trainer.userId || trainer.user_id) === user.id);

    return (
        <div className="flex flex-col h-full group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-[60px] h-[60px] rounded-[18px] bg-[#E5ECE5] overflow-hidden flex items-center justify-center text-xl font-bold text-gray-600 shadow-sm border border-gray-100">
                        {user.name && user.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black text-[#1e2330] mb-1 leading-tight">{user.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[#964C2E] text-[10px] font-black tracking-widest uppercase">{user.title || 'SPECIALIST'}</span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className={`flex items-center gap-1 text-[11px] font-bold ${trainer?.title === 'Head Trainer' ? 'text-amber-600' : 'text-[#059669]'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${trainer?.title === 'Head Trainer' ? 'bg-amber-600' : 'bg-[#059669]'}`}></span>
                                {trainer?.title || 'Trainer'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onNotify(); }} className="p-1.5 hover:bg-[#F9EFE5] hover:text-[#964C2E] rounded-lg transition-colors"><BellRing className="w-4 h-4" /></button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = user.status === 'AVAILABLE' ? 'OFF-DUTY' : 'AVAILABLE';
                            onStatusUpdate(nextStatus);
                        }}
                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">WEEKLY LOAD</h4>
                    <p className="text-[16px] font-black text-[#1e2330]">{user.weeklyLoad || 0}<span className="text-[11px] text-gray-400"> slots</span></p>
                </div>
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">SESSIONS (MTD)</h4>
                    <p className="text-[16px] font-black text-[#1e2330]">{user.sessionsMTD || 0}</p>
                </div>
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">ACCURACY</h4>
                    <div className="flex items-center gap-1">
                        <p className="text-[16px] font-black text-[#1e2330]">{Number(user.rating || 5.0).toFixed(1)}</p>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">SCHEDULE SUMMARY (THIS WEEK)</p>
                <div className="flex gap-1.5 h-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className={`flex-1 rounded-full ${i < 5 ? 'bg-[#964C2E]' : 'bg-gray-100'}`}></div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <span key={i} className="text-[9px] font-bold text-gray-300 w-full text-center">{day}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onUpdateCenterClick === 'function') {
                            onUpdateCenterClick();
                        }
                    }}
                    className="py-3.5 rounded-xl border border-[#964C2E]/20 text-[#964C2E] text-[12px] font-black uppercase tracking-wider hover:bg-[#F9EFE5] transition-all"
                >
                    {trainer?.stableId ? stables.find(s => s.id === trainer?.stableId)?.name || 'Update Center' : 'Add Center'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/slotManagement?trainerId=${user.id}`); }}
                    className="py-3.5 rounded-xl bg-[#964C2E] text-white text-[12px] font-black uppercase tracking-wider hover:bg-[#7D3F25] shadow-lg shadow-[#964C2E]/20 transition-all"
                >
                    Assign Sessions
                </button>
            </div>
        </div>
    );
};

const UserManagement = () => {

    const [userType, setUserType] = useState("all")
    const [sessionFilter, setSessionFilter] = useState("all")
    const [centerFilter, setCenterFilter] = useState("all")
    const [startDateFilter, setStartDateFilter] = useState("")
    const [endDateFilter, setEndDateFilter] = useState("")
    const [createModal, setCreateModal] = useState(false)
    const [notifyModal, setNotifyModal] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const [viewUser, setViewUser] = useState(null)
    const [updateCenterModal, setUpdateCenterModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null) // { id, name }
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [stables, setStables] = useState([])
    const [horses, setHorses] = useState([])
    const navigate = useNavigate();

    const fetchHorses = async () => {
        try {
            const res = await apiFunction(`${getAllHorsesApi}`, [], {}, 'GET', false);
            if (res && res.success) {
                setHorses(res.horses || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchHorses();
    }, []);

    const handleExportCSV = () => {
        if (!users || users.length === 0) {
            toast.error("No users to export");
            return;
        }

        const headers = ["S.No", "Name", "DOJ", "Email", "Mobile", "Date of Birth", "Age", "Weight (kg)", "Type", "Status", "Emergency Contact", "Rider Type", "Session Count", "Membership Plan", "Rider Level"];
        
        const csvRows = [
            headers.join(","),
            ...users.map((user, index) => {
                const createdTime = user.createdAt || user.created_at;
                const doj = createdTime ? new Date(createdTime).toLocaleDateString() : "";
                
                const values = [
                    index + 1,
                    user.name || "",
                    doj,
                    user.email || "",
                    user.mobile || "",
                    user.dob || "",
                    user.age || "",
                    user.weight || "",
                    user.type || "",
                    user.status || "",
                    user.emergencyContact || "",
                    user.riderType || "",
                    user.sessionCount !== undefined ? user.sessionCount : "",
                    user.plan?.name || "",
                    user.level || ""
                ];
                return values.map(val => {
                    const escaped = String(val).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(",");
            })
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exported successfully");
    };

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            const res = await apiFunction(`${updateUserApi}/${userId}`, [], { status: newStatus }, "PUT", true);
            if (res && res.success) {
                toast.success(`User marked as ${newStatus}`);
                fetchUsers();
            } else {
                toast.error(res?.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("Network error");
        }
    }

    const handleDeleteUser = (userId, userName) => {
        setDeleteModal({ id: userId, name: userName });
    }

    const confirmDeleteUser = async () => {
        if (!deleteModal) return;
        try {
            const res = await apiFunction(`${deleteUserApi}/${deleteModal.id}`, [], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("User deleted successfully");
                setDeleteModal(null);
                fetchUsers();
            } else {
                toast.error(res?.message || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Network error");
        }
    }

    const fetchUsers = async () => {
        setLoading(true);
        const res = await apiFunction(getAllUsersApi, [], {}, "GET", true);
        if (res && res.success) {
            setUsers(res.users);
        }
        setLoading(false);
    }

    const fetchTrainers = async () => {
        setLoading(true);
        const res = await apiFunction(getAllTrainersApi, [], {}, "GET", true);
        if (res && res.success) {
            setTrainers(res.trainers);
        }
        setLoading(false);
    }

    const fetchStables = async () => {
        setLoading(true);
        const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);

        if (res && res.success) {

            setStables(res.stables);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUsers();
        fetchTrainers();
        fetchStables();
    }, []);


    const handleApproveRequest = async (userId, leave, status) => {
        try {
            const res = await apiFunction(`${updateUserLeaveApi}/${userId}`, [], { startDate: leave.startDate, endDate: leave.endDate, status }, "PUT", true);
            if (res && res.success) {
                toast.success(`Leave request ${status}`);
                fetchUsers();
            } else {
                toast.error(res?.message || `Error updating leave request`);
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesType = userType === "all" || user.type === userType;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            (user.name?.toLowerCase() || "").includes(search) ||
            (user.email?.toLowerCase() || "").includes(search) ||
            (user.mobile || "").includes(searchQuery);
        
        if (!matchesType || !matchesSearch) return false;

        if (centerFilter !== 'all') {
            const centerStable = stables.find(s => s.id === centerFilter);
            
            if (user.type === 'stableStaff') {
                const stable = stables.find(s => s.userId === user.id);
                if (!stable || stable.id !== centerFilter) return false;
            } else {
                const matchesStableId = user.stableId === centerFilter;
                const matchesCode = centerStable && user.code && user.code.startsWith(centerStable.code);
                if (!matchesStableId && !matchesCode) return false;
            }
        }

        // Rider-specific filters
        if (userType === 'rider') {
            // 1. Session count filter
            if (sessionFilter !== 'all') {
                const count = user.sessionCount || 0;
                if (sessionFilter === '0' && count !== 0) return false;
                if (sessionFilter === 'active' && count <= 0) return false;
                if (sessionFilter === '1-5' && (count < 1 || count > 5)) return false;
                if (sessionFilter === '6-10' && (count < 6 || count > 10)) return false;
                if (sessionFilter === '10+' && count <= 10) return false;
            }
        }

        // 2. Enrollment date filter (Global)
        if (startDateFilter || endDateFilter) {
            const createdTime = user.createdAt || user.created_at;
            if (!createdTime) return false;
            const createdDate = new Date(createdTime);
            
            const parseLocalDate = (dateStr) => {
                if (!dateStr) return null;
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            };

            if (startDateFilter) {
                const start = parseLocalDate(startDateFilter);
                if (start) {
                    start.setHours(0, 0, 0, 0);
                    if (createdDate < start) return false;
                }
            }
            if (endDateFilter) {
                const end = parseLocalDate(endDateFilter);
                if (end) {
                    end.setHours(23, 59, 59, 999);
                    if (createdDate > end) return false;
                }
            }
        }

        return true;
    });

    const counts = {
        all: users.length,
        rider: users.filter(u => u.type === 'rider').length,
        trainer: users.filter(u => u.type === 'trainer').length,
        vet: users.filter(u => u.type === 'vet').length,
        stableStaff: users.filter(u => u.type === 'stableStaff').length,
    }

    const TabButton = ({ type, label, count }) => (
        <button
            onClick={() => setUserType(type)}
            className={`pb-3 text-[13px] font-bold px-1 border-b-[3px] transition-all ${userType === type
                ? "text-[#964C2E] border-[#964C2E]"
                : "text-gray-500 hover:text-gray-700 border-transparent"
                }`}
        >
            {label} ({count})
        </button>
    );



    const handleUploadLogo = async (file, stableId) => {
        try {
            const formData = new FormData();
            formData.append('stableId', stableId);
            formData.append('file', file);
            const res = await axios.post(uploadFileApi, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            console.log(res, "ressssssssssssss")
            if (res && res?.data?.success) {
                toast.success("Logo uploaded successfully");
                fetchStables();
            } else {
                toast.error(res?.message || "Failed to upload logo");
            }
        }
        catch (error) {
            console.log("🚀 ~ handleUploadLogo ~ error:", error)

        }
    }

    const deleteLogo = async (id) => {
        try {
            const res = await apiFunction(deleteStableLogoApi, [id], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("Logo deleted successfully");
                fetchStables();
            } else {
                toast.error(res?.message || "Failed to delete logo");
            }
        }
        catch (error) {
            console.log("🚀 ~ deleteLogo ~ error:", error)

        }
    }


    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fcfbf9] w-full font-sans pb-20">
            {/* Top Breadcrumb & Header section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-6 tracking-wide">
                    <span>Admin</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#1e2330]">User Directory</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">User Management</h1>
                        <p className="text-[14px] font-semibold text-gray-500">Monitor performance, manage availability and assign riding sessions.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="bg-white border border-[#964C2E]/20 text-[#964C2E] text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-[#FDF9F4] transition-all"
                        >
                            <Download className="w-4 h-4" strokeWidth={2.5} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setNotifyModal({ all: true })}
                            className="bg-white border border-[#964C2E]/20 text-[#964C2E] text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-[#FDF9F4] transition-all"
                        >
                            <Megaphone className="w-4 h-4" strokeWidth={2.5} />
                            Global Broadcast
                        </button>
                        <button
                            onClick={() => setCreateModal(true)}
                            className="bg-[#FAE9DB] border border-[#EACDBA] text-[#964C2E] text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-[#F3DCC7] transition-all"
                        >
                            <Zap className="w-4 h-4" strokeWidth={2.5} />
                            Create {userType === 'all' ? 'User' : userType}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar: Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 mb-8 mt-6 gap-4">
                <div className="flex gap-8 overflow-x-auto w-full md:w-auto no-scrollbar">
                    <TabButton type="all" label="All Users" count={counts.all} />
                    <TabButton type="rider" label="Riders" count={counts.rider} />
                    <TabButton type="trainer" label="Trainers" count={counts.trainer} />
                    <TabButton type="vet" label="Vets" count={counts.vet} />
                    <TabButton type="stableStaff" label="Stable Staff" count={counts.stableStaff} />
                </div>

                <div className="relative w-full md:w-72 mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#EADED4] rounded-xl py-2 pl-10 pr-4 text-sm font-bold placeholder:text-gray-400 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all"
                    />
                </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#EADED4] rounded-2xl p-5 mb-8 flex flex-wrap gap-6 items-end animate-in fade-in slide-in-from-top-4 duration-300">
                {userType === 'rider' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Center</label>
                        <select
                            value={centerFilter}
                            onChange={(e) => setCenterFilter(e.target.value)}
                            className="bg-white border border-[#EADED4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e2330] focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all min-w-[160px]"
                        >
                            <option value="all">All Centers</option>
                            {stables.map(stable => (
                                <option key={stable.id} value={stable.id}>{stable.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {userType === 'rider' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session Count</label>
                        <select
                            value={sessionFilter}
                            onChange={(e) => setSessionFilter(e.target.value)}
                            className="bg-white border border-[#EADED4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e2330] focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all min-w-[160px]"
                        >
                            <option value="all">All Sessions</option>
                            <option value="0">No Sessions (0)</option>
                            <option value="active">Active Sessions (&gt; 0)</option>
                            <option value="1-5">1 - 5 Sessions</option>
                            <option value="6-10">6 - 10 Sessions</option>
                            <option value="10+">10+ Sessions</option>
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Enrollment Date (From)</label>
                    <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="bg-white border border-[#EADED4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e2330] focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Enrollment Date (To)</label>
                    <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="bg-white border border-[#EADED4] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e2330] focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all"
                    />
                </div>

                {(centerFilter !== 'all' || sessionFilter !== 'all' || startDateFilter || endDateFilter) && (
                    <button
                        onClick={() => {
                            setCenterFilter('all');
                            setSessionFilter('all');
                            setStartDateFilter('');
                            setEndDateFilter('');
                        }}
                        className="text-[#964C2E] hover:text-[#7D3F25] text-xs font-black uppercase tracking-wider py-3.5 px-2 hover:underline transition-all"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
                {loading ? (
                    <div className="col-span-2 text-center py-20 font-bold text-gray-400">
                        <div className="animate-pulse">Loading users...</div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-2 text-center py-20 font-bold text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                        No users found in this category.
                    </div>
                ) : (
                    filteredUsers.map((user, index) => (
                        <div
                            key={user.id || index}
                            onClick={() => setViewUser(user)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADED4] hover:border-[#964C2E] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-[#964C2E]" />
                            </div>
                            {user.type === 'trainer' ? (
                                <TrainerCard
                                    user={user}
                                    trainers={trainers}
                                    stables={stables}
                                    onNotify={() => setNotifyModal(user)}
                                    onEdit={() => { setEditingUser(user); setCreateModal(true); }}
                                    onStatusUpdate={(status) => handleStatusUpdate(user.id, status)}
                                    onDelete={() => handleDeleteUser(user.id, user.name)}
                                    onUpdateCenterClick={() => setUpdateCenterModal({ user, trainer: trainers.find(t => (t.userId || t.user_id) === user.id) })}
                                    navigate={navigate}
                                />
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-[60px] h-[60px] rounded-[14px] bg-[#E5ECE5] overflow-hidden flex items-center justify-center text-xl font-bold text-gray-600">
                                                {user.name && user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-[18px] font-black text-[#1e2330] mb-1.5">{user.name}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">{user.type}</span>
                                                    {user.type === 'rider' && user.plan?.name && (
                                                        <span className="bg-[#E5F0FA] text-[#2E7496] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">{user.plan.name}</span>
                                                    )}
                                                    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${user.status === 'INACTIVE' ? 'text-red-500' : 'text-[#059669]'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'INACTIVE' ? 'bg-red-500' : 'bg-[#059669]'}`}></span>
                                                        {user.status || 'ACTIVE'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteUser(user.id, user.name);
                                                }}
                                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingUser(user);
                                                    setCreateModal(true);
                                                }}
                                                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotifyModal(user);
                                                }}
                                                className="p-1.5 hover:bg-[#F9EFE5] hover:text-[#964C2E] rounded-lg transition-colors"
                                                title="Send Notification"
                                            >
                                                <BellRing className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const nextStatus = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
                                                    handleStatusUpdate(user.id, nextStatus);
                                                }}
                                                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                                title="Toggle Status"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {user.type === 'rider' ? (
                                            <>
                                                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                                    <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">SESSIONS</h4>
                                                    <p className="text-[20px] font-black text-[#964C2E]">{user.sessionCount !== undefined ? user.sessionCount : '--'}</p>
                                                </div>
                                                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                                    <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">RIDER LEVEL</h4>
                                                    <p className="text-[14px] mt-1.5 font-bold text-[#964C2E] truncate">{user.level || 'Level 1'}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                                    <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">AGE</h4>
                                                    <p className="text-[20px] font-black text-[#964C2E]">{user.age || '--'}</p>
                                                </div>
                                                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                                    <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEIGHT</h4>
                                                    <p className="text-[20px] font-black text-[#964C2E]">{user.weight || '--'} <span className="text-[12px] font-bold text-gray-400">kg</span></p>
                                                </div>
                                            </>
                                        )}
                                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">MOBILE</h4>
                                            <p className="text-[14px] mt-1.5 font-bold text-[#964C2E] truncate">{user.mobile}</p>
                                        </div>
                                    </div>

                                    {(user.type === "stableStaff" || user.role === "stableStaff") && (
                                        <div className="mt-4 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Stable Logo Management</h4>
                                            {(() => {
                                                const stable = stables.find(s => s.userId === user.id);
                                                if (!stable) {
                                                    return (
                                                        <div className="text-[12px] font-semibold text-gray-400 italic">
                                                            No stable associated with this user.
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="flex items-center gap-4 bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                                                        <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                                                            {stable.logo ? (
                                                                <img src={stable.logo} alt="Stable Logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="text-[10px] font-black text-gray-400 text-center uppercase p-1">No Logo</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                            <div className="text-xs font-bold text-[#1e2330] truncate">{stable.name}</div>
                                                            <div className="flex gap-2">
                                                                {stable.logo ? (
                                                                    <>
                                                                        <label className="text-[11px] font-black uppercase tracking-wider text-[#964C2E] hover:underline cursor-pointer">
                                                                            Change
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className="hidden"
                                                                                onChange={(e) => {
                                                                                    if (e.target.files?.[0]) {
                                                                                        handleUploadLogo(e.target.files[0], stable.id);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </label>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteLogo(stable.id);
                                                                            }}
                                                                            className="text-[11px] font-black uppercase tracking-wider text-red-500 hover:underline"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <label className="text-[11px] font-black uppercase tracking-wider text-[#964C2E] hover:underline cursor-pointer">
                                                                        Upload Logo
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                if (e.target.files?.[0]) {
                                                                                    handleUploadLogo(e.target.files[0], stable.id);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}


                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Grid */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-8 mt-4">
                <div className="text-[13px] font-semibold text-gray-500">
                    Showing {filteredUsers.length} of {counts.all} user records
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[#964C2E] text-white text-[13px] font-bold shadow-sm flex items-center justify-center">
                        1
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        2
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        3
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {createModal && (
                <UserActionModal
                    userType={editingUser ? editingUser.type : (userType === 'all' ? 'rider' : userType)}
                    setCreateModal={(val) => {
                        setCreateModal(val);
                        if (!val) setEditingUser(null);
                    }}
                    onSuccess={fetchUsers}
                    initialData={editingUser}
                    stables={stables}
                />
            )}

            {notifyModal && (
                <SendNotificationModal
                    user={notifyModal}
                    onClose={() => setNotifyModal(null)}
                />
            )}

            {updateCenterModal && (
                <UpdateCenterModal
                    user={updateCenterModal.user}
                    trainer={updateCenterModal.trainer}
                    stables={stables}
                    onClose={() => setUpdateCenterModal(null)}
                    onSuccess={() => {
                        fetchUsers();
                        fetchTrainers();
                    }}
                />
            )}

            {viewUser && (
                <ProfileQuickView 
                    user={viewUser} 
                    onClose={() => setViewUser(null)} 
                    navigate={navigate} 
                    onApproveLeave={handleApproveRequest}
                    onUpdateSuccess={(updatedUser) => {
                        fetchUsers();
                        if (fetchHorses) fetchHorses();
                        setViewUser(updatedUser);
                    }}
                    horses={horses}
                    fetchHorses={fetchHorses}
                    users={users}
                    fetchUsers={fetchUsers}
                />
            )}

            {deleteModal && (
                <DeleteConfirmModal
                    userName={deleteModal.name}
                    onCancel={() => setDeleteModal(null)}
                    onConfirm={confirmDeleteUser}
                />
            )}
        </div>
    );
};


const ProfileQuickView = ({ user, onClose, navigate, onApproveLeave, onUpdateSuccess, horses = [], fetchHorses, users, fetchUsers }) => {
    const [isEditingWallet, setIsEditingWallet] = useState(false);
    const [isAddingWallet, setIsAddingWallet] = useState(false);
    const [walletInput, setWalletInput] = useState('');
    const [isSavingWallet, setIsSavingWallet] = useState(false);

    const [isEditingSession, setIsEditingSession] = useState(false);
    const [isAddingSession, setIsAddingSession] = useState(false);
    const [sessionInput, setSessionInput] = useState('');
    const [isSavingSession, setIsSavingSession] = useState(false);

    const [isEditingLevel, setIsEditingLevel] = useState(false);
    const [levelInput, setLevelInput] = useState('');
    const [isSavingLevel, setIsSavingLevel] = useState(false);

    // Plan assignment state
    const [plans, setPlans] = useState([]);
    const [showAssignPlan, setShowAssignPlan] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAssigningPlan, setIsAssigningPlan] = useState(false);
    const [localUser, setLocalUser] = useState(user);

    const [selectedHorseIds, setSelectedHorseIds] = useState([]);
    const [isAssigningHorse, setIsAssigningHorse] = useState(false);

    useEffect(() => {
        if (user && users) {
            const freshUser = users.find(u => u.id === user.id);
            setLocalUser(freshUser || user);
        }
    }, [user, users]);

    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    const handleAssignHorse = async () => {
        if (selectedHorseIds.length === 0) { toast.error('Please select at least one horse'); return; }
        setIsAssigningHorse(true);
        try {
            const res = await apiFunction(`${updateUserApi}/${localUser.id}`, [], { addHorseIds: selectedHorseIds, type: 'vet' }, 'PUT', true);
            if (res && res.success) {
                toast.success('Horses assigned successfully');
                setSelectedHorseIds([]);
                if (fetchHorses) fetchHorses();
                if (fetchUsers) fetchUsers();
                if (onUpdateSuccess) onUpdateSuccess(res.user || localUser);
            } else {
                toast.error(res?.message || 'Failed to assign horses');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setIsAssigningHorse(false);
        }
    };

    const handleRemoveAssignedHorse = async (horseId) => {
        if (!window.confirm("Are you sure you want to unassign this horse?")) return;
        try {
            const res = await apiFunction(`${updateUserApi}/${localUser.id}`, [], { removeHorseId: horseId, type: 'vet' }, 'PUT', true);
            if (res && res.success) {
                toast.success('Horse unassigned');
                if (fetchHorses) fetchHorses();
                if (fetchUsers) fetchUsers();
            } else {
                toast.error(res?.message || 'Failed to unassign horse');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const removeSelectedHorse = (id) => {
        setSelectedHorseIds(prev => prev.filter(hId => hId !== id));
    };

    useEffect(() => {
        if (localUser.type === 'rider') {
            apiFunction(plansApi, [], {}, 'GET', true).then(res => {
                if (res && res.success) setPlans(res.plans || []);
            });
        }
    }, [localUser.type]);

    const handleAssignPlan = async () => {
        if (!selectedPlanId) { toast.error('Please select a plan'); return; }
        setIsAssigningPlan(true);
        try {
            const res = await apiFunction(assignPlanApi, [], { userId: localUser.id, planId: selectedPlanId, startDate: planStartDate }, 'POST', true);
            if (res && res.success) {
                toast.success(res.message || 'Plan assigned successfully');
                const updated = { ...localUser, plan: res.plan, planEndDate: res.planEndDate, sessionCount: res.plan?.sessions_count || localUser.sessionCount };
                setLocalUser(updated);
                if (onUpdateSuccess) onUpdateSuccess(updated);
                setShowAssignPlan(false);
                setSelectedPlanId('');
            } else {
                toast.error(res?.message || 'Failed to assign plan');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setIsAssigningPlan(false);
        }
    };

    const handleWalletUpdate = async (type) => {
        const amount = parseFloat(walletInput);
        if (isNaN(amount) || (amount < 0 && type === 'set')) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (isNaN(amount) || (amount <= 0 && type === 'add')) {
            toast.error("Please enter a valid amount to add");
            return;
        }

        setIsSavingWallet(true);
        try {
            const newBalance = type === 'add' ? (localUser.riderWallet || 0) + amount : amount;
            
            const res = await apiFunction(`${updateUserApi}/${localUser.id}`, [], { 
                riderWallet: newBalance 
            }, "PUT", true);

            if (res && res.success) {
                toast.success(`Wallet balance updated to ₹${newBalance.toLocaleString()}`);
                setIsEditingWallet(false);
                setIsAddingWallet(false);
                setWalletInput('');
                const updated = { ...localUser, riderWallet: newBalance };
                setLocalUser(updated);
                if (onUpdateSuccess) onUpdateSuccess(updated);
            } else {
                toast.error(res?.message || "Failed to update wallet balance");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSavingWallet(false);
        }
    };

    const handleLevelUpdate = async () => {
        if (!levelInput) return;
        setIsSavingLevel(true);
        try {
            const res = await apiFunction(`${updateUserApi}/${localUser.id}`, [], { 
                level: levelInput 
            }, "PUT", true);

            if (res && res.success) {
                toast.success(`Rider level updated to ${levelInput}`);
                setIsEditingLevel(false);
                const updated = { ...localUser, level: levelInput };
                setLocalUser(updated);
                if (onUpdateSuccess) onUpdateSuccess(updated);
            } else {
                toast.error(res?.message || "Failed to update level");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSavingLevel(false);
        }
    };

    const handleSessionUpdate = async (type) => {
        const amount = parseInt(sessionInput);
        if (isNaN(amount) || (amount < 0 && type === 'set')) {
            toast.error("Please enter a valid number of sessions");
            return;
        }
        if (isNaN(amount) || (amount <= 0 && type === 'add')) {
            toast.error("Please enter a valid number to add");
            return;
        }

        setIsSavingSession(true);
        try {
            const newCount = type === 'add' ? (localUser.sessionCount || 0) + amount : amount;
            
            const res = await apiFunction(`${updateUserApi}/${localUser.id}`, [], { 
                sessionCount: newCount 
            }, "PUT", true);

            if (res && res.success) {
                toast.success(`Sessions updated to ${newCount}`);
                setIsEditingSession(false);
                setIsAddingSession(false);
                setSessionInput('');
                const updated = { ...localUser, sessionCount: newCount };
                setLocalUser(updated);
                if (onUpdateSuccess) onUpdateSuccess(updated);
            } else {
                toast.error(res?.message || "Failed to update session count");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSavingSession(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-end z-[60] animate-in fade-in duration-300">
            <div className="w-[450px] bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[20px] font-black text-[#1e2330]">User Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-[#E5ECE5] flex items-center justify-center text-3xl font-black text-gray-500 mb-4">
                        {localUser.name && localUser.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-[#1e2330] mb-1">{localUser.name}</h3>
                    <div className="flex gap-2 mb-2 justify-center">
                        <span className="bg-[#FAE9DB] text-[#964C2E] text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-md">
                            {localUser.type}
                        </span>
                        {localUser.type === 'rider' && localUser.plan?.name && (
                            <span className="bg-[#E5F0FA] text-[#2E7496] text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-md">
                                {localUser.plan.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#059669]">
                        <span className="w-2 h-2 rounded-full bg-[#059669]"></span> Active Account
                    </div>
                </div>

                <div className="space-y-6">
                    {localUser.type === 'rider' && !isEditingSession && !isAddingSession && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-1">Rider Sessions</h4>
                                    <p className="text-[24px] font-black text-[#1e2330]">{localUser.sessionCount || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#964C2E] border border-[#964C2E]/10 shadow-sm">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSessionInput((localUser.sessionCount || 0).toString());
                                        setIsEditingSession(true);
                                        setIsAddingSession(false);
                                    }}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                                >
                                    <Edit className="w-3.5 h-3.5" /> Update Sessions
                                </button>
                                <button
                                    onClick={() => {
                                        setSessionInput('');
                                        setIsAddingSession(true);
                                        setIsEditingSession(false);
                                    }}
                                    className="flex-1 bg-white hover:bg-gray-50 text-[#964C2E] border border-[#964C2E]/20 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Sessions
                                </button>
                            </div>
                        </div>
                    )}

                    {localUser.type === 'rider' && isEditingSession && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
                            <div>
                                <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Update Session Count</h4>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={sessionInput}
                                        onChange={(e) => setSessionInput(e.target.value)}
                                        className="w-full bg-white border border-[#964C2E]/20 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                        placeholder="Enter new session count"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditingSession(false)}
                                    className="flex-1 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSessionUpdate('set')}
                                    disabled={isSavingSession}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all disabled:opacity-55 font-bold"
                                >
                                    {isSavingSession ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {localUser.type === 'rider' && isAddingSession && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
                            <div>
                                <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Add Sessions</h4>
                                <div className="relative mb-3">
                                    <input
                                        type="number"
                                        value={sessionInput}
                                        onChange={(e) => setSessionInput(e.target.value)}
                                        className="w-full bg-white border border-[#964C2E]/20 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                        placeholder="Enter sessions to add"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {['1', '5', '10', '20'].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setSessionInput(amt)}
                                            className="flex-1 py-1.5 text-[11px] font-black rounded-lg bg-white border border-gray-200 hover:border-[#964C2E] text-gray-700 hover:text-[#964C2E] transition-all font-bold"
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddingSession(false)}
                                    className="flex-1 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSessionUpdate('add')}
                                    disabled={isSavingSession}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all disabled:opacity-55 font-bold"
                                >
                                    {isSavingSession ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </div>
                    )}

                    {localUser.type === 'rider' && !isEditingWallet && !isAddingWallet && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-1">Rider Wallet Balance</h4>
                                    <p className="text-[24px] font-black text-[#1e2330]">₹{(localUser.riderWallet || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#964C2E] border border-[#964C2E]/10 shadow-sm">
                                    <Wallet className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setWalletInput((localUser.riderWallet || 0).toString());
                                        setIsEditingWallet(true);
                                        setIsAddingWallet(false);
                                    }}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                                >
                                    <Edit className="w-3.5 h-3.5" /> Update Balance
                                </button>
                                <button
                                    onClick={() => {
                                        setWalletInput('');
                                        setIsAddingWallet(true);
                                        setIsEditingWallet(false);
                                    }}
                                    className="flex-1 bg-white hover:bg-gray-50 text-[#964C2E] border border-[#964C2E]/20 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Money
                                </button>
                            </div>
                        </div>
                    )}

                    {user.type === 'rider' && isEditingWallet && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
                            <div>
                                <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Update Wallet Balance</h4>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[14px]">₹</span>
                                    <input
                                        type="number"
                                        value={walletInput}
                                        onChange={(e) => setWalletInput(e.target.value)}
                                        className="w-full bg-white border border-[#964C2E]/20 rounded-xl pl-8 pr-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                        placeholder="Enter new balance"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditingWallet(false)}
                                    className="flex-1 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleWalletUpdate('set')}
                                    disabled={isSavingWallet}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all disabled:opacity-55 font-bold"
                                >
                                    {isSavingWallet ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {user.type === 'rider' && isAddingWallet && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
                            <div>
                                <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Add Money to Wallet</h4>
                                <div className="relative mb-3">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[14px]">₹</span>
                                    <input
                                        type="number"
                                        value={walletInput}
                                        onChange={(e) => setWalletInput(e.target.value)}
                                        className="w-full bg-white border border-[#964C2E]/20 rounded-xl pl-8 pr-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                        placeholder="Enter amount to add"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {['100', '500', '1000', '2000'].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setWalletInput(amt)}
                                            className="flex-1 py-1.5 text-[11px] font-black rounded-lg bg-white border border-gray-200 hover:border-[#964C2E] text-gray-700 hover:text-[#964C2E] transition-all font-bold"
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddingWallet(false)}
                                    className="flex-1 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleWalletUpdate('add')}
                                    disabled={isSavingWallet}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all disabled:opacity-55 font-bold"
                                >
                                    {isSavingWallet ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </div>
                    )}

                    {localUser.type === 'rider' && !isEditingLevel && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-1">Rider Experience Level</h4>
                                    <p className="text-[20px] font-black text-[#1e2330]">{localUser.level || 'Trial Pack'}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#964C2E] border border-[#964C2E]/10 shadow-sm">
                                    <Shield className="w-6 h-6" />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setLevelInput(localUser.level || 'Trial Pack');
                                    setIsEditingLevel(true);
                                }}
                                className="w-full bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold"
                            >
                                <Edit className="w-3.5 h-3.5" /> Change Level
                            </button>
                        </div>
                    )}

                    {localUser.type === 'rider' && isEditingLevel && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
                            <div>
                                <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-2">Update Rider Level</h4>
                                <select
                                    value={levelInput}
                                    onChange={(e) => setLevelInput(e.target.value)}
                                    className="w-full bg-white border border-[#964C2E]/20 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                >
                                    <option value="Trial Pack">Trial Pack</option>
                                    <option value="Level 1">Level 1</option>
                                    <option value="Level 2">Level 2</option>
                                    <option value="Level 3">Level 3</option>
                                    <option value="Non Competitive 1">Non Competitive 1</option>
                                    <option value="Non Competitive 2">Non Competitive 2</option>
                                    <option value="Competitive 1">Competitive 1</option>
                                    <option value="Competitive 2">Competitive 2</option>
                                    <option value="Full Lease">Full Lease</option>
                                    <option value="Partial Lease">Partial Lease</option>
                                    <option value="Private Horse">Private Horse</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditingLevel(false)}
                                    className="flex-1 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-[11px] font-black uppercase py-2.5 rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLevelUpdate}
                                    disabled={isSavingLevel}
                                    className="flex-1 bg-[#964C2E] hover:bg-[#804026] text-white text-[11px] font-black uppercase py-2.5 rounded-xl transition-all disabled:opacity-55 font-bold"
                                >
                                    {isSavingLevel ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Membership Card ───────────────────────────── */}
                    {localUser.type === 'rider' && (() => {
                        const hasPlan = localUser.plan && (localUser.plan.name || localUser.plan.id);
                        const endDate = localUser.planEndDate ? new Date(localUser.planEndDate) : null;
                        const today = new Date();
                        const isExpired = endDate && endDate < today;
                        const daysLeft = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;
                        return (
                            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: hasPlan ? (isExpired ? '#fca5a5' : '#86efac') : '#e5e7eb' }}>
                                {/* Header */}
                                <div className="px-5 py-4 flex items-center justify-between" style={{ background: hasPlan ? (isExpired ? 'linear-gradient(135deg,#fef2f2,#fff7f7)' : 'linear-gradient(135deg,#f0fdf4,#f7fef9)') : '#f8f9fa' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: hasPlan ? (isExpired ? '#fecaca' : '#bbf7d0') : '#e5e7eb' }}>
                                            <Shield className="w-5 h-5" style={{ color: hasPlan ? (isExpired ? '#dc2626' : '#16a34a') : '#9ca3af' }} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: hasPlan ? (isExpired ? '#dc2626' : '#16a34a') : '#9ca3af' }}>Membership Plan</p>
                                            <p className="text-[15px] font-black text-[#1e2330]">{hasPlan ? localUser.plan.name : 'No Active Plan'}</p>
                                        </div>
                                    </div>
                                    {hasPlan && (
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: isExpired ? '#fecaca' : '#bbf7d0', color: isExpired ? '#dc2626' : '#15803d' }}>
                                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="px-5 py-4 bg-white space-y-3">
                                    {hasPlan && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Sessions</p>
                                                <p className="text-[16px] font-black text-[#964C2E]">{localUser.plan.sessions_count || '--'}</p>
                                            </div>
                                            <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Validity</p>
                                                <p className="text-[13px] font-black text-[#1e2330]">{localUser.plan.validity ? `${localUser.plan.validity} mo` : '--'}</p>
                                            </div>
                                            <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Amount</p>
                                                <p className="text-[13px] font-black text-[#1e2330]">₹{localUser.plan.amount || '--'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {endDate && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: isExpired ? '#fef2f2' : daysLeft <= 7 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${isExpired ? '#fca5a5' : daysLeft <= 7 ? '#fde68a' : '#86efac'}` }}>
                                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: isExpired ? '#dc2626' : daysLeft <= 7 ? '#d97706' : '#16a34a' }} />
                                            <div>
                                                <p className="text-[10px] font-black" style={{ color: isExpired ? '#dc2626' : daysLeft <= 7 ? '#92400e' : '#14532d' }}>
                                                    {isExpired ? 'EXPIRED ON' : 'VALID UNTIL'}
                                                </p>
                                                <p className="text-[12px] font-bold text-[#1e2330]">
                                                    {endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    {!isExpired && daysLeft !== null && <span className="ml-1.5 text-[10px] font-black" style={{ color: daysLeft <= 7 ? '#d97706' : '#16a34a' }}>({daysLeft}d left)</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Assign / Renew Plan */}
                                    {!showAssignPlan ? (
                                        <button
                                            onClick={() => setShowAssignPlan(true)}
                                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#964C2E]/30 text-[#964C2E] text-[11px] font-black uppercase tracking-wider hover:bg-[#FAF3EC] transition-all flex items-center justify-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            {hasPlan ? 'Change / Renew Plan' : 'Assign Plan'}
                                        </button>
                                    ) : (
                                        <div className="space-y-3 pt-2 border-t border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Plan to Assign</p>
                                            <select
                                                value={selectedPlanId}
                                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-bold focus:outline-none focus:border-[#964C2E] transition-all"
                                            >
                                                <option value="">Choose a plan...</option>
                                                {plans.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} — {p.sessions_count} sessions / {p.validity} mo — ₹{p.amount}
                                                    </option>
                                                ))}
                                            </select>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Date</p>
                                                <input
                                                    type="date"
                                                    value={planStartDate}
                                                    onChange={(e) => setPlanStartDate(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-bold focus:outline-none focus:border-[#964C2E] transition-all"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setShowAssignPlan(false); setSelectedPlanId(''); }}
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[11px] font-black uppercase hover:bg-gray-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleAssignPlan}
                                                    disabled={isAssigningPlan || !selectedPlanId}
                                                    className="flex-1 py-2.5 rounded-xl bg-[#964C2E] hover:bg-[#7D3F25] text-white text-[11px] font-black uppercase shadow-md shadow-[#964C2E]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                                >
                                                    {isAssigningPlan ? (
                                                        <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Assigning...</>
                                                    ) : (
                                                        <><CheckCircle2 className="w-3.5 h-3.5" />Assign Plan</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                    {localUser.type === 'vet' && (
                        <div className="p-5 bg-[#FAF3EC] rounded-2xl border border-[#964C2E]/20 mb-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-[#964C2E] tracking-widest uppercase mb-1">ASSIGN HORSE TO VET</h4>
                                    <p className="text-[12px] font-bold text-gray-500">Select horses to add to this vet's assigned patient list.</p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-[#964C2E]/10 p-4 shadow-inner mb-4">
                                <select 
                                    className="w-full bg-white border border-[#964C2E]/20 text-gray-700 text-[13px] font-bold rounded-xl px-4 py-3 outline-none"
                                    value=""
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !selectedHorseIds.includes(val)) {
                                            setSelectedHorseIds([...selectedHorseIds, val]);
                                        }
                                    }}
                                >
                                    <option value="">Select a horse...</option>
                                    {horses.filter(h => h.vatId !== localUser.vetId).map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>

                                {selectedHorseIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-3">
                                        {selectedHorseIds.map(id => {
                                            const h = horses.find(horse => horse.id === id);
                                            return (
                                                <div key={id} className="flex items-center gap-1.5 bg-[#964C2E]/10 text-[#964C2E] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#964C2E]/20">
                                                    <span>{h?.name}</span>
                                                    <button onClick={() => removeSelectedHorse(id)} className="hover:text-red-500 ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAssignHorse}
                                disabled={isAssigningHorse || selectedHorseIds.length === 0}
                                className="w-full bg-[#964C2E] text-white rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.1em] shadow-lg hover:bg-[#7D3F25] transition-all duration-300 disabled:opacity-50"
                            >
                                {isAssigningHorse ? "Assigning..." : "Assign Horses"}
                            </button>
                        </div>
                    )}

                    {localUser.type === 'vet' && horses.filter(h => h.vatId === localUser.vetId).length > 0 && (
                        <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100 mb-6">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">ASSIGNED PATIENTS</h4>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {horses.filter(h => h.vatId === localUser.vetId).map(h => (
                                    <div key={h.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#FAF3EC] flex items-center justify-center font-bold text-[#964C2E] text-sm">
                                                {h.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[#1e2330]">{h.name}</p>
                                                {h.title && <p className="text-[10px] font-bold text-gray-400">{h.title}</p>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAssignedHorse(h.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            title="Unassign Horse"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100 mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">CONTACT INFORMATION</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">EMAIL ADDRESS</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{localUser.email}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">MOBILE NUMBER</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{localUser.mobile}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">PERSONAL DETAILS</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">AGE</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{localUser.age || '--'} Years</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">WEIGHT</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{localUser.weight || '--'} KG</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">DOB</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{localUser.dob || '--'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">LEAVE HISTORY & REQUESTS</h4>
                        {(!user.leaves || user.leaves.length === 0) ? (
                            <p className="text-[12px] font-bold text-gray-400">No leave requests found.</p>
                        ) : (
                            <div className="space-y-3">
                                {user.leaves.map((leave, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[13px] font-bold text-[#1e2330]">{leave.reason}</p>
                                                <p className="text-[11px] font-bold text-gray-400 mt-0.5">{leave.startDate} to {leave.endDate}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${leave.status.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : leave.status.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        {user.type !== 'rider' && leave.status.toLowerCase() === 'pending' && (
                                            <div className="flex gap-2 pt-2 border-t border-gray-50">
                                                <button onClick={() => onApproveLeave(user.id, leave, 'approved')} className="flex-1 bg-[#059669] hover:bg-[#047857] text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors">Approve</button>
                                                <button onClick={() => onApproveLeave(user.id, leave, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};


const UserActionModal = ({ userType, setCreateModal, onSuccess, initialData, stables }) => {

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        mobile: initialData?.mobile || "",
        dob: initialData?.dob || "",
        age: initialData?.age || "",
        weight: initialData?.weight || "",
        emergencyContact: initialData?.emergencyContact || "",
        type: initialData?.type || userType,
        title: initialData?.title || "",
        experience: initialData?.experience || "",
        status: initialData?.status || "ACTIVE",
        password: "",
        riderType: initialData?.riderType || "Regular",
        code: initialData?.code || "",
        level: initialData?.level || "Trial Pack",
        parentName: initialData?.parentName || "",
        allergies: initialData?.allergies || "",
        medical: initialData?.medical || "",
        instructions: initialData?.instructions || "",
        riderWallet: initialData?.riderWallet || 0,
    })

    const [isSubmitting, setIsSubmitting] = useState(false);
    console.log(initialData, "initialData")
    const [errors, setErrors] = useState({})

    const isEdit = !!initialData;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Required";
        if (!formData.email.trim()) {
            newErrors.email = "Required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid format";
        }
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Required";
        } else if (!/^\d{7,}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = "Invalid number";
        }
        if (formData.mobile.trim().length > 10) {
            newErrors.mobile = "Invalid number";
        }
        if (!formData.dob) newErrors.dob = "Required";
        if (!formData.age || formData.age <= 0) newErrors.age = "Required";
        if (!formData.weight || formData.weight <= 0) newErrors.weight = "Required";
        if (!formData.emergencyContact.trim()) {
            newErrors.emergencyContact = "Required";
        } else if (!/^\d{7,}$/.test(formData.emergencyContact.replace(/\D/g, ''))) {
            newErrors.emergencyContact = "Invalid number";
        } else if (formData.emergencyContact.trim().length > 10) {
            newErrors.emergencyContact = "Invalid number";
        }

        if (userType === "trainer") {
            if (!formData.title.trim()) newErrors.title = "Required";
            if (!formData.experience.trim()) newErrors.experience = "Required";
        }

        if (userType === "rider") {
            if (!formData.code) newErrors.code = "Required";
            if (!formData.level) newErrors.level = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);
            try {
                const api = isEdit ? `${updateUserApi}/${initialData.id}` : createUserApi;
                const method = isEdit ? "PUT" : "POST";

                const res = await apiFunction(api, [], formData, method, true);
                if (res && res.success) {
                    toast.success(res.message || `User ${isEdit ? 'updated' : 'created'} successfully`);
                    setCreateModal(false);
                    if (onSuccess) onSuccess();
                } else {
                    toast.error(res?.message || `Error ${isEdit ? 'updating' : 'creating'} user`);
                }
            } catch (error) {
                toast.error('Network error. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }



    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-h-[90vh] w-[650px] overflow-y-auto shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330] capitalize">{isEdit ? 'Edit' : 'Create'} {userType}</h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">
                            {isEdit ? 'Update existing user profile and credentials.' : 'Add a new member to the equestrian platform.'}
                        </p>
                    </div>
                    <button type="button" className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all" onClick={() => setCreateModal(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                <span>Full Name</span>
                                {errors.name && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.name}</span>}
                            </label>
                            <input name="name" value={formData.name} onChange={handleChange} type="text" className={`w-full border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="Enter full name" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                <span>Email Address</span>
                                {errors.email && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.email}</span>}
                            </label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className={`w-full border ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="email@example.com" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                <span>Mobile</span>
                                {errors.mobile && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.mobile}</span>}
                            </label>
                            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className={`w-full border ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="Phone number" />
                        </div>
                        {/* {userType === "stableStaff" && */}
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Password</span>
                                    {errors.password && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.password}</span>}
                                </label>
                                <input required={!isEdit} name="password" value={formData.password} onChange={handleChange} type="password" className={`w-full border ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="Password" />
                            </div>
                            {/* } */}
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                <span>Date of Birth</span>
                                {errors.dob && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.dob}</span>}
                            </label>
                            <input name="dob" value={formData.dob} onChange={handleChange} type="date" className={`w-full border ${errors.dob ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} />
                        </div>
                        <div className="col-span-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Age</span>
                                    {errors.age && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.age}</span>}
                                </label>
                                <input name="age" value={formData.age} onChange={handleChange} type="number" min="1" className={`w-full border ${errors.age ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Weight</span>
                                    {errors.weight && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.weight}</span>}
                                </label>
                                <input name="weight" value={formData.weight} onChange={handleChange} type="number" min="1" className={`w-full border ${errors.weight ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                <span>Emergency Contact</span>
                                {errors.emergencyContact && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.emergencyContact}</span>}
                            </label>
                            <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} type="tel" className={`w-full border ${errors.emergencyContact ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="Emergency number" />
                        </div>
                        {userType === "trainer" &&
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Title</span>
                                    {errors.title && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.title}</span>}
                                </label>
                                <select
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full border ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`}
                                >
                                    <option value="">Select Title</option>
                                    <option value="Trainer">Trainer</option>
                                    <option value="Head Trainer">Head Trainer</option>
                                </select>
                            </div>
                        }
                        {userType === "trainer" &&
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Experience</span>
                                    {errors.experience && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.experience}</span>}
                                </label>
                                <input name="experience" value={formData.experience} onChange={handleChange} type="text" className={`w-full border ${errors.experience ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="e.g. 5 Years" />
                            </div>
                        }
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Account Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="BANNED">BANNED</option>
                            </select>
                        </div>

                        {userType === "rider" && (
                            <>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                        <span>Select Center (Stable)</span>
                                        {errors.code && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.code}</span>}
                                    </label>
                                    <select
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className={`w-full border ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`}
                                    >
                                        <option value="">Select Center</option>
                                        {stables && stables.map(stable => (
                                            <option key={stable.id} value={stable.code}>{stable.name} ({stable.location})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Rider Type</label>
                                    <select name="riderType" value={formData.riderType} onChange={handleChange} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                                        <option value="Regular">Weekend</option>
                                        <option value="weekdays">Weekdays</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                        <span>Riding Experience Level</span>
                                        {errors.level && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.level}</span>}
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={`w-full border ${errors.level ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`}
                                    >
                                        <option value="Trial Pack">Trial Pack</option>
                                        <option value="Level 1">Level 1</option>
                                        <option value="Level 2">Level 2</option>
                                        <option value="Level 3">Level 3</option>
                                        <option value="Non Competitive 1">Non Competitive 1</option>
                                        <option value="Non Competitive 2">Non Competitive 2</option>
                                        <option value="Competitive 1">Competitive 1</option>
                                        <option value="Competitive 2">Competitive 2</option>
                                        <option value="Full Lease">Full Lease</option>
                                        <option value="Partial Lease">Partial Lease</option>
                                        <option value="Private Horse">Private Horse</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                        <span>Parent/Guardian Name</span>
                                    </label>
                                    <input name="parentName" value={formData.parentName} onChange={handleChange} type="text" className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white" placeholder="Parent or guardian name" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                        <span>Wallet Balance (₹)</span>
                                    </label>
                                    <input name="riderWallet" value={formData.riderWallet} onChange={handleChange} type="number" min="0" className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white" placeholder="0" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Medical Conditions</label>
                                    <textarea name="medical" value={formData.medical} onChange={handleChange} rows={2} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white" placeholder="Any medical conditions or historical injuries" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Allergies</label>
                                    <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white" placeholder="Food, environmental, or medical allergies" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Special Safety Instructions</label>
                                    <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows={2} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white" placeholder="Instructions for trainer/center staff" />
                                </div>
                                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="text-[12px] font-black text-[#1e2330] uppercase mb-4">Award Trophy</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Trophy Title</label>
                                            <input name="newTrophyTitle" value={formData.newTrophy?.title || ''} onChange={(e) => setFormData(prev => ({ ...prev, newTrophy: { ...prev.newTrophy, title: e.target.value } }))} type="text" className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" placeholder="e.g. Spring Derby 2023" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Trophy Subtitle</label>
                                            <input name="newTrophySubtitle" value={formData.newTrophy?.subtitle || ''} onChange={(e) => setFormData(prev => ({ ...prev, newTrophy: { ...prev.newTrophy, subtitle: e.target.value } }))} type="text" className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" placeholder="e.g. 1st Place Gold" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 italic px-1">* Entering a title will award a new trophy to this rider upon saving.</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setCreateModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all active:scale-95">
                            Cancel
                        </button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Profile' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const SendNotificationModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        title: "",
        desc: "",
        type: "info"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.desc) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const isAll = user?.all;
            const api = isAll ? notifyAllUsersApi : notifyUserApi(user.id);

            const res = await apiFunction(api, [], { data: formData }, "POST", true);
            if (res && res.success) {
                toast.success(isAll ? "Global broadcast dispatched to all users" : `Notification sent to ${user.name}`);
                onClose();
            } else {
                toast.error(res?.message || "Failed to transmit signal");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-10 w-[500px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${user?.all ? 'bg-[#964C2E] text-white shadow-lg shadow-[#964C2E]/20' : 'bg-[#FAE9DB] text-[#964C2E]'}`}>
                            {user?.all ? <Megaphone size={24} /> : <BellRing size={24} />}
                        </div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">
                            {user?.all ? "System Broadcast" : `Notify ${user.name}`}
                        </h3>
                        <p className="text-[13px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            {user?.all ? "GLOBAL REGISTRY SIGNAL" : "SEND TARGETED ALERT"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">NOTIFCATION CATEGORY</label>
                        <div className="flex gap-3">
                            {['info', 'success', 'alert', 'booking'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: cat })}
                                    className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${formData.type === cat
                                        ? 'bg-[#964C2E] border-[#964C2E] text-white shadow-lg'
                                        : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">TITLE</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                            placeholder="e.g. Schedule Update"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">MESSAGE BODY</label>
                        <textarea
                            rows={4}
                            value={formData.desc}
                            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all resize-none"
                            placeholder="Enter the full notification message here..."
                        />
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-[#964C2E] text-white py-5 rounded-[20px] font-black text-[14px] uppercase tracking-[2px] shadow-xl hover:bg-[#7D3F25] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? 'Transmitting...' : (
                            <>
                                Broadcast Signal <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const UpdateCenterModal = ({ user, trainer, stables, onClose, onSuccess }) => {
    const [selectedStable, setSelectedStable] = useState(trainer?.stableId || "");
    const [isHeadTrainer, setIsHeadTrainer] = useState(trainer?.title === "Head Trainer");
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log(selectedStable)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStable) {
            toast.error("Please select a center");
            return;
        }

        setIsSubmitting(true);
        try {
            // As per existing logic: update center

            const centerRes = await apiFunction(updateTrainerApi, [trainer?.id], {
                stableId: selectedStable,
                title: isHeadTrainer ? "Head Trainer" : "Trainer"
            }, "PUT", true);


            if (centerRes.success) {
                toast.success("Trainer updated successfully");
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to update trainer details");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-10 w-[450px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">Update Center</h3>
                        <p className="text-[13px] font-bold text-gray-400 mt-1">Assign {user.name} to a stable</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">SELECT STABLE / CENTER</label>
                        <select
                            value={selectedStable}
                            onChange={(e) => setSelectedStable(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                        >
                            <option value="">Select a center...</option>
                            {stables.map(stable => (
                                <option key={stable.id} value={stable.id}>{stable.name} ({stable.location})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                        <input
                            type="checkbox"
                            id="headTrainer"
                            checked={isHeadTrainer}
                            onChange={(e) => setIsHeadTrainer(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#964C2E] focus:ring-[#964C2E]"
                        />
                        <label htmlFor="headTrainer" className="text-[13px] font-black text-[#1e2330] cursor-pointer flex-1">
                            Make Head Trainer
                            <span className="block text-[11px] font-semibold text-gray-400 mt-0.5">Assign as the lead specialist for this center.</span>
                        </label>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-[#964C2E] text-white py-4 rounded-[20px] font-black text-[14px] uppercase tracking-wider shadow-xl hover:bg-[#7D3F25] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ userName, onCancel, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onCancel}
        >
            <div
                className="relative bg-white rounded-[28px] shadow-2xl w-[420px] p-8 flex flex-col items-center"
                style={{
                    boxShadow: '0 32px 80px rgba(150,76,46,0.18), 0 2px 20px rgba(0,0,0,0.10)',
                    animation: 'deleteModalIn 0.22s cubic-bezier(.22,1,.36,1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <style>{`
                    @keyframes deleteModalIn {
                        from { opacity: 0; transform: scale(0.88) translateY(24px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes deleteIconPulse {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.18); }
                        50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0.07); }
                    }
                `}</style>

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div
                    className="w-[72px] h-[72px] rounded-[20px] bg-red-50 border border-red-100 flex items-center justify-center mb-5"
                    style={{ animation: 'deleteIconPulse 2s ease-in-out infinite' }}
                >
                    <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2} />
                </div>

                {/* Title */}
                <h2 className="text-[22px] font-black text-[#1e2330] mb-2 text-center leading-snug">
                    Delete User?
                </h2>

                {/* Body */}
                <p className="text-[14px] font-semibold text-gray-500 text-center leading-relaxed mb-1">
                    You are about to permanently delete
                </p>
                <p className="text-[16px] font-black text-[#964C2E] text-center mb-1">
                    &ldquo;{userName}&rdquo;
                </p>
                <p className="text-[13px] font-semibold text-gray-400 text-center mb-7">
                    This action <span className="text-red-500 font-bold">cannot be undone</span>. All associated data will be permanently removed.
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100 mb-6" />

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-[#1e2330] text-[14px] font-black hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[14px] font-black shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Yes, Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;