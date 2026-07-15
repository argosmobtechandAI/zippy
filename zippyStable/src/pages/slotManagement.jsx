import {
    Clock, Calendar, ChevronRight, Ban, Edit, Copy,
    CheckCircle2, Circle, MoreVertical, Download,
    ChevronDown, Info, ShieldAlert, CheckSquare, List, LayoutGrid, ArrowLeft, Plus, Trash2, Filter,
    Search, UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import {
    getAllSessionsApi, createSessionApi, bulkCreateSessionsApi, updateSessionApi, deleteSessionApi,
    getAllUsersApi, getAllStablesApi, getAllHorsesApi, getAllTrainersApi,
    approveSessionApi, cancelFullSessionApi, getUserApi, updateUserApi
} from '../api/apis';
import toast from 'react-hot-toast';
import { X, XCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { formatTime12Hour } from '../utils/timeFormat';

const formatWithDay = (dateStr) => {
    if (!dateStr || dateStr === 'N/A' || dateStr === 'daily') return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
            return `${dateStr}(${days[d.getDay()]})`;
        }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${dateStr}(${days[d.getDay()]})`;
};

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

import { useSelector } from 'react-redux';

const SlotManagement = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const [sessions, setSessions] = useState([]);
    const [stables, setStables] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [horses, setHorses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date filter state
    const [dateFilter, setDateFilter] = useState('upcoming'); // 'all' | 'today' | 'tomorrow' | 'week' | 'upcoming' | 'custom'
    const [customDate, setCustomDate] = useState('');

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);

    // Guest booking state
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestSession, setGuestSession] = useState(null);
    const [allUsers, setAllUsers] = useState([]); // all users for guest booking

    const currentStable = stables.find(s => s.id === selectedStable);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sessionRes, stableRes, trainerRes, userRes, horseRes] = await Promise.all([
                apiFunction(getAllSessionsApi, [], {}, "GET", true),
                apiFunction(getAllStablesApi, [], {}, "GET", true),
                apiFunction(getAllTrainersApi, [], {}, "GET", true),
                apiFunction(getAllUsersApi, [], {}, "GET", true),
                apiFunction(getAllHorsesApi, [], {}, "GET", true)
            ]);

            if (stableRes?.success) setStables(stableRes.stables || []);
            const matchedStable = stableRes?.stables?.find(s => s.id === selectedStable);

            if (sessionRes?.success) {
                const allSessions = sessionRes.sessions || [];
                setSessions(allSessions.filter(s => 
                    s.stableId === selectedStable || 
                    s.stable_id === selectedStable || 
                    (matchedStable && s.location === matchedStable.name)
                ));
            }
            if (trainerRes?.success) {
                setTrainers((trainerRes.trainers || []).filter(t => t.stableId === selectedStable || t.stable_id === selectedStable));
            }
            if (userRes?.success) {
                setAllUsers(userRes.users || []);
                setUsers(userRes.users.filter(u => u.type?.toLowerCase() === 'trainer') || []);
            }
            if (horseRes?.success) {
                setHorses((horseRes.horse || horseRes.horses || []).filter(h => h.stableId === selectedStable || h.stable_id === selectedStable));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStable) {
            fetchData();
        }
    }, [selectedStable]);

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;
        const res = await apiFunction(`${deleteSessionApi}/${id}`, [], {}, "DELETE", true);
        if (res?.success) {
            toast.success("Session deleted");
            fetchData();
        } else {
            toast.error("Failed to delete session");
        }
    };

    const handleCancelSession = async (id) => {
        if (!window.confirm("Are you sure you want to CANCEL this session? All booked riders will be refunded and notified.")) return;
        
        try {
            const res = await apiFunction(`${cancelFullSessionApi}/${id}`, [], {}, "PUT", true);
            if (res?.success) {
                toast.success("Session successfully cancelled and refunded.");
                fetchData();
            } else {
                toast.error(res?.message || "Failed to cancel session");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleBookingStatus = async (sessionId, riderId, newStatus) => {

        try {
            const res = await apiFunction(approveSessionApi, [sessionId, riderId], { status: newStatus }, "PUT", true);
            if (res?.success) {
                toast.success(newStatus === 'REJECTED' ? "Booking rejected" : `Booking ${newStatus.toLowerCase()}`);
                fetchData();
            } else {
                toast.error(res?.message || "Update failed");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleBlockSession = async (session) => {
        const newStatus = session.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
        const res = await apiFunction(`${updateSessionApi}/${session.id}`, [], { status: newStatus }, "PUT", true);
        if (res?.success) {
            toast.success(newStatus === "BLOCKED" ? "Session Blocked" : "Session Unblocked");
            fetchData();
        } else {
            toast.error("Failed to update status");
        }
    };

    const handleDuplicateSlot = async (slot) => {
        try {
            const finalData = {
                ...slot,
                title: `${slot.title} (Copy)`,
                joining_amount: slot.joining_amount !== undefined ? slot.joining_amount : (slot.joiningAmount !== undefined ? slot.joiningAmount : 0),
                joiningAmount: slot.joiningAmount !== undefined ? slot.joiningAmount : (slot.joining_amount !== undefined ? slot.joining_amount : 0)
            };
            
            // Delete properties that should not be duplicated
            delete finalData.id;
            delete finalData.participants;

            const res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            if (res?.success) {
                toast.success("Session duplicated successfully");
                fetchData();
            } else {
                toast.error(res?.message || "Failed to duplicate session");
            }
        } catch (error) {
            console.error("Error duplicating session:", error);
            toast.error("Network error");
        }
    };

    // Compute filtered sessions
    const todayStr = getLocalDateString();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrowDate);
    const weekEndDate = new Date();
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEndStr = getLocalDateString(weekEndDate);

    const filteredSessions = sessions.filter(s => {
        if (s.date === 'daily') return true; // daily sessions always show
        switch (dateFilter) {
            case 'all':      return true;
            case 'today':    return s.date === todayStr;
            case 'tomorrow': return s.date === tomorrowStr;
            case 'week':     return s.date >= todayStr && s.date <= weekEndStr;
            case 'upcoming': return s.date >= todayStr;
            case 'custom':   return customDate ? s.date === customDate : true;
            default:         return s.date >= todayStr;
        }
    });

    if (loading) {
        return <div className="p-10 text-center font-bold text-gray-400">Loading data...</div>;
    }

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                    <span>Centers</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Session Management</span>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Session Control</h1>
                        <p className="text-[14px] font-semibold text-gray-500">Manage training slots, assign trainers and horses, and approve booking requests.</p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => fetchData()} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                            <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                            Refresh Data
                        </button>
                        <button
                            onClick={() => { setSessionToEdit(null); setShowSessionModal(true); }}
                            className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Add Session
                        </button>
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                        >
                            <Calendar className="w-4 h-4" strokeWidth={2.5} />
                            Bulk Create Slots
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Filter Bar */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider mr-2">
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                </div>
                {[
                    { key: 'all',      label: 'All' },
                    { key: 'upcoming', label: 'Upcoming' },
                    { key: 'today',    label: 'Today' },
                    { key: 'tomorrow', label: 'Tomorrow' },
                    { key: 'week',     label: 'This Week' },
                    { key: 'custom',   label: 'Custom Date' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setDateFilter(f.key); if (f.key !== 'custom') setCustomDate(''); }}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                            dateFilter === f.key
                                ? 'bg-[#964C2E] text-white border-[#964C2E] shadow-md'
                                : 'bg-white text-[#1e2330] border-[#E6D9CC] hover:border-[#964C2E] hover:text-[#964C2E]'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
                {dateFilter === 'custom' && (
                    <input
                        type="date"
                        value={customDate}
                        onChange={e => setCustomDate(e.target.value)}
                        className="border border-[#E6D9CC] bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E] shadow-sm"
                    />
                )}
                <span className="ml-auto text-[12px] font-bold text-gray-400">
                    {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                </span>
            </div>

            {filteredSessions.length === 0 ? (
                <div className="text-center py-20 font-bold text-gray-400">
                    {sessions.length === 0 ? 'No sessions available. Create one to get started.' : 'No sessions match the selected filter.'}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {filteredSessions.map(slot => {
                        const trainer = trainers?.find(item => item.id === slot.trainerId);
                        const user = users?.find(item => item.id === (trainer?.userId || trainer?.user_id));
                        const trainerName = user?.name || trainer?.name || "Unassigned";
                        const slotHorses = horses.filter(h => slot.horseId?.includes(h.id));

                        return (
                            <div key={slot.id} className={`border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[320px] transition-all ${slot.status === 'BLOCKED' ? 'bg-[#FEE2E2] border-[#EF4444]' : slot.status === 'CANCELLED' ? 'bg-gray-100 border-gray-300 opacity-70' : 'bg-white border-[#E6D9CC]'}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-block text-[10px] font-black text-white px-3 py-1 tracking-wider uppercase rounded-full shadow-sm ${slot.status === 'BLOCKED' ? 'bg-[#EF4444]' : slot.status === 'CANCELLED' ? 'bg-gray-500' : 'bg-[#22C55E]'}`}>
                                            {slot.status || 'ACTIVE'}
                                        </span>
                                        <div className="flex gap-2.5">
                                            {slot.status !== 'CANCELLED' && (
                                                <button onClick={() => handleCancelSession(slot.id)} title="Cancel Session & Refund" className="text-gray-400 hover:text-orange-500 transition-colors"><XCircle className="w-4 h-4" /></button>
                                            )}
                                            <button onClick={() => handleDuplicateSlot(slot)} title="Duplicate Slot" className="text-gray-400 hover:text-blue-500 transition-colors"><Copy className="w-4 h-4" /></button>
                                            <button onClick={() => { setSessionToEdit(slot); setShowSessionModal(true); }} title="Edit Slot" className="text-gray-400 hover:text-[#964C2E] transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteSlot(slot.id)} title="Delete Slot" className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-[18px] font-black text-[#1e2330] tracking-tight mb-1">{slot.title}</h3>
                                    <p className="text-[13px] font-bold text-[#964C2E] mb-1">{formatTime12Hour(slot.timing)} • {slot.duration}</p>
                                    <p className="text-[12px] font-semibold text-gray-500 mb-4">{slot.date === 'daily' ? 'Daily Session' : `Date: ${slot.date}`}</p>

                                    <div className="bg-[#F0E4D5] rounded-lg p-3 text-[12px] font-bold text-[#1e2330] mb-4">
                                        <span className="text-gray-500 font-semibold block mb-1">Location:</span>
                                        {slot.location}
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-start text-[12px]">
                                            <span className="font-bold text-gray-500">🐎 Horses</span>
                                            <span className="font-black text-[#1e2330] text-right break-words max-w-[150px]">
                                                {slotHorses.length > 0 ? slotHorses.map(h => h.name).join(", ") : "None"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="font-bold text-gray-500">🧑‍🏫 Trainer</span>
                                            <span className="font-black text-[#964C2E] truncate max-w-[120px] text-right">{trainerName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2 border-t border-gray-100 pt-3">
                                        <span>Capacity Utilization</span>
                                        <span className="text-[#1e2330]">{slot.participants?.length || 0}/{slot.totalSeats || 10} Riders</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full mb-6 relative overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${slot.status === 'BLOCKED' ? 'bg-[#EF4444]' : 'bg-[#964C2E]'}`}
                                            style={{ width: `${Math.min(100, ((slot.participants?.length || 0) / (slot.totalSeats || 10)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleBlockSession(slot)} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                            <Ban className={`w-3.5 h-3.5 ${slot.status === 'BLOCKED' ? 'text-[#EF4444]' : 'text-gray-500'}`} />
                                            {slot.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                                        </button>
                                        {slot.status !== 'BLOCKED' && slot.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => { setGuestSession(slot); setShowGuestModal(true); }}
                                                className="flex-1 bg-[#964C2E] text-white border border-[#964C2E] py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#7D3F25] transition-colors"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Book Guest
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}




            {showSessionModal && (
                <SessionModal
                    sessionToEdit={sessionToEdit}
                    setShowModal={setShowSessionModal}
                    onSuccess={fetchData}
                    stables={stables}
                    users={users}
                    trainers={trainers}
                    horses={horses}
                    isAdmin={true}
                    defaultLocation={currentStable?.name}
                />
            )}
            {showBulkModal && (
                <BulkSessionModal
                    setShowModal={setShowBulkModal}
                    onSuccess={fetchData}
                    stables={stables}
                    users={users}
                    trainers={trainers}
                    horses={horses}
                    defaultLocation={currentStable?.name}
                />
            )}
            {showGuestModal && guestSession && (
                <GuestBookingModal
                    session={guestSession}
                    allUsers={allUsers}
                    setShowModal={setShowGuestModal}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

const SessionModal = ({ sessionToEdit, setShowModal, onSuccess, stables, users, trainers, horses, isAdmin, defaultLocation }) => {
    const [formData, setFormData] = useState({
        title: sessionToEdit?.title || "",
        startTime: sessionToEdit?.timing?.split("-")[0]?.trim() || "09:00",
        endTime: sessionToEdit?.timing?.split("-")[1]?.trim() || "10:30",
        date: sessionToEdit?.date || "daily",
        location: sessionToEdit?.location || defaultLocation || "",
        totalSeats: sessionToEdit?.totalSeats || 10,
        trainerId: sessionToEdit?.trainerId || "",
        horseId: Array.isArray(sessionToEdit?.horseId) ? sessionToEdit.horseId : (sessionToEdit?.horseId ? [sessionToEdit.horseId] : []),
        status: sessionToEdit?.status || "ACTIVE"
    });
    const [isDaily, setIsDaily] = useState(sessionToEdit?.date === "daily" || !sessionToEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleHorseToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            horseId: prev.horseId.includes(id)
                ? prev.horseId.filter(hId => hId !== id)
                : [...prev.horseId, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const startStr = formData.startTime;
            const endStr = formData.endTime;
            const [startH, startM] = startStr.split(':').map(Number);
            const [endH, endM] = endStr.split(':').map(Number);
            let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
            if (durationMins < 0) durationMins += 24 * 60;
            const duration = `${durationMins} Min`;
            const timing = `${startStr} - ${endStr}`;

            const finalData = {
                title: formData.title,
                timing,
                duration,
                date: isDaily ? "daily" : formData.date,
                location: formData.location,
                totalSeats: formData.totalSeats,
                trainerId: formData.trainerId ? formData.trainerId : null,
                horseId: formData.horseId,
                status: formData.status
            };

            let res;
            if (sessionToEdit) {
                res = await apiFunction(`${updateSessionApi}/${sessionToEdit.id}`, [], finalData, "PUT", true);
            } else {
                res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            }

            if (res?.success) {
                toast.success(sessionToEdit ? "Session updated" : "Session created");
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to save session");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTrainerName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : "";
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[600px] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">
                            {sessionToEdit ? "Edit Session" : "Create Session"}
                        </h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Define properties for this session.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Session Title</label>
                        <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" placeholder="e.g. Morning Jumping Session" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Start Time</label>
                            <input type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">End Time</label>
                            <input type="time" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Location / Center</label>
                        {isAdmin ? (
                            <select required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                                <option value="">Select Center</option>
                                {stables.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        ) : (
                            <input disabled value={formData.location} className="w-full border border-gray-100 bg-gray-100 rounded-2xl p-4 text-[14px] font-bold focus:outline-none text-gray-500" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Total Seats</label>
                            <input type="number" required min="1" value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Schedule</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-[13px] font-bold">
                                    <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]" />
                                    Daily Recurring Session
                                </label>
                                {!isDaily && (
                                    <input type="date" required={!isDaily} value={formData.date !== 'daily' ? formData.date : ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Trainer</label>
                        <select value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                            <option value="">No Trainer Assigned</option>
                            {users.map(u => {
                                const val = u.trainerId || u.id;
                                return (
                                    <option key={val} value={val}>
                                        {u.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Horses</label>
                        <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                            {horses.length === 0 ? (
                                <p className="text-[13px] font-bold text-gray-400 text-center py-2">No horses available</p>
                            ) : (
                                horses.map(h => (
                                    <label key={h.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.horseId.includes(h.id)}
                                            onChange={() => handleHorseToggle(h.id)}
                                            className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]"
                                        />
                                        <span className="text-[13px] font-bold">{h.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">Cancel</button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Session"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BulkSessionModal = ({ setShowModal, onSuccess, stables, users, trainers, horses, defaultLocation }) => {
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        location: defaultLocation || "",
        totalSeats: 7,
        trainerId: "",
        horseId: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleHorseToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            horseId: prev.horseId.includes(id)
                ? prev.horseId.filter(hId => hId !== id)
                : [...prev.horseId, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error("Start Date cannot be after End Date.");
            return;
        }

        setIsSubmitting(true);
        try {
            const finalData = {
                startDate: formData.startDate,
                endDate: formData.endDate,
                location: formData.location,
                totalSeats: formData.totalSeats,
                trainerId: formData.trainerId ? formData.trainerId : null,
                horseId: formData.horseId
            };

            const res = await apiFunction(bulkCreateSessionsApi, [], finalData, "POST", true);

            if (res?.success) {
                toast.success(res.message || "Slots created successfully!");
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to create bulk sessions");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[600px] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">
                            Bulk Create Slots
                        </h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Automatically create slots for all weekdays (Tue-Sun, skipping Mon) in the range.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Start Date</label>
                            <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">End Date</label>
                            <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Location / Center</label>
                        <select required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                            <option value="">Select Center</option>
                            {stables.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Total Seats (per slot)</label>
                        <input type="number" required min="1" value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Trainer</label>
                        <select value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                            <option value="">No Trainer Assigned</option>
                            {users.map(u => {
                                const val = u.trainerId || u.id;
                                return (
                                    <option key={val} value={val}>
                                        {u.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Horses</label>
                        <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                            {horses.length === 0 ? (
                                <p className="text-[13px] font-bold text-gray-400 text-center py-2">No horses available</p>
                            ) : (
                                horses.map(h => (
                                    <label key={h.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.horseId.includes(h.id)}
                                            onChange={() => handleHorseToggle(h.id)}
                                            className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]"
                                        />
                                        <span className="text-[13px] font-bold">{h.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">Cancel</button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Creating..." : "Create Slots"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GuestBookingModal = ({ session, allUsers, setShowModal, onSuccess }) => {
    const [guestType, setGuestType] = useState('guest'); // 'guest' | 'registered'
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [riderSessionCount, setRiderSessionCount] = useState(null); // live session count for selected rider
    const [fetchingCount, setFetchingCount] = useState(false);
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        bookingDate: '',
        paymentMode: 'CASH',
        amount: session.joiningAmount || session.joining_amount || 0,
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const riders = allUsers.filter(u => u.type?.toLowerCase() === 'rider');
    const filteredUsers = riders.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.includes(userSearch)
    );

    // Fetch live session count when a registered rider is selected
    const handleSelectUser = async (u) => {
        setSelectedUser(u);
        setUserSearch('');
        setShowUserDropdown(false);
        setRiderSessionCount(null);
        setFetchingCount(true);
        try {
            const res = await apiFunction(`${getUserApi}/${u.id}`, [], {}, 'GET', true);
            if (res?.success && res.user) {
                setRiderSessionCount(res.user.sessionCount ?? 0);
            }
        } catch (err) {
            console.error('Failed to fetch rider session count:', err);
        } finally {
            setFetchingCount(false);
        }
    };

    // Switch to guest — reset membership-only fields
    const handleSwitchToGuest = () => {
        setGuestType('guest');
        setSelectedUser(null);
        setRiderSessionCount(null);
        // If membership was selected, reset to CASH since guest can't use membership
        if (formData.paymentMode === 'MEMBERSHIP') {
            setFormData(prev => ({ ...prev, paymentMode: 'CASH' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // --- Membership Deduction Guard ---
            if (guestType === 'registered' && formData.paymentMode === 'MEMBERSHIP') {
                const currentCount = riderSessionCount ?? 0;
                if (currentCount <= 0) {
                    toast.error(`${selectedUser.name}'s session count is 0. Cannot book using Membership Deduction.`);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Fetch current session to get existing participants
            const sessionRes = await apiFunction(`${getAllSessionsApi}/${session.id}`, [], {}, 'GET', true);
            const currentSession = sessionRes?.session || session;
            const existingParticipants = currentSession.participants || session.participants || [];

            let newParticipant;

            if (guestType === 'registered' && selectedUser) {
                // Registered rider booking by admin
                newParticipant = {
                    riderId: selectedUser.riderId || selectedUser.id,
                    name: selectedUser.name,
                    status: 'CONFIRMED',
                    date: formData.bookingDate || new Date().toISOString().split('T')[0],
                    bookedByAdmin: true,
                    paymentMode: formData.paymentMode,
                    amount: formData.amount,
                    notes: formData.notes
                };
            } else {
                // Walk-in guest booking
                newParticipant = {
                    riderId: `guest_${Date.now()}`,
                    name: formData.guestName,
                    phone: formData.guestPhone,
                    email: formData.guestEmail,
                    status: 'CONFIRMED',
                    date: formData.bookingDate || new Date().toISOString().split('T')[0],
                    isGuest: true,
                    bookedByAdmin: true,
                    paymentMode: formData.paymentMode,
                    amount: formData.amount,
                    notes: formData.notes
                };
            }

            const updatedParticipants = [...existingParticipants, newParticipant];

            const res = await apiFunction(
                `${updateSessionApi}/${session.id}`,
                [],
                { participants: updatedParticipants },
                'PUT',
                true
            );

            if (res?.success) {
                // --- Deduct 1 session from rider if Membership Deduction ---
                if (guestType === 'registered' && formData.paymentMode === 'MEMBERSHIP' && selectedUser) {
                    const newCount = (riderSessionCount ?? 1) - 1;
                    await apiFunction(
                        `${updateUserApi}/${selectedUser.id}`,
                        [],
                        { sessionCount: newCount },
                        'PUT',
                        true
                    );
                    toast.success(`Booking confirmed for ${selectedUser.name}! Session count: ${riderSessionCount} → ${newCount}`);
                } else {
                    toast.success(
                        guestType === 'registered'
                            ? `Booking confirmed for ${selectedUser.name}!`
                            : `Guest booking confirmed for ${formData.guestName}!`
                    );
                }
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || 'Failed to book slot');
            }
        } catch (err) {
            console.error('GuestBookingModal error:', err);
            toast.error('Network error while booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="bg-white rounded-3xl p-8 w-[620px] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330] flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-[#964C2E]" /> Book Guest Ride
                        </h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">
                            Session: <span className="text-[#964C2E]">{session.title}</span> &bull; {formatTime12Hour(session.timing)} &bull; {session.date === 'daily' ? 'Daily' : session.date}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            Seats: {session.participants?.length || 0} / {session.totalSeats || 10} booked
                        </p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Guest Type Toggle */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 block px-1">Booking Type</label>
                        <div className="flex bg-[#F3F1EF] p-1.5 rounded-2xl gap-2">
                            <button
                                type="button"
                                onClick={() => handleSwitchToGuest()}
                                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${guestType === 'guest' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                🚶 Walk-in Guest
                            </button>
                            <button
                                type="button"
                                onClick={() => setGuestType('registered')}
                                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${guestType === 'registered' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                👤 Registered Rider
                            </button>
                        </div>
                    </div>

                    {/* Registered Rider Search */}
                    {guestType === 'registered' && (
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Select Rider</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or phone..."
                                    value={selectedUser ? selectedUser.name : userSearch}
                                    onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); setShowUserDropdown(true); }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 pl-11 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                    required={guestType === 'registered'}
                                />
                            </div>
                            {showUserDropdown && !selectedUser && filteredUsers.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 max-h-48 overflow-y-auto mt-1">
                                    {filteredUsers.map(u => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleSelectUser(u)}
                                            className="w-full text-left px-4 py-3 hover:bg-[#FFF5F2] transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <p className="text-[13px] font-bold text-[#1e2330]">{u.name}</p>
                                            <p className="text-[11px] text-gray-400">{u.email} {u.phone ? `· ${u.phone}` : ''}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedUser && (
                                <div className="mt-2 bg-[#FFF5F2] border border-[#FFDDD0] rounded-2xl px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[13px] font-bold text-[#964C2E]">{selectedUser.name}</p>
                                        <p className="text-[11px] text-gray-500">{selectedUser.email}</p>
                                        {fetchingCount ? (
                                            <p className="text-[11px] text-gray-400 mt-1">Fetching session balance...</p>
                                        ) : riderSessionCount !== null ? (
                                            <p className={`text-[12px] font-black mt-1 ${riderSessionCount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                🎟️ {riderSessionCount} session{riderSessionCount !== 1 ? 's' : ''} remaining
                                                {riderSessionCount === 0 && ' — Cannot use Membership Deduction'}
                                            </p>
                                        ) : null}
                                    </div>
                                    <button type="button" onClick={() => { setSelectedUser(null); setRiderSessionCount(null); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Walk-in Guest Fields */}
                    {guestType === 'guest' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Guest Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Full name"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Phone *</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 00000 00000"
                                        value={formData.guestPhone}
                                        onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                        className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Email (optional)</label>
                                    <input
                                        type="email"
                                        placeholder="guest@example.com"
                                        value={formData.guestEmail}
                                        onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                        className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Date */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">
                            Booking Date {session.date === 'daily' ? '(Required for daily sessions)' : '(Optional override)'}
                        </label>
                        <input
                            type="date"
                            required={session.date === 'daily'}
                            value={formData.bookingDate || (session.date !== 'daily' ? session.date : '')}
                            onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                        />
                    </div>

                    {/* Payment */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Payment Mode</label>
                            <select
                                value={formData.paymentMode}
                                onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                            >
                                <option value="CASH">💵 Cash (Collected)</option>
                                <option value="ONLINE">💳 Online / UPI</option>
                                {guestType === 'registered' && (
                                    <option value="MEMBERSHIP">🎟️ Membership Deduction</option>
                                )}
                                <option value="PENDING">⏳ Pending / Collect Later</option>
                                <option value="TRIAL">🆓 Trial Ride</option>
                                <option value="FREE">🎁 Free / Complimentary</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Notes (optional)</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Corporate group, VIP guest, special requirements..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">Cancel</button>
                        <button
                            disabled={isSubmitting || (guestType === 'registered' && !selectedUser)}
                            type="submit"
                            className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlotManagement;
