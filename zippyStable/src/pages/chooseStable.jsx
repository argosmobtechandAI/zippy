import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Loader2, CloudLightning } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { getAllStablesApi, getStableApi, getUserApi } from '../api/apis';
import toast from 'react-hot-toast';
import { setSelectedStable } from '../redux/getDataSlice';
import { useDispatch } from 'react-redux';

const ChooseStable = () => {
    const navigate = useNavigate();
    const [stables, setStables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {

                const stablesRes = await apiFunction(getStableApi, [], {}, "GET", true);
                if (stablesRes && stablesRes.success) {
                    const userStables = (stablesRes.stables || []);
                    setStables(userStables);
                } else {
                    toast.error("Failed to fetch stables data.");
                }

            } catch (error) {
                toast.error("An error occurred while loading stables.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleSelectStable = (stableId) => {
        dispatch(setSelectedStable(stableId));
        toast.success("Stable selected successfully!");
        navigate('/');
    };

    return (
        <div className="min-h-screen w-full bg-[#fcfaf8] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#F9EFE5_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_#F9EFE5_0%,_transparent_40%)]">
            <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(150,76,46,0.15)] border border-[#F9EFE5] overflow-hidden flex flex-col p-10 md:p-14">

                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-[#B26A4A] flex items-center justify-center border border-[#964C2E]/20 shadow-xl mb-6">
                        <CloudLightning className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-[#1e2330] mb-3 text-center">Select Your Stable</h2>
                    <p className="text-gray-400 font-bold text-sm tracking-widest uppercase text-center">Choose a facility to proceed</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#964C2E] animate-spin mb-4" />
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-[11px]">Loading your facilities...</p>
                    </div>
                ) : stables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-bold text-lg mb-2">No facilities found</p>
                        <p className="text-gray-400 text-sm">You are not assigned to manage any stables yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                        {stables.map((stable) => (
                            <button
                                key={stable.id}
                                onClick={() => handleSelectStable(stable.id)}
                                className="group relative flex flex-col items-start p-8 bg-white border border-[#EACDBA]/50 rounded-[32px] hover:border-[#964C2E] hover:shadow-[0_20px_40px_-10px_rgba(150,76,46,0.1)] transition-all duration-300 text-left overflow-hidden active:scale-[0.98]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9EFE5] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="w-14 h-14 rounded-2xl bg-[#FAF0EB] flex items-center justify-center text-[#964C2E] mb-6 relative z-10 group-hover:bg-[#964C2E] group-hover:text-white transition-colors duration-300">
                                    <Building2 className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl font-black text-[#1e2330] mb-2 relative z-10 group-hover:text-[#964C2E] transition-colors line-clamp-1">{stable.name}</h3>
                                <p className="text-gray-500 text-sm font-semibold mb-8 relative z-10 line-clamp-1">{stable.location}</p>

                                <div className="w-full flex justify-between items-center mt-auto border-t border-gray-100 pt-6 relative z-10">
                                    <span className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">Manage Facility</span>
                                    <div className="w-8 h-8 rounded-full bg-[#FAF0EB] group-hover:bg-[#964C2E] flex items-center justify-center transition-colors">
                                        <ArrowRight className="w-4 h-4 text-[#964C2E] group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-gray-400 text-xs font-bold tracking-tight">
                Zippy Stable Management System • V1.0
            </div>
        </div>
    );
};

export default ChooseStable;
