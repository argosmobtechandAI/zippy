import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Archive, ClipboardList, BookOpen, CreditCard, Plus, CloudLightning } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-[280px] bg-brand-brown h-full flex flex-col text-brand-beige shadow-lg relative z-20 flex-shrink-0 font-body">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img src="/assets/logo/ZEC Logos-02.svg" alt="Zippy Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-[16px] tracking-tight text-brand-beige mb-0.5 font-display">StableAdmin</h1>
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
                <button className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 flex items-center justify-center gap-2 text-[14px] font-bold transition-all text-white shadow-sm font-display">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    REGISTER NEW ENTRY
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
