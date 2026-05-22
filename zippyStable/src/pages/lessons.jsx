import { Calendar, UserPlus, Clock, PlayCircle, CheckCircle2, ChevronDown, Edit2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllSessionsApi, getAllHorsesApi, getAllUsersApi, getHorsesByStableApi, assignTrainerApi, getAllTrainersApi, createSessionApi } from '../api/apis';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const Lessons = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer)
    const [horses, setHorses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [allTrainers, setAllTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSession, setEditingSession] = useState(null);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [viewingSessions, setViewingSessions] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const horseRes = await apiFunction(getHorsesByStableApi, [selectedStable], {}, "GET", true)

                if (horseRes.success) {
                    setHorses(horseRes.horses)

                }

                const trainersRes = await apiFunction(getAllUsersApi, [], {}, "GET", true)
                if (trainersRes.success) {
                    setTrainers(trainersRes.users.filter((user) => user?.type?.toLowerCase() === "trainer"))
                }


                const trainersAll = await apiFunction(getAllTrainersApi, [], {}, "GET", true)
                console.log(trainersAll, "trainersAll")
                if (trainersAll.success) {
                    setAllTrainers(trainersAll.trainers)
                }


            } catch (error) {
                console.error("Fetch lessons data error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);


    const handleUpdateLesson = async (e) => {
        e.preventDefault();

        // Check for time overlap
        const existingSessionsOnDate = editingSession.session?.filter(s => s.date === editingSession.date && s.status?.toLowerCase() !== 'unavailable') || [];

        const hasOverlap = existingSessionsOnDate.some(s => {
            try {
                const [start1, end1] = editingSession.timing.split('-').map(t => t.trim());
                const [start2, end2] = s.timing.split('-').map(t => t.trim());

                let t1Start = new Date(`1970-01-01T${start1.length === 4 ? '0' + start1 : start1}:00`);
                let t1End = new Date(`1970-01-01T${end1.length === 4 ? '0' + end1 : end1}:00`);
                let t2Start = new Date(`1970-01-01T${start2.length === 4 ? '0' + start2 : start2}:00`);
                let t2End = new Date(`1970-01-01T${end2.length === 4 ? '0' + end2 : end2}:00`);

                if (!isNaN(t1Start) && !isNaN(t1End) && !isNaN(t2Start) && !isNaN(t2End)) {
                    return t1Start < t2End && t2Start < t1End;
                }
            } catch (e) { }
            return s.timing.toLowerCase().trim() === editingSession.timing.toLowerCase().trim();
        });

        if (hasOverlap) {
            toast.error("This horse already has an active session overlapping this time block.");
            return;
        }

        try {
            const updateData = {
                horseId: editingSession.id,
                timing: editingSession.timing,
                date: editingSession.date,
                status: 'UnAvailable',
                title: "Unavailable",
                trainerId: null,
                participants: [],
                duration: 0,
                location: "",
                totalSeats: 0,
                note: "",
            };
            const res = await apiFunction(createSessionApi, [], updateData, "POST", true);
            if (res && res.success) {
                toast.success("Lesson updated successfully")
                setEditingSession(null)
            }
        } catch (err) {
            console.error("Update lesson failed:", err);
        }
    };

    const handleAssignTrainer = async (trainerId) => {

        try {

            const res = await apiFunction(assignTrainerApi, [editingTrainer.id], { trainerId }, "PUT", true);
            if (res && res.success) {
                toast.success("Trainer assigned successfully")
                setEditingTrainer(null)
            }
        } catch (err) {
            console.error("Assign trainer failed:", err);
        }
    };


    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Header section */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Lesson Assignments</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Pair available horses with trainers and dispatch them to specific lesson slots.</p>
                </div>
            </div>

            {/* Assignment Tracking Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EACDBA]/40 overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-[250px_220px_180px_180px_1fr] gap-4 py-5 px-8 border-b border-[#EACDBA]/40 bg-[#FAFAFA]/50">
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">HORSE IDENTITY</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-2">ASSIGNED TRAINER</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">Total Sessions</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-2">Today's SESSION </div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-20 font-bold text-gray-400">
                            <div className="animate-pulse mb-2">Loading lessons and assignments...</div>
                        </div>
                    ) : horses?.length === 0 ? (
                        <div className="text-center py-20 font-bold text-gray-400">No active lessons setup in the stable yet.</div>
                    ) : (
                        horses?.map((horse, idx) => {
                            let statusIcon = <Clock className="w-3.5 h-3.5" />;
                            let statusStyle = "bg-[#E0E7FF] text-[#4338CA]";
                            let todaySession = horse?.session?.filter((session) => session?.date === new Date().toISOString().split('T')[0]);



                            return (
                                <div key={horse.id || idx} className={`grid grid-cols-[250px_220px_180px_180px_1fr] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors ${idx === horses.length - 1 ? 'border-transparent' : ''}`}>

                                    {/* 1. Horse Identity */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-[50px] h-[50px] rounded-[16px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                            <img
                                                src={horse?.imageUrl || "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"}
                                                alt={horse?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">{horse?.name || "Unassigned Horse"}</h4>
                                            <div className="text-[11px] font-bold text-gray-400">{horse.title}</div>
                                        </div>
                                    </div>

                                    {/* 2. Assigned Trainer */}
                                    <div className="pl-2">
                                        {horse.trainer?.length > 0 ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-gray-200">
                                                    <img
                                                        src={horse.trainer[0]?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"}
                                                        alt={horse.trainer[0]?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-[#1e2330] leading-tight">{horse.trainer[0]?.name}</h4>
                                                    <div className="text-[11px] font-bold text-gray-400">Riding Specialist</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="w-[36px] h-[36px] rounded-full bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center">
                                                    <UserPlus className="w-4 h-4 text-gray-300" />
                                                </div>
                                                <span className="text-[13px] font-bold">No Trainer Set</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Total Sessions  */}
                                    <div>
                                        {horse?.session?.length > 0 ? (
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors w-fit -ml-2"
                                                onClick={() => setViewingSessions({ title: "Total Sessions", sessions: horse.session })}
                                            >
                                                <Calendar className="w-4 h-4 text-[#964C2E]" />
                                                <span className="text-[13px] font-black text-[#1e2330]">{horse?.session?.length}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[13px] font-bold text-gray-400">Unscheduled</span>
                                        )}
                                    </div>

                                    {/* 4. Today Session */}
                                    <div className="pl-2">
                                        {todaySession?.length > 0 ? (
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${statusStyle}`}
                                                onClick={() => setViewingSessions({ title: "Today's Sessions", sessions: todaySession })}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[#964C2E]" />
                                                    <span className="text-[13px] font-black text-[#1e2330]">{todaySession?.length}</span>
                                                </div>
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${statusStyle} bg-gray-100 text-gray-400`}>
                                                <span className="text-[13px] font-bold text-gray-400">Unscheduled</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* 5. Contextual Action Buttons */}
                                    <div className="flex justify-end gap-3 pr-2">
                                        {horse?.trainer?.length === 0 ? (
                                            <button
                                                onClick={() => setEditingTrainer(horse)}
                                                className="py-2.5 px-5 w-40 bg-[#964C2E] rounded-xl text-white text-[12px] font-bold hover:bg-[#7D3F25] transition-colors flex justify-center items-center gap-2 shadow-sm"
                                            >
                                                <UserPlus className="w-4 h-4" /> Assign Trainer
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setEditingSession(horse)}
                                                className="py-2.5 px-5 w-40 bg-white border border-[#EACDBA]/80 rounded-xl text-[#964C2E] text-[12px] font-bold hover:bg-[#F9EEE5] transition-all flex justify-center items-center gap-2 shadow-sm"
                                            >
                                                <Edit2 className="w-4 h-4" /> Make Unavailable
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Trainers Modal */}
            {editingTrainer && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="text-[24px] font-black text-[#1e2330]">Assign Trainer</h2>
                            <button onClick={() => setEditingTrainer(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col gap-4 overflow-y-auto">
                            {trainers.length === 0 ? (
                                <div className="text-center text-gray-400 font-bold">No trainers available</div>
                            ) : (
                                trainers.map(trainer => (
                                    <div key={trainer.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                                <img src={trainer.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} alt={trainer.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#1e2330]">{trainer.name}</div>
                                                <div className="text-xs text-gray-500 font-semibold">{trainer.email}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAssignTrainer(trainer.id)} className="px-4 py-2 bg-[#964C2E] text-white rounded-lg text-sm font-bold hover:bg-[#7D3F25]">
                                            Assign
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions Modal */}
            {viewingSessions && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[600px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="text-[24px] font-black text-[#1e2330]">{viewingSessions.title}</h2>
                            <button onClick={() => setViewingSessions(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col gap-4 overflow-y-auto">
                            {viewingSessions.sessions.filter(s => s.status?.toLowerCase() !== 'unavailable').length === 0 ? (
                                <div className="text-center text-gray-400 font-bold">No active sessions found</div>
                            ) : (
                                viewingSessions.sessions
                                    .filter(s => s.status?.toLowerCase() !== 'unavailable')
                                    .map((session, idx) => {
                                        const user = allTrainers.find(t => t.id === session.trainerId);
                                        console.log(user)
                                        const trainer = trainers.find(t => t.id === user?.userId);
                                        console.log(trainer)
                                        return (
                                            <div key={session.id || idx} className="flex items-center justify-between p-5 border border-gray-100 rounded-[20px] bg-[#FAFAFA]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[#964C2E]" />
                                                        <span className="text-[14px] font-bold text-[#1e2330]">{session.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-[#964C2E]" />
                                                        <span className="text-[14px] font-bold text-[#1e2330]">{session.timing}</span>
                                                    </div>
                                                </div>
                                                {trainer && (
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[12px] font-bold text-gray-400">TRAINER</p>
                                                        <div className="w-8 h-8 rounded-full overflow-hidden">
                                                            <img src={trainer.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} className="w-full h-full object-cover" alt="Trainer" />
                                                        </div>
                                                        <span className="text-[14px] font-black">{trainer.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lesson Modal */}
            {editingSession && (
                <div className="fixed inset-0 bg-[#1e2330]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-[24px] font-black text-[#1e2330]">Manage Lesson</h2>
                            <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateLesson} className="p-8 flex flex-col gap-5">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Date</label>
                                    <input
                                        type="date" required
                                        value={editingSession.date || ''}
                                        onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Timing</label>
                                    <input
                                        type="text" required
                                        value={editingSession.timing || ''}
                                        onChange={(e) => setEditingSession({ ...editingSession, timing: e.target.value })}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                        placeholder="09:00 - 10:30"
                                    />
                                </div>
                            </div>
                            {editingSession.date && editingSession.session?.filter(s => s.date === editingSession.date && s.status?.toLowerCase() !== 'unavailable').length > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-2">
                                    <p className="text-[12px] font-bold text-red-600">Currently assigned sessions on {editingSession.date}:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {editingSession.session.filter(s => s.date === editingSession.date && s.status?.toLowerCase() !== 'unavailable').map((s, idx) => (
                                            <span key={idx} className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-lg text-[12px] font-black shadow-sm">
                                                {s.timing}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-red-500/80 mt-1">* You cannot make times unavailable if they overlap with the sessions above.</p>
                                </div>
                            )}
                            <button type="submit" className="w-full py-4 bg-[#964C2E] text-white rounded-2xl text-[15px] font-black shadow-lg shadow-[#964C2E]/20 hover:bg-[#7D3F25] transition-all mt-4">
                                Make Unavailable
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lessons;
