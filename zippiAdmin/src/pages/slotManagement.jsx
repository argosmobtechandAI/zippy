import { 
    Clock, Calendar, ChevronRight, Ban, Edit, 
    CheckCircle2, Circle, MoreVertical, Download, 
    ChevronDown, Info, ShieldAlert, CheckSquare, List, LayoutGrid
} from 'lucide-react';

const SlotManagement = () => {
    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#F6EDE2] w-full font-sans">
            {/* Top Breadcrumb & Header section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                    <span>Centers</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Lexington Stables</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#964C2E] border-b-2 border-[#964C2E] pb-0.5">Slot Management</span>
                </div>
                
                <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Slot & Booking Control</h1>
                <p className="text-[14px] font-semibold text-gray-500 mb-8">Manage daily equestrian sessions and rider capacities for Oct 24, 2023.</p>

                <div className="flex gap-4">
                    <button className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all">
                        <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                        Edit Center Timings
                    </button>
                    <button className="bg-[#964C2E] text-white text-[13px] font-bold px-5 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all">
                        <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        Add Special Event
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-6 mb-12">
                {/* Total Slots */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Total Slots</h3>
                    <p className="text-[26px] font-black text-[#1e2330] tracking-tight">12 Sessions</p>
                </div>
                {/* Available */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Available</h3>
                    <p className="text-[26px] font-black text-[#22C55E] tracking-tight">4 Slots</p>
                </div>
                {/* Pending */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Pending Approv.</h3>
                    <p className="text-[26px] font-black text-[#964C2E] tracking-tight relative inline-block">
                        8 Requests
                        <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#964C2E] rounded-full"></span>
                    </p>
                </div>
                {/* Total Bookings */}
                <div className="bg-[#F0E4D5] rounded-xl p-6 border border-[#E3CDBC]/50 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-2">Total Bookings</h3>
                    <p className="text-[26px] font-black text-[#1e2330] tracking-tight">42 Riders</p>
                </div>
            </div>

            {/* Morning & Afternoon Sessions */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-bold text-[#1e2330]">Morning & Afternoon Sessions</h2>
                    <div className="bg-[#F0E4D5] border border-[#E3CDBC]/50 p-1 rounded-xl flex items-center">
                        <button className="px-5 py-2 text-[11px] font-bold bg-white text-[#1e2330] shadow-sm rounded-lg flex items-center gap-2">
                            Grid View
                        </button>
                        <button className="px-5 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-700 flex items-center gap-2">
                            List View
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {/* Card 1: Active */}
                    <div className="bg-[#F3E7D9] border-2 border-[#964C2E] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[240px]">
                        <div>
                            <span className="inline-block bg-[#964C2E] text-[10px] font-black text-white px-3 py-1 mb-4 tracking-wider uppercase">ACTIVE</span>
                            <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-1">08:00 AM - 09:30 AM</h3>
                            <p className="text-[13px] font-medium text-gray-500 mb-5">Morning Training - Advanced</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2">
                                <span>Capacity Utilization</span>
                                <span className="text-[#1e2330]">8/10 Riders</span>
                            </div>
                            <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6">
                                <div className="bg-[#964C2E] h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm">
                                    <Ban className="w-3.5 h-3.5 text-gray-500" /> Block
                                </button>
                                <button className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm">
                                    <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Blocked */}
                    <div className="bg-[#F8F4F0] border border-[#EFE5DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[240px] relative overflow-hidden">
                        {/* Huge BLOCKED watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <span className="text-[50px] font-black tracking-tighter text-[#E5DCD4] -rotate-12 opacity-80">BLOCKED</span>
                        </div>
                        <div className="relative z-10 opacity-50">
                            <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-1 mt-6">10:00 AM - 11:30 AM</h3>
                            <p className="text-[13px] font-medium text-gray-500 mb-5">Stable Maintenance</p>
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2">
                                <span>Capacity Utilization</span>
                                <span className="text-[#1e2330]">0/0 Riders</span>
                            </div>
                            <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6">
                                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <button className="w-full bg-[#C2856E] text-white py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#A9705A] transition-colors">
                                Unblock Slot
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Normal */}
                    <div className="bg-[#F5EBE1] border border-[#E6D9CC] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[240px]">
                        <div>
                            <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-1 mt-6">12:00 PM - 01:30 PM</h3>
                            <p className="text-[13px] font-medium text-gray-500 mb-5">Intermediate Jumping</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2">
                                <span>Capacity Utilization</span>
                                <span className="text-[#1e2330]">4/12 Riders</span>
                            </div>
                            <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6">
                                <div className="bg-[#964C2E] h-2 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-[#F9F4EE] border border-[#E6D9CC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 hover:bg-white transition-colors">
                                    <Ban className="w-3.5 h-3.5 text-gray-500" /> Block
                                </button>
                                <button className="flex-1 bg-[#F9F4EE] border border-[#E6D9CC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 hover:bg-white transition-colors">
                                    <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Full */}
                    <div className="bg-[#F5EBE1] border border-[#E6D9CC] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[240px]">
                        <div>
                            <h3 className="text-[17px] font-black text-[#1e2330] tracking-tight mb-1 mt-6">02:00 PM - 03:30 PM</h3>
                            <p className="text-[13px] font-medium text-gray-500 mb-5">Pony Club (Kids)</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-2">
                                <span>Capacity Utilization</span>
                                <span className="text-[#EF4444] font-black">FULL</span>
                            </div>
                            <div className="w-full bg-[#E5D7C9] h-2 rounded-full mb-6">
                                <div className="bg-[#EF4444] h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-[#F9F4EE] border border-[#E6D9CC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
                                    <List className="w-3.5 h-3.5 text-gray-500" /> Modify Cap.
                                </button>
                                <button className="flex-1 bg-[#F9F4EE] border border-[#E6D9CC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
                                    <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Booking Details */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-bold text-[#1e2330]">Today's Booking Details</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-white border border-[#E6D9CC] rounded-xl py-2.5 pl-4 pr-10 text-[13px] font-bold text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/50">
                                <option>All Sessions</option>
                                <option>Morning Training</option>
                                <option>Intermediate Jumping</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button className="flex items-center gap-2 text-[13px] font-bold text-[#CAB4A2] hover:text-[#964C2E] transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-2">
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">RIDER NAME</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">SESSION SLOT</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">HORSE ASSIGNED</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">PAID</div>
                    <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* List Body */}
                <div className="flex flex-col gap-6">
                    {/* Row 1 - Sarah Jenkins */}
                    <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 items-center bg-[#F6EDE2] border-b border-[#E6D9CC] pb-6">
                        <div className="flex items-center gap-4 pl-2">
                            <div className="w-[120px] h-[140px] rounded-sm overflow-hidden border-2 border-white shadow-sm border-b-4 border-b-[#964C2E]">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-[#1e2330] mb-0.5">Sarah<br/>Jenkins</h4>
                                <p className="text-[11px] font-semibold text-gray-500 leading-tight">Elite<br/>Member</p>
                            </div>
                        </div>
                        <div className="text-[13px] font-bold text-[#1e2330] leading-tight">08:00 AM -<br/>09:30 AM</div>
                        <div className="text-[13px] font-medium text-gray-500">Midnight<br/>Shadow</div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-2.5 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase bg-[#FEF3C7] text-[#92400E] shadow-sm">
                                PENDING<br/>APPROVAL
                            </span>
                        </div>
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-6 h-6 text-[#22C55E]" strokeWidth={2} />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 relative top-1">
                            <div className="flex flex-col items-center">
                                <button className="text-[13px] font-bold text-[#964C2E] hover:text-[#7A3D24]">Override<br/>Approval</button>
                                <div className="w-full bg-[#964C2E] h-[2px] mt-1"></div>
                            </div>
                            <Info className="w-3.5 h-3.5 text-gray-400 -mt-3 relative" />
                        </div>
                    </div>

                    {/* Row 2 - Michael Chen */}
                    <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 items-center bg-[#F6EDE2] border-b border-[#E6D9CC] pb-6">
                        <div className="flex items-center gap-4 pl-2">
                            <div className="w-[120px] h-[140px] rounded-sm overflow-hidden border-2 border-white shadow-sm border-b-4 border-b-[#964C2E]">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Michael Chen" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-[#1e2330] mb-0.5">Michael<br/>Chen</h4>
                                <p className="text-[11px] font-semibold text-gray-500 leading-tight">Standard<br/>Member</p>
                            </div>
                        </div>
                        <div className="text-[13px] font-bold text-[#1e2330] leading-tight">08:00 AM -<br/>09:30 AM</div>
                        <div className="text-[13px] font-medium text-gray-500">Apollo's Pride</div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#D1FAE5] text-[#059669] shadow-sm">
                                CONFIRMED
                            </span>
                        </div>
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-6 h-6 text-[#22C55E]" strokeWidth={2} />
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <button className="bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] px-4 py-2 rounded-xl text-[11px] font-bold shadow-sm hover:bg-[#FEE2E2] transition-colors leading-tight text-center">
                                Force<br/>Cancel
                            </button>
                            <MoreVertical className="w-4 h-4 text-gray-400 ml-1" />
                        </div>
                    </div>

                    {/* Row 3 - Emma Wilson */}
                    <div className="grid grid-cols-[300px_1fr_1fr_120px_80px_150px] gap-4 items-center bg-[#F6EDE2] pb-6">
                        <div className="flex items-center gap-4 pl-2">
                            <div className="w-[120px] h-[140px] rounded-sm overflow-hidden border-2 border-white shadow-sm border-b-4 border-b-[#964C2E]">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Emma Wilson" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-[#1e2330] mb-0.5">Emma<br/>Wilson</h4>
                                <p className="text-[11px] font-semibold text-gray-500 leading-tight">Trial<br/>Class</p>
                            </div>
                        </div>
                        <div className="text-[13px] font-bold text-[#1e2330] leading-tight">12:00 PM -<br/>01:30 PM</div>
                        <div className="text-[13px] font-medium text-gray-500">Desert Rose</div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#DBEAFE] text-[#2563EB] shadow-sm">
                                CHECKED IN
                            </span>
                        </div>
                        <div className="flex justify-center">
                            <Circle className="w-6 h-6 text-[#D5C9B9]" strokeWidth={2} />
                        </div>
                        <div className="flex items-center justify-end gap-1 w-full translate-y-1">
                            <span className="text-[12px] font-bold text-[#A59588] tracking-wide inline-flex text-right mr-3">
                                Session Live
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotManagement;
