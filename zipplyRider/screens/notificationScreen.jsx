import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { ChevronLeft, MoreVertical, CheckCircle, Calendar, Clock, AlertTriangle, RefreshCcw, Home, ClipboardList, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function NotificationScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Bookings', 'Alerts'];

    const notifications = [
        {
            id: 1,
            icon: <CheckCircle size={22} color="white" />,
            iconBg: 'bg-[#8C4A28]',
            title: 'Booking Approved',
            time: '2m ago',
            desc: 'Your dressage session at Willow Creek Stables is confirmed for tomorrow at 10:00 AM.',
            unread: false
        },
        {
            id: 2,
            icon: <Calendar size={22} color="#8C4A28" />,
            iconBg: 'bg-[#e2d5c3]',
            title: 'Booking Confirmation',
            time: '1h ago',
            desc: "New booking for 'Jump Training' on Friday with Coach Sarah. See you there!",
            unread: false
        },
        {
            id: 3,
            icon: <Clock size={22} color="#8C4A28" />,
            iconBg: 'bg-[#e2d5c3]',
            title: 'Session Reminder',
            time: '3h ago',
            desc: "Your 'Polo Basics' starts in 2 hours. Don't forget your riding boots!",
            unread: true
        },
        {
            id: 4,
            icon: <Image source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=100&q=80' }} className="w-6 h-6 rounded-full" />,
            iconBg: 'bg-[#e2d5c3]',
            title: 'Low Balance Alert',
            time: 'Yesterday',
            desc: 'You have only 2 sessions left in your current bundle. Top up to keep riding.',
            unread: false
        },
        {
            id: 5,
            icon: <AlertTriangle size={22} color="#DC143C" />,
            iconBg: 'bg-[#FADCD9]',
            title: 'Plan Expiry Alert',
            time: '2d ago',
            desc: "Your 'Professional Rider' subscription expires in 3 days. Action required.",
            unread: false
        },
        {
            id: 6,
            icon: <RefreshCcw size={22} color="#8C4A28" />,
            iconBg: 'bg-[#e2d5c3]',
            title: 'Renewal Reminder',
            time: '3d ago',
            desc: 'Ready for another month? Your plan will automatically renew on Oct 15th.',
            unread: false
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
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
                    <Text className="text-[#1a202c] text-2xl font-extrabold">Notifications</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center">
                    <MoreVertical color="#1a202c" size={24} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 mt-4 border-b border-[#e2d5c3]">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`mr-6 pb-3 ${isActive ? 'border-b-2 border-[#8C4A28]' : ''}`}
                        >
                            <Text className={`font-bold text-[15px] ${isActive ? 'text-[#8C4A28]' : 'text-[#1a202c]'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Notifications List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {notifications.map((notif, index) => {
                    // Alternating background colors exactly like the image
                    const isEven = index % 2 === 0;
                    const rowBg = isEven ? 'bg-transparent' : 'bg-[#e2d5c3]/40';

                    return (
                        <View key={notif.id} className={`flex-row px-6 py-5 ${rowBg}`}>
                            <View className={`w-[52px] h-[52px] rounded-2xl items-center justify-center ${notif.iconBg}`}>
                                {notif.icon}
                            </View>
                            <View className="flex-1 ml-4 justify-center">
                                <View className="flex-row justify-between items-start mb-1">
                                    <Text className="text-[#1a202c] font-bold text-[16px]">{notif.title}</Text>
                                    <View className="flex-row items-center mt-[2px]">
                                        <Text className="text-[#64748b] text-[11px] font-semibold">{notif.time}</Text>
                                        {notif.unread && (
                                            <View className="w-2 h-2 rounded-full bg-[#8C4A28] ml-2" />
                                        )}
                                    </View>
                                </View>
                                <Text className="text-[#64748b] text-[13px] leading-5 pr-4">
                                    {notif.desc}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Tab Bar (Custom to match image exactly) */}
            <View className="flex-row bg-[#F5EDDF] border-t border-[#e2d5c3] pb-6 pt-3 px-2 justify-around">
                <TouchableOpacity className="items-center justify-center w-16" onPress={() => navigation.navigate('Home')}>
                    <Home color="#1a202c" size={22} />
                    <Text className="text-[#1a202c] text-[10px] font-bold mt-1">Home</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center justify-center w-16" onPress={() => navigation.navigate('Booking')}>
                    <ClipboardList color="#1a202c" size={22} />
                    <Text className="text-[#1a202c] text-[10px] font-bold mt-1">Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center justify-center w-16">
                    <Bell color="#8C4A28" size={22} />
                    <Text className="text-[#8C4A28] text-[10px] font-bold mt-1">Alerts</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center justify-center w-16" onPress={() => navigation.navigate('Profile')}>
                    <User color="#1a202c" size={22} />
                    <Text className="text-[#1a202c] text-[10px] font-bold mt-1">Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
