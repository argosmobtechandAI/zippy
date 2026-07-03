
import { useState, useEffect } from "react";
import { Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import NotificationCenter from "./notificationCenter";
import { apiFunction } from "../api/apiFunction";
import { getUserApi } from "../api/apis";

const Header = () => {
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            // In Admin app, user might be stored in localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                // We fetch fresh data to get notifications
                const res = await apiFunction(`${getUserApi}?userId=${parsedUser.id}`, [], {}, "GET", true);
                if (res && res.success) {
                    setUser(res.user);
                } else {
                    setUser(parsedUser);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <header className="h-[80px] bg-brand-beige/80 backdrop-blur-xl border-b border-brand-brown/5 flex items-center justify-between px-10 sticky top-0 z-30 font-body">
            {/* Search Bar */}
            <div className="relative w-[400px] group">
                <Search className="w-5 h-5 text-brand-brown/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-brown transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search fleet or records..." 
                    className="w-full bg-white/50 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-[13px] font-semibold text-brand-black focus:outline-none focus:bg-white focus:border-brand-brown/20 transition-all placeholder:text-brand-brown/30 shadow-sm"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                {/* Notification Dropdown Component */}
                <NotificationCenter user={user} />

                <div className="h-8 w-[1px] bg-brand-brown/10 mx-2" />

                {/* Profile Section */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-transparent hover:border-brand-brown/10 hover:bg-white transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand-brown flex items-center justify-center text-white overflow-hidden shadow-lg shadow-brand-brown/20">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} className="w-full h-full object-cover" alt="profile" />
                            ) : (
                                <User size={20} strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-[13px] font-display font-bold text-brand-brown leading-none mb-1 group-hover:text-brand-orange transition-colors">{user?.name || "Stable Owner"}</p>
                            <p className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest leading-none">Management</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-brand-brown/40 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileDropdown && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-brand-brown/5 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-3 border-b border-brand-brown/5 mb-1">
                                <p className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest">Signed in as</p>
                                <p className="text-[12px] font-bold text-brand-brown truncate">{user?.email || "owner@stable.com"}</p>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-brand-brown/70 hover:bg-brand-beige hover:text-brand-brown transition-colors">
                                <Settings size={18} />
                                Console Settings
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Exit System
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
