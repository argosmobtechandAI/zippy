import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, CheckCircle2, Gavel, Calendar, CalendarClock, Ban, Clock, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRider } from '../redux/getDataSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { getAllPlansApi, enrollPackApi } from '../api/api';
import Toast from 'react-native-toast-message';

export default function CompetitiveRiderPacksScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [enrolling, setEnrolling] = useState(null);
    const dispatch = useDispatch();
    const { user, rider } = useSelector((state: any) => state.getData);
    const walletBalance = (rider?.wallet || user?.riderWallet || 0).toLocaleString();
    const activePlanObj = rider?.plan || user?.plan;
    let activePlanName = '';
    if (Array.isArray(activePlanObj) && activePlanObj.length > 0) {
        activePlanName = activePlanObj[activePlanObj.length - 1].name;
    } else if (activePlanObj && typeof activePlanObj === 'object') {
        activePlanName = activePlanObj.name;
    } else if (typeof activePlanObj === 'string') {
        activePlanName = activePlanObj;
    }

    const isPackActive = (packName) => {
        if (!activePlanObj) return false;
        if (Array.isArray(activePlanObj)) {
            return activePlanObj.some(p => p.name === packName);
        } else if (typeof activePlanObj === 'object') {
            return activePlanObj.name === packName;
        } else if (typeof activePlanObj === 'string') {
            return activePlanObj === packName;
        }
        return false;
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getAllPlansApi, [], {}, "GET", true);
            if (res && res.success) {
                setPlans(res.plans || []);
            }
        } catch (error) {
            console.error("Fetch plans error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollment = async (packId) => {
        setEnrolling(packId);
        try {
            const res = await apiFunction(enrollPackApi, [], { planId: packId }, "POST", true);
            if (res && res.success) {
                // Update local storage and redux
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    user.sessionCount = res.rider?.session_count;
                    user.plan = res.rider?.plan;
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                }
                
                dispatch(fetchRider());
                
                Toast.show({
                    type: 'success',
                    text1: res.message || "Enrollment successful",
                });
                navigation.navigate('Home');
            } else {
                Toast.show({
                    type: 'error',
                    text1: res.message || "Enrollment failed",
                });
            }
        } catch (error) {
            console.error("Enrollment error:", error);
            Toast.show({
                type: 'error',
                text1: "An error occurred during enrollment.",
            });
        } finally {
            setEnrolling(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="px-6 pt-6 pb-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="w-10 h-10 items-center justify-center mr-2"
                        onPress={() => {
                            if (navigation.canGoBack()) navigation.goBack();
                        }}
                    >
                        <ChevronLeft color="#8C4A28" size={24} />
                    </TouchableOpacity>
                    <Text className="text-[#1a202c] text-[16px] font-bold">Competitive Rider Packs</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center">
                    <Bell color="#1a202c" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8C4A28" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {/* Hero Banner */}
                    <View className="w-full h-[150px] rounded-[24px] overflow-hidden mt-3 shadow-md bg-[#8C4A28]">
                        {/* Decorative background elements */}
                        <View className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
                        <View className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full" />
                        
                        <View className="p-5 z-10 w-full h-full flex-col justify-between">
                            {/* Top Info */}
                            <View className="flex-row justify-between items-start">
                                {activePlanName ? (
                                    <View className="bg-[#4ade80] px-3 py-1.5 rounded-full shadow-sm">
                                        <Text className="text-[#064e3b] text-[10px] font-black uppercase tracking-widest">{activePlanName} Active</Text>
                                    </View>
                                ) : (
                                    <View />
                                )}
                                <View className="bg-white/20 px-4 py-1.5 rounded-full flex-row items-center border border-white/20">
                                    <Wallet color="#fff" size={14} />
                                    <Text className="text-white text-xs font-black ml-2 tracking-wide">₹{walletBalance}</Text>
                                </View>
                            </View>
                            
                            {/* Bottom Text */}
                            <View>
                                <Text className="text-white text-[26px] font-black mb-1 tracking-wider">Zippy Equestrian</Text>
                                <Text className="text-white/80 text-[12px] font-bold tracking-wide">Master the art of competitive riding</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section Title */}
                    <View className="mt-6 mb-4">
                        <Text className="text-[#1a202c] text-lg font-black mb-[2px]">Select Your Pack</Text>
                        <Text className="text-[#64748b] text-[11px] font-semibold">Monthly subscription plans for every level</Text>
                    </View>

                    {/* Packs List */}
                    <View className="pb-4">
                        {plans.length === 0 ? (
                            <View className="py-10 items-center">
                                <Text className="text-[#64748b] font-bold">No active packs available.</Text>
                            </View>
                        ) : plans.map((pack) => {
                            const isActive = isPackActive(pack.name);
                            return (
                            <View
                                key={pack.id}
                                className={`bg-white rounded-[20px] p-5 mb-4 shadow-sm border ${isActive ? 'border-[#4ade80] border-2 bg-[#f0fdf4]' : pack.level === 'Intermediate' ? 'border-[#8C4A28] pb-6 pt-6' : 'border-[#e2d5c3]'}`}
                            >
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-[#1a202c] text-[16px] font-black">{pack.name}</Text>
                                    <View className={`bg-[#8C4A28] px-3 py-1 rounded shadow-sm`}>
                                        <Text className={`text-white text-[8px] font-black uppercase tracking-widest`}>{pack.level}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-baseline mb-5">
                                    <Text className="text-[#1a202c] text-[38px] font-black leading-10">{pack.sessionsCount || pack.sessions_count || 0}</Text>
                                    <Text className="text-[#64748b] text-[12px] font-bold ml-1">sessions / {pack.validity}</Text>
                                </View>

                                {isActive ? (
                                    <View className="w-full py-4 rounded-xl items-center justify-center mb-6 bg-[#4ade80]/20 border border-[#4ade80]">
                                        <Text className="font-black text-[13px] text-[#064e3b] uppercase tracking-widest">Currently Active</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        className={`w-full py-4 rounded-xl items-center justify-center mb-6 shadow-sm ${enrolling === pack.id ? 'bg-[#8C4A28]/70' : 'bg-[#8C4A28]'}`}
                                        onPress={() => handleEnrollment(pack.id)}
                                        disabled={enrolling !== null}
                                    >
                                        {enrolling === pack.id ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className={`font-black text-[13px] text-white`}>Enroll for ₹{pack.amount}</Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                <View>
                                    {(pack.rules || ['Professional training', 'Stable access', 'Competition prep']).map((feature: string, idx: number) => (
                                        <View key={idx} className="flex-row items-center mb-[10px]">
                                            <CheckCircle2 color="#8C4A28" size={14} />
                                            <Text className="text-[#475569] text-[11px] font-semibold ml-2">{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )})}
                    </View>

                    {/* Rules & Terms */}
                    <View className="bg-[#e2d5c3]/60 rounded-2xl p-6 mb-8 mt-2">
                        <View className="flex-row items-center mb-5">
                            <Gavel color="#1a202c" size={16} />
                            <Text className="text-[#1a202c] text-[12px] font-black ml-2 uppercase tracking-widest">Pack Rules & Terms</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <CalendarClock color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Sessions auto-created on enrollment</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Calendar color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Valid for selected month only</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Ban color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">No carry forward of unused sessions</Text>
                        </View>

                        <View className="flex-row items-center">
                            <Clock color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Sessions auto-expire at month end</Text>
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
