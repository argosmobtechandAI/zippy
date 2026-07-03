import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getAllSessionsApi, getAllStablesApi, getHealthRecordsByHorseApi, getVaccinationRecordsByHorseApi } from '../api/apis';
import { ChevronRight, Search, X, HeartPulse, Activity, Shield, AlertTriangle, Clock, Syringe, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const HEAVY_THRESHOLD = 10; // sessions/week = Heavy

const STATUS_CONFIG = {
    Available:   { label: 'Available',   color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
    Training:    { label: 'Training',    color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
    Resting:     { label: 'Resting',     color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
    Competition: { label: 'Competition', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    Medical:     { label: 'Medical',     color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
};

const getWorkload = (sessions) => {
    if (sessions === 0) return { level: 'Rest',     color: 'text-gray-400',   bar: 'bg-gray-300',   bg: 'bg-gray-50',  pct: 0 };
    if (sessions <= 3)  return { level: 'Light',    color: 'text-green-600',  bar: 'bg-green-500',  bg: 'bg-green-50', pct: Math.round((sessions / HEAVY_THRESHOLD) * 100) };
    if (sessions <= 6)  return { level: 'Moderate', color: 'text-amber-600',  bar: 'bg-amber-500',  bg: 'bg-amber-50', pct: Math.round((sessions / HEAVY_THRESHOLD) * 100) };
    if (sessions <= 9)  return { level: 'Heavy',    color: 'text-orange-600', bar: 'bg-orange-500', bg: 'bg-orange-50', pct: Math.round((sessions / HEAVY_THRESHOLD) * 100) };
    return                     { level: 'Overloaded', color: 'text-red-600',  bar: 'bg-red-500',    bg: 'bg-red-50',   pct: 100 };
};

const getVaccineDue = (nextDate) => {
    if (!nextDate || nextDate === 'None') return null;
    const days = Math.ceil((new Date(nextDate) - new Date()) / 86400000);
    if (days < 0)  return { label: 'OVERDUE',         color: 'text-red-600',    bg: 'bg-red-100' };
    if (days <= 7) return { label: `Due in ${days}d`,  color: 'text-orange-600', bg: 'bg-orange-100' };
    if (days <= 30)return { label: `Due in ${days}d`,  color: 'text-amber-600',  bg: 'bg-amber-100' };
    return               { label: `Due ${nextDate}`,   color: 'text-green-600',  bg: 'bg-green-100' };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
};

const getLastNDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Mini 7-day Workload Chart ─────────────────────────────────────────────
const WorkloadChart = ({ sessions, horseId }) => {
    const last7 = getLast7Days();
    const perDay = last7.map(dateStr => {
        let assignedCount = 0;
        sessions.forEach(s => {
            if (s.date === dateStr && s.participants) {
                s.participants.forEach(p => {
                    if (p.horse === horseId) {
                        assignedCount++;
                    }
                });
            }
        });
        return {
            date: dateStr,
            label: DAY_LABELS[new Date(dateStr + 'T00:00:00').getDay()],
            count: assignedCount
        };
    });
    const max = Math.max(...perDay.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1 h-14 mt-1">
            {perDay.map(d => {
                const h = Math.max(4, Math.round((d.count / max) * 100));
                const w = getWorkload(d.count);
                return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group">
                        <div className="relative w-full flex justify-center">
                            <div
                                className={`w-full rounded-sm ${d.count === 0 ? 'bg-gray-100' : w.bar} transition-all`}
                                style={{ height: `${h}%`, minHeight: d.count > 0 ? '6px' : '3px' }}
                            />
                            {d.count > 0 && (
                                <span className="absolute -top-4 text-[9px] font-black text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                            )}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400">{d.label[0]}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Detail Panel ──────────────────────────────────────────────────────────
const DetailPanel = ({ horse, sessions, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [healthRecords, setHealthRecords] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [hRes, vRes] = await Promise.all([
                    apiFunction(getHealthRecordsByHorseApi(horse.id), [], {}, 'GET', true),
                    apiFunction(getVaccinationRecordsByHorseApi(horse.id), [], {}, 'GET', true),
                ]);
                setHealthRecords(hRes?.records || []);
                setVaccinations(vRes?.records || []);
            } catch (e) {
                toast.error('Failed to load horse details');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [horse.id]);

    const last7 = getLast7Days();
    let weekAssignmentsCount = 0;
    sessions.forEach(s => {
        if (last7.includes(s.date) && s.participants) {
            s.participants.forEach(p => {
                if (p.horse === horse.id) {
                    weekAssignmentsCount++;
                }
            });
        }
    });
    const wl = getWorkload(weekAssignmentsCount);
    const statusCfg = STATUS_CONFIG[horse.status] || STATUS_CONFIG['Available'];

    const tabs = [
        { id: 'overview',    label: 'Overview' },
        { id: 'workload',    label: 'Workload' },
        { id: 'health',      label: 'Health Log' },
        { id: 'vaccinations',label: 'Vaccinations' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-[520px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        {horse.imageUrl ? (
                            <img src={horse.imageUrl} alt={horse.name} className="w-14 h-14 rounded-2xl object-cover border border-gray-100" />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#F0E4D5] flex items-center justify-center text-2xl">🐴</div>
                        )}
                        <div>
                            <h2 className="text-[20px] font-black text-[#1e2330]">{horse.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                    {statusCfg.label}
                                </span>
                                <span className={`text-[11px] font-bold ${wl.color}`}>{wl.level} Workload</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#964C2E] p-2 rounded-xl hover:bg-gray-50 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-7">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`py-3.5 px-3 text-[12px] font-bold border-b-2 transition-all ${activeTab === t.id ? 'border-[#964C2E] text-[#964C2E]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-7">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 font-bold text-sm">Loading...</div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Age', value: horse.age ? `${horse.age} yrs` : 'N/A' },
                                            { label: 'Weight', value: horse.weight ? `${horse.weight} kg` : 'N/A' },
                                            { label: 'Speed', value: horse.speed ? `${horse.speed} kmh` : 'N/A' },
                                            { label: 'Shoe Status', value: horse.shoeStatus || 'N/A' },
                                        ].map(item => (
                                            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-[15px] font-black text-[#1e2330]">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {horse.diet && (
                                        <div className="bg-[#FFF8F2] border border-[#F0D9C4] rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-[#964C2E] uppercase tracking-widest mb-1">🌿 Diet</p>
                                            <p className="text-[13px] font-semibold text-[#1e2330]">{horse.diet}</p>
                                        </div>
                                    )}
                                    {horse.healthRemarks && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">💬 Health Remarks</p>
                                            <p className="text-[13px] font-semibold text-[#1e2330]">{horse.healthRemarks}</p>
                                        </div>
                                    )}
                                    {horse.shoeingRemarks && (
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">👟 Shoeing Remarks</p>
                                            <p className="text-[13px] font-semibold text-[#1e2330]">{horse.shoeingRemarks}</p>
                                        </div>
                                    )}
                                    {horse.dewormingRecord && (
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">💊 Deworming</p>
                                            <p className="text-[13px] font-semibold text-[#1e2330]">{horse.dewormingRecord}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'workload' && (
                                <div className="space-y-5">
                                    <div className={`rounded-2xl p-5 ${wl.bg}`}>
                                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">This Week's Workload</p>
                                        <p className={`text-[28px] font-black ${wl.color}`}>{wl.level}</p>
                                        <p className="text-[13px] font-bold text-gray-500 mt-0.5">{weekAssignmentsCount} assignments this week · {7 - Math.min(weekAssignmentsCount, 7)} rest days</p>
                                        <div className="mt-3 w-full bg-white/70 h-2.5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${wl.bar} transition-all`} style={{ width: `${wl.pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{wl.pct}% of threshold ({HEAVY_THRESHOLD} sessions/week = Overloaded)</p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">15-Day Session Breakdown</p>
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            {getLastNDays(15).map(dateStr => {
                                                let count = 0;
                                                sessions.forEach(s => {
                                                    if (s.date === dateStr && s.participants) {
                                                        s.participants.forEach(p => {
                                                            if (p.horse === horse.id) {
                                                                count++;
                                                            }
                                                        });
                                                    }
                                                });
                                                const dayWl = getWorkload(count);
                                                const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                                return (
                                                    <div key={dateStr} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                                        <span className="w-28 text-[12px] font-bold text-gray-500">{dayName}</span>
                                                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${count === 0 ? 'bg-gray-200' : dayWl.bar}`} style={{ width: `${Math.min(100, (count / HEAVY_THRESHOLD) * 100)}%` }} />
                                                        </div>
                                                        <span className={`w-20 text-right text-[12px] font-black ${count === 0 ? 'text-gray-300' : dayWl.color}`}>
                                                            {count === 0 ? 'Rest' : `${count} assignment${count !== 1 ? 's' : ''}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* HEALTH LOG TAB */}
                            {activeTab === 'health' && (
                                <div>
                                    {healthRecords.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <HeartPulse className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-bold text-sm">No health records found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {[...healthRecords].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
                                                <div key={r.id || i} className="border border-gray-100 rounded-2xl p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-[14px] font-black text-[#1e2330]">{r.title}</p>
                                                            <p className="text-[11px] font-bold text-gray-400">{r.date}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${r.status === 'Critical' ? 'bg-red-100 text-red-600' : r.status === 'Recovering' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                    {r.treatment && <p className="text-[12px] text-gray-600 mb-1"><span className="font-bold">Treatment:</span> {r.treatment}</p>}
                                                    {r.notes && <p className="text-[12px] text-gray-500">{r.notes}</p>}
                                                    {r.medications?.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {r.medications.map((m, mi) => (
                                                                <span key={mi} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VACCINATIONS TAB */}
                            {activeTab === 'vaccinations' && (
                                <div>
                                    {vaccinations.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <Syringe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-bold text-sm">No vaccination records found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {[...vaccinations].sort((a, b) => new Date(b.date) - new Date(a.date)).map((v, i) => {
                                                const due = getVaccineDue(v.nextDate || v.next_date);
                                                return (
                                                    <div key={v.id || i} className="border border-gray-100 rounded-2xl p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-[14px] font-black text-[#1e2330]">{v.name}</p>
                                                                <p className="text-[11px] font-bold text-gray-400">Given: {v.date} · Batch: {v.batchNumber || v.batch_number || 'N/A'}</p>
                                                            </div>
                                                            {due && (
                                                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${due.bg} ${due.color}`}>{due.label}</span>
                                                            )}
                                                        </div>
                                                        {v.notes && <p className="text-[12px] text-gray-500 mt-2">{v.notes}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Horse Card ────────────────────────────────────────────────────────────
const HorseCard = ({ horse, sessions, onSelect }) => {
    const last7 = getLast7Days();
    let weekCount = 0;
    sessions.forEach(s => {
        if (last7.includes(s.date) && s.participants) {
            s.participants.forEach(p => {
                if (p.horse === horse.id) {
                    weekCount++;
                }
            });
        }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    sessions.forEach(s => {
        if (s.date === todayStr && s.participants) {
            s.participants.forEach(p => {
                if (p.horse === horse.id) {
                    todayCount++;
                }
            });
        }
    });

    const wl = getWorkload(weekCount);
    const statusCfg = STATUS_CONFIG[horse.status] || STATUS_CONFIG['Available'];

    const nextVaccination = horse.vaccinationRecords?.length > 0
        ? horse.vaccinationRecords.reduce((latest, v) => {
            const nd = v.nextDate || v.next_date;
            if (!nd || nd === 'None') return latest;
            return !latest || new Date(nd) < new Date(latest) ? nd : latest;
        }, null)
        : null;
    const vaccineDue = getVaccineDue(nextVaccination);

    return (
        <div className="bg-white border border-[#E6D9CC] rounded-2xl p-5 hover:shadow-md hover:border-[#964C2E]/30 transition-all flex flex-col gap-4">
            {/* Top */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {horse.imageUrl ? (
                        <img src={horse.imageUrl} alt={horse.name} className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
                    ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#F0E4D5] flex items-center justify-center text-xl">🐴</div>
                    )}
                    <div>
                        <h3 className="text-[15px] font-black text-[#1e2330] leading-none">{horse.name}</h3>
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{horse.title || horse.location || ''}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                </span>
            </div>

            {/* Workload Bar */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🏃 Workload</span>
                    <span className={`text-[11px] font-black ${wl.color}`}>{wl.level} · {weekCount}/wk</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${wl.bar} transition-all`} style={{ width: `${wl.pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between">
                    <span className="text-[10px] text-gray-400">Today: {todayCount} assignment{todayCount !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] text-gray-400">{7 - Math.min(weekCount, 7)} rest day{weekCount < 7 ? 's' : ''} this week</span>
                </div>
            </div>

            {/* 7-day mini chart */}
            <WorkloadChart sessions={sessions} horseId={horse.id} />

            {/* Info row */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col gap-0.5">
                    <span className="font-black text-gray-400">👟 Shoe</span>
                    <span className="font-bold text-[#1e2330]">{horse.shoeStatus || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-black text-gray-400">🌿 Diet</span>
                    <span className="font-bold text-[#1e2330] truncate">{horse.diet || 'N/A'}</span>
                </div>
                {vaccineDue && (
                    <div className="col-span-2 flex items-center gap-1.5 mt-1">
                        <Syringe className="w-3 h-3 text-gray-400" />
                        <span className={`text-[11px] font-black ${vaccineDue.color}`}>Vaccine: {vaccineDue.label}</span>
                    </div>
                )}
            </div>

            <button
                onClick={() => onSelect(horse)}
                className="w-full mt-auto bg-[#F6EDE2] hover:bg-[#964C2E] hover:text-white text-[#964C2E] text-[12px] font-bold py-2.5 rounded-xl transition-all border border-[#E6D9CC] hover:border-[#964C2E]"
            >
                View Details
            </button>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const HorseHealth = ({ stableContext = null }) => {
    const [horses, setHorses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [stables, setStables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHorse, setSelectedHorse] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [stableFilter, setStableFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [workloadFilter, setWorkloadFilter] = useState('all');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [horseRes, sessionRes, stableRes] = await Promise.all([
                    apiFunction(getAllHorsesApi, [], {}, 'GET', true),
                    apiFunction(getAllSessionsApi, [], {}, 'GET', true),
                    apiFunction(getAllStablesApi, [], {}, 'GET', true),
                ]);
                setHorses(horseRes?.horses || []);
                setSessions(sessionRes?.sessions || []);
                setStables(stableRes?.stables || []);
            } catch (e) {
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const last7 = getLast7Days();

    const enrichedHorses = useMemo(() => horses.map(h => {
        let weekCount = 0;
        sessions.forEach(s => {
            if (last7.includes(s.date) && s.participants) {
                s.participants.forEach(p => {
                    if (p.horse === h.id) {
                        weekCount++;
                    }
                });
            }
        });
        return { ...h, _weekCount: weekCount, _workloadLevel: getWorkload(weekCount).level };
    }), [horses, sessions]);

    const filtered = useMemo(() => {
        let list = stableContext
            ? enrichedHorses.filter(h => h.stableId === stableContext || h.stable_id === stableContext)
            : enrichedHorses;

        if (stableFilter !== 'all') {
            const st = stables.find(s => s.id === stableFilter);
            list = list.filter(h => h.stableId === stableFilter || h.stable_id === stableFilter || (st && h.location === st.name));
        }
        if (statusFilter !== 'all') list = list.filter(h => h.status === statusFilter);
        if (workloadFilter !== 'all') list = list.filter(h => h._workloadLevel === workloadFilter);
        if (search) list = list.filter(h => h.name?.toLowerCase().includes(search.toLowerCase()));
        return list;
    }, [enrichedHorses, stableFilter, statusFilter, workloadFilter, search, stables, stableContext]);

    // Summary stats
    const total = enrichedHorses.length;
    const healthy = enrichedHorses.filter(h => h.status === 'Available' || h.status === 'Training').length;
    const medical = enrichedHorses.filter(h => h.status === 'Medical' || h.status === 'Resting').length;
    const overloaded = enrichedHorses.filter(h => h._weekCount >= HEAVY_THRESHOLD).length;

    const statCards = [
        { label: 'Total Horses',    value: total,     color: 'text-[#1e2330]', bg: 'bg-white',       icon: '🐴' },
        { label: 'Healthy / Active', value: healthy,   color: 'text-green-600', bg: 'bg-green-50',    icon: '✅' },
        { label: 'Medical / Resting', value: medical,  color: 'text-red-600',   bg: 'bg-red-50',      icon: '🏥' },
        { label: 'Overloaded',       value: overloaded, color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚠️' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🐴</div>
                    <p className="font-bold text-gray-400">Loading horse data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                <span>Horses</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Health & Workload</span>
            </div>

            {/* Title */}
            <div className="mb-8">
                <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-2 tracking-tight">Horse Health & Workload</h1>
                <p className="text-[14px] font-semibold text-gray-500">Monitor health status, training intensity and vaccination schedules for all horses.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {statCards.map(c => (
                    <div key={c.label} className={`${c.bg} border border-white/80 rounded-2xl p-5 shadow-sm`}>
                        <div className="flex justify-between items-start">
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{c.label}</p>
                            <span className="text-xl">{c.icon}</span>
                        </div>
                        <p className={`text-[32px] font-black mt-1 leading-none ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-7 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-[#E6D9CC] rounded-xl px-4 py-2.5 flex-1 min-w-[200px] shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search horse name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent w-full placeholder-gray-300"
                    />
                    {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>}
                </div>

                {/* Stable filter — admin only */}
                {!stableContext && (
                    <div className="bg-white border border-[#E6D9CC] rounded-xl px-4 py-2.5 shadow-sm">
                        <select value={stableFilter} onChange={e => setStableFilter(e.target.value)} className="text-[12px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer">
                            <option value="all">All Stables</option>
                            {stables.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="bg-white border border-[#E6D9CC] rounded-xl px-4 py-2.5 shadow-sm">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-[12px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer">
                        <option value="all">All Statuses</option>
                        {Object.keys(STATUS_CONFIG).map(k => <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>)}
                    </select>
                </div>

                <div className="bg-white border border-[#E6D9CC] rounded-xl px-4 py-2.5 shadow-sm">
                    <select value={workloadFilter} onChange={e => setWorkloadFilter(e.target.value)} className="text-[12px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer">
                        <option value="all">All Workloads</option>
                        <option value="Rest">Rest</option>
                        <option value="Light">Light</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Heavy">Heavy</option>
                        <option value="Overloaded">Overloaded</option>
                    </select>
                </div>

                <span className="text-[12px] font-bold text-gray-400 ml-auto">{filtered.length} horse{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 font-bold text-gray-400">
                    {horses.length === 0 ? 'No horses found.' : 'No horses match the selected filters.'}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {filtered.map(h => (
                        <HorseCard key={h.id} horse={h} sessions={sessions} onSelect={setSelectedHorse} />
                    ))}
                </div>
            )}

            {/* Detail Panel */}
            {selectedHorse && (
                <DetailPanel horse={selectedHorse} sessions={sessions} onClose={() => setSelectedHorse(null)} />
            )}
        </div>
    );
};

export default HorseHealth;
