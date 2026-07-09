import { CheckCircle2, ChevronRight, Clock, Calendar, XCircle, Search, RefreshCw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllSessionsApi, approveSessionApi, getAllUsersApi, getAllTrainersApi, getDailySnapshotsApi, triggerDailySnapshotCronApi } from '../api/apis';
import toast from 'react-hot-toast';
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
        if (!isNaN(d.getTime())) return `${dateStr} (${days[d.getDay()]})`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${dateStr} (${days[d.getDay()]})`;
};

const STATUS_TABS = [
    { key: 'PENDING', label: 'Pending', color: 'bg-[#FEF3C7] text-[#92400E]' },
    { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
    { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-600' },
    { key: 'ALL', label: 'All Bookings', color: 'bg-gray-100 text-gray-600' },
    { key: 'SNAPSHOTS', label: 'Daily Registry Log', color: 'bg-blue-100 text-blue-700' }
];

const statusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === 'CONFIRMED') return 'bg-green-100 text-green-700';
    if (s === 'REJECTED') return 'bg-red-100 text-red-600';
    return 'bg-[#FEF3C7] text-[#92400E]';
};

const BookingRequests = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [selectedDate, setSelectedDate] = useState('All');
    const [trainers, setTrainers] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Snapshot Roster logs states
    const [snapshots, setSnapshots] = useState([]);
    const [snapshotsCount, setSnapshotsCount] = useState(0);
    const [snapshotSearchDate, setSnapshotSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [snapshotSearchName, setSnapshotSearchName] = useState('');
    const [snapshotPages, setSnapshotPages] = useState(1);
    const [isTriggeringCron, setIsTriggeringCron] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const [sessionRes, trainerRes, userRes] = await Promise.all([
                apiFunction(getAllSessionsApi, [], {}, 'GET', true),
                apiFunction(getAllTrainersApi, [], {}, 'GET', true),
                apiFunction(getAllUsersApi, [], {}, 'GET', true)
            ]);
            
            if (sessionRes?.success) setSessions(sessionRes.sessions || []);
            if (trainerRes?.success) setTrainers(trainerRes.trainers || []);
            if (userRes?.success) setUsers(userRes.users.filter(u => u.type?.toLowerCase() === 'trainer') || []);
        } catch {
            toast.error('Failed to load booking requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchSnapshotsData = async () => {
        setLoading(true);
        try {
            const url = `${getDailySnapshotsApi}?date=${snapshotSearchDate}&name=${snapshotSearchName}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
            const res = await apiFunction(url, [], {}, 'GET', true);
            if (res?.success) {
                setSnapshots(res.snapshots || []);
                setSnapshotsCount(res.totalCount || 0);
                setSnapshotPages(res.totalPages || 1);
            } else {
                toast.error(res?.message || 'Failed to fetch snapshots');
            }
        } catch (e) {
            toast.error('Failed to load daily logs');
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerCronManual = async () => {
        setIsTriggeringCron(true);
        try {
            const res = await apiFunction(triggerDailySnapshotCronApi, [], {}, 'POST', true);
            if (res?.success) {
                toast.success('Successfully triggered daily registry log snapshot!');
                if (activeTab === 'SNAPSHOTS') {
                    fetchSnapshotsData();
                }
            } else {
                toast.error(res?.message || 'Failed to trigger cron');
            }
        } catch {
            toast.error('Network error triggering cron');
        } finally {
            setIsTriggeringCron(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'SNAPSHOTS') {
            fetchSnapshotsData();
        } else {
            fetchSessions();
        }
    }, [activeTab, snapshotSearchDate, currentPage]);

    // Separate debounce or button trigger for name search
    const handleNameSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSnapshotsData();
    };

    const handleBookingStatus = async (sessionId, riderId, newStatus) => {
        try {
            const res = await apiFunction(approveSessionApi, [sessionId, riderId], { status: newStatus }, 'PUT', true);
            if (res?.success) {
                toast.success(newStatus === 'REJECTED' ? 'Booking rejected' : `Booking ${newStatus.toLowerCase()}`);
                fetchSessions();
            } else {
                toast.error(res?.message || 'Update failed');
            }
        } catch {
            toast.error('Network error');
        }
    };

    // All participants flattened
    const allParticipants = useMemo(() =>
        sessions.flatMap(s =>
            (s.participants || []).map(p => ({ ...p, session: s }))
        ), [sessions]);

    // Filter by active tab
    const tabFiltered = useMemo(() => {
        if (activeTab === 'SNAPSHOTS') return [];
        if (activeTab === 'ALL') return allParticipants;
        return allParticipants.filter(p => p.status?.toUpperCase() === activeTab);
    }, [allParticipants, activeTab]);

    // Unique dates for date dropdown (based on tab)
    const availableDates = useMemo(() => {
        const dates = new Set();
        tabFiltered.forEach(p => {
            const d = p.date || p.session?.date;
            if (d && d !== 'N/A') dates.add(d);
        });
        return Array.from(dates).sort();
    }, [tabFiltered]);

    // Apply date filter
    const filteredParticipants = useMemo(() => {
        if (activeTab === 'SNAPSHOTS') return [];
        if (selectedDate === 'All') return tabFiltered;
        return tabFiltered.filter(p => (p.date || p.session?.date) === selectedDate);
    }, [tabFiltered, selectedDate, activeTab]);

    // Counts per tab
    const counts = useMemo(() => {
        const c = { ALL: allParticipants.length, SNAPSHOTS: snapshotsCount };
        allParticipants.forEach(p => {
            const s = p.status?.toUpperCase() || 'PENDING';
            c[s] = (c[s] || 0) + 1;
        });
        return c;
    }, [allParticipants, snapshotsCount]);

    // Pagination total pages helper
    const totalPages = activeTab === 'SNAPSHOTS' ? snapshotPages : Math.max(1, Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE));
    
    const paginatedParticipants = useMemo(() => {
        if (activeTab === 'SNAPSHOTS') return [];
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredParticipants.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredParticipants, currentPage, activeTab]);

    // Reset page on tab/date change
    useEffect(() => { setCurrentPage(1); }, [activeTab, selectedDate]);
    // Reset date on tab change
    useEffect(() => { setSelectedDate('All'); }, [activeTab]);

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#964C2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-bold text-gray-400">Loading registry...</p>
                </div>
            </div>
        );
    }

    const isSnapshotsTab = activeTab === 'SNAPSHOTS';

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-5 uppercase tracking-wider">
                    <span>Centers</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Booking Requests</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-2 tracking-tight">
                            {isSnapshotsTab ? 'Daily Registry Log' : 'Booking Requests'}
                        </h1>
                        <p className="text-[14px] font-semibold text-gray-500">
                            {isSnapshotsTab ? 'Inspect rider session counts, daily snapshots, and booking history.' : 'Review, approve or reject rider booking requests.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSnapshotsTab ? (
                            <>
                                <form onSubmit={handleNameSearchSubmit} className="relative group">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#964C2E] transition-colors" />
                                    <input
                                        type="text"
                                        value={snapshotSearchName}
                                        onChange={e => setSnapshotSearchName(e.target.value)}
                                        placeholder="Search rider name..."
                                        className="text-[13px] font-semibold text-[#1e2330] bg-white border border-[#E6D9CC] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#964C2E]/40 shadow-sm"
                                    />
                                </form>
                                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-[#E6D9CC] shadow-sm">
                                    <Calendar className="w-4 h-4 text-[#964C2E]" />
                                    <input
                                        type="date"
                                        value={snapshotSearchDate}
                                        onChange={(e) => setSnapshotSearchDate(e.target.value)}
                                        className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer"
                                    />
                                </div>
                                <button
                                    onClick={handleTriggerCronManual}
                                    disabled={isTriggeringCron}
                                    className="bg-[#964C2E] text-[13px] font-bold text-white px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2 hover:bg-[#7D3F25] transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 text-white ${isTriggeringCron ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                                    Create Log
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-[#E6D9CC] shadow-sm">
                                    <Calendar className="w-4 h-4 text-[#964C2E]" />
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer"
                                    >
                                        <option value="All">All Dates</option>
                                        {availableDates.map(date => (
                                            <option key={date} value={date}>{formatWithDay(date)}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={fetchSessions} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                                    <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                                    Refresh
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white border border-[#E6D9CC] rounded-2xl p-1.5 w-fit shadow-sm">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            activeTab === tab.key
                                ? 'bg-[#964C2E] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-[#F6EDE2]'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.key ? 'bg-white/20 text-white' : tab.color
                        }`}>
                            {counts[tab.key] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div>
                {isSnapshotsTab ? (
                    /* DAILY SNAPSHOTS HISTORY TABLE */
                    <>
                        <div className="grid grid-cols-[1fr_180px_160px_220px_180px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">SESSIONS LEFT</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">BOOKED TODAY?</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SESSION DATE / TIME</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">SNAPSHOT DATE</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {snapshots.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-[#E6D9CC] rounded-2xl shadow-sm">
                                    <p className="font-bold text-gray-400 text-sm">
                                        No registry snapshot found for date {snapshotSearchDate}.
                                    </p>
                                </div>
                            ) : (
                                snapshots.map((s, idx) => {
                                    const booked = s.has_booked_today === "true";
                                    return (
                                        <div key={idx} className="grid grid-cols-[1fr_180px_160px_220px_180px] gap-4 items-center bg-white border border-[#E6D9CC] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 pl-2">
                                                <div className="w-[38px] h-[38px] rounded-full bg-[#EBF3FE] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-black text-[#2563EB] text-sm flex-shrink-0">
                                                    {s.rider_name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <h4 className="text-[13px] font-black text-[#1e2330] truncate">{s.rider_name}</h4>
                                            </div>
                                            <div className="text-[14px] font-black text-center text-[#1e2330]">{s.sessions_left}</div>
                                            <div className="flex justify-center">
                                                <span className={`inline-flex justify-center px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${
                                                    booked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {booked ? 'YES' : 'NO'}
                                                </span>
                                            </div>
                                            <div className="text-[13px] font-bold text-[#964C2E] truncate">
                                                {booked ? (
                                                    <>
                                                        <span className="text-[#1e2330]">{s.booking_date}</span>
                                                        <span className="text-[11px] font-semibold text-gray-400 ml-2">({formatTime12Hour(s.booking_time)})</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-300 font-bold">—</span>
                                                )}
                                            </div>
                                            <div className="text-[12px] font-bold text-gray-500 text-right pr-2">{s.snapshot_date}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    /* STANDARD BOOKING REQUESTS TABLES */
                    <>
                        <div className="grid grid-cols-[180px_1fr_120px_100px_110px_100px_60px_160px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SLOT</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">TRAINER</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">TIMING</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">DATE</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">PAID</div>
                            <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {paginatedParticipants.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-[#E6D9CC] rounded-2xl shadow-sm">
                                    <p className="font-bold text-gray-400 text-sm">
                                        No {activeTab === 'ALL' ? '' : activeTab.toLowerCase()} bookings found
                                        {selectedDate !== 'All' ? ` for ${formatWithDay(selectedDate)}` : ''}.
                                    </p>
                                </div>
                            ) : (
                                paginatedParticipants.map((p, idx) => {
                                    const status = p.status?.toUpperCase() || 'PENDING';
                                    const isPending = status === 'PENDING';
                                    
                                    const trainer = trainers?.find(item => item.id === p.session?.trainerId);
                                    const tUser = users?.find(item => item.id === (trainer?.userId || trainer?.user_id));
                                    const trainerName = tUser?.name || trainer?.name || "Unassigned";

                                    return (
                                        <div key={idx} className="grid grid-cols-[180px_1fr_120px_100px_110px_100px_60px_160px] gap-4 items-center bg-white border border-[#E6D9CC] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 pl-2">
                                                <div className="w-[38px] h-[38px] rounded-full bg-[#F6EDE2] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-black text-[#964C2E] text-sm flex-shrink-0">
                                                    {p.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <h4 className="text-[13px] font-black text-[#1e2330] truncate">{p.name}</h4>
                                            </div>
                                            <div className="text-[13px] font-bold text-[#1e2330] truncate">{p.session?.title}</div>
                                            <div className="text-[12px] font-bold text-[#964C2E] truncate">{trainerName}</div>
                                            <div className="text-[13px] font-semibold text-gray-500">{p.session?.timing}</div>
                                            <div className="text-[12px] font-bold text-gray-500 text-center">{formatWithDay(p.date || p.session?.date || 'N/A')}</div>
                                            <div className="flex justify-center">
                                                <span className={`inline-flex justify-center px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${statusStyle(p.status)}`}>
                                                    {p.status || 'PENDING'}
                                                </span>
                                            </div>
                                            <div className="flex justify-center">
                                                <CheckCircle2 className={`w-5 h-5 ${p.paid ? 'text-[#22C55E]' : 'text-gray-300'}`} strokeWidth={2} />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleBookingStatus(p.session.id, p.riderId, 'CONFIRMED')}
                                                            className="bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm hover:bg-green-100 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookingStatus(p.session.id, p.riderId, 'REJECTED')}
                                                            className="bg-gray-50 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm hover:bg-gray-100 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : status === 'CONFIRMED' ? (
                                                    <button
                                                        onClick={() => handleBookingStatus(p.session.id, p.riderId, 'REJECTED')}
                                                        className="bg-red-50 border border-red-200 text-red-500 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-3 h-3" /> Revoke
                                                    </button>
                                                ) : status === 'REJECTED' ? (
                                                    <button
                                                        onClick={() => handleBookingStatus(p.session.id, p.riderId, 'CONFIRMED')}
                                                        className="bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm hover:bg-green-100 transition-colors"
                                                    >
                                                        Re-approve
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 font-bold pr-2">—</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8">
                        <div className="text-[13px] font-bold text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, isSnapshotsTab ? snapshotsCount : filteredParticipants.length)} of {isSnapshotsTab ? snapshotsCount : filteredParticipants.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl border border-[#E6D9CC] bg-white text-[13px] font-bold text-[#1e2330] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl border text-[13px] font-bold transition-colors ${
                                                currentPage === page
                                                    ? 'bg-[#964C2E] text-white border-[#964C2E]'
                                                    : 'border-[#E6D9CC] bg-white text-[#1e2330] hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl border border-[#E6D9CC] bg-white text-[13px] font-bold text-[#1e2330] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingRequests;
