import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ImageBackground, ActivityIndicator } from 'react-native';
import { ChevronLeft, Bell, CheckCircle2, Gavel, Calendar, CalendarClock, Ban, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { getAllPlansApi, enrollPackApi, createOrderApi, verifyRazorPayOrderApi } from '../api/api';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';

export default function CompetitiveRiderPacksScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [enrolling, setEnrolling] = useState(null);

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
            const res = await apiFunction(createOrderApi, [], { planId: packId }, "POST", true);
            console.log("Res", res);
            if (res && res.success) {
                console.log(res);
                const options = {
                    description: 'Payment for competitive rider pack',
                    image: 'https://your-cdn.com/logo.png',
                    currency: 'INR',
                    key: res?.order?.razorpayKeyId,
                    amount: res?.order?.amount * 100,
                    name: 'Zippy Equestrian',
                    prefill: {
                        email: res?.order?.userEmail,
                        contact: res?.order?.userPhone,
                        name: res?.order?.userName
                    },
                    theme: { color: '#8C4A28' }
                }

                const data = await RazorpayCheckout.open(options);
                console.log(data); // paymentId, signature etc
                if (data) {
                    const verifyRes = await apiFunction(verifyRazorPayOrderApi, [], { orderId: res.order.id, planId: packId, paymentId: data.razorpay_payment_id }, "POST", true);
                    console.log("Verify Res", verifyRes);
                    if (verifyRes && verifyRes.success) {
                        Toast.show({
                            type: 'success',
                            text1: verifyRes.message || "Payment verified successfully",
                        })


                        const res = await apiFunction(enrollPackApi, [], { planId: packId, paymentEndDate: verifyRes?.subscription?.endDate }, "POST", true);
                        if (res && res.success) {
                            Toast.show({
                                type: 'success',
                                text1: res.message || "Enrollment successful",
                            })
                            navigation.navigate('Home');
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: res.message || "Enrollment failed",
                            })
                        }
                    }
                }

            }
            // const res = await apiFunction(enrollPackApi, [], { planId: packId }, "POST", true);
            // if (res && res.success) {
            //     // Update local storage with new session count/plan info
            //     const userData = await AsyncStorage.getItem('user');
            //     if (userData) {
            //         const user = JSON.parse(userData);
            //         user.sessionCount = res.rider?.sessionCount;
            //         user.plan = res.rider?.plan;
            //         await AsyncStorage.setItem('user', JSON.stringify(user));
            //     }
            //     Toast.show({
            //         type: 'success',
            //         text1: res.message || "Enrollment successful",
            //     })
            //     navigation.navigate('Home');
            // } else {
            //     Toast.show({
            //         type: 'error',
            //         text1: res.message || "Enrollment failed",
            //     })
            // }
        } catch (error) {
            console.error("Enrollment error:", error);
            Toast.show({
                type: 'error',
                text1: "An error occurred during enrollment.",
            })
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
                    <View className="relative w-full h-[140px] rounded-2xl overflow-hidden mt-3 shadow-sm">
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1598532213005-592bb21532f6?w=600&auto=format&fit=crop' }}
                            className="w-full h-full justify-end"
                            resizeMode="cover"
                        >
                            <View className="absolute inset-0 bg-black/40" />
                            <View className="p-4 z-10 pb-5">
                                <Text className="text-white text-2xl font-black mb-1 tracking-wide">Zippy Equestrian</Text>
                                <Text className="text-white/90 text-xs font-semibold">Master the art of competitive riding</Text>
                            </View>
                        </ImageBackground>
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
                        ) : plans.map((pack) => (
                            <View
                                key={pack.id}
                                className={`bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-[#e2d5c3] ${pack.level === 'Intermediate' ? 'border border-[#8C4A28] pb-6 pt-6' : ''
                                    }`}
                            >
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-[#1a202c] text-[16px] font-black">{pack.name}</Text>
                                    <View className={`bg-[#8C4A28] px-3 py-1 rounded shadow-sm`}>
                                        <Text className={`text-white text-[8px] font-black uppercase tracking-widest`}>{pack.level}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-baseline mb-5">
                                    <Text className="text-[#1a202c] text-[38px] font-black leading-10">{pack.sessionsCount}</Text>
                                    <Text className="text-[#64748b] text-[12px] font-bold ml-1">sessions / {pack.validity}</Text>
                                </View>

                                <TouchableOpacity
                                    className={`w-full py-4 rounded-xl items-center justify-center mb-6 shadow-sm ${enrolling === pack.id ? 'bg-[#8C4A28]/70' : 'bg-[#8C4A28]'}`}
                                    onPress={() => handleEnrollment(pack.id)}
                                    disabled={enrolling !== null}
                                >
                                    {enrolling === pack.id ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text className={`font-black text-[13px] text-white`}>Enroll for ${pack.amount}</Text>
                                    )}
                                </TouchableOpacity>

                                <View>
                                    {(pack.rules || ['Professional training', 'Stable access', 'Competition prep']).map((feature: string, idx: number) => (
                                        <View key={idx} className="flex-row items-center mb-[10px]">
                                            <CheckCircle2 color="#8C4A28" size={14} />
                                            <Text className="text-[#475569] text-[11px] font-semibold ml-2">{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
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
