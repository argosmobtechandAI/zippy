import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ImageBackground } from 'react-native';
import { ChevronLeft, Bell, CheckCircle2, Gavel, Calendar, CalendarClock, Ban, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function CompetitiveRiderPacksScreen() {
    const navigation = useNavigation();

    const packs = [
        {
            id: 1,
            title: 'Beginner',
            pillText: 'BASICS',
            pillBg: 'bg-[#FADCD9]',
            pillColor: 'text-[#8C4A28]',
            sessions: '8',
            buttonStyle: 'bg-[#F5EDDF]',
            buttonText: 'text-[#8C4A28]',
            features: ['8 professional sessions', 'Basic stable access', 'Equine care intro'],
            isPopular: false
        },
        {
            id: 2,
            title: 'Intermediate',
            pillText: 'MOST POPULAR',
            pillBg: 'bg-[#8C4A28]',
            pillColor: 'text-white',
            sessions: '12',
            buttonStyle: 'bg-[#8C4A28]',
            buttonText: 'text-white',
            features: ['12 advanced sessions', 'Full stable access', 'Competition prep'],
            isPopular: true
        },
        {
            id: 3,
            title: 'Advanced',
            pillText: 'ELITE',
            pillBg: 'bg-[#F5EDDF]',
            pillColor: 'text-[#8C4A28]',
            sessions: '24',
            buttonStyle: 'bg-[#F5EDDF]',
            buttonText: 'text-[#8C4A28]',
            features: ['24 elite sessions', 'Unlimited stable access', 'Tournament entry'],
            isPopular: false
        }
    ];

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
                    {packs.map((pack) => (
                        <View 
                            key={pack.id} 
                            className={`bg-white rounded-[20px] p-5 mb-4 shadow-sm ${
                                pack.isPopular ? 'border border-[#8C4A28] pb-6 pt-6' : 'border border-[#e2d5c3]'
                            }`}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-[#1a202c] text-[16px] font-black">{pack.title}</Text>
                                <View className={`${pack.pillBg} px-3 py-1 rounded shadow-sm`}>
                                    <Text className={`${pack.pillColor} text-[8px] font-black uppercase tracking-widest`}>{pack.pillText}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-baseline mb-5">
                                <Text className="text-[#1a202c] text-[38px] font-black leading-10">{pack.sessions}</Text>
                                <Text className="text-[#64748b] text-[12px] font-bold ml-1">sessions/month</Text>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center justify-center mb-6 shadow-sm ${pack.buttonStyle}`}
                                onPress={() => navigation.navigate('Success')}
                            >
                                <Text className={`font-black text-[13px] ${pack.buttonText}`}>Enroll Now</Text>
                            </TouchableOpacity>

                            <View>
                                {pack.features.map((feature, idx) => (
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
        </SafeAreaView>
    );
}
