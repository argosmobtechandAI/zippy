import { LayoutDashboard, BarChart2, MapPin, Users, Settings, Plus, CloudLightning, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-[280px] bg-[#964C2E] h-full flex flex-col text-[#F9EFE5] shadow-lg relative z-20">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B26A4A] flex flex-shrink-0 items-center justify-center border border-[#CA8B70]/30 shadow-inner">
                    <CloudLightning className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-[13px] tracking-widest text-[#F9EFE5]">ZIPPY EQUESTRIAN</h1>
                    <p className="text-[9px] text-[#D8B4A5] tracking-widest uppercase mt-0.5">Administration Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-2 px-5 space-y-1">
                <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#F9EFE5] text-[#964C2E] shadow-sm' : 'hover:bg-[#AC6345]/50 text-[#F9EFE5]/90'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </NavLink>
                <NavLink to="/revenue" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#F9EFE5] text-[#964C2E] shadow-sm' : 'hover:bg-[#AC6345]/50 text-[#F9EFE5]/90'}`}>
                    <BarChart2 className="w-5 h-5" />
                    Revenue Reports
                </NavLink>
                <NavLink to="/slotManagement" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#F9EFE5] text-[#964C2E] shadow-sm' : 'hover:bg-[#AC6345]/50 text-[#F9EFE5]/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Slot Management
                </NavLink>
                <NavLink to="/centers" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#F9EFE5] text-[#964C2E] shadow-sm' : 'hover:bg-[#AC6345]/50 text-[#F9EFE5]/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Centers
                </NavLink>
                <NavLink to="/userManagement" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#F9EFE5] text-[#964C2E] shadow-sm' : 'hover:bg-[#AC6345]/50 text-[#F9EFE5]/90'}`}>
                    <Users className="w-5 h-5" />
                    Members
                </NavLink>
                
            </nav>

            {/* Bottom Button */}
            <div className="p-6 pt-0 absolute flex flex-row justify-between items-center bottom-0 w-full border border-t border-[#AC6345]/50">
                <h2 className="text-[13px] font-semibold transition-all">Admin</h2>
                <button className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all"><LogOut className="w-5 h-5" />Logout</button>
            </div>
        </div>
    );
};

export default Sidebar;
