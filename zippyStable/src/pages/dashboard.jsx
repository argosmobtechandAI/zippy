import { Download, Plus, Pencil, Trash2, Wheat, Pill, Settings, Brush, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="p-10 max-w-[1400px] mx-auto w-full font-sans bg-[#F9EEE5] min-h-full">
            {/* Breadcrumb & Header section */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-6 uppercase tracking-wider">
                    <span className="text-[#649BA8]">Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[#964C2E] font-black">Inventory</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[32px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Stable Inventory</h1>
                        <p className="text-[14px] font-semibold text-gray-500">Real-time tracking of feed, medicines, and stable supplies.</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="bg-white text-[#964C2E] border border-[#EACDBA]/50 text-[13px] font-bold px-6 py-3.5 rounded-xl flex items-center gap-2.5 shadow-sm hover:bg-white/70 transition-all">
                            <Download className="w-4 h-4" strokeWidth={2.5} />
                            Export CSV
                        </button>
                        <button className="bg-[#964C2E] text-white text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2.5 hover:bg-[#7D3F25] transition-all">
                            <Plus className="w-4 h-4 bg-transparent border border-white rounded-[4px] p-0.5" strokeWidth={3} />
                            Add Stock
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-6">
                <button className="px-6 py-2.5 rounded-full bg-[#964C2E] text-white text-[13px] font-bold shadow-sm">All Items</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors">Feed</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors">Medicines</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors">Equipment</button>
                <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-[#EACDBA]/40 text-[13px] font-bold hover:bg-white/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors">Consumables</button>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EACDBA]/40 overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 py-5 px-8 border-b border-gray-100 bg-[#FAFAFA]">
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase">ITEM NAME</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase">CATEGORY</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-center">CURRENT<br />STOCK</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-left pl-4">UNIT</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-center">STATUS</div>
                    <div className="text-[11px] font-black text-[#5C6B7A] tracking-wider uppercase text-right pr-2">ACTIONS</div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col">
                    {/* Row 1 */}
                    <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                <Wheat className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">Premium Timothy<br />Hay</h4>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-500">Feed</div>
                        <div className="text-center text-[16px] font-black text-[#1e2330]">124</div>
                        <div className="text-[13px] font-semibold text-gray-500 pl-4">Bales</div>
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> In Stock
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pr-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                <Pill className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">Equine Flu Vaccine</h4>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-500">Medicines</div>
                        <div className="text-center text-[16px] font-black text-[#1e2330]">8</div>
                        <div className="text-[13px] font-semibold text-gray-500 pl-4">Vials</div>
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#FEF3C7] text-[#92400E]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#92400E]"></span> Low Stock
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pr-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                <Brush className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">Antiseptic Shampoo</h4>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-500">Consumables</div>
                        <div className="text-center text-[16px] font-black text-[#1e2330]">0</div>
                        <div className="text-[13px] font-semibold text-gray-500 pl-4">Bottles</div>
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#FEE2E2] text-[#B91C1C] text-center leading-tight">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></span> Out of<br />Stock
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pr-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                <Wrench className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">Leather Saddle Soap</h4>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-500">Consumables</div>
                        <div className="text-center text-[16px] font-black text-[#1e2330]">42</div>
                        <div className="text-[13px] font-semibold text-gray-500 pl-4">Tins</div>
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> In Stock
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pr-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-[250px_1fr_120px_1fr_120px_100px] gap-4 items-center py-6 px-8 border-b border-transparent hover:bg-[#FAFAFA]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#F9EEE5] flex items-center justify-center flex-shrink-0 text-[#964C2E]">
                                <Settings className="w-5 h-5" strokeWidth={2} />

                            </div>
                            <h4 className="text-[14px] font-black text-[#1e2330] leading-tight">Stirrup Irons (Adult)</h4>
                        </div>
                        <div className="text-[13px] font-semibold text-gray-500">Equipment</div>
                        <div className="text-center text-[16px] font-black text-[#1e2330]">15</div>
                        <div className="text-[13px] font-semibold text-gray-500 pl-4">Pairs</div>
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> In Stock
                            </span>
                        </div>
                        <div className="flex justify-end gap-3 pr-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                </div>

                {/* Pagination */}
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30 rounded-b-[24px]">
                    <div className="text-[12px] font-semibold text-gray-400 tracking-wide">
                        Showing 1 to 5 of 24 items
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-[12px] font-bold shadow-sm flex items-center justify-center">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                            2
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                            3
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors bg-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
