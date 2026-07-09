import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Search, Calendar, CheckCircle2, XCircle, Clock, Building2, ChevronDown, ChevronUp, User, RefreshCw, AlertCircle, Archive, UserCheck, Download } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllSessionsApi, getAllStablesApi, getAllUsersApi, getAllHorsesApi } from '../api/apis';
import { formatTime12Hour } from '../utils/timeFormat';

const statusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'ARCHIVED') return 'bg-gray-100 text-gray-500 border border-gray-200';
    if (s === 'IN_PROGRESS' || s === 'ONGOING') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-600 border border-red-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
};

const statusLabel = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ARCHIVED') return 'Deleted (Archived)';
    return status || 'Scheduled';
};

const attendanceBadge = (att) => {
    const a = (att || '').toLowerCase();
    if (a === 'present') return { cls: 'bg-green-100 text-green-700 border border-green-200', label: 'Present', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    if (a === 'noshow' || a === 'no-show' || a === 'absent') return { cls: 'bg-red-100 text-red-600 border border-red-200', label: 'No-Show', icon: <XCircle className="w-3.5 h-3.5" /> };
    return { cls: 'bg-gray-100 text-gray-500 border border-gray-200', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" /> };
};

const TABS = [
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'ALL', label: 'All Sessions' },
    { key: 'ARCHIVED', label: 'History (Deleted)' },
];

const AttendanceReport = () => {
    const [sessions, setSessions] = useState([]);
    const [archivedSessions, setArchivedSessions] = useState([]);
    const [stables, setStables] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('COMPLETED');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [stableFilter, setStableFilter] = useState('ALL');
    const [trainerFilter, setTrainerFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSessions, setExpandedSessions] = useState(new Set());

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sessRes, archRes, stabRes, usersRes, horseRes] = await Promise.all([
                apiFunction(getAllSessionsApi, [], {}, 'GET', true),
                apiFunction(`${getAllSessionsApi}?includeArchived=true`, [], {}, 'GET', true),
                apiFunction(getAllStablesApi, [], {}, 'GET', true),
                apiFunction(getAllUsersApi, [], {}, 'GET', true),
                apiFunction(getAllHorsesApi, [], {}, 'GET', true),
            ]);
            if (sessRes?.success) setSessions(sessRes.sessions || []);
            // Archived = full list minus non-archived
            if (archRes?.success) {
                const all = archRes.sessions || [];
                setArchivedSessions(all.filter(s => (s.status || '').toUpperCase() === 'ARCHIVED'));
            }
            if (stabRes?.success) setStables(stabRes.stables || stabRes.data || []);
            if (usersRes?.success) {
                setTrainers((usersRes.users || []).filter(u => (u.type || '').toLowerCase() === 'trainer'));
            }
            if (horseRes?.success) setHorses(horseRes.horses || []);
        } catch (e) {
            console.error('Fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleExpand = (id) => {
        setExpandedSessions(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Pool: normal sessions for tabs except ARCHIVED; archived for ARCHIVED tab
    const pool = activeTab === 'ARCHIVED' ? archivedSessions : sessions;

    const filtered = useMemo(() => {
        return pool.filter(s => {
            const status = (s.status || '').toUpperCase();
            const matchTab =
                activeTab === 'ALL' ||
                activeTab === 'ARCHIVED' ||
                (activeTab === 'COMPLETED' && status === 'COMPLETED') ||
                (activeTab === 'IN_PROGRESS' && (status === 'IN_PROGRESS' || status === 'ONGOING' || status === 'SCHEDULED' || status === 'ACTIVE'));

            let matchDate = true;
            if (startDateFilter && (s.date || '') < startDateFilter) matchDate = false;
            if (endDateFilter && (s.date || '') > endDateFilter) matchDate = false;

            const matchStable = stableFilter === 'ALL' || (s.location || '').toLowerCase().includes(stableFilter.toLowerCase());
            const matchTrainer = trainerFilter === 'ALL' || s.trainerId === trainerFilter;
            const search = searchQuery.toLowerCase();
            const matchSearch =
                !search ||
                (s.title || '').toLowerCase().includes(search) ||
                (s.location || '').toLowerCase().includes(search) ||
                (s.participants || []).some(p => (p.name || '').toLowerCase().includes(search));

            return matchTab && matchDate && matchStable && matchTrainer && matchSearch;
        }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [pool, activeTab, startDateFilter, endDateFilter, stableFilter, trainerFilter, searchQuery]);

    const downloadCSV = () => {
        const headers = ["Session Title", "Date", "Time", "Location", "Trainer Name", "Status", "Rider Name", "Rider Type", "Booking Status", "Attendance", "Individual Remark", "Trainer Remarks"];
        let csvContent = headers.join(",") + "\n";

        filtered.forEach(session => {
            const trainerUser = trainers.find(t => t.trainerId === session.trainerId);
            const trainerName = trainerUser ? trainerUser.name : 'Unassigned';
            const escapedTitle = `"${(session.title || '').replace(/"/g, '""')}"`;
            const escapedLocation = `"${(session.location || '').replace(/"/g, '""')}"`;
            const escapedTrainer = `"${(trainerName || '').replace(/"/g, '""')}"`;
            const escapedNote = `"${(session.note || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            const timing = `"${formatTime12Hour(session.timing || session.time || '')}"`;
            
            if (!session.participants || session.participants.length === 0) {
                const row = [
                    escapedTitle,
                    `"${session.date || ''}"`,
                    timing,
                    escapedLocation,
                    escapedTrainer,
                    `"${session.status || ''}"`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    escapedNote
                ];
                csvContent += row.join(",") + "\n";
            } else {
                session.participants.forEach(p => {
                    const row = [
                        escapedTitle,
                        `"${session.date || ''}"`,
                        timing,
                        escapedLocation,
                        escapedTrainer,
                        `"${session.status || ''}"`,
                        `"${(p.name || '').replace(/"/g, '""')}"`,
                        `"${(p.type || '').replace(/"/g, '""')}"`,
                        `"${(p.status || '').replace(/"/g, '""')}"`,
                        `"${(p.attendance || 'Pending').replace(/"/g, '""')}"`,
                        `"${(p.remark || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                        escapedNote
                    ];
                    csvContent += row.join(",") + "\n";
                });
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShareWhatsApp = (session, participants) => {
        let message = `*Session:* ${session.title || 'Untitled Session'}\n`;
        message += `*Time:* ${formatTime12Hour(session.timing || session.time) || '—'}\n`;
        message += `*Date:* ${session.date || '—'}\n\n`;
        message += `*Riders & Horses:*\n`;
        
        if (participants.length === 0) {
            message += `No riders assigned.`;
        } else {
            participants.forEach(p => {
                const assignedHorse = horses.find(h => h.id === p.horse);
                message += `- ${p.name || 'Unknown'} (🐴 ${assignedHorse ? assignedHorse.name : 'No horse assigned'})\n`;
            });
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const handleDownloadSlotCsv = (session, participants) => {
        const headers = ["Session Title", "Date", "Time", "Location", "Rider Name", "Horse Name", "Attendance", "Individual Remark"];
        let csvContent = headers.join(",") + "\n";

        const escapedTitle = `"${(session.title || '').replace(/"/g, '""')}"`;
        const escapedLocation = `"${(session.location || '').replace(/"/g, '""')}"`;
        const timing = `"${formatTime12Hour(session.timing || session.time || '')}"`;
        const date = `"${session.date || ''}"`;

        if (participants.length === 0) {
            const row = [escapedTitle, date, timing, escapedLocation, '""', '""', '""', '""'];
            csvContent += row.join(",") + "\n";
        } else {
            participants.forEach(p => {
                const assignedHorse = horses.find(h => h.id === p.horse);
                const horseName = assignedHorse ? assignedHorse.name : '';
                const row = [
                    escapedTitle,
                    date,
                    timing,
                    escapedLocation,
                    `"${(p.name || '').replace(/"/g, '""')}"`,
                    `"${horseName.replace(/"/g, '""')}"`,
                    `"${(p.attendance || 'Pending').replace(/"/g, '""')}"`,
                    `"${(p.remark || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
                ];
                csvContent += row.join(",") + "\n";
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `session_${(session.title || 'report').replace(/\s+/g, '_')}_${session.date || 'date'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const counts = useMemo(() => {
        const c = { COMPLETED: 0, IN_PROGRESS: 0, ALL: sessions.length, ARCHIVED: archivedSessions.length };
        sessions.forEach(s => {
            const status = (s.status || '').toUpperCase();
            if (status === 'COMPLETED') c.COMPLETED++;
            else if (['IN_PROGRESS', 'ONGOING', 'SCHEDULED', 'ACTIVE'].includes(status)) c.IN_PROGRESS++;
        });
        return c;
    }, [sessions, archivedSessions]);

    const renderSession = (session) => {
        const isExpanded = expandedSessions.has(session.id);
        const participants = session.participants || [];
        const presentCount = participants.filter(p => (p.attendance || '').toLowerCase() === 'present').length;
        const noshowCount = participants.filter(p => ['noshow', 'no-show', 'absent'].includes((p.attendance || '').toLowerCase())).length;
        const pendingCount = participants.length - presentCount - noshowCount;
        const isArchived = (session.status || '').toUpperCase() === 'ARCHIVED';
        const trainerUser = trainers.find(t => t.trainerId === session.trainerId);
        const trainerName = trainerUser ? trainerUser.name : 'Unassigned';

        return (
            <div key={session.id} className={`bg-white border rounded-3xl shadow-sm overflow-hidden ${isArchived ? 'border-gray-200 opacity-80' : 'border-[#E6D9CC]'}`}>
                {/* Archived ribbon */}
                {isArchived && (
                    <div className="bg-gray-100 border-b border-gray-200 px-5 py-1.5 flex items-center gap-2">
                        <Archive className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archived / Deleted Session — History Record</span>
                    </div>
                )}

                {/* Session Header Row */}
                <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#FBF9F6] transition-colors"
                    onClick={() => toggleExpand(session.id)}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="text-[15px] font-black text-[#1e2330] truncate">{session.title || 'Untitled Session'}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusBadge(session.status)}`}>
                                {statusLabel(session.status)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-[12px] font-semibold text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {session.date || 'No date'}
                            </span>
                            <span className="text-[12px] font-semibold text-gray-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {formatTime12Hour(session.timing || session.time) || '—'}
                            </span>
                            <span className="text-[12px] font-semibold text-gray-500 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" /> {session.location || '—'}
                            </span>
                            <span className="text-[12px] font-semibold text-gray-500 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" /> {trainerName}
                            </span>
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[11px] font-black px-3 py-1.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {presentCount} Present
                        </span>
                        <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[11px] font-black px-3 py-1.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> {noshowCount} No-Show
                        </span>
                        {pendingCount > 0 && (
                            <span className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-black px-3 py-1.5 rounded-full">
                                <Clock className="w-3.5 h-3.5" /> {pendingCount} Pending
                            </span>
                        )}
                        <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {participants.length} Riders
                        </span>
                    </div>

                    <div className="ml-2 flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-[#E6D9CC] bg-[#FBF9F6]">
                        <div className="px-6 pt-4 flex flex-wrap gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(session, participants); }}
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-xl text-[11px] font-black transition-colors flex items-center gap-2 uppercase tracking-wide"
                            >
                                Share to WhatsApp
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDownloadSlotCsv(session, participants); }}
                                className="bg-[#8C4A28] hover:bg-[#7a4023] text-white px-4 py-2 rounded-xl text-[11px] font-black transition-colors flex items-center gap-2 uppercase tracking-wide"
                            >
                                Download Slot CSV
                            </button>
                        </div>
                        {session.note && (
                            <div className="px-6 pt-4 pb-3">
                                <p className="text-[11px] font-black text-[#964C2E] uppercase tracking-widest mb-1">Trainer Remarks</p>
                                <p className="text-[13px] font-semibold text-[#1e2330] bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 whitespace-pre-line">
                                    {session.note}
                                </p>
                            </div>
                        )}
                        <div className="px-6 pt-3 pb-5">
                            <p className="text-[11px] font-black text-[#A59588] uppercase tracking-widest mb-3">Rider Attendance</p>
                            {participants.length === 0 ? (
                                <div className="text-center py-6 text-[13px] text-gray-400 font-semibold">No riders registered for this session.</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-[1fr_120px_140px_160px] gap-4 px-4 pb-2 border-b border-[#E6D9CC]">
                                        <span className="text-[10px] font-black text-[#A59588] uppercase tracking-widest">Rider Name & Horse</span>
                                        <span className="text-[10px] font-black text-[#A59588] uppercase tracking-widest">Type</span>
                                        <span className="text-[10px] font-black text-[#A59588] uppercase tracking-widest">Booking Status</span>
                                        <span className="text-[10px] font-black text-[#A59588] uppercase tracking-widest">Attendance</span>
                                    </div>
                                    {participants.map((p, i) => {
                                        const att = attendanceBadge(p.attendance);
                                        const assignedHorse = horses.find(h => h.id === p.horse);
                                        return (
                                            <div key={i} className="bg-white border border-[#E6D9CC] rounded-2xl shadow-sm overflow-hidden">
                                                <div className="grid grid-cols-[1fr_120px_140px_160px] gap-4 items-center px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#F6EDE2] flex items-center justify-center font-black text-[#964C2E] text-xs flex-shrink-0">
                                                            {(p.name || 'R').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black text-[#1e2330]">{p.name || '—'}</p>
                                                            {assignedHorse && (
                                                                <p className="text-[10px] text-[#8C4A28] font-bold mt-0.5">
                                                                    🐴 {assignedHorse.name}
                                                                </p>
                                                            )}
                                                            {p.remark && (
                                                                <p className="text-[10px] text-gray-500 font-medium mt-1">
                                                                    <span className="font-bold">Remark:</span> {p.remark}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                                                        p.type === 'Standard' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                                        p.type === 'Premium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                        'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                        {p.type || 'Standard'}
                                                    </span>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                                                        (p.status || '').toUpperCase() === 'CONFIRMED'
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {p.status || 'Pending'}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${att.cls}`}>
                                                        {att.icon} {att.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto font-body">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-[#1e2330] tracking-tight font-display mb-1 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-[#964C2E]" strokeWidth={2.5} />
                        Attendance Report
                    </h1>
                    <p className="text-[13px] font-semibold text-gray-500">
                        View all session slots with rider attendance, trainer remarks, and full history of deleted sessions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={downloadCSV} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                        <Download className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                        Export
                    </button>
                    <button onClick={fetchData} className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                        <RefreshCw className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#E6D9CC] rounded-3xl p-5 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex flex-1 items-center gap-3 bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl">
                    <Search className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search session name, stable, or rider..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent text-[13px] font-semibold text-[#1e2330] outline-none placeholder-gray-400 w-full"
                    />
                </div>
                <div className="bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#964C2E]" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">From</span>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={e => setStartDateFilter(e.target.value)}
                            className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer w-[110px]"
                        />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline mx-1">To</span>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={e => setEndDateFilter(e.target.value)}
                            className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer w-[110px]"
                        />
                    </div>
                    {(startDateFilter || endDateFilter) && (
                        <button onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }} className="text-gray-400 hover:text-red-500 ml-1 text-xs font-bold flex-shrink-0">✕</button>
                    )}
                </div>
                <div className="bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#964C2E]" />
                    <select
                        value={stableFilter}
                        onChange={e => setStableFilter(e.target.value)}
                        className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer"
                    >
                        <option value="ALL">All Stables</option>
                        {stables.map(st => (
                            <option key={st.id} value={st.name}>{st.name}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#964C2E]" />
                    <select
                        value={trainerFilter}
                        onChange={e => setTrainerFilter(e.target.value)}
                        className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer"
                    >
                        <option value="ALL">All Trainers</option>
                        {trainers.map(tr => (
                            <option key={tr.trainerId} value={tr.trainerId}>{tr.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white border border-[#E6D9CC] rounded-2xl p-1.5 w-fit shadow-sm flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            activeTab === tab.key
                                ? tab.key === 'ARCHIVED'
                                    ? 'bg-gray-600 text-white shadow-sm'
                                    : 'bg-[#964C2E] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-[#F6EDE2]'
                        }`}
                    >
                        {tab.key === 'ARCHIVED' && <Archive className="w-3.5 h-3.5" />}
                        {tab.label}
                        <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.key ? 'bg-white/20 text-white' :
                            tab.key === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {counts[tab.key] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Info banner for History tab */}
            {activeTab === 'ARCHIVED' && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <Archive className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-[13px] font-semibold text-amber-700">
                        These sessions were deleted by admin but their attendance records, rider info, and trainer remarks are preserved permanently.
                    </p>
                </div>
            )}

            {/* Session List */}
            {loading ? (
                <div className="text-center py-20 bg-white border border-[#E6D9CC] rounded-3xl shadow-sm">
                    <p className="font-bold text-gray-400 text-sm">Loading sessions...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white border border-[#E6D9CC] rounded-3xl shadow-sm flex flex-col items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-gray-300" />
                    <p className="font-bold text-gray-400 text-sm">No sessions found for the selected filters.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map(session => renderSession(session))}
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;
