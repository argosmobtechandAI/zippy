import {
    Clock, Calendar, ChevronRight, Ban, Edit,
    CheckCircle2, Circle, MoreVertical, Download,
    ChevronDown, Info, ShieldAlert, CheckSquare, List, LayoutGrid, ArrowLeft, Plus, Trash2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import {
    getAllBatchesApi, createBatchApi, updateBatchApi, deleteBatchApi,
    getAllSessionsApi, createSessionApi, updateSessionApi, deleteSessionApi,
    getAllUsersApi, getAllStablesApi, getAllHorsesApi, getAllTrainersApi
} from '../api/apis';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const SlotManagement = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [stables, setStables] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [horses, setHorses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchToEdit, setBatchToEdit] = useState(null);

    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotToEdit, setSlotToEdit] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [batchRes, sessionRes, stableRes, trainerRes, userRes, horseRes] = await Promise.all([
                apiFunction(getAllBatchesApi, [], {}, "GET", true),
                apiFunction(getAllSessionsApi, [], {}, "GET", true),
                apiFunction(getAllStablesApi, [], {}, "GET", true),
                apiFunction(getAllTrainersApi, [], {}, "GET", true),
                apiFunction(getAllUsersApi, [], {}, "GET", true),
                apiFunction(getAllHorsesApi, [], {}, "GET", true)
            ]);

            if (stableRes?.success) setStables(stableRes.stables || []);

            const currentStable = stableRes?.stables?.find(s => s.id === selectedStable);

            if (batchRes?.success && currentStable) {
                setBatches(batchRes.batch.filter(b => b.location === currentStable.name) || []);
            } else {
                setBatches([]);
            }

            console.log(sessionRes, "sessionRes")

            if (sessionRes?.success) setSessions(sessionRes.sessions || []);
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

    console.log(stables, "stables")

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this batch? All its slots will be orphaned/deleted.")) return;
        const res = await apiFunction(`${deleteBatchApi}/${id}`, [], {}, "DELETE", true);
        if (res?.success) {
            toast.success("Batch deleted");
            fetchData();
            if (selectedBatch?.id === id) setSelectedBatch(null);
        } else {
            toast.error("Failed to delete batch");
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        const res = await apiFunction(`${deleteSessionApi}/${id}`, [], {}, "DELETE", true);
        if (res?.success) {
            toast.success("Slot deleted");
            fetchData();
        } else {
            toast.error("Failed to delete slot");
        }
    };

    const handleBookingStatus = async (sessionId, riderId, newStatus) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        let updatedParticipants;
        if (newStatus === 'REJECTED') {
            updatedParticipants = session.participants.filter(p => p.riderId !== riderId);
        } else {
            updatedParticipants = session.participants.map(p =>
                p.riderId === riderId ? { ...p, status: newStatus } : p
            );
        }
        try {
            const res = await apiFunction(`${updateSessionApi}/${sessionId}`, [], { participants: updatedParticipants }, "PUT", true);
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
            toast.success(newStatus === "BLOCKED" ? "Slot Blocked" : "Slot Unblocked");
            fetchData();
        } else {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return <div className="p-10 text-center font-bold text-gray-400">Loading data...</div>;
    }

    // --- BATCH VIEW ---
    if (!selectedBatch) {
        return (
            <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                        <span>Centers</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Batch Management</span>
                    </div>

                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Batch Control</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mb-8">Manage training batches and create slots under them.</p>

                    <div className="flex gap-4">
                        <button onClick={() => fetchData()} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                            <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                            Refresh Data
                        </button>
                        <button
                            onClick={() => { setBatchToEdit(null); setShowBatchModal(true); }}
                            className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Add Batch
                        </button>
                    </div>
                </div>

                {batches.length === 0 ? (
                    <div className="text-center py-20 font-bold text-gray-400">No batches available. Create one to get started.</div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {batches.map(batch => (
                            <div key={batch.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6D9CC] flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-block text-[10px] font-black text-white px-3 py-1 tracking-wider uppercase rounded-full shadow-sm ${batch.status === 'INACTIVE' ? 'bg-[#EF4444]' : 'bg-[#22C55E]'}`}>
                                            {batch.status || 'ACTIVE'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setBatchToEdit(batch); setShowBatchModal(true); }} className="text-gray-400 hover:text-[#964C2E]"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteBatch(batch.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-[18px] font-black text-[#1e2330] tracking-tight mb-1">{batch.title}</h3>
                                    <p className="text-[13px] font-bold text-[#964C2E] mb-1">{batch.timing} • {batch.duration}</p>
                                    <p className="text-[12px] font-semibold text-gray-500 mb-4">{batch.date === 'daily' ? 'Daily Batch' : `Date: ${batch.date}`}</p>

                                    <div className="bg-[#F0E4D5] rounded-lg p-3 text-[12px] font-bold text-[#1e2330] mb-4">
                                        <span className="text-gray-500 font-semibold block mb-1">Location:</span>
                                        {batch.location}
                                    </div>
                                    <div className="flex justify-between text-[13px] font-bold border-t border-gray-100 pt-3">
                                        <span className="text-gray-500">Joining Amount:</span>
                                        <span className="text-[#1e2330]">${batch.joiningAmount}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBatch(batch)}
                                    className="mt-6 w-full py-3 rounded-xl bg-[#F6EDE2] text-[#964C2E] font-bold text-[13px] hover:bg-[#E3CDBC] transition-colors border border-[#E3CDBC]"
                                >
                                    Manage Slots ({sessions.filter(s => s.batchsId === batch.id).length})
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {showBatchModal && <BatchModal batchToEdit={batchToEdit} setShowModal={setShowBatchModal} onSuccess={fetchData} stables={stables} selectedStableId={selectedStable} />}
            </div>
        );
    }

    // --- SLOTS VIEW (Inside a Batch) ---
    const batchSlots = sessions.filter(s => s.batchsId === selectedBatch.id).sort((a, b) => a.title.localeCompare(b.title));
    const pendingParticipants = batchSlots.flatMap(s => (s.participants || []).filter(p => p.status?.toLowerCase() === 'pending').map(p => ({ ...p, session: s })));

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            <div className="mb-8">
                <button onClick={() => setSelectedBatch(null)} className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:text-[#964C2E] transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Batches
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-2 tracking-tight">{selectedBatch.title} - Slots</h1>
                        <p className="text-[14px] font-semibold text-gray-500">{selectedBatch.timing} • {selectedBatch.location} • {selectedBatch.date === 'daily' ? 'Daily' : selectedBatch.date}</p>
                    </div>
                    <button
                        onClick={() => { setSlotToEdit(null); setShowSlotModal(true); }}
                        className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                        disabled={batchSlots.length >= 10}
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Add Slot {batchSlots.length >= 10 ? '(Max 10)' : ''}
                    </button>
                </div>
            </div>

            {batchSlots.length === 0 ? (
                <div className="text-center py-20 font-bold text-gray-400">No slots created for this batch yet.</div>
            ) : (
                <div className="grid grid-cols-4 gap-6 mb-12">
                    {batchSlots.map(slot => {
                        const trainer = trainers?.find(item => item.id === slot.trainerId);
                        const user = users?.find(item => item.id === trainer?.userId);
                        const trainerName = user?.name || trainer?.name || "Unassigned";
                        const slotHorses = horses.filter(h => slot.horseId?.includes(h.id));

                        return (
                            <div key={slot.id} className={`border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[290px] transition-all ${slot.status === 'BLOCKED' ? 'bg-[#FEE2E2] border-[#EF4444]' : 'bg-[#F3E7D9] border-[#964C2E]'}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-block text-[10px] font-black text-white px-3 py-1 tracking-wider uppercase rounded-full shadow-sm ${slot.status === 'BLOCKED' ? 'bg-[#EF4444]' : 'bg-[#964C2E]'}`}>
                                            {slot.status || 'ACTIVE'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSlotToEdit(slot); setShowSlotModal(true); }} className="text-gray-400 hover:text-[#964C2E]"><Edit className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-4">{slot.title}</h3>

                                    <div className="bg-white/60 p-3 rounded-xl border border-[#E3CDBC]/50 mb-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-start text-[12px]">
                                            <span className="font-bold text-gray-500">🐎 Horses</span>
                                            <span className="font-black text-[#1e2330] text-right break-words max-w-[120px]">
                                                {slotHorses.length > 0 ? slotHorses.map(h => h.name).join(", ") : "None"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="font-bold text-gray-500">🧑‍🏫 Trainer</span>
                                            <span className="font-black text-[#964C2E] truncate max-w-[100px] text-right">{trainerName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2">
                                        <span>Capacity Utilization</span>
                                        <span className="text-[#1e2330]">{slot.participants?.length || 0}/{slot.totalSeats || 10} Riders</span>
                                    </div>
                                    <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6 relative overflow-hidden">
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

            {/* Pending Requests for this Batch */}
            <div>
                <h2 className="text-[20px] font-bold text-[#1e2330] mb-6">Booking Requests</h2>
                <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SLOT</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">TIMING</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">PAID</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>
                <div className="flex flex-col gap-6">
                    {pendingParticipants.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No pending bookings for this batch.</div>
                    ) : (
                        pendingParticipants.map((p, idx) => (
                            <div key={idx} className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 items-center bg-[#F6EDE2] border-b border-[#E6D9CC] pb-6">
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

            {showSlotModal && <SlotModal slotToEdit={slotToEdit} batch={selectedBatch} batchSlotsCount={batchSlots.length} setShowModal={setShowSlotModal} onSuccess={fetchData} users={users} trainers={trainers} horses={horses} />}
        </div>
    );
};

const BatchModal = ({ batchToEdit, setShowModal, onSuccess, stables, selectedStableId }) => {
    const currentStable = stables.find(s => s.id === selectedStableId);
    console.log(stables, "currentStable")

    const [formData, setFormData] = useState({
        title: batchToEdit?.title || "",
        startTime: batchToEdit?.timing?.split("-")[0]?.trim() || "09:00",
        endTime: batchToEdit?.timing?.split("-")[1]?.trim() || "10:30",
        date: batchToEdit?.date || "daily",
        joiningAmount: batchToEdit?.joiningAmount || 100,
        location: batchToEdit?.location || currentStable?.name || "",
        status: batchToEdit?.status || "ACTIVE"
    });
    const [isDaily, setIsDaily] = useState(batchToEdit?.date === "daily" || !batchToEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                ...formData,
                timing,
                duration,
                date: isDaily ? "daily" : formData.date
            };
            delete finalData.startTime;
            delete finalData.endTime;

            let res;
            if (batchToEdit) {
                res = await apiFunction(`${updateBatchApi}/${batchToEdit.id}`, [], finalData, "PUT", true);
            } else {
                res = await apiFunction(createBatchApi, [], finalData, "POST", true);
            }

            if (res?.success) {
                toast.success(batchToEdit ? "Batch updated" : "Batch created");
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to save batch");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[600px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">{batchToEdit ? "Edit Batch" : "Create Batch"}</h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Define properties for this batch.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Batch Title</label>
                        <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" placeholder="e.g. Morning Jumping Batch" />
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Location / Center</label>
                            <input disabled value={formData.location} className="w-full border border-gray-100 bg-gray-100 rounded-2xl p-4 text-[14px] font-bold focus:outline-none text-gray-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Joining Amount ($)</label>
                            <input type="number" required value={formData.joiningAmount} onChange={(e) => setFormData({ ...formData, joiningAmount: parseInt(e.target.value) })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Schedule</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-[13px] font-bold">
                                    <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]" />
                                    Daily Batch
                                </label>
                                {!isDaily && (
                                    <input type="date" required={!isDaily} value={formData.date !== 'daily' ? formData.date : ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">Cancel</button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Batch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SlotModal = ({ slotToEdit, batch, batchSlotsCount, setShowModal, onSuccess, users, trainers, horses }) => {
    const [formData, setFormData] = useState({
        totalSeats: slotToEdit?.totalSeats || 10,
        trainerId: slotToEdit?.trainerId || "",
        horseId: slotToEdit?.horseId || [],
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
        setIsSubmitting(true);
        try {
            const title = slotToEdit ? slotToEdit.title : `Slot ${batchSlotsCount + 1}`;
            const finalData = {
                title,
                timing: batch.timing,
                date: batch.date,
                joiningAmount: batch.joiningAmount,
                duration: batch.duration,
                location: batch.location,
                batchsId: batch.id,
                totalSeats: formData.totalSeats,
                trainerId: formData.trainerId,
                horseId: formData.horseId
            };

            let res;
            if (slotToEdit) {
                res = await apiFunction(`${updateSessionApi}/${slotToEdit.id}`, [], finalData, "PUT", true);
            } else {
                res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            }

            if (res?.success) {
                toast.success(slotToEdit ? "Slot updated" : "Slot created");
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to save slot");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTrainerName = (id) => {
        const user = users.find(user => user.id === id);
        return user ? user.name : "";
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">{slotToEdit ? "Edit Slot" : `Add Slot ${batchSlotsCount + 1}`}</h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Belongs to: {batch.title}</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Total Seats</label>
                        <input type="number" required min="1" value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Trainer</label>
                        <select value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                            <option value="">No Trainer Assigned</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{getTrainerName(t.userId)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Assigned Horses</label>
                        <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                            {horses.map(h => (
                                <label key={h.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.horseId.includes(h.id)}
                                        onChange={() => handleHorseToggle(h.id)}
                                        className="w-4 h-4 text-[#964C2E] rounded focus:ring-[#964C2E]"
                                    />
                                    <span className="text-[13px] font-bold">{h.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">Cancel</button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Slot"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlotManagement;
