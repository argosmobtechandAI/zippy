import {
    Activity, Search, Bell, User, Calendar,
    FileSpreadsheet, FileText, TrendingUp, TrendingDown,
    Globe, Plus, Edit2, Trash2, X, List, Layers,
    CreditCard, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi, getAllUsersApi, getRevenueStatsApi, plansApi, revenueStatsApi, getPaymentsApi, getLevelsApi } from '../api/apis';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

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
        gst: '',
        level: '',
        rules: ''
    });

    const [selectedMonth, setSelectedMonth] = useState('all');
    const [payments, setPayments] = useState([]);
    const [levels, setLevels] = useState([]);

    // Payment Log tab state
    const [paySearchTerm, setPaySearchTerm] = useState('');
    const [payStartDate, setPayStartDate]   = useState(null);
    const [payEndDate, setPayEndDate]       = useState(null);
    const [payUserFilter, setPayUserFilter] = useState('');
    const [payPlanFilter, setPayPlanFilter] = useState('');
    const [payPage, setPayPage]             = useState(1);
    const PAY_PER_PAGE = 10;

    const [stats, setStats] = useState({
        totalRevenue: 0,
        enrollmentRevenue: 0,
        renewalRevenue: 0,
        guestRevenue: 0,
        revenueGrowth: "12.5%",
        trends: [],
        mix: { enrollment: 0, renewal: 0, guests: 0 }
    });

    const scopedStats = useMemo(() => {
        let txns = payments || [];

        // Apply range filter
        const todayStr = new Date().toDateString();
        const now = new Date();
        
        console.log("scopedStats inputs: payments length =", payments.length, "selectedMonth =", selectedMonth, "activeTab =", activeTab);

        txns = txns.filter(p => {
            if (!p.date) return false;
            const pDate = new Date(p.date);
            if (isNaN(pDate.getTime())) return false; // Invalid Date
            
            // If a specific month is selected in the dropdown, filter by that month only and skip the activeTab range filter!
            if (selectedMonth !== 'all') {
                return pDate.getMonth().toString() === selectedMonth;
            }
            
            if (activeTab === 'today') {
                return pDate.toDateString() === todayStr;
            } else if (activeTab === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return pDate >= oneWeekAgo && pDate <= now;
            } else if (activeTab === 'month') {
                return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
            }
            return true;
        });

        console.log("scopedStats filtered txns:", txns);

        let total = 0;
        let enrollment = 0;
        let renewal = 0;
        let guest = 0;

        txns.forEach(p => {
            const amt = Number(p.amount) || 0;
            total += amt;
            
            // Check if level or plan
            const isLevel = levels.some(l => l.id === p.plan_id);
            if (isLevel) {
                enrollment += amt;
            } else {
                renewal += amt;
            }
        });

        // Compute trends dynamically
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trends = months.map((m, idx) => {
            const currentYear = now.getFullYear();
            const prevYear = currentYear - 1;
            
            const revenueCurrent = (payments || [])
                .filter(p => {
                    const d = new Date(p.date);
                    return d.getMonth() === idx && d.getFullYear() === currentYear;
                })
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

            const revenuePrev = (payments || [])
                .filter(p => {
                    const d = new Date(p.date);
                    return d.getMonth() === idx && d.getFullYear() === prevYear;
                })
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

            return {
                month: m,
                revenue2024: revenueCurrent,
                revenue2023: revenuePrev
            };
        });

        const totalMix = enrollment + renewal + guest || 1;
        const mix = {
            enrollment: Math.round((enrollment / totalMix) * 100),
            renewal: Math.round((renewal / totalMix) * 100),
            guests: Math.round((guest / totalMix) * 100)
        };

        return {
            statsList: txns,
            totalRevenue: total,
            enrollmentRevenue: enrollment,
            renewalRevenue: renewal,
            guestRevenue: guest,
            trends,
            mix
        };
    }, [payments, levels, activeTab, selectedMonth]);

    const fetchStats = async (range) => {
        try {
            const [usersRes, paymentsRes, levelsRes] = await Promise.all([
                apiFunction(getAllUsersApi, [], {}, "GET", true),
                apiFunction(getPaymentsApi, [], {}, "GET", true),
                apiFunction(getLevelsApi, [], {}, "GET", true)
            ]);

            if (usersRes && usersRes.success) {
                setUsers(usersRes.users || []);
            }
            if (paymentsRes && paymentsRes.success) {
                setPayments(paymentsRes.payments || []);
            }
            if (levelsRes && levelsRes.success) {
                setLevels(levelsRes.levels || []);
            }
        } catch (err) {
            console.error("Failed to fetch revenue stats:", err);
        }
    };
    const getStableRevenue = (stableId, type) => {
        const sourcePayments = scopedStats?.statsList || payments;
        const stablePayments = sourcePayments.filter(p => {
            if (!p.user) return false;
            const riderStables = p.user.rider?.map(r => String(r.stableId || r.stable_id || r.stable?.id || '')) || [];
            const isMatch = riderStables.includes(String(stableId)) || String(p.user.stableId || '') === String(stableId) || String(p.user.stable_id || '') === String(stableId);
            return isMatch;
        });

        console.warn(`getStableRevenue debug: stableId = ${stableId}, type = ${type}, total payments matching = ${stablePayments.length}`, stablePayments.map(p => ({ user: p.user?.name, amount: p.amount, riders: p.user?.rider })));

        let total = 0;
        let enrollment = 0;
        let renewal = 0;
        let guest = 0;

        stablePayments.forEach(p => {
            const amt = Number(p.amount) || 0;
            total += amt;
            
            // Check if level or plan
            const isLevel = levels.some(l => l.id === p.plan_id);
            if (isLevel) {
                enrollment += amt;
            } else {
                renewal += amt;
            }
        });

        if (type === 'enrollment') return enrollment;
        if (type === 'renewal') return renewal;
        if (type === 'guest') return guest;
        return total;
    };

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

    const getPlanOrLevelName = (planId) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) return plan.name;
        const level = levels.find(l => l.id === planId);
        if (level) return level.name;
        return 'Unknown Package';
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
                sessionsCount: plan.sessions_count || plan.sessionsCount,
                validity: plan.validity,
                amount: plan.amount,
                gst: plan.gst ?? '',
                level: plan.level,
                rules: Array.isArray(plan.rules) ? plan.rules.join('\n') : ''
            });
        } else {
            setEditingPlan(null);
            setPlanForm({ name: '', sessionsCount: '', validity: '', amount: '', gst: '', level: '', rules: '' });
        }
        setIsPlanModalOpen(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        const baseAmount = Number(planForm.amount) || 0;
        const gstPct    = Number(planForm.gst) || 0;
        const gstAmount = Math.round((baseAmount * gstPct) / 100);
        const payload = {
            name: planForm.name,
            sessions_count: 0,
            validity: planForm.validity,
            amount: baseAmount,
            gst: gstPct,
            gst_amount: gstAmount,
            total_amount: baseAmount + gstAmount,
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
                        {viewMode === 'dashboard' ? 'Revenue Reports Detail' : viewMode === 'plans' ? 'Plans Management' : 'Payment Log'}
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
                        <button
                            onClick={() => setViewMode('payments')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'payments' ? 'bg-white text-[#964C2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Payment Log
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
                        <div className="bg-[#F3F1EF] p-1.5 rounded-xl flex items-center gap-2">
                            <button
                                onClick={() => { setActiveTab('today'); setSelectedMonth('all'); }}
                                className={`px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'today' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                TODAY
                            </button>
                            <button
                                onClick={() => { setActiveTab('week'); setSelectedMonth('all'); }}
                                className={`px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'week' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                THIS WEEK
                            </button>
                            <button
                                onClick={() => { setActiveTab('month'); setSelectedMonth('all'); }}
                                className={`px-6 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'month' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                THIS MONTH
                            </button>
                            <button
                                onClick={() => { setActiveTab('all'); setSelectedMonth('all'); }}
                                className={`px-6 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all uppercase ${activeTab === 'all' ? 'bg-[#964C2E] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ALL TIME
                            </button>
                            <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-lg text-gray-500 hover:text-gray-700 flex items-center gap-2 uppercase">
                                CUSTOM <Calendar className="w-4 h-4" />
                            </button>
                            
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 text-xs font-bold tracking-wide rounded-lg bg-white border border-[#E6D9CC] text-[#1e2330] outline-none cursor-pointer focus:ring-2 focus:ring-[#964C2E]/20"
                            >
                                <option value="all">ALL MONTHS</option>
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                                    <option key={m} value={idx.toString()}>{m.toUpperCase()}</option>
                                ))}
                            </select>
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
                                <p className="text-[40px] font-bold mb-5 tracking-tight">₹{Number(scopedStats.totalRevenue).toLocaleString()}</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#4ADE80]">
                                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                                    {stats.revenueGrowth} <span className="text-white/70 font-medium ml-1">from last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Card 1 */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Enrollment Revenue</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">₹{Number(scopedStats.enrollmentRevenue).toLocaleString()}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                                <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                                +4.2% <span className="text-gray-400 font-medium ml-1">from last month</span>
                            </div>
                        </div>

                        {/* Info Card 2 */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Renewal Revenue</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">₹{Number(scopedStats.renewalRevenue).toLocaleString()}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                                <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                                +5.4% <span className="text-gray-400 font-medium ml-1">from last month</span>
                            </div>
                        </div>

                        {/* Info Card 3 */}
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100/80">
                            <h3 className="text-[13px] font-bold text-[#818C99] mb-2 uppercase tracking-wide">Guest Ride Revenue</h3>
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">₹{Number(scopedStats.guestRevenue).toLocaleString()}</p>
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
                            <div className="flex-1 flex items-end gap-6 px-4 relative pt-4 h-full">
                                {(scopedStats.trends || []).map((t, idx) => {
                                    const maxVal = Math.max(...(scopedStats.trends || []).map(item => Math.max(item.revenue2023 || 0, item.revenue2024 || 0)), 1);
                                    const height2023 = `${((t.revenue2023 || 0) / maxVal) * 100}%`;
                                    const height2024 = `${((t.revenue2024 || 0) / maxVal) * 100}%`;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                                            <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                                                {/* 2023 Bar */}
                                                <div 
                                                    className="w-1/2 bg-[#DBCBBF] rounded-t-sm transition-all duration-300 hover:brightness-95 relative group/bar" 
                                                    style={{ height: height2023 }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                        2023: ₹{t.revenue2023?.toLocaleString()}
                                                    </div>
                                                </div>
                                                {/* 2024 Bar */}
                                                <div 
                                                    className="w-1/2 bg-[#964C2E] rounded-t-sm transition-all duration-300 hover:brightness-95 relative group/bar" 
                                                    style={{ height: height2024 }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                                                        2024: ₹{t.revenue2024?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="mt-4 text-[10px] font-bold text-gray-400 tracking-wider">{t.month}</span>
                                        </div>
                                    );
                                })}
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
                                    <span className="w-3 h-3 rounded-full bg-[#964C2E]"></span> Enrollment ({scopedStats.mix?.enrollment}%)
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                    <span className="w-3 h-3 rounded-full bg-[#EDDED4]"></span> Renewal ({scopedStats.mix?.renewal}%)
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                    <span className="w-3 h-3 rounded-full bg-[#DBCBBF]"></span> Guests ({scopedStats.mix?.guests}%)
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
                                            <td className="py-5 px-6 font-semibold text-gray-600">₹{getStableRevenue(stable.id, 'enrollment').toLocaleString()}</td>
                                            <td className="py-5 px-6 font-semibold text-gray-600">₹{getStableRevenue(stable.id, 'renewal').toLocaleString()}</td>
                                            <td className="py-5 px-6 font-semibold text-gray-600">₹{getStableRevenue(stable.id, 'guest').toLocaleString()}</td>
                                            <td className="py-5 px-6 font-bold text-[#964C2E]">₹{getStableRevenue(stable.id, 'total').toLocaleString()}</td>
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
                                <p className="text-[40px] font-bold mb-5 tracking-tight">₹{Number(revenueData?.totalRevenue || 0).toLocaleString()}</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#4ADE80]">
                                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                                    <span>Active: ₹{Number(revenueData?.totalActiveRevenue || 0).toLocaleString()}</span>
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
                            <p className="text-[40px] font-bold text-[#1e2330] mb-5 tracking-tight">₹{Number(revenueData?.totalInactiveRevenue || 0).toLocaleString()}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                                <FileText className="w-4 h-4" strokeWidth={2.5} />
                                <span className="font-medium ml-1">From expired plans</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center px-8 py-6 border-b border-[#F0E6D8]">
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

                        {/* Table Header */}
                        <div className="grid grid-cols-[1.8fr_1.2fr_90px_110px_70px_110px_1.8fr_110px] gap-4 py-4 px-8 bg-gray-50/50 border-b border-[#F0E6D8]">
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">NAME</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">LEVEL</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">VALIDITY</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">BASE AMOUNT</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">GST</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">TOTAL</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">FEATURES</div>
                            <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col">
                            {plans.length === 0 ? (
                                <div className="text-center py-12 font-bold text-gray-400">No plans available. Create one to get started.</div>
                            ) : (
                                plans.map((plan) => {
                                    const gstPct = plan.gst ?? 0;
                                    const gstAmt = Math.round((Number(plan.amount) * gstPct) / 100);
                                    const totalAmt = plan.total_amount || (Number(plan.amount) + gstAmt);
                                    return (
                                        <div key={plan.id} className="grid grid-cols-[1.8fr_1.2fr_90px_110px_70px_110px_1.8fr_110px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-8 hover:bg-[#FDFBF9] transition-colors">
                                            {/* Name */}
                                            <div>
                                                <div className="font-black text-[#1e2330] text-[15px]">{plan.name}</div>
                                            </div>

                                            {/* Level */}
                                            <div>
                                                <span className="inline-block px-2.5 py-1 bg-[#FFF5F2] text-[#964C2E] rounded-full text-[11px] font-bold uppercase tracking-wide">
                                                    {plan.level || '—'}
                                                </span>
                                            </div>

                                            {/* Validity */}
                                            <div className="font-bold text-[#1e2330] text-sm">{plan.validity ? `${plan.validity} mo` : '—'}</div>

                                            {/* Base Amount */}
                                            <div className="font-bold text-[#1e2330] text-sm">{plan.amount > 0 ? `₹${Number(plan.amount).toLocaleString()}` : '—'}</div>

                                            {/* GST */}
                                            <div>
                                                {gstPct > 0
                                                    ? <span className="inline-flex px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[11px] font-black">{gstPct}%</span>
                                                    : <span className="text-gray-400 text-xs">—</span>}
                                            </div>

                                            {/* Total */}
                                            <div className="font-black text-[#964C2E] text-sm">{totalAmt > 0 ? `₹${totalAmt.toLocaleString()}` : '—'}</div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-1">
                                                {(plan.rules || []).slice(0, 2).map((rule, idx) => (
                                                    <span key={idx} className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 font-semibold line-clamp-1">{rule}</span>
                                                ))}
                                                {(plan.rules || []).length > 2 && (
                                                    <span className="text-[11px] text-[#964C2E] font-bold">+{plan.rules.length - 2} more</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenPlanModal(plan)}
                                                    className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                    title="Edit Plan"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Log Tab */}
            {viewMode === 'payments' && (() => {
                const allPlansAndLevels = [...plans, ...levels];
                const getPlanName = (planId) => {
                    const p = plans.find(x => x.id === planId);
                    if (p) return p.name;
                    const l = levels.find(x => x.id === planId);
                    if (l) return l.name;
                    return 'Unknown';
                };
                const filtered = payments.filter(p => {
                    const term = paySearchTerm.toLowerCase();
                    const matchSearch = !paySearchTerm ||
                        p.user?.name?.toLowerCase().includes(term) ||
                        p.user?.email?.toLowerCase().includes(term) ||
                        p.order_id?.toLowerCase().includes(term) ||
                        p.payment_id?.toLowerCase().includes(term);
                    let matchDate = true;
                    if (payStartDate && payEndDate) {
                        const d = new Date(p.date);
                        const end = new Date(payEndDate); end.setHours(23, 59, 59, 999);
                        matchDate = d >= payStartDate && d <= end;
                    }
                    const matchUser = !payUserFilter || p.user?.id === payUserFilter;
                    const matchPlan = !payPlanFilter || p.plan_id === payPlanFilter;
                    return matchSearch && matchDate && matchUser && matchPlan;
                });
                const totalPages = Math.ceil(filtered.length / PAY_PER_PAGE);
                const sliced = filtered.slice((payPage - 1) * PAY_PER_PAGE, payPage * PAY_PER_PAGE);
                const handleExport = () => {
                    const rows = filtered.map(p => ({
                        'Date': new Date(p.date).toLocaleString(),
                        'User': p.user?.name || 'N/A',
                        'Email': p.user?.email || 'N/A',
                        'Plan / Level': getPlanName(p.plan_id),
                        'Amount': `₹${p.amount}`,
                        'Wallet Used': p.wallet_amount_used > 0 ? `₹${p.wallet_amount_used}` : '₹0',
                        'Method': p.payment_method || 'unknown',
                        'Coupon': p.coupon_code || 'None',
                        'Order ID': p.order_id || 'N/A',
                        'Payment ID': p.payment_id || 'N/A',
                        'Status': p.status || 'captured',
                    }));
                    const ws = XLSX.utils.json_to_sheet(rows);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
                    XLSX.writeFile(wb, 'Payment_Log.xlsx');
                };
                return (
                    <div>
                        {/* Filters */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-3 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-wrap">
                                <Filter className="w-4 h-4 text-gray-400 ml-1" />
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search name, email, order ID…"
                                        value={paySearchTerm}
                                        onChange={e => { setPaySearchTerm(e.target.value); setPayPage(1); }}
                                        className="bg-[#F3F1EF] rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] w-52"
                                    />
                                </div>
                                <DatePicker selected={payStartDate} onChange={d => { setPayStartDate(d); setPayPage(1); }} placeholderText="Start Date" className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none w-28" />
                                <span className="text-gray-400 text-sm">–</span>
                                <DatePicker selected={payEndDate} onChange={d => { setPayEndDate(d); setPayPage(1); }} minDate={payStartDate} placeholderText="End Date" className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none w-28" />
                                <select value={payUserFilter} onChange={e => { setPayUserFilter(e.target.value); setPayPage(1); }} className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none border-r-8 border-transparent">
                                    <option value="">All Users</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <select value={payPlanFilter} onChange={e => { setPayPlanFilter(e.target.value); setPayPage(1); }} className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none border-r-8 border-transparent">
                                    <option value="">All Plans</option>
                                    {allPlansAndLevels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {(paySearchTerm || payStartDate || payEndDate || payUserFilter || payPlanFilter) && (
                                    <button onClick={() => { setPaySearchTerm(''); setPayStartDate(null); setPayEndDate(null); setPayUserFilter(''); setPayPlanFilter(''); setPayPage(1); }} className="text-xs text-red-500 font-bold hover:underline ml-1">Clear All</button>
                                )}
                            </div>
                            <button onClick={handleExport} className="px-5 py-2.5 bg-white border border-[#964C2E]/20 rounded-xl flex items-center gap-2 text-sm font-bold text-[#964C2E] hover:bg-[#FFF5F2] shadow-sm">
                                <FileSpreadsheet className="w-4 h-4" /> Export Excel
                            </button>
                        </div>
                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1e2330]">Payment Transactions</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">All Razorpay & wallet transactions</p>
                                </div>
                                <span className="text-sm font-bold bg-gray-50 px-4 py-2 rounded-lg text-gray-600">Total: <span className="text-[#964C2E]">{filtered.length}</span></span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-[#FAFAFA]">
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">User</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Date</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Plan / Level</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Razorpay ID</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Method</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Coupon</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Wallet</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Amount</th>
                                            <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sliced.length === 0 ? (
                                            <tr><td colSpan="9" className="py-10 text-center font-bold text-gray-400">No transactions found.</td></tr>
                                        ) : sliced.map((p, idx) => (
                                            <tr key={p.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 px-6">
                                                    <p className="text-sm font-bold text-[#1e2330]">{p.user?.name || 'N/A'}</p>
                                                    <p className="text-[11px] text-gray-400">{p.user?.email || ''}</p>
                                                </td>
                                                <td className="py-5 px-6 text-sm text-gray-600 font-semibold">
                                                    {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#964C2E]"><Layers className="w-3.5 h-3.5" /></div>
                                                        <span className="font-bold text-[#1e2330] text-sm">{getPlanName(p.plan_id)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <p className="text-[12px] font-bold text-gray-600">{p.payment_id}</p>
                                                    <p className="text-[10px] text-gray-400">{p.order_id}</p>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E8EAF6] text-[#3F51B5] text-[11px] font-bold capitalize">
                                                        {p.payment_method || (p.payment_id?.startsWith('wallet') ? 'wallet' : 'unknown')}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    {p.coupon_code
                                                        ? <span className="inline-flex px-2 py-1 rounded bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold">{p.coupon_code}</span>
                                                        : <span className="text-gray-400 text-xs">—</span>}
                                                </td>
                                                <td className="py-5 px-6 font-bold text-[#8C4A28] text-sm">
                                                    {p.wallet_amount_used > 0 ? `₹${p.wallet_amount_used}` : '—'}
                                                </td>
                                                <td className="py-5 px-6 font-black text-[#964C2E] text-base">₹{p.amount}</td>
                                                <td className="py-5 px-6">
                                                    <span className={`inline-flex px-2.5 py-1.5 rounded-md text-[11px] font-bold ${p.status === 'captured' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {p.status || 'captured'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            <div className="px-8 py-4 flex justify-between items-center border-t border-gray-100 bg-[#FAFAFA]/30">
                                <span className="text-xs font-semibold text-gray-400">
                                    Showing <span className="text-[#964C2E] font-bold">{filtered.length === 0 ? 0 : (payPage - 1) * PAY_PER_PAGE + 1}</span> – <span className="text-[#964C2E] font-bold">{Math.min(payPage * PAY_PER_PAGE, filtered.length)}</span> of <span className="text-[#964C2E] font-bold">{filtered.length}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <button disabled={payPage === 1} onClick={() => setPayPage(p => Math.max(p - 1, 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 bg-white shadow-sm disabled:opacity-40">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold text-gray-600 px-2">Page {payPage} of {totalPages || 1}</span>
                                    <button disabled={payPage === totalPages || totalPages === 0} onClick={() => setPayPage(p => Math.min(p + 1, totalPages))} className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-[#964C2E] hover:bg-gray-50 shadow-sm disabled:opacity-40">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Validity (in Months)</label>
                                    <input
                                        type="text"
                                        required
                                        value={planForm.validity}
                                        onChange={e => setPlanForm({ ...planForm, validity: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. 1, 2, 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Base Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={planForm.amount}
                                        onChange={e => setPlanForm({ ...planForm, amount: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. 10000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">GST (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={planForm.gst}
                                        onChange={e => setPlanForm({ ...planForm, gst: e.target.value })}
                                        className="w-full bg-[#F3F1EF] rounded-xl py-3 px-4 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
                                        placeholder="e.g. 18"
                                    />
                                </div>

                                {/* Live Total Preview */}
                                {(planForm.amount || planForm.gst) && (
                                    <div className="col-span-2 bg-[#FFF5F2] border border-[#964C2E]/20 rounded-xl p-4 flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-bold text-[#1e2330]">₹{Number(planForm.amount) || 0}</span>
                                            <span className="mx-2 text-gray-400">+</span>
                                            <span className="font-bold text-orange-600">₹{Math.round(((Number(planForm.amount) || 0) * (Number(planForm.gst) || 0)) / 100)} GST ({planForm.gst || 0}%)</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Total Amount</p>
                                            <p className="text-xl font-black text-[#964C2E]">₹{(Number(planForm.amount) || 0) + Math.round(((Number(planForm.amount) || 0) * (Number(planForm.gst) || 0)) / 100)}</p>
                                        </div>
                                    </div>
                                )}

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
