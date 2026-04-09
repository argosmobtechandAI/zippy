import {
    Plus, TrendingUp, Building2, PawPrint, Banknote, 
    Filter, ChevronDown, Trees, Droplet, Hammer, Star, 
    ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';

const Centers = () => {
    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Equestrian Centers</h1>
                    <p className="text-[14px] font-medium text-gray-500">Monitor performance across your facility network.</p>
                </div>
                <button className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-4 rounded-xl shadow-md flex items-center gap-2 hover:bg-[#7D3F25] transition-all">
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Add New Center
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                {/* Total Centers */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Total Centers</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">04</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22C55E]">
                        <TrendingUp className="w-4 h-4" />
                        2 centers added this year
                    </div>
                </div>

                {/* Active Horses */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Active Horses</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">84</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                            <PawPrint className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                        Across all regional facilities
                    </div>
                </div>

                {/* Daily Revenue */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#F0E6D8] relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Daily Revenue</h3>
                            <p className="text-[36px] font-black text-[#1e2330] leading-none tracking-tight">$2,500</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#22C55E]">
                            <Banknote className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22C55E]">
                        <TrendingUp className="w-4 h-4" />
                        +12.5% increase
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] flex flex-col">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8F9FA] text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8F9FA] text-[13px] font-bold text-[#1e2330] hover:bg-gray-100 transition-colors">
                                Region: All <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-400">
                            Showing 4 centers
                        </div>
                    </div>
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 pb-4 border-b border-[#F0E6D8] px-4">
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">CENTER DETAILS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">OCCUPANCY</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">TRAINERS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center leading-tight">REVENUE<br/>(DAILY)</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {/* Row 1 - Meadowbrook */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] flex-shrink-0">
                                <Trees className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">Meadowbrook Stables</h4>
                                <p className="text-[11px] font-semibold text-gray-400 leading-tight">North Region • 124<br/>Equestrian Dr</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                ACTIVE
                            </span>
                        </div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">24</div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">06</div>
                        <div className="text-center text-[14px] font-black text-[#1e2330] tracking-wide">$1,200</div>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#964C2E] hover:text-[#7D3F25] transition-colors text-right">
                                Manage<br/>Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Row 2 - Riverside Arena */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] flex-shrink-0">
                                <Droplet className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">Riverside Arena</h4>
                                <p className="text-[11px] font-semibold text-gray-400 leading-tight">South Region • 88 River<br/>Road</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                ACTIVE
                            </span>
                        </div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">18</div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">04</div>
                        <div className="text-center text-[14px] font-black text-[#1e2330] tracking-wide">$850</div>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#964C2E] hover:text-[#7D3F25] transition-colors text-right">
                                Manage<br/>Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Row 3 - Oak Ridge Farm */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] flex-shrink-0">
                                <Hammer className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">Oak Ridge Farm</h4>
                                <p className="text-[11px] font-semibold text-gray-400 leading-tight">West Region • 22 Ridge<br/>Ln</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[100px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#FFF3DC] text-[#B45309]">
                                MAINTENANCE
                            </span>
                        </div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">30</div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">08</div>
                        <div className="text-center text-[14px] font-black text-gray-300 tracking-wide">$0</div>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#964C2E] hover:text-[#7D3F25] transition-colors text-right">
                                Manage<br/>Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Row 4 - Sunrise Heights */}
                    <div className="grid grid-cols-[300px_120px_1fr_1fr_1fr_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] flex-shrink-0">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">Sunrise Heights</h4>
                                <p className="text-[11px] font-semibold text-gray-400 leading-tight">East Region • 55<br/>Viewcrest</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <span className="inline-flex max-w-[80px] text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#EBF5FF] text-[#2563EB]">
                                NEW
                            </span>
                        </div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">12</div>
                        <div className="text-center text-[14px] font-bold text-[#1e2330]">03</div>
                        <div className="text-center text-[14px] font-black text-[#1e2330] tracking-wide">$450</div>
                        <div className="flex justify-end">
                            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#964C2E] hover:text-[#7D3F25] transition-colors text-right">
                                Manage<br/>Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="p-6 px-10 flex justify-between items-center bg-white rounded-b-[24px]">
                    <div className="text-[12px] font-bold text-gray-400">
                        Page 1 of 1
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-[12px] font-bold shadow-sm flex items-center justify-center">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Centers;