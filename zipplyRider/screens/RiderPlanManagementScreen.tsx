import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Bell, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getAllPlansApi } from '../api/api';

export default function RiderPlanManagementScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);

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
            console.error("Fetch plans management error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-[#e2d5c3] items-center justify-center mr-4"
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            }
                        }}
                    >
                        <ChevronLeft color="#1a202c" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-[#1a202c] text-[16px] font-extrabold">Rider Plan Management</Text>
                        <Text className="text-[#64748b] text-[10px] mt-[2px]">Zippy Equestrian Center</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity className="w-8 h-8 items-center justify-center mr-2">
                        <Search color="#1a202c" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-8 h-8 items-center justify-center">
                        <Bell color="#1a202c" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8C4A28" />
                </View>
            ) : (
            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Current Membership Card */}
                <View className="bg-[#e2d5c3] rounded-2xl p-5 mb-6 mt-2 border border-[#d4bca4]">
                    <Text className="text-[#8C4A28] text-[10px] font-extrabold uppercase mb-1">
                        Current Membership
                    </Text>
                    <Text className="text-[#475569] text-sm leading-5 pr-4">
                        You haven't selected a rider plan yet. Choose one below to start your journey.
                    </Text>
                </View>

                <Text className="text-[#1a202c] text-xl font-extrabold mb-4">Basic Rider Plans</Text>

                {/* Plans List */}
                <View className="pb-8">
                    {plans.length === 0 ? (
                        <View className="py-10 items-center">
                            <Text className="text-[#64748b] font-extrabold">No plans available at the moment.</Text>
                        </View>
                    ) : plans.map((plan) => (
                        <TouchableOpacity key={plan.id} onPress={() => navigation.navigate("Enrolment", { planId: plan.id })} className="bg-white rounded-[24px] mb-6 overflow-hidden shadow-sm">
                            <View className="relative h-48 w-full bg-[#f1f5f9]">
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop' }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                {plan.level === 'Intermediate' && (
                                    <View className="absolute top-4 right-4 bg-[#8C4A28] rounded-md px-3 py-1">
                                        <Text className="text-white text-[10px] font-extrabold uppercase">Most Popular</Text>
                                    </View>
                                )}
                            </View>
                            <View className="p-5">
                                <View className="flex-row justify-between items-start mb-1">
                                    <View>
                                        <Text className="text-[#8C4A28] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                                            {plan.level}
                                        </Text>
                                        <Text className="text-[#1a202c] text-[18px] font-extrabold">
                                            {plan.name}
                                        </Text>
                                    </View>
                                    <View className="bg-[#F5EDDF] rounded-xl px-4 py-2">
                                        <Text className="text-[#8C4A28] font-extrabold text-[15px]">₹{plan.amount}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center mb-3 mt-1">
                                    <Calendar color="#64748b" size={14} />
                                    <Text className="text-[#64748b] text-xs ml-2 font-medium">
                                        {plan.sessionsCount} sessions • {plan.validity}
                                    </Text>
                                </View>

                                <Text className="text-[#64748b] text-[13px] leading-5 mb-5">
                                    {plan.rules?.join('. ') || 'Standard equestrian training plan tailored for your level.'}
                                </Text>

                                <TouchableOpacity
                                    className="w-full bg-[#8C4A28] rounded-xl py-[14px] items-center justify-center"
                                    onPress={() => navigation.navigate('Enrolment', { planId: plan.id })}
                                >
                                    <Text className="text-white font-bold text-[15px]">Select Plan</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            )}
        </SafeAreaView>
    );
}
