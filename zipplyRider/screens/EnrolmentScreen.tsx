import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Clock, Info, CheckSquare, Layers, RefreshCcw, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function EnrolmentScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero section */}
                <ImageBackground 
                    source={{ uri: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800&auto=format&fit=crop' }}
                    className="w-full h-72 justify-end"
                    resizeMode="cover"
                >
                    {/* Header Controls */}
                    <View style={{ top: Math.max(insets.top, 12) }} className="absolute left-0 right-0 px-6 flex-row items-center justify-center">
                        <TouchableOpacity 
                            className="absolute left-6 w-10 h-10 rounded-full bg-[#e2d5c3]/90 items-center justify-center"
                            onPress={() => {
                                navigation.goBack();
                            }}
                        >
                            <ChevronLeft color="#1a202c" size={24} />
                        </TouchableOpacity>
                        <Text className="text-[#1a202c] text-xl font-extrabold">Enrolment</Text>
                    </View>

                    {/* Gradient Overlay for Text Readability */}
                    <View className="absolute inset-0 bg-black/30" />
                    
                    <View className="px-6 pb-6 pt-20 h-full justify-end">
                        <View className="bg-[#8C4A28] self-start px-3 py-1 rounded-md mb-2">
                            <Text className="text-white text-[10px] font-extrabold uppercase tracking-widest">Popular Plan</Text>
                        </View>
                        <Text className="text-white text-3xl font-extrabold mb-1">Basic Rider Plan</Text>
                        <Text className="text-white/90 text-sm font-medium">Level 2: Intermediate Training</Text>
                    </View>
                </ImageBackground>

                <View className="px-5 pt-6 pb-24">
                    {/* Stats Cards */}
                    <View className="flex-row justify-between mb-6">
                        <View className="flex-1 bg-[#FFF9F0] rounded-2xl p-4 mr-2 shadow-sm border border-[#e2d5c3]">
                            <View className="flex-row items-center mb-1">
                                <Calendar color="#8C4A28" size={14} />
                                <Text className="text-[#8C4A28] text-[10px] font-extrabold ml-1 uppercase tracking-wider">Sessions</Text>
                            </View>
                            <Text className="text-[#1a202c] text-[22px] font-extrabold">20 Lessons</Text>
                        </View>
                        <View className="flex-1 bg-[#FFF9F0] rounded-2xl p-4 ml-2 shadow-sm border border-[#e2d5c3]">
                            <View className="flex-row items-center mb-1">
                                <Clock color="#8C4A28" size={14} />
                                <Text className="text-[#8C4A28] text-[10px] font-extrabold ml-1 uppercase tracking-wider">Validity</Text>
                            </View>
                            <Text className="text-[#1a202c] text-[22px] font-extrabold">150 Days</Text>
                        </View>
                    </View>

                    {/* Plan Rules & Schedule */}
                    <View className="bg-[#FFF9F0] rounded-3xl p-5 mb-8 shadow-sm border border-[#e2d5c3]">
                        <View className="flex-row items-center mb-6">
                            <Info color="#8C4A28" size={22} />
                            <Text className="text-[#1a202c] text-lg font-extrabold ml-2">Plan Rules & Schedule</Text>
                        </View>

                        <View className="flex-row mb-6">
                            <View className="w-12 h-12 rounded-xl bg-[#F5EDDF] items-center justify-center mr-4">
                                <Layers color="#8C4A28" size={20} />
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-[#1a202c] font-extrabold text-[15px] mb-1">Weekday Sessions</Text>
                                <Text className="text-[#64748b] text-[12px] leading-4 pr-2">
                                    Available Mon-Fri. Ideal for consistent skill building with less arena traffic.
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row mb-6">
                            <View className="w-12 h-12 rounded-xl bg-[#F5EDDF] items-center justify-center mr-4">
                                <CheckSquare color="#8C4A28" size={20} />
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-[#1a202c] font-extrabold text-[15px] mb-1">Weekend Access</Text>
                                <Text className="text-[#64748b] text-[12px] leading-4 pr-2">
                                    Limited to 2 weekend bookings per month to ensure fair access for all riders.
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row">
                            <View className="w-12 h-12 rounded-xl bg-[#F5EDDF] items-center justify-center mr-4">
                                <RefreshCcw color="#8C4A28" size={20} />
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-[#1a202c] font-extrabold text-[15px] mb-1">Cancellation Policy</Text>
                                <Text className="text-[#64748b] text-[12px] leading-4 pr-2">
                                    Bookings and cancellations are allowed until 8:00 PM on the previous day. After this cutoff time, no booking changes will be permitted. No-shows will result in session deduction.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Curriculum Highlights */}
                    <View className="mb-4">
                        <Text className="text-[#1a202c] text-lg font-extrabold mb-3">Curriculum Highlights</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Footer Fixed */}
            <View style={{ paddingBottom: Math.max(insets.bottom, 20) }} className="absolute bottom-0 left-0 right-0 bg-[#F5EDDF] border-t border-[#e2d5c3] px-6 py-5 flex-row items-center justify-between">
                <View>
                    <Text className="text-[#64748b] text-xs font-semibold mb-1">Total Investment</Text>
                    <View className="flex-row items-center">
                        <Text className="text-[#1a202c] text-2xl font-black mr-2">₹1,250</Text>
                        <View>
                            <View className="bg-[#e2d5c3] px-2 py-[2px] rounded mb-[2px]">
                                <Text className="text-[#8C4A28] text-[8px] font-extrabold">BEST VALUE</Text>
                            </View>
                            <Text className="text-[#94a3b8] text-[10px] line-through font-semibold">₹1,500</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    className="bg-[#8C4A28] rounded-xl px-6 py-4 flex-row items-center"
                    onPress={() => navigation.navigate('Success')}
                >
                    <Text className="text-white font-extrabold text-[15px] mr-2">Enroll Now</Text>
                    <ArrowRight color="white" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
