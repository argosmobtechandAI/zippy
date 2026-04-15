import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ChevronLeft, MoreVertical, CheckCircle, Calendar, Clock, AlertTriangle, RefreshCcw, Home, ClipboardList, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getUserApi } from '../api/api';

const getIcon = (type: string) => {
    switch (type) {
        case 'booking': return <Calendar size={22} color="#8C4A28" />;
        case 'alert': return <AlertTriangle size={22} color="#DC143C" />;
        case 'success': return <CheckCircle size={22} color="white" />;
        case 'reminder': return <Clock size={22} color="#8C4A28" />;
        default: return <Bell size={22} color="#8C4A28" />;
    }
};

const getIconBg = (type: string) => {
    switch (type) {
        case 'success': return 'bg-[#8C4A28]';
        case 'alert': return 'bg-[#FADCD9]';
        default: return 'bg-[#e2d5c3]';
    }
};

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const tabs = ['All', 'Bookings', 'Alerts'];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFunction(getUserApi, [], {}, "GET", true);
      if (res && res.success) {
        setNotifications(res.user?.notifications || []);
      }
    } catch (error) {
      console.error("Fetch vet notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Bookings') return n.type === 'booking' || n.type === 'success';
    if (activeTab === 'Alerts') return n.type === 'alert' || n.type === 'reminder';
    return true;
  });

    return (
        <View className="flex-1 bg-[#F5EDDF]">
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
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8C4A28" />
                </View>
            ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {filteredNotifications.length === 0 ? (
                    <View className="py-20 items-center justify-center">
                        <Bell size={48} color="#94a3b8" />
                        <Text className="text-[#64748b] font-bold mt-4">No notifications yet.</Text>
                    </View>
                ) : filteredNotifications.map((notif, index) => {
                    const rowBg = index % 2 === 0 ? 'bg-transparent' : 'bg-[#e2d5c3]/40';

                    return (
                        <View key={notif.id || index} className={`flex-row px-6 py-5 ${rowBg}`}>
                            <View className={`w-[52px] h-[52px] rounded-2xl items-center justify-center ${getIconBg(notif.type)}`}>
                                {getIcon(notif.type)}
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
            )}


        </View>
    );
}
