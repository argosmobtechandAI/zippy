import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Settings, User, Award, Calendar, ChevronRight, LogOut, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 mb-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <ArrowLeft color="#1a202c" size={20} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#1a202c]">Trainer Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Settings")} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <Settings color="#1a202c" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Profile Info */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden mb-3">
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                            className="w-full h-full"
                        />
                    </View>
                    <Text className="text-[#1a202c] font-bold text-2xl mb-1">Jane Thompson</Text>
                    <View className="bg-[#e6d0b3] px-3 py-1 rounded-full flex-row items-center">
                        <ShieldCheck color="#8C4A28" size={12} className="mr-1" />
                        <Text className="text-[#8C4A28] text-xs font-bold">Senior Head Trainer</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row justify-between mb-8">
                    <View className="flex-1 bg-white rounded-3xl p-4 mr-2 shadow-sm border border-[#e2e8f0] items-center">
                        <Text className="text-[#8C4A28] font-bold text-2xl mb-1">12</Text>
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider text-center">YEARS EXP.</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-3xl p-4 mx-1 shadow-sm border border-[#e2e8f0] items-center">
                        <Text className="text-[#8C4A28] font-bold text-2xl mb-1">24</Text>
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider text-center">SESSIONS</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-3xl p-4 ml-2 shadow-sm border border-[#e2e8f0] items-center">
                        <Text className="text-[#8C4A28] font-bold text-2xl mb-1">8</Text>
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider text-center">HORSES</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <Text className="text-lg font-bold text-[#1a202c] mb-4">Account Overview</Text>
                
                <View className="bg-white rounded-3xl p-2 shadow-sm border border-[#e2e8f0] mb-6">
                    <TouchableOpacity onPress={() => navigation.navigate("PersonalInformation")} className="flex-row items-center p-3 border-b border-[#f1f5f9]">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-xl items-center justify-center mr-3">
                            <User color="#8C4A28" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold text-base mb-0.5">Personal Details</Text>
                            <Text className="text-[#64748b] text-xs">Email, Phone, Address</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-3 border-b border-[#f1f5f9]">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-xl items-center justify-center mr-3">
                            <Award color="#8C4A28" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold text-base mb-0.5">Certifications</Text>
                            <Text className="text-[#64748b] text-xs">BHS Stage 4, First Aid</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Attendance")} className="flex-row items-center p-3">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-xl items-center justify-center mr-3">
                            <Calendar color="#8C4A28" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold text-base mb-0.5">Availability & Leave</Text>
                            <Text className="text-[#64748b] text-xs">Manage your working hours</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Support & Logout */}
                <Text className="text-lg font-bold text-[#1a202c] mb-4">Other</Text>
                <View className="bg-white rounded-3xl p-2 shadow-sm border border-[#e2e8f0] mb-6">
                    <TouchableOpacity className="flex-row items-center p-3" onPress={() => navigation.navigate("Login")}>
                        <View className="w-10 h-10 bg-[#fee2e2] rounded-xl items-center justify-center mr-3">
                            <LogOut color="#ef4444" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#ef4444] font-bold text-base">Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
