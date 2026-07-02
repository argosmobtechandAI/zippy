import { CheckCircle2, ChevronRight, Clock, Calendar as CalendarIcon, XCircle, Search, Users, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllUsersApi, updateUserLeaveApi } from '../api/apis';
import toast from 'react-hot-toast';

const formatWithDay = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return `${dateStr} (${days[d.getDay()]})`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${dateStr} (${days[d.getDay()]})`;
};

const STATUS_TABS = [
    { key: 'PENDING', label: 'Pending Requests', color: 'bg-amber-100 text-amber-700' },
    { key: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-700' },
    { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-600' },
    { key: 'ALL', label: 'All Requests', color: 'bg-gray-100 text-gray-600' },
];

const statusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === 'APPROVED') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'REJECTED') return 'bg-red-100 text-red-600 border border-red-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
};

import { useSelector } from 'react-redux';

const LeaveRequests = () => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');

    const fetchUsersAndLeaves = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAllUsersApi, [], {}, 'GET', true);
            if (res?.success) {
                const allUsers = res.users || [];
                const filtered = allUsers.filter(u => u.stableId === selectedStable || u.stable_id === selectedStable);
                setUsers(filtered);
            } else {
                toast.error('Failed to load leave requests');
            }
        } catch {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndLeaves();
    }, [selectedStable]);

    const handleLeaveStatus = async (userId, leave, newStatus) => {
        try {
            const res = await apiFunction(
                `${updateUserLeaveApi}/${userId}`,
                [],
                { startDate: leave.startDate, endDate: leave.endDate, status: newStatus },
                'PUT',
                true
            );
            if (res?.success) {
                toast.success(`Leave request ${newStatus.toLowerCase()} successfully`);
                fetchUsersAndLeaves();
            } else {
                toast.error(res?.message || 'Update failed');
            }
        } catch {
            toast.error('Network error');
        }
    };

    // Flatten leaves from all users
    const allLeaves = useMemo(() => {
        const list = [];
        users.forEach(user => {
            if (user.leaves && Array.isArray(user.leaves)) {
                user.leaves.forEach(leave => {
                    list.push({
                        ...leave,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            type: user.type,
                            mobile: user.mobile
                        }
                    });
                });
            }
        });
        // Sort by submittedAt descending or startDate descending
        return list.sort((a, b) => {
            const dateA = a.submittedAt || a.startDate;
            const dateB = b.submittedAt || b.startDate;
            return new Date(dateB) - new Date(dateA);
        });
    }, [users]);

    // Filter by active tab, search query and role
    const filteredLeaves = useMemo(() => {
        return allLeaves.filter(leave => {
            // Tab filter
            const matchesTab = activeTab === 'ALL' || leave.status?.toUpperCase() === activeTab;
            
            // Search query (member name, email or reason)
            const search = searchQuery.toLowerCase();
            const matchesSearch = 
                (leave.user?.name?.toLowerCase() || '').includes(search) ||
                (leave.user?.email?.toLowerCase() || '').includes(search) ||
                (leave.reason?.toLowerCase() || '').includes(search);

            // Role filter
            const matchesRole = selectedRole === 'ALL' || leave.user?.type?.toUpperCase() === selectedRole;

            return matchesTab && matchesSearch && matchesRole;
        });
    }, [allLeaves, activeTab, searchQuery, selectedRole]);

    // Counts for tabs
    const counts = useMemo(() => {
        const c = { PENDING: 0, APPROVED: 0, REJECTED: 0, ALL: 0 };
        allLeaves.forEach(leave => {
            const status = leave.status?.toUpperCase() || 'PENDING';
            c.ALL++;
            if (c[status] !== undefined) {
                c[status]++;
            }
        });
        return c;
    }, [allLeaves]);

    return (
        <div className="p-8 max-w-[1400px] mx-auto font-body">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-[#1e2330] tracking-tight font-display mb-1 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-[#964C2E]" strokeWidth={2.5} />
                        Leave Management
                    </h1>
                    <p className="text-[13px] font-semibold text-gray-500">
                        Review, approve, or reject leave requests submitted by staff members and trainers.
                    </p>
                </div>

                <button 
                    onClick={fetchUsersAndLeaves} 
                    className="bg-white border border-[#964C2E]/20 text-[13px] font-bold text-[#1e2330] px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-white/80 transition-all"
                >
                    <Clock className="w-4 h-4 text-[#964C2E]" strokeWidth={2.5} />
                    Refresh
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-[#E6D9CC] rounded-3xl p-5 mb-8 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl">
                    <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or leave reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-[13px] font-semibold text-[#1e2330] outline-none placeholder-gray-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-[#FBF9F6] border border-[#E6D9CC]/60 px-4 py-3 rounded-2xl flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#964C2E]" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="text-[13px] font-bold text-[#1e2330] outline-none bg-transparent cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="TRAINER">Trainers</option>
                            <option value="VET">Vets</option>
                            <option value="STABLESTAFF">Stable Staff</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white border border-[#E6D9CC] rounded-2xl p-1.5 w-fit shadow-sm">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            activeTab === tab.key
                                ? 'bg-[#964C2E] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-[#F6EDE2]'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.key ? 'bg-white/20 text-white' : tab.color
                        }`}>
                            {counts[tab.key] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Header */}
                    <div className="grid grid-cols-[220px_130px_220px_1fr_120px_180px] gap-4 mb-4 border-b border-[#E6D9CC] pb-4 px-4">
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">MEMBER NAME</div>
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">ROLE</div>
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">LEAVE DURATION</div>
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase">REASON</div>
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                        <div className="text-[11px] font-bold text-[#A59588] tracking-widest uppercase text-right pr-4">ACTIONS</div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="text-center py-16 bg-white border border-[#E6D9CC] rounded-2xl shadow-sm">
                                <p className="font-bold text-gray-500 text-sm">Loading leave requests...</p>
                            </div>
                        ) : filteredLeaves.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[#E6D9CC] rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                                <AlertCircle className="w-8 h-8 text-gray-400" />
                                <p className="font-bold text-gray-400 text-sm">
                                    No {activeTab === 'ALL' ? '' : activeTab.toLowerCase()} leave requests found.
                                </p>
                            </div>
                        ) : (
                            filteredLeaves.map((leave, idx) => {
                                const status = leave.status?.toUpperCase() || 'PENDING';
                                const isPending = status === 'PENDING';
                                const roleLabel = leave.user?.type === 'trainer' ? 'Trainer' :
                                                  leave.user?.type === 'vet' ? 'Vet' :
                                                  leave.user?.type === 'stableStaff' ? 'Stable Staff' : leave.user?.type;

                                return (
                                    <div key={idx} className="grid grid-cols-[220px_130px_220px_1fr_120px_180px] gap-4 items-center bg-white border border-[#E6D9CC] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                        {/* Member Info */}
                                        <div className="flex items-center gap-3 pl-2">
                                            <div className="w-[38px] h-[38px] rounded-full bg-[#F6EDE2] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-black text-[#964C2E] text-sm flex-shrink-0">
                                                {leave.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="truncate">
                                                <h4 className="text-[13px] font-black text-[#1e2330] truncate">{leave.user?.name}</h4>
                                                <p className="text-[11px] font-medium text-gray-400 truncate">{leave.user?.email}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                                                leave.user?.type === 'trainer' ? 'bg-[#E5ECE5] text-[#2E6B40]' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {roleLabel}
                                            </span>
                                        </div>

                                        {/* Duration */}
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1e2330]">{formatWithDay(leave.startDate)}</div>
                                            <div className="text-[11px] font-semibold text-gray-400">to {formatWithDay(leave.endDate)}</div>
                                        </div>

                                        {/* Reason */}
                                        <div className="text-[13px] font-medium text-gray-600 line-clamp-2 pr-4" title={leave.reason}>
                                            {leave.reason || <span className="text-gray-400 italic">No reason provided</span>}
                                        </div>

                                        {/* Status */}
                                        <div className="flex justify-center">
                                            <span className={`inline-flex justify-center px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${statusStyle(leave.status)}`}>
                                                {leave.status || 'PENDING'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 pr-2">
                                            {isPending ? (
                                                <>
                                                    <button
                                                        onClick={() => handleLeaveStatus(leave.user.id, leave, 'approved')}
                                                        className="bg-green-50 border border-green-200 text-green-600 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase shadow-sm hover:bg-green-100 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleLeaveStatus(leave.user.id, leave, 'rejected')}
                                                        className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase shadow-sm hover:bg-red-100 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-[11px] font-bold text-gray-400 italic">
                                                    Processed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests;
