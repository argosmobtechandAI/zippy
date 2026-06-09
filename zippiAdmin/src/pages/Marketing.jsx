import { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Megaphone, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { notifyAllUsersApi, uploadNotificationImageApi, getBroadcastsApi, deleteBroadcastApi } from '../api/apis';
import axios from 'axios';
import toast from 'react-hot-toast';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        targetType: 'rider' // Default to riders
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // History State
    const [broadcasts, setBroadcasts] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const fetchBroadcasts = async () => {
        setLoadingHistory(true);
        try {
            const res = await apiFunction(getBroadcastsApi, [], {}, "GET", true);
            if (res && res.success) {
                setBroadcasts(res.broadcasts || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchBroadcasts();
        }
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.desc) {
            toast.error("Please fill in both title and description");
            return;
        }

        setIsSubmitting(true);
        let uploadedImageUrl = null;

        try {
            // 1. Upload image if exists
            if (image) {
                const uploadData = new FormData();
                uploadData.append("file", image);
                
                const res = await axios.post(uploadNotificationImageApi, uploadData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res && res.data && res.data.success) {
                    uploadedImageUrl = res.data.url;
                } else {
                    throw new Error(res?.data?.message || "Failed to upload image");
                }
            }

            // 2. Send Broadcast Notification
            const payload = {
                title: formData.title,
                desc: formData.desc,
                type: 'marketing',
                image: uploadedImageUrl,
                targetType: formData.targetType
            };

            const notifyRes = await apiFunction(notifyAllUsersApi, [], payload, "POST", true);
            
            if (notifyRes && notifyRes.success) {
                toast.success("Broadcast sent successfully!");
                // Reset form
                setFormData({ title: '', desc: '', targetType: 'rider' });
                clearImage();
                // Switch to history to see it
                setActiveTab('history');
            } else {
                throw new Error(notifyRes?.message || "Failed to send broadcast");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while sending the broadcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this broadcast? It will be removed from all users' apps as well.")) {
            try {
                const res = await apiFunction(deleteBroadcastApi(id), [], {}, "DELETE", true);
                if (res && res.success) {
                    toast.success("Broadcast deleted successfully");
                    fetchBroadcasts();
                } else {
                    throw new Error(res?.message || "Failed to delete");
                }
            } catch (error) {
                toast.error(error.message || "An error occurred while deleting");
            }
        }
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBroadcasts = broadcasts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(broadcasts.length / itemsPerPage);

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fbf6f0] w-full font-sans">
            <div className="mb-8">
                <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight flex items-center gap-3">
                    <Megaphone className="w-8 h-8 text-[#964C2E]" />
                    Marketing & Offers
                </h1>
                <p className="text-[14px] font-medium text-gray-500">Send push notifications and manage past broadcasts.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('compose')}
                    className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'compose' ? 'bg-[#964C2E] text-white shadow-md' : 'bg-white text-gray-500 border border-[#F0E6D8] hover:bg-gray-50'}`}
                >
                    Compose Offer
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'history' ? 'bg-[#964C2E] text-white shadow-md' : 'bg-white text-gray-500 border border-[#F0E6D8] hover:bg-gray-50'}`}
                >
                    Sent Broadcasts
                </button>
            </div>

            {activeTab === 'compose' && (
                <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] p-8 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Target Audience is fixed to Riders */}
                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Target Audience</label>
                            <div className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold text-[#1e2330]">
                                Riders Only
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Notification Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Special Weekend Offer!"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Message Description</label>
                            <textarea
                                placeholder="Type your message here..."
                                value={formData.desc}
                                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#964C2E]/10 focus:border-[#964C2E] focus:bg-white transition-all h-32 resize-none"
                                maxLength={500}
                            />
                            <div className="text-right text-[11px] text-gray-400 font-semibold px-1 mt-1">
                                {formData.desc.length}/500 characters
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2 block px-1">Feature Image (Optional)</label>
                            
                            {imagePreview ? (
                                <div className="relative rounded-2xl overflow-hidden border border-gray-200 inline-block">
                                    <img src={imagePreview} alt="Preview" className="h-48 object-cover rounded-2xl" />
                                    <button 
                                        type="button" 
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-[#F9EFE5] hover:border-[#964C2E] hover:text-[#964C2E] cursor-pointer transition-all text-gray-400">
                                    <ImageIcon className="w-6 h-6 mb-2" />
                                    <span className="text-[13px] font-bold">Click to upload image</span>
                                    <input 
                                        id="image-upload" 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="pt-6 border-t border-[#F0E6D8]">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-[#964C2E] text-white text-[15px] font-bold py-4 rounded-xl shadow-lg hover:bg-[#7D3F25] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? "Sending Broadcast..." : "Send Broadcast Now"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-[24px] shadow-sm border border-[#F0E6D8] flex flex-col max-w-5xl">
                    <div className="p-6 pb-4 border-b border-[#F0E6D8] flex justify-between items-center">
                        <h2 className="text-[16px] font-black text-[#1e2330]">Broadcast History</h2>
                        <div className="text-[13px] font-semibold text-gray-400">
                            Total: {broadcasts.length}
                        </div>
                    </div>

                    <div className="grid grid-cols-[80px_1fr_120px_150px_100px] gap-4 py-4 border-b border-[#F0E6D8] px-8 bg-gray-50/50">
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">IMAGE</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">CONTENT</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">AUDIENCE</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase">SENT AT</div>
                        <div className="text-[10px] font-black text-[#A59588] tracking-widest uppercase text-right">ACTIONS</div>
                    </div>

                    <div className="flex flex-col">
                        {loadingHistory ? (
                            <div className="text-center py-10 font-bold text-gray-400">Loading broadcasts...</div>
                        ) : broadcasts.length === 0 ? (
                            <div className="text-center py-10 font-bold text-gray-400">No broadcasts sent yet.</div>
                        ) : (
                            currentBroadcasts.map((b) => (
                                <div key={b.id} className="grid grid-cols-[80px_1fr_120px_150px_100px] gap-4 items-center border-b border-[#F0E6D8] py-5 px-8 hover:bg-[#FDFBF9] transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {b.image ? (
                                            <img src={b.image} alt="Broadcast" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="pr-4">
                                        <h4 className="text-[14px] font-black text-[#1e2330] mb-1 line-clamp-1">{b.title}</h4>
                                        <p className="text-[12px] font-semibold text-gray-400 line-clamp-1">{b.desc}</p>
                                    </div>
                                    <div>
                                        <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-[#E0F8EC] text-[#059669]">
                                            {b.target_type === 'rider' ? 'RIDERS' : b.target_type === 'trainer' ? 'TRAINERS' : 'ALL USERS'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1e2330]">
                                            {new Date(b.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-[11px] font-semibold text-gray-400">
                                            {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                                            title="Delete Broadcast"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {broadcasts.length > 0 && (
                        <div className="p-6 flex justify-between items-center rounded-b-[24px]">
                            <div className="text-[12px] font-bold text-gray-400">
                                Page {currentPage} of {totalPages || 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#964C2E] hover:border-[#964C2E] transition-all bg-white disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button 
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#964C2E] hover:border-[#964C2E] transition-all bg-white disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Marketing;
