import { 
    Search, Bell, Settings, Users, Gauge, Download, 
    MoreHorizontal, History, ChevronLeft, ChevronRight, 
    MapPin, Wallet, Zap
} from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="p-8 max-w-[1400px] mx-auto h-full overflow-y-auto w-full">
            {/* Top Bar */}
            <header className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-[#1e2330] mb-1">Dashboard Overview</h1>
                    <p className="text-[13px] font-medium text-gray-400">Real-time metrics for all Zippy Equestrian locations</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search centers or riders..." 
                            className="bg-[#F3F1EF] rounded-xl py-2.5 pl-11 pr-4 w-[360px] outline-none text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                        />
                    </div>
                    <button className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative text-[#1e2330] hover:bg-gray-50 border border-gray-100">
                        <Bell className="w-5 h-5" strokeWidth={2} />
                    </button>
                    <button className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] text-[#1e2330] hover:bg-gray-50 border border-gray-100">
                        <Settings className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Wallet className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                            +12.5%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Total Revenue</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">$124,500</p>
                    </div>
                </div>

                {/* Total Riders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Users className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                            +5.2%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Total Riders</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">1,240</p>
                    </div>
                </div>

                {/* Active Horses */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Zap className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                            +2.1%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Active Horses</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">85</p>
                    </div>
                </div>

                {/* Center Utilization */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Gauge className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                            -1.5%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Center Utilization</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">92%</p>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 mb-8">
                <div className="p-6 flex justify-between items-center border-b border-gray-100/80">
                    <h3 className="text-lg font-bold text-[#1e2330]">Center Performance</h3>
                    <button className="px-4 py-2 bg-[#FFF9F6] border border-[#964C2E]/20 rounded-lg flex items-center gap-2 text-[13px] font-bold text-[#964C2E] hover:bg-[#FFF2EB] transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100/80 bg-[#FAFAFA]">
                                <th className="py-4 px-8 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">LOCATION NAME</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">MANAGER</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">ACTIVE<br/>RIDERS</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">MONTHLY<br/>REVENUE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">HORSE<br/>COUNT</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">STATUS</th>
                                <th className="py-4 px-8 text-[11px] font-bold text-[#818C99] tracking-widest uppercase items-end text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Row 1 */}
                            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1e2330]">Lexington Valley</div>
                                            <div className="text-[11px] font-semibold text-gray-400">Kentucky, USA</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">
                                    <div>John</div>
                                    <div>Marston</div>
                                </td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">412</td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">$42,800</td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">28</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex max-w-[100px] text-center justify-center px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-[#D1FAE5] text-[#065F46]">
                                        PEAK PERFORMANCE
                                    </span>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1e2330]">Wellington South</div>
                                            <div className="text-[11px] font-semibold text-gray-400">Florida, USA</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">Sadie Adler</td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">388</td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">$38,200</td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">22</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex max-w-[100px] text-center justify-center px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-[#FEF3C7] text-[#92400E]">
                                        NEAR CAPACITY
                                    </span>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                            {/* Row 3 */}
                            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1e2330]">Ocala Meadows</div>
                                            <div className="text-[11px] font-semibold text-gray-400">Florida, USA</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">
                                    <div>Charles</div>
                                    <div>Smith</div>
                                </td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">210</td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">$24,150</td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">18</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex justify-center px-4 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-[#D1FAE5] text-[#065F46]">
                                        STABLE
                                    </span>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                            {/* Row 4 */}
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1e2330]">Middleburg Estates</div>
                                            <div className="text-[11px] font-semibold text-gray-400">Virginia, USA</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">
                                    <div>Abigail</div>
                                    <div>Roberts</div>
                                </td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">230</td>
                                <td className="py-4 px-6 font-bold text-[#1e2330]">$19,350</td>
                                <td className="py-4 px-6 font-semibold text-[#1e2330]">17</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex justify-center px-4 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-[#F1F5F9] text-[#475569]">
                                        UNDER REVIEW
                                    </span>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 flex justify-center items-center gap-2 border-t border-gray-100/80">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#964C2E] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-xs font-bold shadow-sm">1</button>
                    <button className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 text-xs font-bold transition-colors">2</button>
                    <button className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 text-xs font-bold transition-colors">3</button>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#964C2E] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white col-span-1 rounded-2xl p-6 shadow-sm border border-gray-100/80">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="w-5 h-5 text-[#964C2E]" />
                        <h3 className="text-[16px] font-bold text-[#1e2330]">Recent Activity</h3>
                    </div>
                    
                    <div className="flex flex-col gap-0">
                        {/* Item 1 */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-1.5 h-6 rounded-full bg-[#964C2E]"></div>
                                <div className="w-[1.5px] h-12 bg-[#964C2E]/20 mt-1"></div>
                            </div>
                            <div className="pb-6 w-full -mt-0.5">
                                <h4 className="text-[13px] font-bold text-[#1e2330] mb-0.5">New Trainer Certified</h4>
                                <p className="text-[11px] font-medium text-gray-400">Marston Center • 2 hours ago</p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-1.5 h-6 rounded-full bg-[#DFB390]"></div>
                                <div className="w-[1.5px] h-12 bg-[#964C2E]/20 mt-1"></div>
                            </div>
                            <div className="pb-6 w-full -mt-0.5">
                                <h4 className="text-[13px] font-bold text-[#1e2330] mb-0.5">Horse Health Check Alert</h4>
                                <p className="text-[11px] font-medium text-gray-400">Wellington • 5 hours ago</p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-1.5 h-6 rounded-full bg-[#DFB390]"></div>
                            </div>
                            <div className="pb-2 w-full -mt-0.5">
                                <h4 className="text-[13px] font-bold text-[#1e2330] mb-0.5">Subscription Milestone</h4>
                                <p className="text-[11px] font-medium text-gray-400">Ocala • 1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="bg-[#2B1B15] col-span-2 rounded-2xl p-8 shadow-md flex flex-col justify-between overflow-hidden relative">
                    {/* Background glow effect hidden but implied by Tailwind */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#964C2E]/10 to-transparent pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h3 className="text-lg font-bold text-white">Global Revenue Growth</h3>
                        <div className="flex items-center gap-3 bg-[#1e110c] px-2 py-1.5 rounded-full border border-[#964C2E]/20">
                            <button className="px-5 py-1.5 text-[10px] font-black tracking-widest text-[#964C2E] uppercase">MONTHLY</button>
                            <button className="px-5 py-1.5 text-[10px] font-black tracking-widest text-[#964C2E] bg-[#3B2219] rounded-full uppercase">LIVE DATA</button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-4 px-2 relative z-10">
                        {/* Custom Bars */}
                        {[
                            { val: "30%", lbl: "JAN", highlight: false },
                            { val: "40%", lbl: "FEB", highlight: false },
                            { val: "35%", lbl: "MAR", highlight: false },
                            { val: "50%", lbl: "APR", highlight: false },
                            { val: "45%", lbl: "MAY", highlight: false },
                            { val: "65%", lbl: "JUN", highlight: false },
                            { val: "75%", lbl: "JUL", highlight: true }
                        ].map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end group items-center">
                                <div className={`w-full max-w-[50px] transition-all rounded-t-lg relative ${item.highlight ? 'bg-[#964B29]' : 'bg-[#5f301a] group-hover:bg-[#72391e]'}`} style={{ height: item.val }}>
                                    {/* Overlay for subtle 3D effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg"></div>
                                </div>
                                <span className={`text-[10px] font-black tracking-wider uppercase mt-6 ${item.highlight ? 'text-[#964B29]' : 'text-[#816B61]'}`}>{item.lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
