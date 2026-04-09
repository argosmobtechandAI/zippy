import { useState } from 'react';
import { MapPin, Tag, Archive, ExternalLink, RotateCw, Settings2, MoreHorizontal } from 'lucide-react';

const StableManagement = () => {
    const [activeTab, setActiveTab] = useState('horses');

    // MOCK DATA: Same entities, completely different visual representations
    const horses = [
        { name: 'Thunder', stall: 'B-12', cat: 'Schooling', img: 'https://images.unsplash.com/photo-1553531580-6520e78089c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
        { name: 'Bella', stall: 'A-05', cat: 'Competitive', img: 'https://images.unsplash.com/photo-1534068590799-09895a7090aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
        { name: 'Spirit', stall: 'C-02', cat: 'Bridging', img: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
        { name: 'Luna', stall: 'B-01', cat: 'Schooling', img: 'https://images.unsplash.com/photo-1543015467-f41857c0a9cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
        { name: 'Apollo', stall: 'A-10', cat: 'Competitive', img: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
        { name: 'Shadow', stall: 'C-05', cat: 'Schooling', img: 'https://images.unsplash.com/photo-1590768407851-f2fec319faab?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }
    ];

    const stocks = [
        { name: 'Premium Timothy Hay', cat: 'Feed', stock: 124, unit: 'Bales', status: 'Good' },
        { name: 'Equine Flu Vaccine', cat: 'Medicines', stock: 8, unit: 'Vials', status: 'Low' },
        { name: 'Antiseptic Shampoo', cat: 'Consumables', stock: 0, unit: 'Bottles', status: 'Out' },
        { name: 'Leather Saddle Soap', cat: 'Consumables', stock: 42, unit: 'Tins', status: 'Good' },
        { name: 'Stirrup Irons (Adult)', cat: 'Equipment', stock: 15, unit: 'Pairs', status: 'Good' },
        { name: 'Alfalfa Cubes', cat: 'Feed', stock: 85, unit: 'Bags', status: 'Good' }
    ];

    return (
        <div className="w-full min-h-full flex flex-col bg-[#F9EEE5] p-10 font-sans max-w-[1400px] mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">Stable General Registry</h1>
                    <p className="text-[14px] font-semibold text-gray-500">Comprehensive directory view for all structural assets and rostered horses.</p>
                </div>
                
                {/* Custom Toggle Switch Tab */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-[#EACDBA]/40 inline-flex">
                    <button 
                        onClick={() => setActiveTab('horses')}
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${
                            activeTab === 'horses' 
                            ? 'bg-[#964C2E] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Equine Roster
                    </button>
                    <button 
                        onClick={() => setActiveTab('stocks')}
                        className={`px-8 py-3 text-[14px] font-bold rounded-xl transition-all ${
                            activeTab === 'stocks' 
                            ? 'bg-[#964C2E] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Master Inventory
                    </button>
                </div>
            </div>

            {/* Dynamic Content Views */}
            <div className="mt-2">
                {activeTab === 'horses' ? (
                    
                    /* --- EQUNINE ROSTER Grid View --- */
                    /* Using a visual card grid paradigm instead of linear list rows to distinguish the UI greatly from dashboard */
                    <div className="grid grid-cols-3 gap-6">
                        {horses.map((horse, idx) => (
                            <div key={idx} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#EACDBA]/30 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                
                                <div className="h-[220px] w-full overflow-hidden relative">
                                    <img src={horse.img} alt={horse.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e2330]/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-5 left-6 right-6">
                                        <h3 className="text-white text-[26px] font-black leading-tight drop-shadow-md mb-1">{horse.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[#F9EEE5] text-[13px] font-bold drop-shadow-md">
                                            <MapPin className="w-4 h-4 text-[#EACDBA]" /> Stall {horse.stall}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col gap-6 bg-white">
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#F9EEE5] text-[#964C2E]">
                                            <Tag className="w-3.5 h-3.5" /> {horse.cat}
                                        </span>
                                        <button className="text-gray-400 hover:text-[#964C2E] p-1 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="py-3 border-2 border-[#F9EEE5] rounded-xl text-[#964C2E] text-[13px] font-bold hover:bg-[#F9EEE5] transition-colors flex justify-center items-center gap-2">
                                            <ExternalLink className="w-4 h-4" /> Profile
                                        </button>
                                        <button className="py-3 bg-[#964C2E] rounded-xl text-white text-[13px] font-bold hover:bg-[#7D3F25] transition-colors flex justify-center items-center gap-2 shadow-sm">
                                            <Settings2 className="w-4 h-4" /> Manage
                                        </button>
                                    </div>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                    
                ) : (
                    
                    /* --- STOCKS / INVENTORY Metrics Grid View --- */
                    /* Using a metric-block style instead of a data table. Bold visual numbers and categorized borders */
                    <div className="grid grid-cols-3 gap-6">
                        {stocks.map((item, idx) => {
                            const isLow = item.status === 'Low';
                            const isOut = item.status === 'Out';
                            
                            // Dynamic theme based on status to give powerful UI differences
                            const bgAccent = isOut ? 'bg-[#FEE2E2]' : isLow ? 'bg-[#FEF3C7]' : 'bg-[#E0F8EC]';
                            const textAccent = isOut ? 'text-[#DC2626]' : isLow ? 'text-[#D97706]' : 'text-[#059669]';
                            const borderAccent = isOut ? 'border-l-[#FCA5A5]' : isLow ? 'border-l-[#FCD34D]' : 'border-l-[#6EE7B7]';
                            
                            return (
                                <div key={idx} className={`bg-white rounded-[24px] p-7 shadow-sm border-l-[8px] border-y border-r border-y-[#EACDBA]/30 border-r-[#EACDBA]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[240px] ${borderAccent}`}>
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="pr-4">
                                                <h3 className="text-[18px] font-black text-[#1e2330] leading-tight mb-2.5">{item.name}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100">
                                                    {item.cat}
                                                </span>
                                            </div>
                                            <div className={`p-3 rounded-[14px] ${bgAccent} ${textAccent} flex-shrink-0 shadow-sm`}>
                                                <Archive className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-2 mb-8">
                                            <span className={`text-[54px] font-black leading-none tracking-tighter ${textAccent}`}>
                                                {item.stock}
                                            </span>
                                            <span className="text-[14px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                                {item.unit}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <button className="flex-1 py-3.5 bg-[#F9EEE5] rounded-xl text-[#964C2E] text-[13px] font-bold hover:bg-[#F3DCC7] transition-colors flex justify-center items-center gap-2">
                                            <RotateCw className="w-4 h-4" /> Issue Restock
                                        </button>
                                        <button className="p-3.5 bg-white border border-[#EACDBA]/50 rounded-xl text-gray-500 hover:text-[#964C2E] hover:border-[#964C2E]/30 transition-colors flex justify-center items-center">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StableManagement;
