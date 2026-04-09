import { Calendar, UserPlus, Clock, PlayCircle, CheckCircle2, ChevronDown, Edit2 } from 'lucide-react';

const Lessons = () => {
    // MOCK DATA structure handling trainer assignments and scheduling
    const activeLessons = [
        { 
            horse: { name: 'Thunder', type: 'Show Jumping', img: 'https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            trainer: { name: 'Marcus Thorne', role: 'Senior Trainer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            time: 'Today, 14:00 PM',
            status: 'Scheduled'
        },
        { 
            horse: { name: 'Bella', type: 'Dressage', img: 'https://images.unsplash.com/photo-1534068590799-09895a7090aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            trainer: null,
            time: 'Unscheduled',
            status: 'Setup Required'
        },
        { 
            horse: { name: 'Spirit', type: 'Beginner Lessons', img: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            trainer: { name: 'Elena Richardson', role: 'Head Trainer', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            time: 'Today, 09:00 AM',
            status: 'Ongoing'
        },
        { 
            horse: { name: 'Luna', type: 'Trail Riding', img: 'https://images.unsplash.com/photo-1543015467-f41857c0a9cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            trainer: null,
            time: 'Unscheduled',
            status: 'Setup Required'
        },
        { 
            horse: { name: 'Apollo', type: 'Advanced Flatwork', img: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            trainer: { name: 'Julianne Smith', role: 'Director', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
            time: 'Yesterday, 16:00 PM',
            status: 'Completed'
        }
    ];

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
                    {activeLessons.map((session, idx) => {
                        // Dynamic Status Styling
                        let statusIcon = <Clock className="w-3.5 h-3.5" />;
                        let statusStyle = "bg-[#E0E7FF] text-[#4338CA]"; // Scheduled / Blue

                        if (session.status === 'Ongoing') { 
                            statusIcon = <PlayCircle className="w-3.5 h-3.5" />; 
                            statusStyle = "bg-[#E0F8EC] text-[#059669]"; // Green
                        }
                        if (session.status === 'Setup Required') { 
                            statusIcon = <UserPlus className="w-3.5 h-3.5" />; 
                            statusStyle = "bg-[#FEE2E2] text-[#DC2626]"; // Red
                        }
                        if (session.status === 'Completed') { 
                            statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />; 
                            statusStyle = "bg-gray-100 text-gray-500"; // Grey
                        }

                        return (
                            <div key={idx} className={`grid grid-cols-[250px_220px_180px_180px_1fr] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors ${idx === activeLessons.length - 1 ? 'border-transparent' : ''}`}>
                                
                                {/* 1. Horse Identity */}
                                <div className="flex items-center gap-4">
                                    <div className="w-[50px] h-[50px] rounded-[16px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                        <img src={session.horse.img} alt={session.horse.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">{session.horse.name}</h4>
                                        <div className="text-[11px] font-bold text-gray-400">{session.horse.type}</div>
                                    </div>
                                </div>

                                {/* 2. Assigned Trainer */}
                                <div className="pl-2">
                                    {session.trainer ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-gray-200">
                                                <img src={session.trainer.img} alt={session.trainer.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-[#1e2330] leading-tight">{session.trainer.name}</h4>
                                                <div className="text-[11px] font-bold text-gray-400">{session.trainer.role}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div className="w-[36px] h-[36px] rounded-full bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center">
                                                <UserPlus className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <span className="text-[13px] font-bold italic">No Trainer Set</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Schedule Slot */}
                                <div>
                                    {session.status === 'Setup Required' ? (
                                        <span className="text-[13px] font-bold text-gray-400 italic">Unscheduled</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#964C2E]" />
                                            <span className="text-[13px] font-black text-[#1e2330]">{session.time}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Status Pill */}
                                <div className="pl-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${statusStyle}`}>
                                        {statusIcon} {session.status}
                                    </span>
                                </div>

                                {/* 5. Contextual Action Buttons */}
                                <div className="flex justify-end gap-3 pr-2">
                                    {session.status === 'Setup Required' ? (
                                        // Empty state action (Needs Trainer)
                                        <button className="py-2.5 px-5 w-40 bg-[#964C2E] rounded-xl text-white text-[12px] font-bold hover:bg-[#7D3F25] transition-colors flex justify-center items-center gap-2 shadow-sm">
                                            <UserPlus className="w-4 h-4" /> Assign Trainer
                                        </button>
                                    ) : (
                                        // Scheduled/Active state actions (Can Edit/Modify)
                                        <button className="py-2.5 px-5 w-40 bg-white border border-[#EACDBA]/80 rounded-xl text-[#964C2E] text-[12px] font-bold hover:bg-[#F9EEE5] transition-all flex justify-center items-center gap-2 shadow-sm">
                                            <Edit2 className="w-4 h-4" /> Edit Lesson
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Lessons;
