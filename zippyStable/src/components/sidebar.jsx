import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CloudLightning, ClipboardList, BarChart2, MapPin, Package, Tag, HeartPulse, Calendar, Settings, LogOut, BookOpen, BookOpenCheck, Activity } from 'lucide-react';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi } from '../api/apis';

const Sidebar = () => {

    const navigate = useNavigate();
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const [stableDetails, setStableDetails] = useState(null);

    useEffect(() => {
        const fetchStable = async () => {
            if (selectedStable) {
                const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);
                if (res && res.success) {
                    const current = res.stables.find(s => s.id === selectedStable);
                    setStableDetails(current);
                }
            }
        };
        fetchStable();
    }, [selectedStable]);

    const handleLogOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("selectedStable");
        navigate("/login");
    };

    return (
        <div className="w-[280px] bg-brand-brown h-full flex flex-col text-brand-beige shadow-lg relative z-20 flex-shrink-0 font-body overflow-hidden">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-xl overflow-hidden p-1 shadow-sm">
                    <img src={stableDetails?.logo || "/assets/logo/ZEC Logos-02.svg"} alt="Stable Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-[16px] tracking-tight text-brand-beige mb-0.5 font-display line-clamp-1" title={stableDetails?.name}>{stableDetails?.name || "Center Admin"}</h1>
                    <p className="text-[10px] text-brand-beige/60 uppercase tracking-widest font-bold">Equestrian Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-2 px-5 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-4">
                <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard Overview
                </NavLink>
                <NavLink to="/bookingRequests" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Users className="w-5 h-5" />
                    Booking Requests
                </NavLink>
                <NavLink to="/userManagement" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Users className="w-5 h-5" />
                    Member Directory
                </NavLink>
                <NavLink to="/horses" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <CloudLightning className="w-5 h-5" />
                    Horses registry
                </NavLink>
                <NavLink to="/horse-health" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Activity className="w-5 h-5" />
                    Horse Health & Workload
                </NavLink>
                <NavLink to="/workout-tracker" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <ClipboardList className="w-5 h-5" />
                    Workout Tracker
                </NavLink>
                <NavLink to="/attendanceReport" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <ClipboardList className="w-5 h-5" />
                    Attendance Report
                </NavLink>
                <NavLink to="/revenue" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <BarChart2 className="w-5 h-5" />
                    Revenue Reports
                </NavLink>
                <NavLink to="/slot-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Slot Management
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Tag className="w-5 h-5" />
                    Horse Categories
                </NavLink>
                <NavLink to="/medical-records" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <HeartPulse className="w-5 h-5" />
                    Medical Registry
                </NavLink>
                <NavLink to="/leaveRequests" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Calendar className="w-5 h-5" />
                    Leave Requests
                </NavLink>
                <NavLink to="/marketing" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Tag className="w-5 h-5" />
                    Marketing & Offers
                </NavLink>
                <NavLink to="/help-center" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Settings className="w-5 h-5" />
                    Help Center
                </NavLink>
                <NavLink to="/coupons" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Tag className="w-5 h-5" />
                    Coupons & Offers
                </NavLink>
                <NavLink to="/payments" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <BarChart2 className="w-5 h-5" />
                    Payment Logs
                </NavLink>
                <NavLink to="/trainer-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Users className="w-5 h-5" />
                    Trainer Management
                </NavLink>
                {/* <NavLink to="/lessons" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <BookOpen className="w-5 h-5" />
                    Lesson Schedule
                </NavLink> */}
            </nav>

            {/* Bottom Button */}
            <div className="p-6">
                <button onClick={handleLogOut} className="w-full cursor-pointer py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 flex items-center justify-center gap-2 text-[14px] font-bold transition-all text-white shadow-sm font-display">
                    <LogOut className="w-4 h-4" strokeWidth={3} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
