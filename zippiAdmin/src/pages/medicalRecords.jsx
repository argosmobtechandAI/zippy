import { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Calendar, Shield, Info, Syringe, HeartPulse, User, MapPin, Pill, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi } from '../api/apis';
import toast from 'react-hot-toast';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Strip api suffix from backend base URL if it's there
    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

const MedicalRecords = () => {
    const [horses, setHorses] = useState([]);
    const [selectedHorseId, setSelectedHorseId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('vaccinations'); // vaccinations, health

    const fetchHorses = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAllHorsesApi, [], {}, 'GET', true);
            if (res?.success) {
                const horsesList = res.horses || [];
                setHorses(horsesList);
                if (horsesList.length > 0 && !selectedHorseId) {
                    setSelectedHorseId(horsesList[0].id);
                }
            }
        } catch (e) {
            toast.error('Failed to load horse records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHorses();
    }, []);

    const filteredHorses = horses.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.title && h.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedHorse = horses.find(h => h.id === selectedHorseId);

    const getVaccinationStatus = (nextDateStr) => {
        if (!nextDateStr || nextDateStr === 'None') return { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
        try {
            const nextDate = new Date(nextDateStr);
            const now = new Date();
            // Reset hours for pure date comparison
            now.setHours(0,0,0,0);
            if (nextDate < now) {
                return { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200' };
            }
            return { label: 'Upcoming', color: 'bg-amber-50 text-amber-700 border-amber-200' };
        } catch {
            return { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
        }
    };

    return (
        <div className="p-8 min-h-full bg-[#fdfaf7] w-full font-sans">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#964C2E]/60 mb-2 uppercase tracking-[0.2em]">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#964C2E]">Medical Registry</span>
                </div>
                <h1 className="text-4xl font-black text-[#1e2330] tracking-tight mb-2">Clinical & Health History</h1>
                <p className="text-sm font-medium text-gray-400">
                    View horse-wise diagnostic reports, clinical timeline notes, and vaccination schedules.
                </p>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#964C2E]/10 border-t-[#964C2E] rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400">Synchronizing clinical registry...</p>
                </div>
            ) : horses.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <HeartPulse className="w-16 h-16 text-[#964C2E] opacity-25" />
                    <div className="text-center">
                        <p className="text-lg font-bold text-[#1e2330]">No horses registered yet</p>
                        <p className="text-xs font-medium text-gray-400 mt-1">Please register horses first in the registry dashboard.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Panel: Horse Roster */}
                    <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 max-h-[75vh] flex flex-col overflow-hidden">
                        <div className="mb-6 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30 transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {filteredHorses.map(horse => {
                                const isSelected = horse.id === selectedHorseId;
                                const status = horse.healthStatus?.status || 'Fit';
                                const statusColors = status.toLowerCase() === 'unfit' 
                                    ? 'bg-red-50 text-red-700' 
                                    : status.toLowerCase() === 'light work' 
                                    ? 'bg-amber-50 text-amber-700' 
                                    : 'bg-green-50 text-green-700';

                                return (
                                    <button
                                        key={horse.id}
                                        onClick={() => setSelectedHorseId(horse.id)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                                            isSelected 
                                                ? 'bg-[#964C2E]/5 border-[#964C2E]/20' 
                                                : 'bg-white border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-gray-100 flex items-center justify-center">
                                            {horse.imageUrl ? (
                                                <img src={getImageUrl(horse.imageUrl)} alt={horse.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Activity className="w-6 h-6 text-[#964C2E]/40" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[#1e2330] truncate">{horse.name}</p>
                                            <p className="text-[10px] font-semibold text-gray-400 mt-1 truncate">
                                                {horse.title || 'General'} • {horse.location}
                                            </p>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ${statusColors}`}>
                                            {status}
                                        </span>
                                    </button>
                                );
                            })}
                            {filteredHorses.length === 0 && (
                                <div className="py-10 text-center text-xs font-bold text-gray-400">
                                    No matching horses found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Clinical Details */}
                    <div className="lg:col-span-8 space-y-6">
                        {selectedHorse ? (
                            <>
                                {/* Profile Card */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#964C2E]/5 rounded-full" />
                                    
                                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-[#FAF7F2] border-2 border-white shadow-xl shrink-0 flex items-center justify-center">
                                        {selectedHorse.imageUrl ? (
                                            <img src={getImageUrl(selectedHorse.imageUrl)} alt={selectedHorse.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-14 h-14 text-[#964C2E]/30" />
                                        )}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-2">
                                            <h2 className="text-3xl font-black text-[#1e2330] tracking-tight">{selectedHorse.name}</h2>
                                            <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-center ${
                                                (selectedHorse.healthStatus?.status || 'Fit').toLowerCase() === 'unfit'
                                                    ? 'bg-red-100 text-red-800'
                                                    : (selectedHorse.healthStatus?.status || 'Fit').toLowerCase() === 'light work'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {selectedHorse.healthStatus?.status || 'Fit'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                            Breed / Category: {selectedHorse.title || 'General'}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[500px] mx-auto md:mx-0">
                                            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#964C2E]/5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Age</p>
                                                <p className="text-base font-bold text-[#1e2330]">{selectedHorse.age || '—'} yrs</p>
                                            </div>
                                            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#964C2E]/5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                                                <p className="text-base font-bold text-[#1e2330]">{selectedHorse.weight || '—'} kg</p>
                                            </div>
                                            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#964C2E]/5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Stable</p>
                                                <p className="text-base font-bold text-[#1e2330] truncate">{selectedHorse.location || '—'}</p>
                                            </div>
                                            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#964C2E]/5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Shoe Status</p>
                                                <p className="text-base font-bold text-[#1e2330]">{selectedHorse.shoeStatus || 'Standard'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs & Records Area */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                                    <div className="flex border-b border-gray-100 p-4 gap-2 bg-[#fdfaf7]/50">
                                        <button
                                            onClick={() => setActiveTab('vaccinations')}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                                activeTab === 'vaccinations'
                                                    ? 'bg-[#964C2E] text-white shadow-md'
                                                    : 'bg-white hover:bg-gray-50 text-[#8C4A28] border border-gray-100'
                                            }`}
                                        >
                                            <Syringe className="w-4 h-4" />
                                            Vaccination Records
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('health')}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                                activeTab === 'health'
                                                    ? 'bg-[#964C2E] text-white shadow-md'
                                                    : 'bg-white hover:bg-gray-50 text-[#8C4A28] border border-gray-100'
                                            }`}
                                        >
                                            <HeartPulse className="w-4 h-4" />
                                            Clinical Logs
                                        </button>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        {activeTab === 'vaccinations' ? (
                                            /* Vaccinations Tab */
                                            (!selectedHorse.vaccinationRecords || selectedHorse.vaccinationRecords.length === 0) ? (
                                                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center opacity-40">
                                                    <Syringe className="w-12 h-12 text-[#964C2E] mb-3" />
                                                    <p className="text-sm font-bold text-[#1e2330]">No vaccination logs found</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1">This horse has no logged immunizations.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {selectedHorse.vaccinationRecords.map((vac) => {
                                                        const status = getVaccinationStatus(vac.nextDate || vac.next_date);
                                                        return (
                                                            <div key={vac.id} className="bg-[#fdfaf7]/40 border border-gray-100 rounded-[2rem] p-6 hover:bg-[#fdfaf7]/80 transition-colors shadow-sm">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                                                    <div>
                                                                        <h4 className="text-lg font-black text-[#1e2330]">{vac.name}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                                            <span className="text-xs font-bold text-gray-400">
                                                                                Administered: {new Date(vac.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${status.color}`}>
                                                                            {status.label}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-50 mb-4">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Batch ID</p>
                                                                        <p className="text-xs font-bold text-[#1e2330]">{vac.batchNumber || vac.batch_number || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Next Immunization Due</p>
                                                                        <p className="text-xs font-bold text-[#1e2330]">
                                                                            {vac.nextDate || vac.next_date ? new Date(vac.nextDate || vac.next_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'None scheduled'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {vac.notes && (
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Clinical Notes</p>
                                                                        <p className="text-xs font-medium leading-5 text-gray-500 bg-white p-4 rounded-xl border border-gray-50">
                                                                            {vac.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        ) : (
                                            /* Health Logs Tab */
                                            (!selectedHorse.healthRecords || selectedHorse.healthRecords.length === 0) ? (
                                                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center opacity-40">
                                                    <HeartPulse className="w-12 h-12 text-[#964C2E] mb-3" />
                                                    <p className="text-sm font-bold text-[#1e2330]">No clinical checkup reports</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1">This horse has no diagnostics logged.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {selectedHorse.healthRecords.map((log) => {
                                                        const status = log.status || 'Fit';
                                                        const statusColors = status.toLowerCase() === 'unfit'
                                                            ? 'bg-red-50 text-red-700 border-red-100'
                                                            : status.toLowerCase() === 'light work'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : 'bg-green-50 text-green-700 border-green-100';

                                                        return (
                                                            <div key={log.id} className="bg-[#fdfaf7]/40 border border-gray-100 rounded-[2rem] p-6 hover:bg-[#fdfaf7]/80 transition-colors shadow-sm">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                                                    <div>
                                                                        <h4 className="text-lg font-black text-[#1e2330]">{log.title || 'General Checkup'}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                                            <span className="text-xs font-bold text-gray-400">
                                                                                Logged: {new Date(log.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${statusColors}`}>
                                                                            {status}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    {log.treatment && (
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 pl-1">Treatment Provided</p>
                                                                            <p className="text-xs font-bold text-[#1e2330] bg-white p-3 rounded-xl border border-gray-50">{log.treatment}</p>
                                                                        </div>
                                                                    )}

                                                                    {log.notes && (
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Diagnostics / Observations</p>
                                                                            <p className="text-xs font-medium leading-5 text-gray-500 bg-white p-4 rounded-xl border border-gray-50">
                                                                                {log.notes}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {log.medications && log.medications.length > 0 && (
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">Prescribed Medications</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {log.medications.map((med, idx) => (
                                                                                    <span key={idx} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-lg">
                                                                                        <Pill className="w-3.5 h-3.5" />
                                                                                        {med}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 text-center text-gray-400 flex flex-col justify-center items-center h-[500px]">
                                <Activity className="w-14 h-14 mb-4 text-[#964C2E]/20 animate-pulse" />
                                <p className="text-sm font-bold text-[#1e2330]">No horse selected</p>
                                <p className="text-xs font-medium text-gray-400 mt-1">Please select a horse from the roster side panel.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
