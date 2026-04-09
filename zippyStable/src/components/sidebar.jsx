import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Archive, ClipboardList, BookOpen, CreditCard, Plus, CloudLightning } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-[280px] bg-[#964C2E] h-full flex flex-col text-[#F9EFE5] shadow-lg relative z-20 flex-shrink-0">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B26A4A] flex flex-shrink-0 items-center justify-center border border-[#CA8B70]/30 shadow-inner">
                    <CloudLightning className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-[16px] tracking-tight text-white mb-0.5">StableAdmin</h1>
                    <p className="text-[10px] text-[#D8B4A5]">Equestrian Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-2 px-5 space-y-1.5">
                <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#AC6345]/60 text-white shadow-sm' : 'hover:bg-[#AC6345]/40 text-[#F9EFE5]/90'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </NavLink>
                <NavLink to="/stable-management" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#AC6345]/60 text-white shadow-sm' : 'hover:bg-[#AC6345]/40 text-[#F9EFE5]/90'}`}>
                    <Archive className="w-5 h-5" />
                    Stable Management
                </NavLink>
                <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#AC6345]/60 text-white shadow-sm' : 'hover:bg-[#AC6345]/40 text-[#F9EFE5]/90'}`}>
                    <ClipboardList className="w-5 h-5" />
                    Health & Workload
                </NavLink>
                <NavLink to="/lessons" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#AC6345]/60 text-white shadow-sm' : 'hover:bg-[#AC6345]/40 text-[#F9EFE5]/90'}`}>
                    <BookOpen className="w-5 h-5" />
                    Lessons
                </NavLink>
                {/* <NavLink to="/billing" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'bg-[#AC6345]/60 text-white shadow-sm' : 'hover:bg-[#AC6345]/40 text-[#F9EFE5]/90'}`}>
                    <CreditCard className="w-5 h-5" />
                    Billing
                </NavLink> */}
            </nav>

            {/* Bottom Button */}
            <div className="p-6">
                <button className="w-full py-3.5 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center gap-2 text-[14px] font-bold transition-all text-[#964C2E] shadow-sm">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    New Entry
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
