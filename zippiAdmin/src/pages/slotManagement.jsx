import {
    Clock, Calendar, ChevronRight, Ban, Edit,
    CheckCircle2, Circle, MoreVertical, Download,
    ChevronDown, Info, ShieldAlert, CheckSquare, List, LayoutGrid
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllSessionsApi, createSessionApi, updateSessionApi, getAllUsersApi, getAllStablesApi, getAllHorsesApi, getAllTrainersApi } from '../api/apis';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Plus } from 'lucide-react';

const SlotManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sessionFilter, setSessionFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'UNAVAILABLE', 'TODAYS'
    const stableId = searchParams.get("id");
    const trainerIdParam = searchParams.get("trainerId");
    const [horses, setHorses] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalSlots: 0,
        totalBookings: 0,
        availableSlots: 0,
        pendingRequests: 0,
        allParticipants: []
    });


    useEffect(() => {
        if (trainerIdParam && trainers.length > 0) {
            setShowModal(true);
            setSessionToEdit(null);
        }
    }, [trainerIdParam, trainers]);

    const handleBlock = async (session) => {
        const newStatus = session.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
        const res = await apiFunction(`${updateSessionApi}/${session.id}`, [], { status: newStatus }, "PUT", true);
        if (res?.success) {
            toast.success(newStatus === "BLOCKED" ? "Session Blocked" : "Session Unblocked");
            fetchData();
        } else {
            toast.error("Failed to update session status");
        }
    };

    const fetchData = async () => {
        setLoading(true);



        // Fetch Sessions filtered by location
        const res = await apiFunction(getAllSessionsApi, [], {}, "GET", true);
        if (res && res.success) {
            setSessions(res.sessions || []);
        }

        // Fetch Trainers for the modal (using the new trainerId from our joined backend query)

        const trainerRes = await apiFunction(getAllTrainersApi, [], {}, "GET", true);
        console.log(trainerRes, "trainerRes")
        if (trainerRes && trainerRes.success) {
            setTrainers(trainerRes.trainers);
        }
        const userRes = await apiFunction(getAllUsersApi, [], {}, "GET", true);
        if (userRes && userRes.success) {
            setUsers(userRes.users.filter(u => u.type === 'trainer'));
        }

        const horseRes = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
        if (horseRes && horseRes.success) {
            setHorses(horseRes.horses);
        }

        setLoading(false);
    }

    const handleBookingStatus = async (sessionId, riderId, newStatus) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        let updatedParticipants;
        if (newStatus === 'REJECTED') {
            // Remove rider from list entirely for rejection
            updatedParticipants = session.participants.filter(p => p.riderId !== riderId);
        } else {
            updatedParticipants = session.participants.map(p =>
                p.riderId === riderId ? { ...p, status: newStatus } : p
            );
        }

        try {
            const res = await apiFunction(`${updateSessionApi}/${sessionId}`, [], { participants: updatedParticipants }, "PUT", true);
            if (res && res.success) {
                toast.success(newStatus === 'REJECTED' ? "Booking rejected" : `Booking ${newStatus.toLowerCase()}`);
                fetchData();
            } else {
                toast.error(res?.message || "Update failed");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };


    console.log(trainers, "trainers")

    useEffect(() => {
        fetchData();
    }, []);

    // Derived stats
    useEffect(() => {

        if (sessions?.length > 0) {
            console.log("hello")
            let totalSlots = sessions.length;
            let totalBookings = sessions.reduce((acc, s) => acc + (s.participants?.length || 0), 0);
            let availableSlots = sessions.length > 0 ? sessions.reduce((acc, s) => acc + (s.totalSeats - (s.participants?.length || 0)), 0) : 0;
            let pendingRequests = sessions.reduce((acc, s) => acc + (s.participants?.filter(p => p.status.toLowerCase() === 'pending').length || 0), 0);
            let allParticipants = sessions.flatMap(s => (s.participants || []).map(p => ({ ...p, session: s })));

            setStats({
                totalSlots,
                totalBookings,
                availableSlots,
                pendingRequests,
                allParticipants
            });
        }
    }, [sessions])


    console.log(stats)

    // Filter sessions to show today's participants
    const filteredDisplaySessions = useMemo(() => {
        return sessions.filter(session => {
            if (sessionFilter === 'ACTIVE') return session.status.toLowerCase() === 'active';
            if (sessionFilter === 'UNAVAILABLE') return session.status.toLowerCase() === 'unavailable';
            if (sessionFilter === 'TODAYS') {
                const today = new Date().toISOString().split('T')[0];
                return session.date === today;
            }
            return true;
        });
    }, [sessions, sessionFilter]);

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            {/* Top Breadcrumb & Header section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                    <span>Centers</span>
                    <ChevronRight className="w-3 h-3" />

                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Slot Management</span>
                </div>

                <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Slot & Booking Control</h1>
                <p className="text-[14px] font-semibold text-gray-500 mb-8">Manage daily equestrian sessions and rider capacities for Oct 24, 2023.</p>

                <div className="flex gap-4">
                    <button onClick={() => fetchData()} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                        <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                        Refresh Data
                    </button>
                    <button
                        onClick={() => { setSessionToEdit(null); setShowModal(true); }}
                        className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all"
                    >
                        <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        Add Session
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-6 mb-12">
                {/* Total Sessions */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Total Sessions</h3>
                    <p className="text-[26px] font-black text-[#1e2330] tracking-tight">{stats.totalSlots} Sessions</p>
                </div>
                {/* Available */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Available Seats</h3>
                    <p className="text-[26px] font-black text-[#22C55E] tracking-tight">{stats.availableSlots} Seats</p>
                </div>
                {/* Pending */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Pending Approv.</h3>
                    <p className="text-[26px] font-black text-[#964C2E] tracking-tight relative inline-block">
                        {stats.pendingRequests} Requests
                        <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#964C2E] rounded-full"></span>
                    </p>
                </div>
                {/* Total Bookings */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Total Bookings</h3>
                    <p className="text-[26px] font-black text-[#1e2330] tracking-tight">{stats.totalBookings} Riders</p>
                </div>
            </div>

            {/* Morning & Afternoon Sessions */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[20px] font-bold text-[#1e2330]">Sessions</h2>
                        <div className="relative">
                            <select
                                value={sessionFilter}
                                onChange={(e) => setSessionFilter(e.target.value)}
                                className="appearance-none bg-white border border-[#E6D9CC] rounded-xl py-2 pl-4 pr-10 text-[12px] font-bold text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/50"
                            >
                                <option value="ALL">All Sessions</option>
                                <option value="ACTIVE">Active</option>
                                <option value="UNAVAILABLE">Unavailable</option>
                                <option value="TODAYS">Today's</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div className="bg-[#F0E4D5] border border-[#E3CDBC]/50 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-5 py-2 text-[11px] font-bold shadow-sm rounded-lg flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white text-[#1e2330]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Grid View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-5 py-2 text-[11px] font-bold shadow-sm rounded-lg flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white text-[#1e2330]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                            List View
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 font-bold text-gray-400">Loading sessions...</div>
                ) : filteredDisplaySessions.length === 0 ? (
                    <div className="text-center py-10 font-bold text-gray-400">No sessions available.</div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-4 gap-6">
                        {filteredDisplaySessions.map((session, idx) => {
                            const horse = horses?.find((item) => item.id === session.horseId);
                            const trainer = trainers?.find((item) => item.id === session.trainerId);
                            const user = users?.find((item) => item.id === trainer?.userId);
                            const trainerName = user?.name || trainer?.name || "Unknown Trainer";

                            return (
                                <div key={session.id || idx} className={`border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[290px] transition-all ${session.status === 'BLOCKED' ? 'bg-[#FEE2E2] border-[#EF4444]' : 'bg-[#F3E7D9] border-[#964C2E]'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`inline-block text-[10px] font-black text-white px-3 py-1 tracking-wider uppercase rounded-full shadow-sm ${session.status === 'BLOCKED' ? 'bg-[#EF4444]' : 'bg-[#964C2E]'}`}>
                                                {session.status || 'ACTIVE'}
                                            </span>
                                        </div>
                                        <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-1">
                                            {session.timing || "Invalid Time"}
                                        </h3>
                                        <p className="text-[12px] font-bold text-[#964C2E] mb-1">{session.date}</p>
                                        <p className="text-[14px] font-bold text-[#1e2330] mb-4">{session.title || 'Session'}</p>

                                        <div className="bg-white/60 p-3 rounded-xl border border-[#E3CDBC]/50 mb-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="font-bold text-gray-500">🐎 Horse</span>
                                                <span className="font-black text-[#1e2330] truncate max-w-[100px] text-right">{horse?.name || "Unassigned"}</span>
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
                                            <span className="text-[#1e2330]">
                                                {session.participants?.length || 0}/{session.totalSeats || 10} Riders
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6 relative overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${session.status === 'BLOCKED' ? 'bg-[#EF4444]' : 'bg-[#964C2E]'}`}
                                                style={{ width: `${Math.min(100, ((session.participants?.length || 0) / (session.totalSeats || 10)) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleBlock(session)} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                                <Ban className={`w-3.5 h-3.5 ${session.status === 'BLOCKED' ? 'text-[#EF4444]' : 'text-gray-500'}`} />
                                                {session.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                                            </button>
                                            <button onClick={() => { setSessionToEdit(session); setShowModal(true); }} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                                <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    /* LIST VIEW */
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E6D9CC]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F0E4D5] border-b border-[#E6D9CC]">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Timing</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Session Type</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Horse & Trainer</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Utilization</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-[#A59588] tracking-widest uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDisplaySessions.map((session, idx) => {
                                    const horse = horses?.find((item) => item.id === session.horseId);
                                    const trainer = trainers?.find((item) => item.id === session.trainerId);
                                    const user = users?.find((item) => item.id === trainer?.userId);
                                    const trainerName = user?.name || trainer?.name || "Unknown Trainer";

                                    return (
                                        <tr key={session.id || idx} className="border-b border-gray-50 last:border-0 hover:bg-[#FDF9F4] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-[14px] font-black text-[#1e2330]">{session.timing}</div>
                                                <div className="text-[11px] font-bold text-[#964C2E] uppercase">{session.date}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#1e2330]">{session.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-[13px] font-black text-[#1e2330]">{horse?.name || "Unassigned"}</div>
                                                <div className="text-[11px] font-bold text-gray-500">{trainerName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 bg-[#E5D7C9] h-2 rounded-full relative overflow-hidden">
                                                        <div
                                                            className="bg-[#964C2E] h-2 rounded-full"
                                                            style={{ width: `${Math.min(100, ((session.participants?.length || 0) / (session.totalSeats || 10)) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[12px] font-bold text-[#1e2330]">
                                                        {session.participants?.length || 0}/{session.totalSeats}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${session.status === 'BLOCKED' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#D1FAE5] text-[#059669]'}`}>
                                                    {session.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleBlock(session)} className="p-2 bg-gray-50 text-gray-400 hover:text-[#EF4444] rounded-lg transition-all" title={session.status === 'BLOCKED' ? 'Unblock' : 'Block'}>
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => { setSessionToEdit(session); setShowModal(true); }} className="p-2 bg-gray-50 text-gray-400 hover:text-[#964C2E] rounded-lg transition-all" title="Edit Session">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Today's Booking Details */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-bold text-[#1e2330]">Today's Booking Details</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-white border border-[#E6D9CC] rounded-xl py-2.5 pl-4 pr-10 text-[13px] font-bold text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/50">
                                <option>All Sessions</option>
                                <option>Morning Training</option>
                                <option>Intermediate Jumping</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button className="flex items-center gap-2 text-[13px] font-bold text-[#CAB4A2] hover:text-[#964C2E] transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SESSION SLOT</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">HORSE ASSIGNED</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">PAID</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* List Body */}
                <div className="flex flex-col gap-6">
                    {stats.allParticipants.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No bookings recorded for today.</div>
                    ) : (
                        stats.allParticipants.map((p, idx) => (
                            <div key={idx} className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 items-center bg-[#F6EDE2] border-b border-[#E6D9CC] pb-6">
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="w-[120px] h-[140px] rounded-sm bg-gray-200 overflow-hidden border-2 border-white shadow-sm border-b-4 border-b-[#964C2E] flex items-center justify-center font-black text-gray-400">
                                        {p.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-black text-[#1e2330] mb-0.5">{p.name}</h4>
                                        <p className="text-[11px] font-semibold text-gray-500 leading-tight">Member</p>
                                    </div>
                                </div>
                                <div className="text-[13px] font-bold text-[#1e2330] leading-tight">{p.session?.timing}</div>
                                <div className="text-[13px] font-medium text-gray-500">Assigned</div>
                                <div className="flex justify-center">
                                    <span className={`inline-flex max-w-[80px] text-center justify-center px-2.5 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase shadow-sm ${p.status === 'CONFIRMED' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#92400E]'
                                        }`}>
                                        {p.status || 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <CheckCircle2 className={`w-6 h-6 ${p.paid ? 'text-[#22C55E]' : 'text-gray-300'}`} strokeWidth={2} />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    {(p.status.toLowerCase() === 'confirmed' || p.status.toLowerCase() === 'approved') ? (
                                        <button
                                            onClick={() => handleBookingStatus(p.session.id, p.riderId, 'REJECTED')}
                                            className="bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] px-4 py-2 rounded-xl text-[11px] font-bold shadow-sm hover:bg-[#FEE2E2] transition-colors leading-tight text-center"
                                        >
                                            Force<br />Cancel
                                        </button>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && <SessionModal sessionToEdit={sessionToEdit} trainers={users.filter(u => u.type.toLowerCase() === 'trainer')} setShowModal={setShowModal} onSuccess={fetchData} horses={horses} sessions={sessions} />}
        </div>
    );
};


const SessionModal = ({ sessionToEdit, trainers, setShowModal, horses, onSuccess, sessions = [] }) => {
    const [searchParams] = useSearchParams();
    const trainerIdParam = searchParams.get("trainerId");
    const [formData, setFormData] = useState({
        title: sessionToEdit?.title || "",
        startTime: sessionToEdit?.timing?.split("-")[0].trim() || "09:00",
        endTime: sessionToEdit?.timing?.split("-")[1].trim() || "10:30",
        date: sessionToEdit?.date || new Date().toISOString().split('T')[0],
        joiningAmount: sessionToEdit?.joiningAmount || 100,
        trainerId: sessionToEdit?.trainerId || trainerIdParam || "",
        horseId: sessionToEdit?.horseId || "",
        duration: sessionToEdit?.duration || "90 Min",
        location: sessionToEdit?.location || "",
        totalSeats: sessionToEdit?.totalSeats || 10,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const existingSessions = formData.horseId && formData.date ?
        sessions.filter(s => s.horseId === formData.horseId && s.date === formData.date && s.id !== sessionToEdit?.id) : [];


    console.log(existingSessions, "existingSessions")


    const handleSubmit = async (e) => {

        e.preventDefault();

        setIsSubmitting(true);

        try {

            // Quick find a horse ID if empty (choosing first available)

            const formattedTiming = `${formData.startTime} - ${formData.endTime}`;

            const finalData = { ...formData, timing: formattedTiming };

            console.log(finalData, "finalData")

            let res;
            if (sessionToEdit) {
                res = await apiFunction(`${updateSessionApi}/${sessionToEdit.id}`, [], finalData, "PUT", true);
            } else {
                console.log("newwwww")
                res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            }

            if (res && res.success) {
                toast.success(sessionToEdit ? "Session updated" : "Session created successfully");
                setShowModal(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || "Failed to create session");
            }
        } catch (error) {
            console.log(error, "error")
            toast.error("Network error. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[600px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">{sessionToEdit ? "Edit Session" : "Add New Session"}</h3>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">Schedule a session.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#964C2E] p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Session Title</label>
                        <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-all" placeholder="e.g. Morning Jumping" />
                    </div>

                    {existingSessions.length > 0 && (
                        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-2xl p-4 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[13px] font-black text-[#92400E] mb-1">Horse has existing sessions on this date:</h4>
                                <ul className="text-[12px] font-bold text-[#B45309] list-disc pl-4 space-y-0.5">
                                    {existingSessions.map((s, i) => (
                                        <li key={s.id || i}>{s.title || 'Session'} ({s.timing})</li>
                                    ))}
                                </ul>
                                <p className="text-[11px] font-semibold text-[#D97706] mt-1.5">Please ensure new timing does not overlap.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Start Time</label>
                            <input type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">End Time</label>
                            <input type="time" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Location</label>
                            <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Date</label>
                            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Trainer</label>
                            <select required value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                                <option value="">Select Trainer</option>
                                {trainers.map(t => <option key={t.trainerId} value={t.trainerId}>{t.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Horse</label>
                            <select required value={formData.horseId} onChange={(e) => setFormData({ ...formData, horseId: e.target.value })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]">
                                <option value="">Select Horse</option>
                                {horses?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Total Seats</label>
                            <input type="number" required value={formData.totalSeats} onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })} className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:border-[#964C2E]" />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-gray-50">
                        <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-2xl border border-gray-200 text-[#1e2330] text-[14px] font-bold hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button disabled={isSubmitting} type="submit" className="px-8 py-3.5 rounded-2xl bg-[#964C2E] text-white text-[14px] font-bold shadow-lg hover:bg-[#7D3F25] transition-all disabled:opacity-50">
                            {isSubmitting ? "Saving..." : (sessionToEdit ? "Save Changes" : "Schedule Session")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlotManagement;
