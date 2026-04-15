import { LayoutDashboard, BarChart2, MapPin, Users, Settings, Plus, CloudLightning, LogOut, Package } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-[280px] bg-brand-brown h-full flex flex-col text-brand-beige shadow-lg relative z-20 font-body">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img src="/assets/logo/ZEC Logos-02.svg" alt="Zippy Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-[14px] tracking-tight text-brand-beige font-display">ZIPPY EQUESTRIAN</h1>
                    <p className="text-[9px] text-brand-beige/60 tracking-widest uppercase mt-0.5">Administration Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-2 px-5 space-y-1">
                <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </NavLink>
                <NavLink to="/revenue" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <BarChart2 className="w-5 h-5" />
                    Revenue Reports
                </NavLink>
                <NavLink to="/slotManagement" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Slot Management
                </NavLink>
                <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Package className="w-5 h-5" />
                    Inventory Management
                </NavLink>
                <NavLink to="/centers" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <MapPin className="w-5 h-5" />
                    Center Directory
                </NavLink>
                <NavLink to="/horses" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <CloudLightning className="w-5 h-5" />
                    Horses registry
                </NavLink>
                <NavLink to="/userManagement" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-brand-beige text-brand-brown shadow-sm' : 'hover:bg-white/10 text-brand-beige/90'}`}>
                    <Users className="w-5 h-5" />
                    Member Directory
                </NavLink>
                
            </nav>

            {/* Bottom Section */}
            <div className="p-6 pt-0 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[11px] font-bold text-brand-orange uppercase tracking-tighter">System Admin</p>
                </div>
                <button 
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold transition-all bg-white/5 hover:bg-white/10 text-brand-beige"
                >
                    <LogOut className="w-4 h-4" />Logout Securely
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
