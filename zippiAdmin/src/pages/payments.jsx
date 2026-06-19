import React, { useState, useEffect } from 'react';
import {
    Activity, Search, Bell, User, Calendar,
    FileSpreadsheet, FileText, CreditCard, Layers, Filter
} from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getPaymentsApi, plansApi, getLevelsApi, getAllStablesApi, getAllUsersApi } from '../api/apis';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [plans, setPlans] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userLevelFilter, setUserLevelFilter] = useState('');
    const [centerLevelFilter, setCenterLevelFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');

    const [stables, setStables] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paymentsRes, plansRes, levelsRes, stablesRes, usersRes] = await Promise.all([
                    apiFunction(getPaymentsApi, [], {}, "GET", true),
                    apiFunction(plansApi, [], {}, "GET", true),
                    apiFunction(getLevelsApi, [], {}, "GET", true),
                    apiFunction(getAllStablesApi, [], {}, "GET", true),
                    apiFunction(getAllUsersApi, [], {}, "GET", true)
                ]);

                if (paymentsRes && paymentsRes.success) {
                    setPayments(paymentsRes.payments || []);
                }
                if (plansRes && plansRes.success) {
                    setPlans(plansRes.plans || []);
                }
                if (levelsRes && levelsRes.success) {
                    setLevels(levelsRes.levels || []);
                }
                if (stablesRes && stablesRes.success) {
                    setStables(stablesRes.stables || []);
                }
                if (usersRes && usersRes.success) {
                    setUsers(usersRes.users || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getPlanOrLevelName = (planId) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) return plan.name;
        
        const level = levels.find(l => l.id === planId);
        if (level) return level.name;

        return 'Unknown';
    };

    const filteredPayments = payments.filter((payment) => {
        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            matchesSearch = 
                payment.user?.name?.toLowerCase().includes(term) ||
                payment.user?.email?.toLowerCase().includes(term) ||
                payment.order_id?.toLowerCase().includes(term) ||
                payment.payment_id?.toLowerCase().includes(term);
        }

        let matchesDate = true;
        if (startDate && endDate) {
            const paymentDate = new Date(payment.date);
            // End of day for end date
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            matchesDate = paymentDate >= startDate && paymentDate <= endOfDay;
        }

        let matchesUserLevel = true;
        if (userLevelFilter) {
            const levelsArr = payment.user?.rider?.map(r => r.level) || [];
            matchesUserLevel = levelsArr.includes(userLevelFilter);
        }

        let matchesCenter = true;
        if (centerLevelFilter) {
            const centersArr = payment.user?.rider?.map(r => r.stable?.name) || [];
            matchesCenter = centersArr.includes(centerLevelFilter);
        }

        let matchesUser = true;
        if (userFilter) {
            matchesUser = payment.user?.id === userFilter;
        }

        let matchesPlan = true;
        if (planFilter) {
            matchesPlan = payment.plan_id === planFilter;
        }

        return matchesSearch && matchesDate && matchesUserLevel && matchesCenter && matchesUser && matchesPlan;
    });

    const uniqueUserLevels = levels.map(l => l.name);
    const uniqueCenters = stables.map(s => s.name);
    const allUsers = users;
    const allPlans = [...plans, ...levels];

    const handleExportExcel = () => {
        if (filteredPayments.length === 0) return;

        const data = filteredPayments.map((p) => ({
            'Transaction Date': new Date(p.date).toLocaleString(),
            'User Name': p.user?.name || 'Unknown',
            'User Email': p.user?.email || 'N/A',
            'Plan / Level': getPlanOrLevelName(p.plan_id),
            'Total Amount': `₹${p.amount}`,
            'Wallet Used': p.wallet_amount_used > 0 ? `₹${p.wallet_amount_used}` : '₹0',
            'Payment Method': p.payment_method || (p.payment_id?.startsWith('wallet') ? 'wallet' : 'online'),
            'Coupon Code': p.coupon_code || 'None',
            'Order ID': p.order_id || 'N/A',
            'Payment ID': p.payment_id || 'N/A',
            'Status': p.status || 'captured'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "Payment_Transactions.xlsx");
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto h-full overflow-y-auto w-full relative">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-[#964C2E]" strokeWidth={2.5} />
                    <h1 className="text-[26px] font-bold text-[#1e2330]">Payment Transactions</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, email, order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#F3F1EF] rounded-xl py-2.5 pl-11 pr-4 w-[280px] outline-none text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#964C2E] transition-all"
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

            {/* Filters Area */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-400 ml-2" />
                    <span className="text-sm font-bold text-gray-600">Filter by Date:</span>
                    <div className="flex items-center gap-2 border-r border-gray-100 pr-4 mr-1">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] w-28"
                        />
                        <span className="text-gray-400">-</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="End Date"
                            className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] w-28"
                        />
                    </div>

                    <span className="text-sm font-bold text-gray-600 ml-1">User:</span>
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] min-w-[120px] border-r-[8px] border-transparent"
                    >
                        <option value="">All Users</option>
                        {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>

                    <span className="text-sm font-bold text-gray-600 ml-3">Plan/Membership:</span>
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] min-w-[140px] border-r-[8px] border-transparent"
                    >
                        <option value="">All Plans</option>
                        {allPlans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                    </select>

                    <span className="text-sm font-bold text-gray-600 ml-3">Level:</span>
                    <select
                        value={userLevelFilter}
                        onChange={(e) => setUserLevelFilter(e.target.value)}
                        className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] min-w-[120px] border-r-[8px] border-transparent"
                    >
                        <option value="">All Levels</option>
                        {uniqueUserLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>

                    <span className="text-sm font-bold text-gray-600 ml-3">Center:</span>
                    <select
                        value={centerLevelFilter}
                        onChange={(e) => setCenterLevelFilter(e.target.value)}
                        className="bg-[#F3F1EF] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-[#964C2E] min-w-[140px] border-r-[8px] border-transparent"
                    >
                        <option value="">All Centers</option>
                        {uniqueCenters.map(center => <option key={center} value={center}>{center}</option>)}
                    </select>

                    {(startDate || endDate || userLevelFilter || centerLevelFilter || userFilter || planFilter) && (
                        <button 
                            onClick={() => { setStartDate(null); setEndDate(null); setUserLevelFilter(''); setCenterLevelFilter(''); setUserFilter(''); setPlanFilter(''); }}
                            className="text-xs text-red-500 font-bold ml-3 hover:underline"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleExportExcel}
                        className="px-5 py-2.5 bg-white border border-[#964C2E]/20 rounded-xl flex items-center gap-2.5 text-sm font-bold text-[#964C2E] hover:bg-[#FFF5F2] shadow-sm transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Export to Excel
                    </button>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100/80 bg-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-[#1e2330]">All Transactions</h3>
                        <p className="text-sm text-gray-500 mt-1">Detailed list of all Razorpay transactions</p>
                    </div>
                    <div className="text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                        Total Records: <span className="text-[#964C2E]">{filteredPayments.length}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100/80 bg-[#FAFAFA]">
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">USER DETAILS</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">DATE</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">PLAN / LEVEL</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">RAZORPAY ID</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">METHOD</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">COUPON</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">WALLET</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">TOTAL AMOUNT</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-[#818C99] tracking-widest uppercase">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-10 text-center font-bold text-gray-400">Loading transactions...</td>
                                </tr>
                            ) : filteredPayments.map((payment, idx) => (
                                <tr key={payment.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-6">
                                        <p className="text-sm font-bold text-[#1e2330]">{payment.user?.name || 'N/A'}</p>
                                        <p className="text-[11px] font-semibold text-gray-400">{payment.user?.email || 'N/A'}</p>
                                    </td>
                                    <td className="py-5 px-6 text-sm text-gray-600 font-semibold">
                                        {new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#FFF5F2] flex items-center justify-center text-[#964C2E]">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-[#1e2330]">{getPlanOrLevelName(payment.plan_id)}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <p className="text-[12px] font-bold text-gray-600">{payment.payment_id}</p>
                                        <p className="text-[10px] text-gray-400">{payment.order_id}</p>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E8EAF6] text-[#3F51B5] text-[11px] font-bold capitalize">
                                            {payment.payment_method || (payment.payment_id?.startsWith('wallet') ? 'wallet' : 'unknown')}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        {payment.coupon_code ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold">
                                                {payment.coupon_code}
                                            </span>
                                        ) : (
                                            <span className="text-[12px] text-gray-400 font-medium">-</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-6 font-bold text-[#8C4A28] text-sm">
                                        {payment.wallet_amount_used > 0 ? `₹${payment.wallet_amount_used}` : '-'}
                                    </td>
                                    <td className="py-5 px-6 font-black text-[#964C2E] text-base">
                                        ₹{payment.amount}
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-bold ${payment.status === 'captured' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {payment.status || 'captured'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="py-10 text-center font-bold text-gray-400">No transactions found for the given criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payments;
