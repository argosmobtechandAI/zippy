import { Search, Bell, ClipboardList } from 'lucide-react';

const Header = () => {
    return (
        <header className="flex justify-between items-center py-4 px-8 border-b border-[#EACDBA]/50 bg-[#F9EEE5]">
            <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-[#964C2E]" />
                <h2 className="text-[15px] font-black text-[#964C2E] tracking-tight">Inventory Management</h2>
            </div>
            
            <div className="flex items-center gap-5">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        className="bg-white rounded-full py-2.5 pl-11 pr-4 w-[300px] outline-none text-[13px] placeholder:text-gray-400 focus:ring-2 focus:ring-[#964C2E]/20 shadow-sm transition-all"
                    />
                </div>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/50 transition-colors relative">
                    <Bell className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-transparent cursor-pointer hover:ring-[#964C2E]/20 transition-all">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="User Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>
    );
};

export default Header;
