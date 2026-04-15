import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Settings, User, Award, Calendar, ChevronRight, LogOut, ShieldCheck } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchUser();
        }, [])
    );

    const fetchUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView className="flex-1 bg-brand-beige">
            {/* Premium Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
               <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
                >
                    <ArrowLeft color="#85431E" size={20} />
                </TouchableOpacity>
                <Text className="text-brand-brown font-display text-lg uppercase tracking-widest">Trainer Profile</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Settings")}
                    className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
                >
                    <Settings color="#85431E" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Profile Banner Section */}
                <View className="items-center mb-10">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="absolute bottom-1 right-1 bg-brand-orange w-8 h-8 rounded-full border-[3px] border-white items-center justify-center shadow-lg">
                            <ShieldCheck color="white" size={16} strokeWidth={3} />
                        </View>
                    </View>
                    <Text className="text-brand-brown font-display text-2xl mt-5 mb-1">{user ? user.name : 'Zippy Trainer'}</Text>
                    <Text className="text-brand-brown/50 font-body text-xs uppercase tracking-widest">Master Trainer • Level 12</Text>
                </View>

                {/* Refined Quick Stats Tiles */}
                <View className="flex-row justify-between mb-10">
                    <View className="flex-1 bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 mr-2 shadow-sm items-center">
                        <Text className="text-brand-brown font-display text-2xl mb-0.5">12</Text>
                        <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px] text-center">Years Exp.</Text>
                    </View>
                    <View className="flex-1 bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 mx-1 shadow-sm items-center">
                        <Text className="text-brand-brown font-display text-2xl mb-0.5">24</Text>
                        <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px] text-center">Sessions</Text>
                    </View>
                    <View className="flex-1 bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 ml-2 shadow-sm items-center">
                        <Text className="text-brand-brown font-display text-2xl mb-0.5">8</Text>
                        <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px] text-center">Horses</Text>
                    </View>
                </View>

                {/* Account Settings Section */}
                <View className="mb-8">
                    <Text className="text-lg font-display text-brand-brown mb-5">Account Overview</Text>
                    
                    <View className="bg-white/70 border border-brand-brown/5 rounded-[32px] overflow-hidden p-2 shadow-sm">
                        <TouchableOpacity onPress={() => navigation.navigate("PersonalInformation")} className="flex-row items-center p-4 border-b border-brand-brown/5">
                            <View className="w-12 h-12 bg-brand-beige rounded-2xl items-center justify-center mr-4">
                                <User color="#85431E" size={22} strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-brand-brown font-display-reg font-bold text-sm mb-0.5">Personal Details</Text>
                                <Text className="text-brand-brown/40 font-body text-[11px]">Email, Phone, Security</Text>
                            </View>
                            <ChevronRight color="#85431E" size={18} opacity={0.3} />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 border-b border-brand-brown/5">
                            <View className="w-12 h-12 bg-brand-beige rounded-2xl items-center justify-center mr-4">
                                <Award color="#85431E" size={22} strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-brand-brown font-display-reg font-bold text-sm mb-0.5">Certifications</Text>
                                <Text className="text-brand-brown/40 font-body text-[11px]">BHS Stage 4, Expert Rating</Text>
                            </View>
                            <ChevronRight color="#85431E" size={18} opacity={0.3} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Attendance")} className="flex-row items-center p-4">
                            <View className="w-12 h-12 bg-brand-beige rounded-2xl items-center justify-center mr-4">
                                <Calendar color="#85431E" size={22} strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-brand-brown font-display-reg font-bold text-sm mb-0.5">Availability & Leave</Text>
                                <Text className="text-brand-brown/40 font-body text-[11px]">Manage roster & hours</Text>
                            </View>
                            <ChevronRight color="#85431E" size={18} opacity={0.3} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Global Support & Exit */}
                <View className="mb-6">
                    <Text className="text-lg font-display text-brand-brown mb-5">Security & Support</Text>
                    <View className="bg-white/70 border border-brand-brown/5 rounded-[32px] overflow-hidden p-2 shadow-sm">
                        <TouchableOpacity className="flex-row items-center p-4" onPress={handleLogout}>
                            <View className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center mr-4">
                                <LogOut color="white" size={20} strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-red-500 font-display-reg font-bold text-sm">Sign Out Safely</Text>
                                <Text className="text-red-300 font-body text-[11px]">Disconnect from all devices</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
