import {
    Clock, Calendar, ChevronRight, Ban, Edit,
    CheckCircle2, Circle, MoreVertical, Download,
    ChevronDown, Info, ShieldAlert, CheckSquare, List, LayoutGrid, ArrowLeft, Plus, Trash2, Copy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import {
    getAllSessionsApi, createSessionApi, updateSessionApi, deleteSessionApi,
    getAllUsersApi, getAllStablesApi, getAllHorsesApi, getAllTrainersApi,
    approveSessionApi
} from '../api/apis';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

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

const SlotManagement = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const [sessions, setSessions] = useState([]);
    const [stables, setStables] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [horses, setHorses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);

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
            if (matchedStable && sessionRes?.success) {
                setSessions((sessionRes.sessions || []).filter(s => s.location === matchedStable.name));
            } else {
                setSessions([]);
            }

            if (trainerRes?.success) setTrainers(trainerRes.trainers.filter(t => t.stableId === selectedStable) || []);
            if (userRes?.success) setUsers(userRes.users.filter(u => u.type === 'trainer') || []);
            if (horseRes?.success) setHorses(horseRes.horses.filter(h => h.stableId === selectedStable) || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const handleBookingStatus = async (sessionId, riderId, newStatus) => {

        try {
            const res = await apiFunction(approveSessionApi, [riderId, sessionId], { status: newStatus }, "PUT", true);
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

    if (loading) {
        return <div className="p-10 text-center font-bold text-gray-400">Loading data...</div>;
    }

    const pendingParticipants = sessions.flatMap(s => (s.participants || []).filter(p => p.status?.toLowerCase() === 'pending').map(p => ({ ...p, session: s })));

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
                        <p className="text-[14px] font-semibold text-gray-500">Manage training slots, assign trainers and horses, and approve booking requests for {currentStable?.name}.</p>
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
                    </div>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-20 font-bold text-gray-400">No sessions available. Create one to get started.</div>
            ) : (
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {sessions.map(slot => {
                        const trainer = trainers?.find(item => item.id === slot.trainerId);
                        const user = users?.find(item => item.id === trainer?.userId);
                        const trainerName = user?.name || trainer?.name || "Unassigned";
                        const slotHorses = horses.filter(h => slot.horseId?.includes(h.id));

                        return (
                            <div key={slot.id} className={`border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[320px] transition-all ${slot.status === 'BLOCKED' ? 'bg-[#FEE2E2] border-[#EF4444]' : 'bg-white border-[#E6D9CC]'}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-block text-[10px] font-black text-white px-3 py-1 tracking-wider uppercase rounded-full shadow-sm ${slot.status === 'BLOCKED' ? 'bg-[#EF4444]' : 'bg-[#22C55E]'}`}>
                                            {slot.status || 'ACTIVE'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDuplicateSlot(slot)} title="Duplicate Slot" className="text-gray-400 hover:text-blue-500 transition-colors"><Copy className="w-4 h-4" /></button>
                                            <button onClick={() => { setSessionToEdit(slot); setShowSessionModal(true); }} className="text-gray-400 hover:text-[#964C2E]"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-[18px] font-black text-[#1e2330] tracking-tight mb-1">{slot.title}</h3>
                                    <p className="text-[13px] font-bold text-[#964C2E] mb-1">{slot.timing} • {slot.duration}</p>
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
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Booking Requests across all sessions */}
            <div>
                <h2 className="text-[20px] font-bold text-[#1e2330] mb-6">Booking Requests</h2>
                <div className="grid grid-cols-[200px_1fr_1fr_120px_120px_80px_150px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SLOT</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">TIMING</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">DATE</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">PAID</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>
                <div className="flex flex-col gap-6">
                    {pendingParticipants.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No pending bookings.</div>
                    ) : (
                        pendingParticipants.map((p, idx) => (
                            <div key={idx} className="grid grid-cols-[200px_1fr_1fr_120px_120px_80px_150px] gap-4 items-center bg-white border border-[#E6D9CC] rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="w-[40px] h-[40px] rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-black text-gray-400">
                                        {p.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-black text-[#1e2330] mb-0.5">{p.name}</h4>
                                    </div>
                                </div>
                                <div className="text-[13px] font-bold text-[#1e2330]">{p.session?.title}</div>
                                <div className="text-[13px] font-bold text-gray-500">{p.session?.timing}</div>
                                <div className="text-[13px] font-bold text-gray-500 text-center">{formatWithDay(p.date || p.session?.date || 'N/A')}</div>
                                <div className="flex justify-center">
                                    <span className="inline-flex max-w-[80px] text-center justify-center px-2.5 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase shadow-sm bg-[#FEF3C7] text-[#92400E]">
                                        {p.status || 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <CheckCircle2 className={`w-6 h-6 ${p.paid ? 'text-[#22C55E]' : 'text-gray-300'}`} strokeWidth={2} />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleBookingStatus(p.session.id, p.riderId, 'CONFIRMED')}
                                        className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-[11px] font-bold shadow-sm hover:bg-green-100 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleBookingStatus(p.session.id, p.riderId, 'REJECTED')}
                                        className="bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-[11px] font-bold shadow-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showSessionModal && (
                <SessionModal
                    sessionToEdit={sessionToEdit}
                    setShowModal={setShowSessionModal}
                    onSuccess={fetchData}
                    stables={stables}
                    users={users}
                    trainers={trainers}
                    horses={horses}
                    isAdmin={false}
                    defaultLocation={currentStable?.name}
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
        date: sessionToEdit?.date || "",
        location: sessionToEdit?.location || defaultLocation || "",
        totalSeats: sessionToEdit?.totalSeats || 10,
        trainerId: sessionToEdit?.trainerId || "",
        horseId: sessionToEdit?.horseId || [],
        status: sessionToEdit?.status || "ACTIVE",
        joiningAmount: sessionToEdit?.joiningAmount ?? sessionToEdit?.joining_amount ?? 0
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
                date: isDaily ? "daily" : (formData.date || new Date().toISOString().split('T')[0]),
                location: formData.location,
                totalSeats: formData.totalSeats,
                trainerId: formData.trainerId ? formData.trainerId : null,
                horseId: formData.horseId,
                status: formData.status,
                joiningAmount: parseInt(formData.joiningAmount) || 0,
                joining_amount: parseInt(formData.joiningAmount) || 0
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
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Joining Fee (₹)</label>
                            <input type="number" min="0" value={formData.joiningAmount} onChange={(e) => setFormData({ ...formData, joiningAmount: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Schedule</label>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-[13px] font-bold cursor-pointer">
                                <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]" />
                                Daily Recurring Session
                            </label>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Session Date</label>
                                <input
                                    type="date"
                                    required={!isDaily}
                                    disabled={isDaily}
                                    value={isDaily ? '' : formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className={`w-full border border-gray-100 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] ${isDaily ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50/50'}`}
                                />
                                {isDaily && <p className="text-[11px] text-gray-400 mt-1 px-1">Date not required for daily sessions</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Trainer</label>
                        <select value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                            <option value="">No Trainer Assigned</option>
                            {users.map(u => {
                                const isAssignedToStable = trainers.some(t => t.userId === u.id);
                                if (!isAssignedToStable) return null;

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

export default SlotManagement;
