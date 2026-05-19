import { useState, useEffect } from 'react';
import { Search, MapPin, Tag, ExternalLink, Star, ChevronLeft, ChevronRight, Activity, X } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllUsersApi, getAllTrainersApi, getAllStablesApi, updateTrainerApi, getUserApi } from '../api/apis';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TrainerCard = ({ user, trainers, stables, onUpdateCenterClick, navigate }) => {
    const trainer = trainers.find((trainer) => trainer.userId === user.id);

    return (
        <div className="flex flex-col h-full group bg-white rounded-[32px] p-8 shadow-sm border border-[#EACDBA]/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-[60px] h-[60px] rounded-[18px] bg-[#F9EEE5] overflow-hidden flex items-center justify-center text-xl font-bold text-[#964C2E] shadow-sm border border-[#EACDBA]/40">
                        {user.name && user.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black text-[#1e2330] mb-1 leading-tight">{user.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[#964C2E] text-[10px] font-black tracking-widest uppercase bg-[#F9EEE5] px-2 py-1 rounded-md">{user.title || 'SPECIALIST'}</span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className={`flex items-center gap-1 text-[11px] font-bold ${user.status === 'OFF-DUTY' ? 'text-amber-600' : (user.status === 'ON-LEAVE' ? 'text-red-500' : 'text-[#059669]')}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'OFF-DUTY' ? 'bg-amber-600' : (user.status === 'ON-LEAVE' ? 'bg-red-500' : 'bg-[#059669]')}`}></span>
                                {user.status || 'AVAILABLE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#FCFAF8] rounded-2xl p-4 border border-[#EACDBA]/20">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">WEEKLY LOAD</h4>
                    <p className="text-[16px] font-black text-[#1e2330]">{user.weeklyLoad || 0}<span className="text-[11px] text-gray-400"> slots</span></p>
                </div>
                <div className="bg-[#FCFAF8] rounded-2xl p-4 border border-[#EACDBA]/20">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">SESSIONS (MTD)</h4>
                    <p className="text-[16px] font-black text-[#1e2330]">{user.sessionsMTD || 0}</p>
                </div>
                <div className="bg-[#FCFAF8] rounded-2xl p-4 border border-[#EACDBA]/20">
                    <h4 className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">ACCURACY</h4>
                    <div className="flex items-center gap-1">
                        <p className="text-[16px] font-black text-[#1e2330]">{Number(user.rating || 5.0).toFixed(1)}</p>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                </div>
            </div>

            <div className="mt-auto grid grid-cols-1 gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onUpdateCenterClick === 'function') {
                            onUpdateCenterClick();
                        }
                    }}
                    className="py-4 rounded-xl border border-[#964C2E]/20 text-[#964C2E] text-[12px] font-black uppercase tracking-wider hover:bg-[#F9EEE5] transition-all"
                >
                    {trainer?.stableId ? 'Update Center / Role' : 'Assign Center'}
                </button>
            </div>
        </div>
    );
};

const UpdateCenterModal = ({ user, trainer, stables, onClose, onSuccess }) => {
    const [selectedStable, setSelectedStable] = useState(trainer?.stableId || "");
    const [isHeadTrainer, setIsHeadTrainer] = useState(trainer?.title === "Head Trainer" || user.title === "Head Trainer");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStable) {
            toast.error("Please select a center");
            return;
        }

        setIsSubmitting(true);
        try {
            const centerRes = await apiFunction(updateTrainerApi, [trainer?.id], {
                stableId: selectedStable,
            }, "PUT", true);

            const statusStr = isHeadTrainer ? "Head Trainer" : "Trainer";
            const statusRes = await apiFunction(updateTrainerApi, [trainer?.id], {
                stableId: selectedStable,
                title: statusStr
            }, "PUT", true);

            if (centerRes.success || statusRes.success) {
                toast.success("Trainer updated successfully");
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to update trainer details");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-10 w-[450px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1e2330]">Update Center</h3>
                        <p className="text-[13px] font-bold text-gray-400 mt-1">Assign {user.name} to a stable</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">SELECT STABLE / CENTER</label>
                        <select
                            value={selectedStable}
                            onChange={(e) => setSelectedStable(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] transition-all"
                        >
                            <option value="">Select a center...</option>
                            {stables.map(stable => (
                                <option key={stable.id} value={stable.id}>{stable.name} ({stable.location})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                        <input
                            type="checkbox"
                            id="headTrainer"
                            checked={isHeadTrainer}
                            onChange={(e) => setIsHeadTrainer(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#964C2E] focus:ring-[#964C2E]"
                        />
                        <label htmlFor="headTrainer" className="text-[13px] font-black text-[#1e2330] cursor-pointer flex-1">
                            Make Head Trainer
                            <span className="block text-[11px] font-semibold text-gray-400 mt-0.5">Assign as the lead specialist for this center.</span>
                        </label>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-[#964C2E] text-white py-4 rounded-[20px] font-black text-[14px] uppercase tracking-wider shadow-xl hover:bg-[#7D3F25] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const TrainerManagement = () => {
    const [users, setUsers] = useState([]);

    const {selectedStable} = useSelector((state) => state.getDataReducer);
    const [trainers, setTrainers] = useState([]);
    const [stables, setStables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updateCenterModal, setUpdateCenterModal] = useState(null);
    const navigate = useNavigate();

    console.log(selectedStable, "fkw")

    const fetchUsers = async () => {
        setLoading(true);
        const res = await apiFunction(getAllUsersApi, [], {}, "GET", true);
        console.log(res, "ress")
        if (res && res.success) {
            // Only keep trainers
            setUsers(res.users.filter(u => u.type === 'trainer'));
        }
        setLoading(false);
    }

    const fetchTrainers = async () => {
        const res = await apiFunction(getAllTrainersApi, [], {}, "GET", true);
        if (res && res.success) {
            setTrainers(res.trainers.filter(trainer => trainer.stableId === selectedStable));
        }
    }

    const fetchStables = async () => {
        const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);
        if (res && res.success) {
            setStables(res.stables);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchTrainers();
        fetchStables();
    }, []);

    const filteredUsers = users.filter(user => {
        const trainer = trainers.find(t =>t.userId === user.id)
        
        const search = searchQuery.toLowerCase();
        if(trainer){

            return (user.name?.toLowerCase() || "").includes(search) ||
                   (user.email?.toLowerCase() || "").includes(search) ||
                   (user.mobile || "").includes(searchQuery);
        }else{
            return false
        }
    });

    console.log(users, "fiekfws")

    return (
        <div className="w-full min-h-full flex flex-col bg-[#F9EEE5] p-10 font-sans max-w-[1400px] mx-auto pb-20">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Trainer Directory</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Manage trainers, assignments, and roles across the stable network.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trainers by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#EACDBA]/40 rounded-2xl py-3.5 pl-12 pr-4 text-[14px] font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#964C2E]/20 focus:border-[#964C2E] transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {loading ? (
                    <div className="col-span-full text-center py-20 font-bold text-gray-400">Loading trainers...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-20 font-bold text-gray-400 bg-white rounded-3xl border border-dashed border-[#EACDBA]/50">
                        No trainers found.
                    </div>
                ) : (
                    filteredUsers.map((user, index) => (
                        <TrainerCard
                            key={user.id || index}
                            user={user}
                            trainers={trainers}
                            stables={stables}
                            onUpdateCenterClick={() => setUpdateCenterModal({ user, trainer: trainers.find(t => t.userId === user.id) })}
                            navigate={navigate}
                        />
                    ))
                )}
            </div>

            {updateCenterModal && (
                <UpdateCenterModal
                    user={updateCenterModal.user}
                    trainer={updateCenterModal.trainer}
                    stables={stables}
                    onClose={() => setUpdateCenterModal(null)}
                    onSuccess={() => {
                        fetchUsers();
                        fetchTrainers();
                    }}
                />
            )}
        </div>
    );
};

export default TrainerManagement;
