import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Archive, ClipboardList, BookOpen, LogOut, CreditCard, Plus, CloudLightning, Users, MapPin } from 'lucide-react';
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
        navigate("/login");
    };

    return (
        <div className="w-[280px] bg-brand-brown h-full flex flex-col text-brand-beige shadow-lg relative z-20 flex-shrink-0 font-body">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-xl overflow-hidden p-1 shadow-sm">
                    <img src={stableDetails?.logo || "/assets/logo/ZEC Logos-02.svg"} alt="Stable Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-[16px] tracking-tight text-brand-beige mb-0.5 font-display line-clamp-1" title={stableDetails?.name}>{stableDetails?.name || "Center Admin"}</h1>
                    <p className="text-[10px] text-brand-beige/60 uppercase tracking-widest font-bold">Equestrian Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-2 px-5 space-y-1.5">
                <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard Overview
                </NavLink>
                <NavLink to="/stable-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Archive className="w-5 h-5" />
                    Fleet Management
                </NavLink>
                <NavLink to="/trainer-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Users className="w-5 h-5" />
                    Trainer Management
                </NavLink>
                <NavLink to="/slot-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Slot Management
                </NavLink>
                <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <ClipboardList className="w-5 h-5" />
                    Health & Workload
                </NavLink>
                <NavLink to="/lessons" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <BookOpen className="w-5 h-5" />
                    Lesson Schedule
                </NavLink>
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
