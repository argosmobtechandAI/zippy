import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCcw, ChevronLeft, ChevronRight, Trash2, CheckCircle2 } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getHelpCenterApi, updateHelpCenterApi, deleteHelpCenterApi } from '../api/apis';
import toast from 'react-hot-toast';

const HelpCenter = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getHelpCenterApi, [], {}, "GET", true);
            if (res && res.success) {
                // Sort by date descending (newest first)
                const sorted = (res.data || []).sort((a, b) => new Date((b.created_at || '').replace(' ', 'T').replace(/\+00$/, 'Z')) - new Date((a.created_at || '').replace(' ', 'T').replace(/\+00$/, 'Z')));
                setRequests(sorted);
            } else {
                toast.error(res?.message || "Failed to fetch help center requests");
            }
        } catch (error) {
            toast.error("An error occurred while fetching requests");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
        try {
            const res = await apiFunction(`${updateHelpCenterApi}/${id}`, [], { status: newStatus }, "PUT", true);
            if (res && res.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchRequests();
            } else {
                toast.error(res?.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const res = await apiFunction(`${deleteHelpCenterApi}/${id}`, [], {}, "DELETE", true);
            if (res && res.success) {
                toast.success("Request deleted successfully");
                fetchRequests();
            } else {
                toast.error(res?.message || "Failed to delete request");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Help Center</h1>
                    <p className="text-[14px] font-medium text-gray-500">View and manage support requests from users.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="bg-white text-gray-700 border border-gray-200 text-[13px] font-bold px-6 py-4 rounded-xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                >
                    <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
                    Refresh
                </button>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] flex flex-col">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-[13px] font-semibold text-gray-400">
                            Showing {requests.length} requests
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[150px_200px_1fr_150px_150px] gap-4 pb-4 border-b border-[#F0E6D8] px-4">
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">DATE</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">USER ID</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">SUBJECT & MESSAGE</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-center">STATUS</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col min-h-[300px]">
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-400">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400">No support requests found.</div>
                    ) : (
                        paginatedRequests.map((req, idx) => (
                            <div key={req.id || idx} className="grid grid-cols-[150px_200px_1fr_150px_150px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-10 hover:bg-[#FDFBF9] transition-colors">
                                <div className="text-[14px] font-bold text-[#1e2330]">
                                    {new Date((req.created_at || '').replace(' ', 'T').replace(/\+00$/, 'Z')).toLocaleDateString()}
                                </div>
                                <div className="text-[12px] font-semibold text-gray-500 truncate pr-4">
                                    {req.userName !== 'Unknown User' ? req.userName : (req.user_id || "Guest / Anonymous")}
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-[#1e2330] mb-0.5">{req.subject}</h4>
                                    <p className="text-[12px] font-semibold text-gray-500 leading-snug">{req.message}</p>
                                </div>
                                <div className="flex justify-center">
                                    <button 
                                        onClick={() => handleStatusChange(req.id, req.status)}
                                        className={`inline-flex max-w-[90px] w-full text-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase transition-all hover:opacity-80 ${req.status === 'Open' ? 'bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20' : 'bg-[#E0F8EC] text-[#059669] border border-[#059669]/20'}`}
                                    >
                                        {req.status}
                                    </button>
                                </div>
                                <div className="flex justify-end gap-3 text-sm font-bold text-gray-400">
                                    <button
                                        onClick={() => handleStatusChange(req.id, req.status)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-green-600"
                                        title={req.status === 'Open' ? "Mark as Closed" : "Mark as Open"}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(req.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                                        title="Delete Request"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                {!loading && requests.length > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-[#F0E6D8] bg-[#FAF8F5] rounded-b-[24px]">
                        <div className="text-[13px] font-semibold text-gray-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, requests.length)} of {requests.length} requests
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl font-bold text-[13px] transition-all shadow-sm flex items-center justify-center ${currentPage === i + 1 ? 'bg-[#964C2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button 
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpCenter;
