import { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Calendar, Shield, Info, Syringe, HeartPulse, User, MapPin, Pill, CheckCircle2, AlertTriangle, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, baseUrl, logVaccinationApi, logHealthApi } from '../api/apis';
import toast from 'react-hot-toast';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    return `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const MedicalRecords = () => {
    const [horses, setHorses] = useState([]);
    const [selectedHorseId, setSelectedHorseId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('vaccinations'); // vaccinations, health
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editRecordId, setEditRecordId] = useState(null);

    // Form states
    const [vaccineForm, setVaccineForm] = useState({
        name: '',
        date: '',
        nextDate: '',
        batchNumber: '',
        notes: ''
    });

    const [healthForm, setHealthForm] = useState({
        title: '',
        date: '',
        treatment: '',
        notes: '',
        status: 'Fit', // Fit, Unfit, Light Work
        medicationsInput: ''
    });

    const fetchHorses = async (silent = false) => {
        if (!silent) setLoading(true);
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
            if (!silent) setLoading(false);
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
            now.setHours(0,0,0,0);
            if (nextDate < now) {
                return { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200' };
            }
            return { label: 'Upcoming', color: 'bg-amber-50 text-amber-700 border-amber-200' };
        } catch {
            return { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
        }
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditRecordId(null);
        // Reset forms
        setVaccineForm({ name: '', date: '', nextDate: '', batchNumber: '', notes: '' });
        setHealthForm({ title: '', date: '', treatment: '', notes: '', status: 'Fit', medicationsInput: '' });
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditing(true);
        setEditRecordId(record.id);
        if (activeTab === 'vaccinations') {
            setVaccineForm({
                name: record.name || '',
                date: record.date ? record.date.substring(0, 10) : '',
                nextDate: record.nextDate || record.next_date ? (record.nextDate || record.next_date).substring(0, 10) : '',
                batchNumber: record.batchNumber || record.batch_number || '',
                notes: record.notes || ''
            });
        } else {
            setHealthForm({
                title: record.title || '',
                date: record.date ? record.date.substring(0, 10) : '',
                treatment: record.treatment || '',
                notes: record.notes || '',
                status: record.status || 'Fit',
                medicationsInput: record.medications ? record.medications.join(', ') : ''
            });
        }
        setShowModal(true);
    };

    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        const apiPath = activeTab === 'vaccinations' 
            ? `${baseUrl}/horse/vaccination/${recordId}` 
            : `${baseUrl}/horse/health/${recordId}`;
        try {
            const res = await apiFunction(apiPath, [], {}, 'DELETE', true);
            if (res?.success) {
                toast.success('Record deleted successfully');
                fetchHorses(true);
            } else {
                toast.error(res?.message || 'Failed to delete record');
            }
        } catch (e) {
            toast.error('An error occurred while deleting the record');
        }
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!selectedHorseId) return;

        if (activeTab === 'vaccinations') {
            const payload = {
                horseId: selectedHorseId,
                name: vaccineForm.name,
                date: vaccineForm.date,
                nextDate: vaccineForm.nextDate || 'None',
                batchNumber: vaccineForm.batchNumber,
                notes: vaccineForm.notes
            };

            try {
                let res;
                if (isEditing) {
                    res = await apiFunction(`${baseUrl}/horse/vaccination/${editRecordId}`, [], { data: payload }, 'PUT', true);
                } else {
                    res = await apiFunction(logVaccinationApi, [], { data: payload }, 'POST', true);
                }

                if (res?.success) {
                    toast.success(isEditing ? 'Vaccination updated' : 'Vaccination logged');
                    setShowModal(false);
                    fetchHorses(true);
                } else {
                    toast.error(res?.message || 'Failed to save record');
                }
            } catch (err) {
                toast.error('Error saving vaccination record');
            }
        } else {
            const meds = healthForm.medicationsInput 
                ? healthForm.medicationsInput.split(',').map(m => m.trim()).filter(Boolean)
                : [];
            const payload = {
                horseId: selectedHorseId,
                title: healthForm.title,
                date: healthForm.date,
                treatment: healthForm.treatment,
                notes: healthForm.notes,
                status: healthForm.status,
                medications: meds
            };

            try {
                let res;
                if (isEditing) {
                    res = await apiFunction(`${baseUrl}/horse/health/${editRecordId}`, [], { data: payload }, 'PUT', true);
                } else {
                    res = await apiFunction(logHealthApi, [], { data: payload }, 'POST', true);
                }

                if (res?.success) {
                    toast.success(isEditing ? 'Health record updated' : 'Health status logged');
                    setShowModal(false);
                    fetchHorses(true);
                } else {
                    toast.error(res?.message || 'Failed to save record');
                }
            } catch (err) {
                toast.error('Error saving health record');
            }
        }
    };

    return (
        <div className="p-8 min-h-full bg-[#fdfaf7] w-full font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
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
                {selectedHorseId && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 bg-[#964C2E] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#7D3F25] transition-all shadow-md shadow-[#964C2E]/10"
                    >
                        <Plus className="w-4 h-4" />
                        Log {activeTab === 'vaccinations' ? 'Vaccination' : 'Health Record'}
                    </button>
                )}
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
                                const latestHealth = horse.healthRecords && horse.healthRecords.length > 0
                                    ? [...horse.healthRecords].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                                    : null;
                                const status = latestHealth ? latestHealth.status : 'Fit';
                                const statusColors = status.toLowerCase() === 'medical' || status.toLowerCase() === 'unfit' || status.toLowerCase() === 'overloaded'
                                    ? 'bg-red-50 text-red-700' 
                                    : status.toLowerCase() === 'resting' || status.toLowerCase() === 'light work' 
                                    ? 'bg-amber-50 text-amber-700' 
                                    : status.toLowerCase() === 'training' 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : status.toLowerCase() === 'competition' 
                                    ? 'bg-purple-50 text-purple-700' 
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
                                            {(() => {
                                                 const latestHealth = selectedHorse.healthRecords && selectedHorse.healthRecords.length > 0
                                                     ? [...selectedHorse.healthRecords].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                                                     : null;
                                                 const status = latestHealth ? latestHealth.status : 'Fit';
                                                 const statusColors = status.toLowerCase() === 'medical' || status.toLowerCase() === 'unfit' || status.toLowerCase() === 'overloaded'
                                                     ? 'bg-red-100 text-red-800'
                                                     : status.toLowerCase() === 'resting' || status.toLowerCase() === 'light work'
                                                     ? 'bg-amber-100 text-amber-800'
                                                     : status.toLowerCase() === 'training'
                                                     ? 'bg-blue-100 text-blue-800'
                                                     : status.toLowerCase() === 'competition'
                                                     ? 'bg-purple-100 text-purple-800'
                                                     : 'bg-green-100 text-green-800';
                                                 return (
                                                     <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-center ${statusColors}`}>
                                                         {status}
                                                     </span>
                                                 );
                                             })()}
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
                                            Health Records
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
                                                    {[...(selectedHorse.vaccinationRecords || [])]
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .slice(0, 5)
                                                        .map((vac) => {
                                                            const status = getVaccinationStatus(vac.nextDate || vac.next_date);
                                                        return (
                                                            <div key={vac.id} className="bg-[#fdfaf7]/40 border border-gray-100 rounded-[2rem] p-6 hover:bg-[#fdfaf7]/80 transition-colors shadow-sm relative group">
                                                                {/* Edit/Delete Actions */}
                                                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleOpenEditModal(vac)}
                                                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteRecord(vac.id)}
                                                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pr-16">
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
                                            /* Health Records Tab */
                                            (!selectedHorse.healthRecords || selectedHorse.healthRecords.length === 0) ? (
                                                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center opacity-40">
                                                    <HeartPulse className="w-12 h-12 text-[#964C2E] mb-3" />
                                                    <p className="text-sm font-bold text-[#1e2330]">No clinical checkup reports</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1">This horse has no diagnostics logged.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {[...(selectedHorse.healthRecords || [])]
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .slice(0, 5)
                                                        .map((log) => {
                                                            const status = log.status || 'Fit';
                                                        const statusColors = status.toLowerCase() === 'unfit' || status.toLowerCase() === 'overloaded'
                                                            ? 'bg-red-50 text-red-700 border-red-100'
                                                            : status.toLowerCase() === 'light work'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : status.toLowerCase() === 'training'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                            : status.toLowerCase() === 'competition'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-green-50 text-green-700 border-green-100';

                                                        return (
                                                            <div key={log.id} className="bg-[#fdfaf7]/40 border border-gray-100 rounded-[2rem] p-6 hover:bg-[#fdfaf7]/80 transition-colors shadow-sm relative group">
                                                                {/* Edit/Delete Actions */}
                                                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleOpenEditModal(log)}
                                                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteRecord(log.id)}
                                                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pr-16">
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

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfaf7]/50">
                            <h2 className="text-xl font-black text-[#1e2330] tracking-tight">
                                {isEditing ? 'Edit' : 'Log'} {activeTab === 'vaccinations' ? 'Vaccination' : 'Health Record'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="p-8 space-y-5">
                            {activeTab === 'vaccinations' ? (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Vaccine Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={vaccineForm.name}
                                            onChange={e => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            placeholder="e.g. Rabies Vaccine"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Administered Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={vaccineForm.date}
                                                onChange={e => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Next Date (Optional)</label>
                                            <input
                                                type="date"
                                                value={vaccineForm.nextDate}
                                                onChange={e => setVaccineForm({ ...vaccineForm, nextDate: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Batch Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={vaccineForm.batchNumber}
                                            onChange={e => setVaccineForm({ ...vaccineForm, batchNumber: e.target.value })}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            placeholder="e.g. BAT-90823"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Notes</label>
                                        <textarea
                                            rows={3}
                                            value={vaccineForm.notes}
                                            onChange={e => setVaccineForm({ ...vaccineForm, notes: e.target.value })}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-semibold text-gray-600 focus:outline-none focus:border-[#964C2E]/30"
                                            placeholder="Any reactions or clinical remarks..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Record Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={healthForm.title}
                                                onChange={e => setHealthForm({ ...healthForm, title: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                                placeholder="e.g. Injury Checkup"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Health Status</label>
                                            <select
                                                value={healthForm.status}
                                                onChange={e => setHealthForm({ ...healthForm, status: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            >
                                                <option value="Fit">Fit</option>
                                                <option value="Unfit">Unfit</option>
                                                <option value="Light Work">Light Work</option>
                                                <option value="Training">Training</option>
                                                <option value="Competition">Competition</option>
                                                <option value="Overloaded">Overloaded</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Checkup Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={healthForm.date}
                                                onChange={e => setHealthForm({ ...healthForm, date: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Treatment</label>
                                            <input
                                                type="text"
                                                value={healthForm.treatment}
                                                onChange={e => setHealthForm({ ...healthForm, treatment: e.target.value })}
                                                className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                                placeholder="e.g. Bandage Applied"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Medications (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={healthForm.medicationsInput}
                                            onChange={e => setHealthForm({ ...healthForm, medicationsInput: e.target.value })}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-[#1e2330] focus:outline-none focus:border-[#964C2E]/30"
                                            placeholder="e.g. Penicillin, Calmpose"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Observations / Notes</label>
                                        <textarea
                                            rows={3}
                                            value={healthForm.notes}
                                            onChange={e => setHealthForm({ ...healthForm, notes: e.target.value })}
                                            className="w-full bg-[#fdfaf7] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-semibold text-gray-600 focus:outline-none focus:border-[#964C2E]/30"
                                            placeholder="Diagnostic report details..."
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#964C2E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#7D3F25] transition-all shadow-md shadow-[#964C2E]/10"
                                >
                                    {isEditing ? 'Save Changes' : 'Log Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
