import {
    ChevronRight, Zap, Edit2, MoreVertical, Star,
    ChevronLeft, MoreHorizontal, UserCheck, Activity, Award, X, BellRing, Send, Megaphone, Search,
    Edit,
    Delete,
    Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFunction } from '../api/apiFunction';
import { createUserApi, getAllUsersApi, notifyUserApi, notifyAllUsersApi, updateUserApi, updateUserLeaveApi, getAllTrainersApi, updateTrainerApi, getAllStablesApi, deleteStableLogoApi, uploadFileApi } from '../api/apis';
import toast from 'react-hot-toast';
import axios from 'axios';

const TrainerCard = ({ user, trainers, stables, onNotify, onEdit, onStatusUpdate, onUpdateCenterClick, navigate }) => {

    console.log(user, "userr")
    console.log(trainers, "trainerr")
    const trainer = trainers.find((trainer) => trainer.userId === user.id);

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
                    <button onClick={(e) => { e.stopPropagation(); onNotify(); }} className="p-1.5 hover:bg-[#F9EFE5] hover:text-[#964C2E] rounded-lg transition-colors"><BellRing className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = user.status === 'AVAILABLE' ? 'OFF-DUTY' : 'AVAILABLE';
                            onStatusUpdate(nextStatus);
                        }}
                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Toggle Status"
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
    const [createModal, setCreateModal] = useState(false)
    const [notifyModal, setNotifyModal] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const [viewUser, setViewUser] = useState(null)
    const [updateCenterModal, setUpdateCenterModal] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [stables, setStables] = useState([])
    const navigate = useNavigate();

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
        return matchesType && matchesSearch;
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
            const res = await axios.post("http://localhost:3000/api/stable/uploadFile", formData, {
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
                                    onUpdateCenterClick={() => setUpdateCenterModal({ user, trainer: trainers.find(t => t.userId === user.id) })}
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
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">{user.type}</span>
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
                                                    setEditingUser(user);
                                                    setCreateModal(true);
                                                }}
                                                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">AGE</h4>
                                            <p className="text-[20px] font-black text-[#964C2E]">{user.age || '--'}</p>
                                        </div>
                                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEIGHT</h4>
                                            <p className="text-[20px] font-black text-[#964C2E]">{user.weight || '--'} <span className="text-[12px] font-bold text-gray-400">kg</span></p>
                                        </div>
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

            {viewUser && <ProfileQuickView user={viewUser} onClose={() => setViewUser(null)} navigate={navigate} onApproveLeave={handleApproveRequest} />}
        </div>
    );
};


const ProfileQuickView = ({ user, onClose, navigate, onApproveLeave }) => {
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
                        {user.name && user.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-[#1e2330] mb-1">{user.name}</h3>
                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-md mb-2">
                        {user.type}
                    </span>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#059669]">
                        <span className="w-2 h-2 rounded-full bg-[#059669]"></span> Active Account
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">CONTACT INFORMATION</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">EMAIL ADDRESS</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">MOBILE NUMBER</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{user.mobile}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">PERSONAL DETAILS</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">AGE</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{user.age || '--'} Years</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">WEIGHT</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{user.weight || '--'} KG</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 mb-0.5">DOB</p>
                                <p className="text-[14px] font-bold text-[#1e2330]">{user.dob || '--'}</p>
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


const UserActionModal = ({ userType, setCreateModal, onSuccess, initialData }) => {

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
    })

    const [isSubmitting, setIsSubmitting] = useState(false);
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
                        {userType === "stableStaff" &&
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 flex justify-between items-center px-1">
                                    <span>Password</span>
                                    {errors.password && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.password}</span>}
                                </label>
                                <input required={!isEdit} name="password" value={formData.password} onChange={handleChange} type="password" className={`w-full border ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-100'} bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white`} placeholder="Password" />
                            </div>}
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

export default UserManagement;