import {
    Plus, Activity, CheckCircle2, AlertTriangle, AlertCircle,
    BellRing, Eye, Ban, ChevronDown, ChevronLeft, ChevronRight, BedDouble, Wrench
} from 'lucide-react';

const Inventory = () => {
    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Header section */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[32px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Horse Workload & Health</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Monitor daily sessions, weekly training averages, and fitness status.</p>
                </div>

                <button className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    Add New Horse
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Total Horses */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#F5EBE1] flex items-center justify-center text-[#964C2E]">
                        <Activity className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">TOTAL HORSES</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">42</p>
                    </div>
                </div>

                {/* Fit for Work */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#E0F8EC] flex items-center justify-center text-[#059669]">
                        <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">FIT FOR WORK</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">35</p>
                    </div>
                </div>

                {/* Near Limits */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                        <AlertTriangle className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">NEAR LIMITS</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">5</p>
                    </div>
                </div>

                {/* Rest Required */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EACDBA]/40 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                        <AlertCircle className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#8595A6] tracking-widest uppercase mb-1">REST REQUIRED</h3>
                        <p className="text-[26px] font-black text-[#1e2330] leading-none">2</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-6">
                <button className="px-6 py-2.5 rounded-full bg-[#964C2E] text-white text-[13px] font-bold shadow-sm flex items-center gap-2">
                    All Horses <ChevronDown className="w-4 h-4" />
                </button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-sm transition-colors flex items-center gap-2">
                    Schooling <span className="text-[10px]">🐴</span>
                </button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-sm transition-colors flex items-center gap-2">
                    Bridging <span className="text-[10px]">🔗</span>
                </button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-sm transition-colors flex items-center gap-2">
                    Competitive <span className="text-[10px]">🏆</span>
                </button>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EACDBA]/40 overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 py-5 px-8 border-b border-[#EACDBA]/40 bg-[#FAFAFA]/50">
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">HORSE NAME</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">CATEGORY</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-center leading-tight">SESSIONS<br />TODAY</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase text-left leading-tight">WEEKLY TRAINING<br />AVG</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-4">HEALTH STATUS</div>
                    <div className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">SYSTEM ALERTS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {/* Row 1 - Thunder */}
                    <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                <img src="https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="Thunder" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">Thunder</h4>
                                <div className="text-[11px] font-bold text-gray-400">Stall B-12</div>
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-[#E0E7FF] text-[#4338CA]">
                                Schooling
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-[18px] font-black text-[#DC2626] mb-1">4/4</div>
                            <div className="w-10 h-[3px] bg-[#DC2626] rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#F5EBE1] h-2 rounded-full overflow-hidden">
                                <div className="bg-[#964C2E] h-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-[13px] font-black text-[#1e2330]">85%</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" strokeWidth={2.5} />
                            <span className="text-[13px] font-bold text-[#059669]">Fit for Work</span>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                <BellRing className="w-3.5 h-3.5" /> LIMIT REACHED
                            </span>
                        </div>
                    </div>

                    {/* Row 2 - Bella */}
                    <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                <img src="https://images.unsplash.com/photo-1534068590799-09895a7090aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="Bella" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">Bella</h4>
                                <div className="text-[11px] font-bold text-gray-400">Stall A-05</div>
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#7E22CE]">
                                Competitive
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-[18px] font-black text-[#1e2330] mb-1">2/3</div>
                            <div className="w-10 h-[3px] bg-[#F5EBE1] rounded-full relative">
                                <div className="absolute left-0 top-0 h-full bg-[#964C2E] rounded-full" style={{ width: '66%' }}></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#F5EBE1] h-2 rounded-full overflow-hidden">
                                <div className="bg-[#964C2E] h-full" style={{ width: '60%' }}></div>
                            </div>
                            <span className="text-[13px] font-black text-[#1e2330]">60%</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" strokeWidth={2.5} />
                            <span className="text-[13px] font-bold text-[#059669]">Fit for Work</span>
                        </div>
                        <div className="text-[12px] font-semibold text-gray-400 pl-2">
                            No alerts
                        </div>
                    </div>

                    {/* Row 3 - Spirit */}
                    <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-white">
                                <img src="https://images.unsplash.com/photo-1598974357801-cbca100e65d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="Spirit" className="w-full h-full object-cover scale-[1.2]" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">Spirit</h4>
                                <div className="text-[11px] font-bold text-gray-400">Stall C-02</div>
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-[#CCFBF1] text-[#0F766E]">
                                Bridging
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-[18px] font-black text-[#1e2330] mb-1">1/3</div>
                            <div className="w-10 h-[3px] bg-[#F5EBE1] rounded-full relative">
                                <div className="absolute left-0 top-0 h-full bg-[#964C2E] rounded-full" style={{ width: '33%' }}></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#F5EBE1] h-2 rounded-full overflow-hidden">
                                <div className="bg-[#964C2E] h-full" style={{ width: '40%' }}></div>
                            </div>
                            <span className="text-[13px] font-black text-[#1e2330]">40%</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                            <Wrench className="w-4 h-4 text-[#EA580C]" strokeWidth={2.5} />
                            <span className="text-[13px] font-bold text-[#EA580C]">Light Work</span>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                                <Eye className="w-3.5 h-3.5" /> REVIEW NEEDED
                            </span>
                        </div>
                    </div>

                    {/* Row 4 - Luna */}
                    <div className="grid grid-cols-[250px_1fr_120px_200px_1fr_180px] gap-4 items-center py-6 px-8 border-b border-transparent hover:bg-[#FAFAFA]/50 transition-colors opacity-80">
                        <div className="flex items-center gap-4">
                            <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                <img src="https://images.unsplash.com/photo-1543015467-f41857c0a9cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="Luna" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] leading-tight mb-1">Luna</h4>
                                <div className="text-[11px] font-bold text-gray-400">Stall B-01</div>
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-[#E0E7FF] text-[#4338CA]">
                                Schooling
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-gray-300">
                            <div className="text-[18px] font-black text-gray-400 mb-1">0/4</div>
                            <div className="w-10 h-[3px] bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#F5EBE1] h-2 rounded-full overflow-hidden flex">
                                <div className="bg-[#964C2E] h-full w-1 rounded-full opacity-60"></div>
                            </div>
                            <span className="text-[13px] font-black text-gray-400">0%</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                            <BedDouble className="w-4 h-4 text-[#DC2626]" strokeWidth={2.5} />
                            <span className="text-[13px] font-bold text-[#DC2626]">Rest Required</span>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
                                <Ban className="w-3.5 h-3.5" /> UNAVAILABLE
                            </span>
                        </div>
                    </div>

                </div>

                {/* Pagination */}
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30 rounded-b-[24px]">
                    <div className="text-[12px] font-semibold text-gray-400 tracking-wide">
                        Showing <span className="text-[#964C2E] font-bold">4</span> of <span className="text-[#964C2E] font-bold">42</span> horses
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-[#964C2E] font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
