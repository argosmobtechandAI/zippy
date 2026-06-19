import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Calendar, Tag, Wallet, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getUserPaymentsApi, getAllPlansApi, getLevelsApi } from '../api/api';

export default function PaymentHistoryScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    
    // We also need plans and levels to resolve names
    const [plans, setPlans] = useState([]);
    const [levels, setLevels] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, plansRes, levelsRes] = await Promise.all([
                apiFunction(getUserPaymentsApi, [], {}, "GET", true),
                apiFunction(getAllPlansApi, [], {}, "GET", true),
                apiFunction(getLevelsApi, [], {}, "GET", true)
            ]);

            if (plansRes?.success) setPlans(plansRes.plans || []);
            if (levelsRes?.success) setLevels(levelsRes.levels || []);
            if (paymentsRes?.success) {
                setPayments(paymentsRes.payments || []);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPlanOrLevelName = (id) => {
        if (!id) return 'Unknown';
        const plan = plans.find(p => p.id === id);
        if (plan) return plan.name;
        const level = levels.find(l => l.id === id);
        if (level) return level.name;
        return 'Unknown';
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-[#85431E]/10 bg-white/50 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/60 items-center justify-center border border-[#85431E]/10">
                    <ArrowLeft size={20} color="#85431E" />
                </TouchableOpacity>
                <Text className="text-[14px] font-bold text-[#85431E] tracking-[3px] uppercase">Purchase History</Text>
                <View className="w-10 h-10" />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#85431E" />
                    <Text className="mt-4 text-[#85431E] font-bold tracking-widest text-[11px] uppercase">Loading History...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    {payments.length === 0 ? (
                        <View className="items-center justify-center py-20 bg-white rounded-3xl shadow-sm mt-10">
                            <CreditCard size={48} color="#e2d5c3" />
                            <Text className="mt-6 text-[#5C2E0E] text-[16px] font-bold">No Purchase History</Text>
                            <Text className="mt-2 text-center text-[#85431E]/50 px-8 text-[13px]">When you purchase packs or levels, they will appear here.</Text>
                        </View>
                    ) : (
                        payments.map((payment, idx) => (
                            <View key={payment.id || idx} className="bg-white rounded-[24px] p-5 mb-5 shadow-sm shadow-[#85431E]/10 border border-[#85431E]/5">
                                <View className="flex-row justify-between items-start mb-4 border-b border-[#85431E]/10 pb-4">
                                    <View>
                                        <Text className="text-[16px] font-black text-[#5C2E0E] mb-1">{getPlanOrLevelName(payment.plan_id)}</Text>
                                        <View className="flex-row items-center">
                                            <Calendar size={12} color="#85431E" opacity={0.6} />
                                            <Text className="text-[11px] font-bold text-[#85431E]/60 ml-1.5 uppercase tracking-wide">
                                                {new Date(payment.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-[20px] font-black text-[#DA7347]">₹{payment.amount}</Text>
                                        <View className={`px-2 py-0.5 rounded-full mt-1 flex-row items-center ${payment.status === 'captured' ? 'bg-[#DCFCE7]' : 'bg-red-100'}`}>
                                            {payment.status === 'captured' ? <CheckCircle2 size={10} color="#166534" /> : <AlertCircle size={10} color="#991B1B" />}
                                            <Text className={`text-[9px] font-black ml-1 uppercase tracking-wider ${payment.status === 'captured' ? 'text-[#166534]' : 'text-red-800'}`}>
                                                {payment.status || 'captured'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-y-3">
                                    <View className="w-1/2 flex-row items-center">
                                        <CreditCard size={14} color="#85431E" opacity={0.5} />
                                        <View className="ml-2">
                                            <Text className="text-[9px] font-bold text-[#85431E]/40 uppercase tracking-widest">Method</Text>
                                            <Text className="text-[12px] font-bold text-[#5C2E0E] capitalize">{payment.payment_method || (payment.payment_id?.startsWith('wallet') ? 'wallet' : 'online')}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="w-1/2 flex-row items-center">
                                        <Tag size={14} color="#85431E" opacity={0.5} />
                                        <View className="ml-2">
                                            <Text className="text-[9px] font-bold text-[#85431E]/40 uppercase tracking-widest">Coupon</Text>
                                            <Text className="text-[12px] font-bold text-[#5C2E0E]">{payment.coupon_code || 'None'}</Text>
                                        </View>
                                    </View>

                                    {payment.wallet_amount_used > 0 && (
                                        <View className="w-1/2 flex-row items-center mt-2">
                                            <Wallet size={14} color="#85431E" opacity={0.5} />
                                            <View className="ml-2">
                                                <Text className="text-[9px] font-bold text-[#85431E]/40 uppercase tracking-widest">Wallet Used</Text>
                                                <Text className="text-[12px] font-bold text-[#5C2E0E]">₹{payment.wallet_amount_used}</Text>
                                            </View>
                                        </View>
                                    )}
                                    
                                    <View className="w-full flex-row items-center mt-4 pt-3 border-t border-[#85431E]/10">
                                        <Text className="text-[9px] font-bold text-[#85431E]/60 uppercase tracking-widest">Transaction ID</Text>
                                        <Text className="text-[10px] font-bold text-[#5C2E0E] ml-auto" numberOfLines={1} ellipsizeMode="middle">
                                            {payment.payment_id}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
