import {
    ChevronRight, Zap, Edit2, MoreVertical, Star,
    ChevronLeft, MoreHorizontal, UserCheck, Activity, Award, X
} from 'lucide-react';
import { useState } from 'react';
import { apiFunction } from '../api/apiFunction';
import { createUserApi } from '../api/apis';
import toast from 'react-hot-toast';

const UserManagement = () => {

    const [userType, setUserType] = useState("all")
    const [createModal, setCreateModal] = useState(false)

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-full bg-[#fcfbf9] w-full font-sans pb-20">
            {/* Top Breadcrumb & Header section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-6 tracking-wide">
                    <span>Admin</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#1e2330]">User Directory</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[34px] font-black text-[#1e2330] leading-none mb-3 tracking-tight">User Management</h1>
                        <p className="text-[14px] font-semibold text-gray-500">Monitor performance, manage availability and assign riding sessions.</p>
                    </div>

                    {userType !== "all" && <button onClick={() => setCreateModal(true)} className="bg-[#FAE9DB] border border-[#EACDBA] text-[#964C2E] text-[13px] font-bold px-6 py-3.5 rounded-xl shadow-sm flex items-center gap-2.5 hover:bg-[#F3DCC7] transition-all">
                        <Zap className="w-4 h-4" strokeWidth={2.5} />
                        Create {userType}
                    </button>}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 mt-6">
                <button className="pb-3 text-[13px] font-bold text-[#964C2E] border-b-[3px] border-[#964C2E] px-1">
                    All Users (24)
                </button>
                <button onClick={() => setUserType("rider")} className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-700 px-1 border-b-[3px] border-transparent transition-colors">
                    Riders (10)
                </button>
                <button onClick={() => setUserType("trainer")} className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-700 px-1 border-b-[3px] border-transparent transition-colors">
                    Trainers (6)
                </button>
                <button onClick={() => setUserType("vet")} className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-700 px-1 border-b-[3px] border-transparent transition-colors">
                    Vets (3)
                </button>
                <button onClick={() => setUserType("stableStaff")} className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-700 px-1 border-b-[3px] border-transparent transition-colors">
                    Stable Staff (5)
                </button>
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
                {/* User Card 1 - Rider */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADED4]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-[60px] h-[60px] rounded-[14px] bg-[#E5ECE5] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-black text-[#1e2330] mb-1.5">Sarah Jenkins</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">RIDER</span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Available
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEEKLY HRS</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">12<span className="text-[12px] font-bold text-gray-400">/20h</span></p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">ACTIVITY (MTD)</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">24</p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">RATING</h4>
                            <div className="flex items-center gap-1">
                                <p className="text-[20px] font-black text-[#964C2E]">4.8</p>
                                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] -mt-0.5" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">SCHEDULE SUMMARY (THIS WEEK)</h4>
                        <div className="flex justify-between items-center px-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                    <div className={`h-1.5 w-[80%] rounded-full ${[0, 2, 4].includes(i) ? 'bg-[#964C2E]' : 'bg-[#EADED4]'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white border border-[#EADED4] text-[#964C2E] py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            View Profile
                        </button>
                        <button className="flex-1 bg-[#964C2E] text-white py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#7D3F25] transition-colors">
                            Manage Booking
                        </button>
                    </div>
                </div>

                {/* User Card 2 - Trainer */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADED4]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-[60px] h-[60px] rounded-[14px] bg-[#E3EDF5] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Marcus Thorne" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-black text-[#1e2330] mb-1.5">Marcus Thorne</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">TRAINER</span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D97706]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span> In Session
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEEKLY LOAD</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">38<span className="text-[12px] font-bold text-gray-400">/40h</span></p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">SESSIONS (MTD)</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">98</p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">RATING</h4>
                            <div className="flex items-center gap-1">
                                <p className="text-[20px] font-black text-[#964C2E]">4.7</p>
                                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] -mt-0.5" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">SCHEDULE SUMMARY (THIS WEEK)</h4>
                        <div className="flex justify-between items-center px-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                    <div className={`h-1.5 w-[80%] rounded-full ${[0, 1, 2, 3, 4].includes(i) ? 'bg-[#964C2E]' : 'bg-[#EADED4]'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white border border-[#EADED4] text-[#964C2E] py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            Manage Leave
                        </button>
                        <button className="flex-1 bg-[#964C2E] text-white py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#7D3F25] transition-colors">
                            Assign Sessions
                        </button>
                    </div>
                </div>

                {/* User Card 3 - Vet */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADED4]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-[60px] h-[60px] rounded-[14px] bg-[#E8E2D9] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Dr. Julianne Smith" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-black text-[#1e2330] mb-1.5">Julianne Smith</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">VETERINARIAN</span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Off-Duty
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEEKLY LOAD</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">15<span className="text-[12px] font-bold text-gray-400">/40h</span></p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">ACTIVITY (MTD)</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">42</p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">RATING</h4>
                            <div className="flex items-center gap-1">
                                <p className="text-[20px] font-black text-[#964C2E]">5.0</p>
                                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] -mt-0.5" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">SCHEDULE SUMMARY (THIS WEEK)</h4>
                        <div className="flex justify-between items-center px-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                    <div className={`h-1.5 w-[80%] rounded-full ${[2, 3, 4].includes(i) ? 'bg-[#964C2E]' : 'bg-[#EADED4]'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white border border-[#EADED4] text-[#964C2E] py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            Manage Leave
                        </button>
                        <button className="flex-1 bg-[#964C2E] text-white py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#7D3F25] transition-colors">
                            Assign Appointments
                        </button>
                    </div>
                </div>

                {/* User Card 4 - Stable Staff */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EADED4]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-[60px] h-[60px] rounded-[14px] bg-[#D4E2D4] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Leo Grant" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-black text-[#1e2330] mb-1.5">Leo Grant</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#FAE9DB] text-[#964C2E] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-sm">STABLE STAFF</span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Available
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">WEEKLY LOAD</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">22<span className="text-[12px] font-bold text-gray-400">/40h</span></p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">ACTIVITY (MTD)</h4>
                            <p className="text-[20px] font-black text-[#964C2E]">67</p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5">RATING</h4>
                            <div className="flex items-center gap-1">
                                <p className="text-[20px] font-black text-[#964C2E]">4.6</p>
                                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] -mt-0.5" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">SCHEDULE SUMMARY (THIS WEEK)</h4>
                        <div className="flex justify-between items-center px-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                    <div className={`h-1.5 w-[80%] rounded-full ${[0, 1, 2, 5, 6].includes(i) ? 'bg-[#964C2E]' : 'bg-[#EADED4]'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white border border-[#EADED4] text-[#964C2E] py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors">
                            Manage Leave
                        </button>
                        <button className="flex-1 bg-[#964C2E] text-white py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#7D3F25] transition-colors">
                            Assign Shifts
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination Grid */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-8 mt-4">
                <div className="text-[13px] font-semibold text-gray-500">
                    Showing 4 of 24 user records
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[#964C2E] text-white text-[13px] font-bold shadow-sm flex items-center justify-center">
                        1
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        2
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        3
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {createModal && <CreateUserModal userType={userType} setCreateModal={setCreateModal} />}
        </div>
    );
};


const CreateUserModal = ({ userType, setCreateModal }) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        dob: "",
        age: "",
        weight: "",
        emergency_contact: "",
        type: userType,
        title: "",
        experience: "",
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Required";
        if (!formData.email.trim()) {
            newErrors.email = "Required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid format";
        }
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Required";
        } else if (!/^\d{7,}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = "Invalid number";
        }
        if (formData.mobile.trim().length > 10) {
            newErrors.mobile = "Invalid number";
        }
        if (!formData.dob) newErrors.dob = "Required";
        if (!formData.age || formData.age <= 0) newErrors.age = "Required";
        if (!formData.weight || formData.weight <= 0) newErrors.weight = "Required";
        if (!formData.emergency_contact.trim()) {
            newErrors.emergency_contact = "Required";
        } else if (!/^\d{7,}$/.test(formData.emergency_contact.replace(/\D/g, ''))) {
            newErrors.emergency_contact = "Invalid number";
        } else if (formData.emergency_contact.trim().length > 10) {
            newErrors.emergency_contact = "Invalid number";
        }

        if (userType === "trainer") {
            if (!formData.title.trim()) newErrors.title = "Required";
        }
        if (userType === "trainer") {
            if (!formData.experience.trim()) newErrors.experience = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            console.log("Form data:", formData);
            const res = await apiFunction(createUserApi, [], formData, "POST", true);
            if (res.success) {
                toast.success(res.message);
                setCreateModal(false);
            } else {
                toast.error(res.message);
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-h-[80vh] w-[600px] overflow-y-auto shadow-sm border border-[#EADED4]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[18px] font-black text-[#1e2330] capitalize">Create {userType}</h3>
                    <button type="button" className="text-[#964C2E] text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors p-1 rounded-md" onClick={() => setCreateModal(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                <span>Full Name</span>
                                {errors.name && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.name}</span>}
                            </label>
                            <input name="name" value={formData.name} onChange={handleChange} type="text" className={`w-full border ${errors.name ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                <span>Email</span>
                                {errors.email && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.email}</span>}
                            </label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className={`w-full border ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                <span>Mobile</span>
                                {errors.mobile && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.mobile}</span>}
                            </label>
                            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className={`w-full border ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                <span>Date of Birth</span>
                                {errors.dob && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.dob}</span>}
                            </label>
                            <input name="dob" value={formData.dob} onChange={handleChange} type="date" className={`w-full border ${errors.dob ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                        </div>
                        <div className="col-span-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                    <span>Age</span>
                                    {errors.age && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.age}</span>}
                                </label>
                                <input name="age" value={formData.age} onChange={handleChange} type="number" min="1" className={`w-full border ${errors.age ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                    <span>Weight (kg)</span>
                                    {errors.weight && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.weight}</span>}
                                </label>
                                <input name="weight" value={formData.weight} onChange={handleChange} type="number" min="1" className={`w-full border ${errors.weight ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                <span>Emergency Contact</span>
                                {errors.emergency_contact && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.emergency_contact}</span>}
                            </label>
                            <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} type="tel" className={`w-full border ${errors.emergency_contact ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                        </div>
                        {userType === "trainer" &&
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                    <span>Title</span>
                                    {errors.title && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.title}</span>}
                                </label>
                                <input name="title" value={formData.title} onChange={handleChange} type="text" className={`w-full border ${errors.title ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                            </div>
                        }
                        {userType === "trainer" &&
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex justify-between items-center">
                                    <span>Experience</span>
                                    {errors.experience && <span className="text-red-500 normal-case tracking-normal font-bold">{errors.experience}</span>}
                                </label>
                                <input name="experience" value={formData.experience} onChange={handleChange} type="text" className={`w-full border ${errors.experience ? 'border-red-400 bg-red-50' : 'border-[#EADED4]'} rounded-xl p-3 text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#964C2E]`} />
                            </div>
                        }
                    </div>
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => setCreateModal(false)} className="px-6 py-3 rounded-xl border border-[#EADED4] text-[#1e2330] text-[13px] font-bold hover:bg-gray-50 transition-colors focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-3 rounded-xl bg-[#964C2E] text-white text-[13px] font-bold shadow-sm hover:bg-[#7D3F25] transition-colors focus:outline-none">
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UserManagement;