import {
    Search, Bell, Settings, Users, Gauge, Download,
    MoreHorizontal, History, ChevronLeft, ChevronRight,
    MapPin, Wallet, Zap, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllUsersApi, getGlobalStatsApi, updateStableApi } from '../api/apis';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalRiders: 0,
        totalHorses: 0,
        utilization: 0,
        revenueGrowth: "0%",
        riderGrowth: "0%",
        horseGrowth: "0%",
        utilizationTrend: "0%"
    });
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [changeManagerModal, setChangeManagerModal] = useState(false);


    useEffect(() => {
        const fetchStats = async () => {
            const res = await apiFunction(getGlobalStatsApi, [], {}, "GET", true);
            if (res && res.success) {
                console.log(res.stats, "res.stats")
                setStats(res.stats);
            }
            setLoading(false);
        }

        fetchStats();

    }, []);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Center Performance Report", 14, 15);
        
        const tableColumn = ["Location Name", "Manager", "Stocks Count", "Monthly Revenue", "Horse Count"];
        const tableRows = [];

        (stats.centers || []).forEach(center => {
            const centerData = [
                center.name,
                center.manager,
                center.stocksCount,
                `Rs ${Number(center.monthlyRevenue).toLocaleString()}`,
                center.horseCount
            ];
            tableRows.push(centerData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [150, 76, 46] }
        });

        doc.save("center_performance_report.pdf");
    };

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
                            {stats.revenueGrowth}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Total Revenue</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">₹{Number(stats.totalRevenue).toLocaleString()}</p>
                    </div>
                </div>

                {/* Total Riders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Users className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                            {stats.riderGrowth}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Total Riders</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">{stats.totalRiders}</p>
                    </div>
                </div>

                {/* Active Horses */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Zap className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                            {stats.horseGrowth}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Active Horses</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">{stats.totalHorses}</p>
                    </div>
                </div>

                {/* Center Utilization */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E]">
                            <Gauge className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                            {stats.utilizationTrend}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-[12px] font-semibold text-[#818C99] mb-1">Center Utilization</h3>
                        <p className="text-[28px] font-black text-[#1e2330] leading-none tracking-tight">{stats.utilization}%</p>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 mb-8">
                <div className="p-6 flex justify-between items-center border-b border-gray-100/80">
                    <h3 className="text-lg font-bold text-[#1e2330]">Center Performance</h3>
                    <button onClick={exportToPDF} className="px-4 py-2 bg-[#FFF9F6] border border-[#964C2E]/20 rounded-lg flex items-center gap-2 text-[13px] font-bold text-[#964C2E] hover:bg-[#FFF2EB] transition-all cursor-pointer">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100/80 bg-[#FAFAFA]">
                                <th className="py-4 px-8 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">LOCATION NAME</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">MANAGER</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">STOCKS<br />COUNT</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">MONTHLY<br />REVENUE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">HORSE<br />COUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.centers || []).map((center, idx) => (
                                <tr key={center.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#1e2330]">{center.name}</div>
                                                <div className="text-[11px] font-semibold text-gray-400">{center.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-[#1e2330]">
                                        {center.manager}
                                    </td>
                                    <td className="py-4 px-6 font-bold text-[#1e2330]">{center.stocksCount}</td>
                                    <td className="py-4 px-6 font-bold text-[#1e2330]">₹{Number(center.monthlyRevenue).toLocaleString()}</td>
                                    <td className="py-4 px-6 font-semibold text-[#1e2330]">{center.horseCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified for live data) */}
                <div className="p-6 flex justify-center items-center gap-2 border-t border-gray-100/80">
                    <button className="w-8 h-8 rounded-lg bg-[#964C2E] text-white text-xs font-bold shadow-sm">1</button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white col-span-3 rounded-2xl p-6 shadow-sm border border-gray-100/80">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="w-5 h-5 text-[#964C2E]" />
                        <h3 className="text-[16px] font-bold text-[#1e2330]">Recent Activity</h3>
                    </div>

                    <div className="flex flex-col gap-0">
                        {(stats.recentActivity || []).length === 0 ? (
                            <p className="text-xs font-bold text-gray-400 text-center py-10">No recent activity detected.</p>
                        ) : (stats.recentActivity || []).map((activity, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-1.5 h-6 rounded-full ${idx === 0 ? 'bg-[#964C2E]' : 'bg-[#DFB390]'}`}></div>
                                    {idx !== (stats.recentActivity.length - 1) && <div className="w-[1.5px] h-12 bg-[#964C2E]/20 mt-1"></div>}
                                </div>
                                <div className="pb-6 w-full -mt-0.5">
                                    <h4 className="text-[13px] font-bold text-[#1e2330] mb-0.5">{activity.title}</h4>
                                    <p className="text-[11px] font-medium text-gray-400">{activity.desc} • {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {changeManagerModal && (
                <ChangeManagerModal
                    isOpen={changeManagerModal}
                    onClose={() => setChangeManagerModal(false)}
                    stable={selectedCenter}
                    allUsers={stats.staff}
                />
            )}
        </div>
    );
};


const ChangeManagerModal = ({ isOpen, onClose, stable, allUsers }) => {
    const [managerId, setManagerId] = useState(stable?.userId || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const res = await apiFunction(updateStableApi, [stable.id], { userId: managerId }, "PUT", true);
        if (res && res.success) {
            onClose();
            window.location.reload();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl">
                <h2 className="text-xl font-bold mb-6">Change Manager</h2>
                <div className="mb-6">
                    <div className="flex justify-center bg-white text-white p-2 rounded-lg mb-2 items-center">
                        
                        <p className="text-md text-[#964C2E] font-medium ">{stable.name}</p>
                    </div>
                    <div className="flex justify-between bg-[#964C2E] text-white p-4 mb-2 rounded-lg items-center">
                        <label className="block text-sm font-medium ">Selected Manager</label>
                        <p className="text-sm font-medium">{stable.manager}</p>
                    </div>


                    <label className="block text-sm font-medium mb-2">Select New Manager</label>

                    <select
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#964C2E]"
                    >
                        <option value="">Select Manager</option>
                        {allUsers?.map((user) => (
                            <option key={user.id} value={user.id} selected={managerId ? user.id === managerId : user.id === stable?.userId}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !managerId}
                        className="px-6 py-2 rounded-lg bg-[#964C2E] text-white hover:bg-[#72391e] disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
