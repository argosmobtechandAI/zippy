import { 
    Activity, Search, Bell, User, Calendar, 
    FileSpreadsheet, FileText, TrendingUp, TrendingDown,
    Globe
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi, getRevenueStatsApi } from '../api/apis';

const Revenue = () => {
    const [stables, setStables] = useState([]);
    const [activeTab, setActiveTab] = useState('month');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        enrollmentRevenue: 0,
        renewalRevenue: 0,
        guestRevenue: 0,
        revenueGrowth: "0%",
        trends: [],
        mix: { enrollment: 0, renewal: 0, guests: 0 }
    });

    const fetchStats = async (range) => {
        try {
            const res = await apiFunction(`${getRevenueStatsApi}?range=${range}`, [], {}, "GET", true);
            if (res && res.success) {
                setStats(res.stats);
            }
        } catch (err) {
            console.error("Failed to fetch revenue stats:", err);
        }
    }

    useEffect(() => {
        const fetchStables = async () => {
            const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);
            if (res && res.success) {
                setStables(res.stables || []);
            }
        }
        fetchStables();
    }, []);

    useEffect(() => {
        fetchStats(activeTab);
    }, [activeTab]);
    return (
        <div className="p-10 max-w-[1400px] mx-auto h-full overflow-y-auto w-full">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Activity className="w-8 h-8 text-[#964C2E]" strokeWidth={2.5} />
                    <h1 className="text-[26px] font-bold text-[#1e2330]">Revenue Reports Detail</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            className="bg-[#F3F1EF] rounded-xl py-2.5 pl-11 pr-4 w-[360px] outline-none text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                        />
                    </div>
                    <button className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative text-[#964C2E] hover:bg-gray-50 border border-red-50/50">
                        <Bell className="w-5 h-5" strokeWidth={2} />
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="w-[42px] h-[42px] bg-[#FFF5F2] rounded-full flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-[#964C2E] hover:bg-[#FFEAE4]">
                        <User className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* Sub-tabs and Actions */}
            <div className="flex justify-between items-center mb-8">
                <div className="bg-[#F3F1EF] p-1.5 rounded-xl flex gap-1">
                    <button 
                        onClick={() => setActiveTab('today')}
                        className={`px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'today' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        TODAY
                    </button>
                    <button 
                        onClick={() => setActiveTab('week')}
                        className={`px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'week' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        THIS WEEK
                    </button>
                    <button 
                        onClick={() => setActiveTab('month')}
                        className={`px-6 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'month' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        THIS MONTH
                    </button>
                    <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg text-gray-500 hover:text-gray-700 flex items-center gap-2 uppercase">
                        CUSTOM <Calendar className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-white border border-[#964C2E]/20 rounded-xl flex items-center gap-2.5 text-sm font-bold text-[#964C2E] hover:bg-[#FFF5F2] shadow-sm transition-all">
                        <FileSpreadsheet className="w-4 h-4" /> Export to Excel
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-[#964C2E]/20 rounded-xl flex items-center gap-2.5 text-sm font-bold text-[#964C2E] hover:bg-[#FFF5F2] shadow-sm transition-all">
                        <FileText className="w-4 h-4" /> Export to PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Active Card */}
                <div className="bg-[#964C2E] rounded-2xl p-7 text-white relative overflow-hidden shadow-xl shadow-[#964C2E]/20">
                    <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none">
                        <Globe className="w-48 h-48 text-white min-w-[200px]" strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-[13px] font-semibold text-white/80 mb-2">Total Global Revenue</h3>
                        <p className="text-[40px] font-bold mb-5 tracking-tight">${Number(stats.totalRevenue).toLocaleString()}</p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#4ADE80]">
                            <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                            {stats.revenueGrowth} <span className="text-white/70 font-medium ml-1">from last month</span>
                        </div>
                    </div>
                </div>

                {/* Info Card 1 */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                    <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Enrollment Revenue</h3>
                    <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">${Number(stats.enrollmentRevenue).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                        <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                        +4.2% <span className="text-gray-400 font-medium ml-1">from last month</span>
                    </div>
                </div>

                {/* Info Card 2 */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                    <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Renewal Revenue</h3>
                    <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">${Number(stats.renewalRevenue).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                        <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                        +5.4% <span className="text-gray-400 font-medium ml-1">from last month</span>
                    </div>
                </div>

                {/* Info Card 3 */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                    <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Guest Ride Revenue</h3>
                    <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">${Number(stats.guestRevenue).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                        <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                        +8.2% <span className="text-gray-400 font-medium ml-1">from last month</span>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="bg-white col-span-2 rounded-2xl p-8 shadow-sm border border-gray-100/80 h-[380px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-[#1e2330]">Monthly Revenue Trends</h3>
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#964C2E]"></span>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">2024 Revenue</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#DBCBBF]"></span>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">2023 Revenue</span>
                            </div>
                        </div>
                    </div>
                    {/* Visual Bar Chart */}
                    <div className="flex-1 flex items-end gap-1.5 px-4 relative pt-4">
                        {(stats.trends || []).map((t, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end group px-0.5">
                                <div className="w-full flex-col flex relative transition-opacity group-hover:opacity-90">
                                    <div className="w-full bg-[#DBCBBF] rounded-t-sm" style={{ height: `${(t.revenue2023 / stats.totalRevenue) * 200}%` }}></div>
                                    <div className="w-full bg-[#964C2E] mt-[2px] rounded-b-sm" style={{ height: `${(t.revenue2024 / stats.totalRevenue) * 300}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* X Axis */}
                    <div className="flex justify-between px-4 mt-6 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
                        <span className="flex-1 text-center">JAN</span>
                        <span className="flex-1 text-center">FEB</span>
                        <span className="flex-1 text-center">MAR</span>
                        <span className="flex-1 text-center">APR</span>
                        <span className="flex-1 text-center">MAY</span>
                        <span className="flex-1 text-center">JUN</span>
                    </div>
                </div>

                {/* Donut Chart Component */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/80 flex flex-col">
                    <h3 className="text-lg font-bold text-[#1e2330] mb-8">Revenue Mix</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            {/* Nested SVG Rings */}
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 stroke-round overflow-visible">
                                {/* Guests (Outer) */}
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#F1E8E2" strokeWidth="6" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#DBCBBF" strokeWidth="6" strokeDasharray="40 249" strokeDashoffset="0" />
                                
                                {/* Renewal (Middle) */}
                                <circle cx="50" cy="50" r="36" fill="none" stroke="#F9F2ED" strokeWidth="6" />
                                <circle cx="50" cy="50" r="36" fill="none" stroke="#EDDED4" strokeWidth="6" strokeDasharray="80 146" strokeDashoffset="-40" />

                                {/* Enrollment (Inner) */}
                                <circle cx="50" cy="50" r="26" fill="none" stroke="#FFF5F2" strokeWidth="6" />
                                <circle cx="50" cy="50" r="26" fill="none" stroke="#964C2E" strokeWidth="6" strokeDasharray="163 163" strokeDashoffset="-120" />
                            </svg>
                            {/* Inner Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[22px] font-bold text-[#1e2330] leading-none mb-1">100%</span>
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">TOTAL</span>
                            </div>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-3 mt-8 ml-4">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                            <span className="w-3 h-3 rounded-full bg-[#964C2E]"></span> Enrollment ({stats.mix?.enrollment}%)
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                            <span className="w-3 h-3 rounded-full bg-[#EDDED4]"></span> Renewal ({stats.mix?.renewal}%)
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                            <span className="w-3 h-3 rounded-full bg-[#DBCBBF]"></span> Guests ({stats.mix?.guests}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100/80 bg-white">
                    <h3 className="text-lg font-bold text-[#1e2330]">Center-wise Revenue Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100/80 bg-[#FAFAFA]">
                                <th className="py-4 px-8 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">CENTER NAME</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">ENROLLMENT<br/>REVENUE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">RENEWAL<br/>REVENUE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">GUEST<br/>REVENUE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">TOTAL<br/>REVENUE</th>
                                <th className="py-4 px-8 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stables.map((stable, idx) => (
                                <tr key={stable.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-8 font-bold text-[#1e2330] max-w-[220px]">{stable.name || 'Unnamed Center'}</td>
                                    <td className="py-5 px-6 font-semibold text-gray-600">${Math.round(stable.totalRevenue * 0.5)}</td>
                                    <td className="py-5 px-6 font-semibold text-gray-600">${Math.round(stable.totalRevenue * 0.35)}</td>
                                    <td className="py-5 px-6 font-semibold text-gray-600">${Math.round(stable.totalRevenue * 0.15)}</td>
                                    <td className="py-5 px-6 font-bold text-[#964C2E]">${stable.totalRevenue || 0}</td>
                                    <td className="py-5 px-8">
                                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stables.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center font-bold text-gray-400">Loading revenue details...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
