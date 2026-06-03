
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, UserPlus, ShieldAlert, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAdminNotificationsApi, markAllAdminNotificationsAsReadApi, markAdminNotificationAsReadApi } from '../api/apis';

const NotificationCenter = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAdminNotificationsApi, [], {}, "GET", true);
            if (res && res.success) {
                setNotifications(res.notifications || []);
            }
        } catch (error) {
            console.error("Error fetching admin notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Polling for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        
        // Handle click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = async () => {
        try {
            const res = await apiFunction(markAllAdminNotificationsAsReadApi, [], {}, "PUT", true);
            if (res && res.success) {
                setNotifications(notifications.map(n => ({ ...n, unread: false })));
            }
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const handleMarkSingleAsRead = async (id) => {
        try {
            const res = await apiFunction(markAdminNotificationAsReadApi(id), [], {}, "PUT", true);
            if (res && res.success) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
            }
        } catch (error) {
            console.error("Error marking single notification as read", error);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Calendar className="w-4 h-4 text-[#964C2E]" />;
            case 'plan': return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
            case 'alert': return <ShieldAlert className="w-4 h-4 text-[#EF4444]" />;
            case 'system': return <UserPlus className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'Just Now';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 6000);
            
            if (diffMins < 1) return 'Just Now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch (e) {
            return 'Just Now';
        }
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button 
                onClick={toggleOpen}
                className="relative p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-[#964C2E] hover:bg-[#F9EFE5] transition-all duration-300"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-[#FDF9F4]">
                        <div>
                            <h3 className="text-sm font-black text-[#1e2330]">System Notifications</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {unreadCount} UNREAD ALERTS
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleMarkAsRead}
                                className="text-[10px] font-black text-[#964C2E] uppercase tracking-wider hover:opacity-70 transition-opacity"
                            >
                                Clear All
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#EF4444] p-1">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="w-6 h-6 border-2 border-[#964C2E]/20 border-t-[#964C2E] rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-xs font-bold text-gray-400">Syncing Inbox...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={24} className="text-gray-200" />
                                </div>
                                <p className="text-sm font-black text-[#1e2330]">Inbox is Empty</p>
                                <p className="text-[11px] font-medium text-gray-400 mt-1">Check back later for system updates</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif, idx) => (
                                    <div 
                                        key={notif.id || idx} 
                                        onClick={() => notif.unread && handleMarkSingleAsRead(notif.id)}
                                        className={`p-6 flex gap-4 hover:bg-[#FDF9F4] transition-colors relative cursor-pointer ${notif.unread ? 'bg-white' : 'bg-gray-50/10'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.unread ? 'bg-[#964C2E]/10' : 'bg-gray-100'}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className={`text-[13px] font-black tracking-tight ${notif.unread ? 'text-[#1e2330]' : 'text-gray-500'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed ${notif.unread ? 'font-semibold text-gray-600' : 'text-gray-400'}`}>
                                                {notif.desc}
                                            </p>
                                            {notif.unread && (
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#964C2E] rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30 text-center">
                        <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-[#964C2E] transition-colors">
                            View All Logs
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
