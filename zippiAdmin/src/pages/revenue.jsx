import {
    Activity, Search, Bell, User, Calendar,
    FileSpreadsheet, FileText, TrendingUp, TrendingDown,
    Globe, Plus, Edit2, Trash2, X, List, Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi, getAllUsersApi, getRevenueStatsApi, plansApi, revenueStatsApi } from '../api/apis';

const Revenue = () => {
    const [stables, setStables] = useState([]);
    const [activeTab, setActiveTab] = useState('month');
    const [viewMode, setViewMode] = useState('dashboard');
    const [plans, setPlans] = useState([]);
    const [users, setUsers] = useState([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [planForm, setPlanForm] = useState({
        name: '',
        sessionsCount: '',
        validity: '',
        amount: '',
        level: '',
        rules: ''
    });

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

            const usersRes = await apiFunction(getAllUsersApi, [], {}, "GET", true);
            console.log("Users Data:", usersRes);
            if (usersRes && usersRes.success) {
                setUsers(usersRes.users || []);
            }

        } catch (err) {
            console.error("Failed to fetch revenue stats:", err);
        }
    }

    const fetchPlans = async () => {
        try {
            const res = await apiFunction(plansApi, [], {}, "GET", true);
            console.log("Plans:", res);
            if (res && res.success) {
                setPlans(res.plans || []);
            }

            const revenueRes = await apiFunction(revenueStatsApi, [], {}, "GET", true);
            console.log("Revenue Data:", revenueRes);
            if (revenueRes && revenueRes.success) {
                setRevenueData(revenueRes.revenueStats || []);
            }


        } catch (err) {
            console.error("Failed to fetch plans:", err);
        }
    };

    const getUserName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : '';
    };


    useEffect(() => {
        const fetchStables = async () => {
            const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);
            if (res && res.success) {
                setStables(res.stables || []);
            }
        }
        fetchStables();
        fetchPlans();
    }, []);

    const handleOpenPlanModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setPlanForm({
                name: plan.name,
                sessionsCount: plan.sessionsCount,
                validity: plan.validity,
                amount: plan.amount,
                level: plan.level,
                rules: Array.isArray(plan.rules) ? plan.rules.join('\n') : ''
            });
        } else {
            setEditingPlan(null);
            setPlanForm({ name: '', sessionsCount: '', validity: '', amount: '', level: '', rules: '' });
        }
        setIsPlanModalOpen(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        const payload = {

            name: planForm.name,
            sessionsCount: Number(planForm.sessionsCount),
            validity: planForm.validity,
            amount: Number(planForm.amount),
            level: planForm.level,
            rules: planForm.rules.split('\n').map(r => r.trim()).filter(r => r)

        };

        try {
            let res;
            if (editingPlan) {
                console.log("Editing plan", `${plansApi}/${editingPlan.id}`, payload);
                res = await apiFunction(`${plansApi}/${editingPlan.id}`, [], payload, "PUT", true);
            } else {
                res = await apiFunction(plansApi, [], payload, "POST", true);
            }
            if (res && res.success) {
                setIsPlanModalOpen(false);
                fetchPlans();
            }
        } catch (err) {
            console.error("Failed to save plan:", err);
        }
    };

    const handleDeletePlan = async (id) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            try {
                const res = await apiFunction(`${plansApi}/${id}`, [], {}, "DELETE", true);
                if (res && res.success) {
                    fetchPlans();
                }
            } catch (err) {
                console.error("Failed to delete plan:", err);
            }
        }
    };

    useEffect(() => {
        fetchStats(activeTab);
    }, [activeTab]);
    return (
        <div className="p-10 max-w-[1400px] mx-auto h-full overflow-y-auto w-full relative">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Activity className="w-8 h-8 text-[#964C2E]" strokeWidth={2.5} />
                    <h1 className="text-[26px] font-bold text-[#1e2330]">
                        {viewMode === 'dashboard' ? 'Revenue Reports Detail' : 'Plans Management'}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-[#F3F1EF] p-1.5 rounded-xl mr-4">
                        <button
                            onClick={() => setViewMode('dashboard')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'dashboard' ? 'bg-white text-[#964C2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Dashboard
                        </button>
                        <button
                            onClick={() => setViewMode('plans')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'plans' ? 'bg-white text-[#964C2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Layers className="w-4 h-4" /> Plans
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#F3F1EF] rounded-xl py-2.5 pl-11 pr-4 w-[240px] outline-none text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
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

            {viewMode === 'dashboard' ? (
                <>
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
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">ENROLLMENT<br />REVENUE</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">RENEWAL<br />REVENUE</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">GUEST<br />REVENUE</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">TOTAL<br />REVENUE</th>
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
                </>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Plans Stats Overview */}
                    <div className="grid grid-cols-4 gap-6">
                        {/* Total Plan Revenue */}
                        <div className="bg-[#964C2E] rounded-2xl p-7 text-white relative overflow-hidden shadow-xl shadow-[#964C2E]/20">
                            <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none">
                                <Globe className="w-48 h-48 text-white min-w-[200px]" strokeWidth={1} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[13px] font-semibold text-white/80 mb-2">Total Plan Revenue</h3>
                                <p className="text-[40px] font-bold mb-5 tracking-tight">${Number(revenueData?.totalRevenue || 0).toLocaleString()}</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#4ADE80]">
                                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                                    <span>Active: ${Number(revenueData?.totalActiveRevenue || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Plans */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Active Subscriptions</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">{revenueData?.activePlans?.length || 0}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                                <Activity className="w-4 h-4" strokeWidth={2.5} />
                                <span className="text-gray-400 font-medium ml-1">Currently active</span>
                            </div>
                        </div>

                        {/* Expired Plans */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Expired Subscriptions</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">{revenueData?.expiredPlans?.length || 0}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-red-400">
                                <TrendingDown className="w-4 h-4" strokeWidth={2.5} />
                                <span className="text-gray-400 font-medium ml-1">Currently expired</span>
                            </div>
                        </div>

                        {/* Inactive Revenue */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Past Revenue</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">${Number(revenueData?.totalInactiveRevenue || 0).toLocaleString()}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                                <FileText className="w-4 h-4" strokeWidth={2.5} />
                                <span className="font-medium ml-1">From expired plans</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-[#1e2330]">All Plans</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage subscription plans and packages</p>
                            </div>
                            <button
                                onClick={() => handleOpenPlanModal()}
                                className="px-6 py-3 bg-[#964C2E] text-white rounded-xl font-bold hover:bg-[#7d3f25] transition-all flex items-center gap-2 shadow-lg shadow-[#964C2E]/20"
                            >
                                <Plus className="w-5 h-5" /> Create New Plan
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow relative group">
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenPlanModal(plan)}
                                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#964C2E] hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="inline-block px-3 py-1 bg-[#FFF5F2] text-[#964C2E] rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                                        {plan.level}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1e2330] mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-bold text-[#964C2E]">${plan.amount}</span>
                                        <span className="text-sm text-gray-500 font-medium">/ {plan.validity}</span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#964C2E]"></div>
                                            <span className="font-medium">{plan.sessionsCount} Sessions included</span>
                                        </div>
                                        {(plan.rules || []).map((rule, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#964C2E]"></div>
                                                <span>{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {plans.length === 0 && (
                                <div className="col-span-3 py-12 text-center text-gray-500 font-medium">
                                    No plans available. Create one to get started.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Transaction History Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-6 border-b border-gray-100/80 bg-white">
                            <h3 className="text-lg font-bold text-[#1e2330]">Transaction History</h3>
                            <p className="text-sm text-gray-500 mt-1">Recent plan purchases and revenue events</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100/80 bg-[#FAFAFA]">
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Purchaser name</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">DATE</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">PLAN</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">AMOUNT</th>
                                        <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(revenueData?.stats || []).map((txn, idx) => (
                                        <tr key={txn.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 px-6 text-sm font-medium text-gray-500">
                                                {getUserName(txn.purchaserId)}
                                            </td>
                                            <td className="py-5 px-6 text-sm text-gray-600">
                                                {new Date(txn.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#964C2E]">
                                                        <Layers className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-[#1e2330]">{plans.find(p => p.id === txn.planId)?.name || 'Unknown Plan'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 font-bold text-[#964C2E]">
                                                ${txn.amount}
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-bold ${txn.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-gray-100 text-gray-600'}`}>
                                                    {txn.status || 'Completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!revenueData?.stats || revenueData.stats.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center font-bold text-gray-400">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
                            <h2 className="text-xl font-bold text-[#1e2330]">
                                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                            </h2>
                            <button
                                onClick={() => setIsPlanModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={planForm.name}
                                        onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. Beginner Pack"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                                    <input
                                        type="text"
                                        required
                                        value={planForm.level}
                                        onChange={e => setPlanForm({ ...planForm, level: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. Beginner, Intermediate"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Number of Sessions</label>
                                    <input
                                        type="number"
                                        required
                                        value={planForm.sessionsCount}
                                        onChange={e => setPlanForm({ ...planForm, sessionsCount: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. 8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Validity</label>
                                    <input
                                        type="text"
                                        required
                                        value={planForm.validity}
                                        onChange={e => setPlanForm({ ...planForm, validity: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. month, year"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={planForm.amount}
                                        onChange={e => setPlanForm({ ...planForm, amount: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. 100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Rules / Features (One per line)</label>
                                    <textarea
                                        rows={4}
                                        value={planForm.rules}
                                        onChange={e => setPlanForm({ ...planForm, rules: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all resize-none"
                                        placeholder="Basic stable access&#10;Equine care intro"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsPlanModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#964C2E] text-white rounded-xl font-bold hover:bg-[#7d3f25] transition-all shadow-lg shadow-[#964C2E]/20"
                                >
                                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Revenue;
