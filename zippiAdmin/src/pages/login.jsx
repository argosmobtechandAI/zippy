
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudLightning, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { apiFunction } from '../api/apiFunction';
import { loginApi } from '../api/apis';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await apiFunction(loginApi, [], formData, "POST", false);
            if (res && res.success) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                toast.success('Welcome back to Zippy!');
                navigate('/');
            } else {
                toast.error(res?.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            toast.error('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fcfaf8] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#F9EFE5_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_#F9EFE5_0%,_transparent_40%)]">
            <div className="w-full max-w-[1100px] h-[640px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(150,76,46,0.15)] border border-[#F9EFE5] overflow-hidden flex">
                
                {/* Visual Side */}
                <div className="hidden lg:flex w-1/2 bg-[#964C2E] relative overflow-hidden flex-col justify-between p-12">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full -mr-48 -mt-24 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B26A4A]/20 rounded-full -ml-32 -mb-16 blur-3xl" />
                    
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#B26A4A] flex items-center justify-center border border-white/20 shadow-xl">
                            <CloudLightning className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-white font-black text-xl tracking-widest">ZIPPY</h2>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-white text-5xl font-black leading-tight mb-6">
                            Elevating<br/>
                            <span className="text-[#D8B4A5]">Equestrian</span><br/>
                            Management.
                        </h1>
                        <p className="text-white/60 text-lg font-medium max-w-[340px] leading-relaxed">
                            A specialized ecosystem for stables, trainers, and riders at the pinnacle of performance.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#964C2E] bg-gray-200 overflow-hidden shadow-lg">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-[11px] font-black tracking-widest uppercase">Trusted by 50+ Global Stables</p>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 relative">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-[#1e2330] mb-3">Welcome Back</h2>
                        <p className="text-gray-400 font-bold text-sm tracking-wide">PLEASE ENTER YOUR ADMIN CREDENTIALS</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase pl-1">Email or Mobile</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#964C2E] transition-colors" />
                                <input 
                                    type="text"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="admin@zippy.com"
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 text-[15px] font-bold text-[#1e2330] focus:outline-none focus:bg-white focus:border-[#964C2E]/20 transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-black text-[#964C2E] tracking-widest uppercase">Password</label>
                                <button type="button" className="text-[10px] font-black text-gray-300 hover:text-[#964C2E] transition-colors tracking-widest uppercase">Forgot Password?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#964C2E] transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-12 text-[15px] font-bold text-[#1e2330] focus:outline-none focus:bg-white focus:border-[#964C2E]/20 transition-all placeholder:text-gray-300"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#964C2E] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#964C2E] hover:bg-[#7d3f26] disabled:bg-[#964C2E]/50 text-white rounded-2xl py-4 font-black tracking-widest uppercase shadow-[0_20px_40px_-10px_rgba(150,76,46,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(150,76,46,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Authenticate Access"
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-xs font-bold tracking-tight">
                            Strictly for authorized Zippy personnel. <br/>
                            Unauthorized access attempts are monitored and recorded.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
