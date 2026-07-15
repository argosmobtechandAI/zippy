import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, User, Clock, AlertCircle, CheckCircle, XCircle, Plus, Trash2, Edit3, Save, Eye, ChevronRight } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { workoutsApi, getAllHorsesApi, getAllUsersApi, updateHorseApi, getAllTrainersApi } from '../api/apis';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const STATUS_TABS = [
    { key: 'ALL', label: 'All Workouts' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' }
];

const WORKOUT_TYPES = [
    'Riding',
    'Lunging',
    'Lunging With Shambone',
    'Lunging with Side rein'
];

const INTENSITIES = ['Light', 'Moderate', 'Heavy'];

const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
};

const getIntensityBadgeClass = (intensity) => {
    const i = intensity?.toLowerCase();
    if (i === 'heavy') return 'bg-orange-100 text-orange-700';
    if (i === 'moderate') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
};

const WorkoutTracker = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);

    const [workouts, setWorkouts] = useState([]);
    const [horses, setHorses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Form state
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        horseId: '',
        trainerId: '',
        date: new Date().toISOString().split('T')[0],
        workoutType: 'Riding',
        duration: 45,
        intensity: 'Moderate',
        status: 'Scheduled',
        notes: ''
    });

    // Trainer pairing inline state
    const [editingTrainerPair, setEditingTrainerPair] = useState(null);
    const [pairedTrainerId, setPairedTrainerId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [workoutRes, horseRes, userRes, trainerRes] = await Promise.all([
                apiFunction(workoutsApi, [], { stableId: selectedStable }, 'GET', true),
                apiFunction(getAllHorsesApi, [], {}, 'GET', true),
                apiFunction(getAllUsersApi, [], {}, 'GET', true),
                apiFunction(getAllTrainersApi, [], {}, 'GET', true)
            ]);

            if (workoutRes?.success) {
                setWorkouts(workoutRes.workouts || []);
            }
            if (horseRes?.success) {
                const stableHorses = (horseRes.horses || []).filter(h => h.stableId === selectedStable || h.stable_id === selectedStable);
                setHorses(stableHorses);
            }
            if (userRes?.success) {
                const stableTrainers = (userRes.users || []).filter(u => u.type?.toLowerCase() === 'trainer');
                setTrainers(stableTrainers);
            }
        } catch (error) {
            toast.error('Failed to load tracker data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStable) {
            fetchData();
        }
    }, [selectedStable]);

    // Handle create/update workout
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.horseId) {
            toast.error('Please select a horse');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                duration: parseInt(formData.duration) || 0,
                stableId: selectedStable
            };

            let res;
            if (editingWorkout) {
                res = await apiFunction(`${workoutsApi}/${editingWorkout.id}`, [], payload, 'PUT', true);
            } else {
                res = await apiFunction(workoutsApi, [], payload, 'POST', true);
            }

            if (res?.success) {
                toast.success(editingWorkout ? 'Workout updated successfully' : 'Workout scheduled successfully');
                setShowModal(false);
                setEditingWorkout(null);
                fetchData();
            } else {
                toast.error(res?.message || 'Action failed');
            }
        } catch {
            toast.error('Network error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete/cancel workout
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workout?')) return;
        try {
            const res = await apiFunction(`${workoutsApi}/${id}`, [], {}, 'DELETE', true);
            if (res?.success) {
                toast.success('Workout deleted successfully');
                fetchData();
            } else {
                toast.error(res?.message || 'Delete failed');
            }
        } catch {
            toast.error('Network error');
        }
    };

    // Quick update status
    const handleStatusUpdate = async (workoutId, newStatus) => {
        try {
            const res = await apiFunction(`${workoutsApi}/${workoutId}`, [], { status: newStatus }, 'PUT', true);
            if (res?.success) {
                toast.success(`Workout status updated to ${newStatus}`);
                fetchData();
            } else {
                toast.error(res?.message || 'Failed to update status');
            }
        } catch {
            toast.error('Network error');
        }
    };

    // Update horse trainer pairing
    const handleTrainerPairSubmit = async (horse) => {
        if (!pairedTrainerId) return;
        try {
            const res = await apiFunction(`${updateHorseApi}/${horse.id}`, [], { trainerId: pairedTrainerId }, 'PUT', true);
            if (res?.success) {
                toast.success(`Trainer assigned to ${horse.name} successfully`);
                setEditingTrainerPair(null);
                fetchData();
            } else {
                toast.error(res?.message || 'Pairing update failed');
            }
        } catch {
            toast.error('Network error');
        }
    };

    // Filtered workouts list
    const filteredWorkouts = useMemo(() => {
        return workouts.filter(w => {
            const matchTab = activeTab === 'ALL' || w.status === activeTab;
            const query = searchQuery.toLowerCase();
            const matchQuery = !query || 
                (w.horseName || '').toLowerCase().includes(query) ||
                (w.trainerName || '').toLowerCase().includes(query) ||
                (w.workoutType || '').toLowerCase().includes(query);
            return matchTab && matchQuery;
        });
    }, [workouts, activeTab, searchQuery]);

    // Metrics calculations
    const metrics = useMemo(() => {
        const scheduled = workouts.filter(w => w.status === 'Scheduled').length;
        const completed = workouts.filter(w => w.status === 'Completed').length;
        const total = workouts.length;
        const rest = workouts.filter(w => w.workoutType === 'Rest').length;
        return { total, scheduled, completed, rest };
    }, [workouts]);

    const openCreateModal = () => {
        setEditingWorkout(null);
        setFormData({
            horseId: horses[0]?.id || '',
            trainerId: trainers[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            workoutType: 'Riding',
            duration: 45,
            intensity: 'Moderate',
            status: 'Scheduled',
            notes: ''
        });
        setShowModal(true);
    };

    const openEditModal = (w) => {
        setEditingWorkout(w);
        setFormData({
            horseId: w.horseId || '',
            trainerId: w.trainerId || '',
            date: w.date || '',
            workoutType: w.workoutType || 'Riding',
            duration: w.duration || 45,
            intensity: w.intensity || 'Moderate',
            status: w.status || 'Scheduled',
            notes: w.notes || ''
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#964C2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-bold text-gray-400">Loading workout tracker...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-5 uppercase tracking-wider">
                        <span>Horses</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Workout Tracker</span>
                    </div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-2 tracking-tight">Equine Workout Tracker</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Schedule horse exercise plans, pair horses with trainers, and track fitness levels.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2 hover:bg-[#7D3F25] transition-all"
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Schedule Workout
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Workouts Scheduled', value: metrics.total, color: 'text-[#1e2330]', bg: 'bg-white' },
                    { label: 'Scheduled / Upcoming', value: metrics.scheduled, color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' },
                    { label: 'Completed Workouts', value: metrics.completed, color: 'text-green-600', bg: 'bg-green-50/50 border-green-100' },
                    { label: 'Rest Days Planned', value: metrics.rest, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' }
                ].map(c => (
                    <div key={c.label} className={`border border-[#E6D9CC] rounded-2xl p-5 shadow-sm ${c.bg}`}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.label}</p>
                        <p className={`text-[32px] font-black mt-2 leading-none ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
                
                {/* Main Workouts Section */}
                <div className="flex flex-col gap-4 bg-white border border-[#E6D9CC] rounded-[24px] p-6 shadow-sm">
                    <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
                        {/* Tab filters */}
                        <div className="flex gap-2">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-[#964C2E] text-white'
                                            : 'text-gray-500 hover:bg-[#F6EDE2]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search input */}
                        <div className="flex items-center gap-2 bg-[#F6EDE2] border border-[#E6D9CC]/50 rounded-xl px-3 py-2 w-full sm:max-w-xs">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workouts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-[12px] font-semibold text-[#1e2330] outline-none bg-transparent w-full"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E6D9CC]">
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase">HORSE</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase">TRAINER</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase">DATE</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase">TYPE</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase">DURATION</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">INTENSITY</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">STATUS</th>
                                    <th className="py-3 text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWorkouts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-gray-400 font-bold text-sm">
                                            No workouts scheduled for the current selection.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWorkouts.map((w) => (
                                        <React.Fragment key={w.id}>
                                            <tr className="border-b border-gray-50 hover:bg-[#FDFBF9] transition-colors">
                                                <td className="py-4 font-bold text-[#1e2330] text-[13px]">{w.horseName}</td>
                                                <td className="py-4 text-[12px] font-semibold text-gray-500">{w.trainerName}</td>
                                                <td className="py-4 text-[12px] font-bold text-gray-500">{w.date}</td>
                                                <td className="py-4 font-bold text-[#964C2E] text-[12px]">{w.workoutType}</td>
                                                <td className="py-4 text-[13px] font-semibold text-[#1e2330]">{w.duration} Min</td>
                                                <td className="py-4 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getIntensityBadgeClass(w.intensity)}`}>
                                                        {w.intensity}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadgeClass(w.status)}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {w.status === 'Scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(w.id, 'Completed')}
                                                                    title="Mark Completed"
                                                                    className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(w.id, 'Cancelled')}
                                                                    title="Cancel Workout"
                                                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => openEditModal(w)}
                                                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-[#964C2E] rounded-lg"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(w.id)}
                                                            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {(w.notes || w.trainerComment) && (
                                                <tr className="border-b border-gray-50/50 bg-[#FDFBF9]/30">
                                                    <td colSpan="8" className="px-6 py-2 pb-3">
                                                        <div className="flex gap-4">
                                                            {w.notes ? (
                                                                <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100">
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Stable Notes</span>
                                                                    <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">{w.notes}</p>
                                                                </div>
                                                            ) : null}
                                                            {w.trainerComment ? (
                                                                <div className="flex-1 bg-green-50/20 p-3 rounded-xl border border-green-700/5">
                                                                    <span className="text-[9px] font-black text-green-700/40 uppercase tracking-widest block mb-0.5">Trainer Observation / Comment</span>
                                                                    <p className="text-[11px] text-green-800 font-semibold leading-relaxed">{w.trainerComment}</p>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trainer Pairings Column */}
                <div className="flex flex-col gap-4 bg-white border border-[#E6D9CC] rounded-[24px] p-6 shadow-sm">
                    <div>
                        <h3 className="text-[16px] font-black text-[#1e2330] leading-none mb-1">Trainer Pairings</h3>
                        <p className="text-[11px] font-semibold text-gray-400">Assign a primary trainer to handle each horse's daily routine.</p>
                    </div>

                    <div className="flex flex-col gap-3.5 mt-2">
                        {horses.length === 0 ? (
                            <p className="text-[12px] text-gray-400 font-bold py-4 text-center">No horses in registry</p>
                        ) : (
                            horses.map(h => {
                                const activeAssigned = trainers.find(t => t.id === h.trainerId);
                                const isEditing = editingTrainerPair === h.id;

                                return (
                                    <div key={h.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            {h.imageUrl ? (
                                                <img src={h.imageUrl} className="w-9 h-9 rounded-xl object-cover" alt="horse" />
                                            ) : (
                                                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-sm">🐴</div>
                                            )}
                                            <div>
                                                <h4 className="text-[13px] font-black text-[#1e2330] leading-none mb-0.5">{h.name}</h4>
                                                <span className="text-[10px] text-gray-400 font-bold">{h.title || 'General'}</span>
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <select
                                                    value={pairedTrainerId}
                                                    onChange={e => setPairedTrainerId(e.target.value)}
                                                    className="border border-[#E6D9CC] text-[11px] font-bold text-[#1e2330] rounded-xl px-2 py-1 focus:outline-none"
                                                >
                                                    <option value="">No Trainer</option>
                                                    {trainers.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleTrainerPairSubmit(h)}
                                                    className="p-1 bg-[#964C2E] hover:bg-[#7D3F25] text-white rounded-lg shadow-sm"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTrainerPair(null)}
                                                    className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-black text-[#964C2E]">
                                                    {activeAssigned?.name || 'Unassigned'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingTrainerPair(h.id);
                                                        setPairedTrainerId(h.trainerId || '');
                                                    }}
                                                    className="p-1 hover:bg-[#F6EDE2] text-[#964C2E] rounded-lg"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* Schedule Workout Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-[500px] shadow-2xl p-8 overflow-hidden relative animate-in zoom-in-95 duration-300">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-[20px] font-black text-[#1e2330] tracking-tight">
                                {editingWorkout ? 'Edit Workout Plan' : 'Schedule Workout Plan'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); setEditingWorkout(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Horse field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Horse</label>
                                <select
                                    value={formData.horseId}
                                    onChange={e => setFormData({ ...formData, horseId: e.target.value })}
                                    className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                >
                                    <option value="" disabled>Choose a Horse...</option>
                                    {horses.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Trainer field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Trainer</label>
                                <select
                                    value={formData.trainerId}
                                    onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                                    className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                >
                                    <option value="">Unassigned</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Type field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workout Type</label>
                                    <select
                                        value={formData.workoutType}
                                        onChange={e => setFormData({ ...formData, workoutType: e.target.value })}
                                        className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                    >
                                        {WORKOUT_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Duration field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration (Min)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Intensity field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intensity</label>
                                    <select
                                        value={formData.intensity}
                                        onChange={e => setFormData({ ...formData, intensity: e.target.value })}
                                        className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                    >
                                        {INTENSITIES.map(i => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none"
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes / Special Instructions</label>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-white border border-[#E6D9CC] rounded-xl px-4 py-3 text-[13px] font-bold text-[#1e2330] focus:outline-none placeholder-gray-300"
                                    placeholder="Enter physical observations, instructions..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#964C2E] hover:bg-[#7D3F25] text-white text-[14px] font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 mt-4"
                            >
                                {isSubmitting ? 'Saving...' : (editingWorkout ? 'Update Workout' : 'Schedule Workout')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutTracker;
