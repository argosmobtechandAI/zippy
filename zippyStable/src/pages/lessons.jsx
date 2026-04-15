import { Calendar, UserPlus, Clock, PlayCircle, CheckCircle2, ChevronDown, Edit2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllSessionsApi, getAllHorsesApi, getAllUsersApi } from '../api/apis';

const Lessons = () => {
    const [sessions, setSessions] = useState([]);
    const [horses, setHorses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSession, setEditingSession] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sessionRes, horseRes, userRes] = await Promise.all([
                    apiFunction(getAllSessionsApi, [], {}, "GET", true),
                    apiFunction(getAllHorsesApi, [], {}, "GET", true),
                    apiFunction(getAllUsersApi + "/all", [], {}, "GET", true)
                ]);

                if (sessionRes && sessionRes.success) setSessions(sessionRes.sessions || []);
                if (horseRes && horseRes.success) setHorses(horseRes.horses || []);
                if (userRes && userRes.success) {
                    const allUsers = userRes.users || [];
                    setTrainers(allUsers.filter(u => u.type === 'trainer'));
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
        try {
            const updateData = {
                trainerId: editingSession.trainerId,
                timing: editingSession.timing,
                date: editingSession.date,
                status: editingSession.trainerId ? 'Scheduled' : 'Setup Required'
            };
            const res = await apiFunction(getAllSessionsApi, [editingSession.id], updateData, "PUT", true);
            if (res && res.success) {
                setSessions(sessions.map(s => s.id === editingSession.id ? res.session : s));
                setEditingSession(null);
            }
        } catch (err) {
            console.error("Update lesson failed:", err);
        }
    };

    const enrichedSessions = sessions.map(session => {
        const horse = horses.find(h => h.id === session.horseId);
        const trainer = trainers.find(t => t.id === session.trainerId);
        return { ...session, horse, trainer };
    });

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
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">SCHEDULE SLOT</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-2">SESSION STATUS</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {loading ? (
                        <div className="text-center py-20 font-bold text-gray-400">
                            <div className="animate-pulse mb-2">Loading lessons and assignments...</div>
                        </div>
                    ) : enrichedSessions.length === 0 ? (
                        <div className="text-center py-20 font-bold text-gray-400">No active lessons setup in the stable yet.</div>
                    ) : (
                        enrichedSessions.map((session, idx) => {
                            let statusIcon = <Clock className="w-3.5 h-3.5" />;
                            let statusStyle = "bg-[#E0E7FF] text-[#4338CA]"; 
                            let statusStr = 'Scheduled';

                            if (session.status === 'Ongoing') { 
                                statusIcon = <PlayCircle className="w-3.5 h-3.5" />; 
                                statusStyle = "bg-[#E0F8EC] text-[#059669]"; 
                                statusStr = 'Ongoing';
                            }
                            if (!session.trainerId) { 
                                statusIcon = <UserPlus className="w-3.5 h-3.5" />; 
                                statusStyle = "bg-[#FEE2E2] text-[#DC2626]"; 
                                statusStr = 'Setup Required';
                            }

                            return (
                                <div key={session.id || idx} className={`grid grid-cols-[250px_220px_180px_180px_1fr] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors ${idx === enrichedSessions.length - 1 ? 'border-transparent' : ''}`}>
                                    
                                    {/* 1. Horse Identity */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-[50px] h-[50px] rounded-[16px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                            <img 
                                                src={session.horse?.image || "https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} 
                                                alt={session.horse?.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">{session.horse?.name || "Unassigned Horse"}</h4>
                                            <div className="text-[11px] font-bold text-gray-400">{session.title}</div>
                                        </div>
                                    </div>

                                    {/* 2. Assigned Trainer */}
                                    <div className="pl-2">
                                        {session.trainer ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={session.trainer?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} 
                                                        alt={session.trainer?.name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-[#1e2330] leading-tight">{session.trainer?.name}</h4>
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

                                    {/* 3. Schedule Slot */}
                                    <div>
                                        {!session.timing ? (
                                            <span className="text-[13px] font-bold text-gray-400">Unscheduled</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#964C2E]" />
                                                <span className="text-[13px] font-black text-[#1e2330]">{session.timing} - {session.date}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. Status Pill */}
                                    <div className="pl-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${statusStyle}`}>
                                            {statusIcon} {statusStr}
                                        </span>
                                    </div>

                                    {/* 5. Contextual Action Buttons */}
                                    <div className="flex justify-end gap-3 pr-2">
                                        {statusStr === 'Setup Required' ? (
                                            <button 
                                                onClick={() => setEditingSession({...session})}
                                                className="py-2.5 px-5 w-40 bg-[#964C2E] rounded-xl text-white text-[12px] font-bold hover:bg-[#7D3F25] transition-colors flex justify-center items-center gap-2 shadow-sm"
                                            >
                                                <UserPlus className="w-4 h-4" /> Assign Trainer
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setEditingSession({...session})}
                                                className="py-2.5 px-5 w-40 bg-white border border-[#EACDBA]/80 rounded-xl text-[#964C2E] text-[12px] font-bold hover:bg-[#F9EEE5] transition-all flex justify-center items-center gap-2 shadow-sm"
                                            >
                                                <Edit2 className="w-4 h-4" /> Edit Lesson
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

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
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Assign Trainer</label>
                                <select 
                                    value={editingSession.trainerId || ''}
                                    onChange={(e) => setEditingSession({...editingSession, trainerId: e.target.value})}
                                    className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors appearance-none"
                                >
                                    <option value="">No Trainer - Needs Setup</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Timing</label>
                                    <input 
                                        type="text" required
                                        value={editingSession.timing || ''}
                                        onChange={(e) => setEditingSession({...editingSession, timing: e.target.value})}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                        placeholder="09:00 - 10:30"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase pl-1">Date</label>
                                    <input 
                                        type="text" required
                                        value={editingSession.date || ''}
                                        onChange={(e) => setEditingSession({...editingSession, date: e.target.value})}
                                        className="w-full bg-[#FAFAFA] border border-[#EACDBA]/40 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#964C2E] transition-colors"
                                        placeholder="YYYY-MM-DD"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-[#964C2E] text-white rounded-2xl text-[15px] font-black shadow-lg shadow-[#964C2E]/20 hover:bg-[#7D3F25] transition-all mt-4">
                                Save Assignments
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lessons;
