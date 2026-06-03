import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { ChevronLeft, CheckCircle, Calendar, Clock, AlertTriangle, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getUserApi, markNotificationsAsReadApi, clearNotificationsApi } from '../api/api';

const getIcon = (type: string) => {
    switch (type) {
        case 'booking': return <Calendar size={22} color="#8C4A28" />;
        case 'alert': return <AlertTriangle size={22} color="#DC143C" />;
        case 'success': return <CheckCircle size={22} color="white" />;
        case 'reminder': return <Clock size={22} color="#8C4A28" />;
        case 'system': return <Bell size={22} color="#8C4A28" />;
        default: return <Bell size={22} color="#8C4A28" />;
    }
};

const getIconBg = (type: string) => {
    switch (type) {
        case 'success': return 'bg-[#8C4A28]';
        case 'alert': return 'bg-[#FADCD9]';
        case 'system': return 'bg-[#e2d5c3]';
        default: return 'bg-[#e2d5c3]';
    }
};

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const tabs = ['All', 'Bookings', 'Alerts'];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!refreshing) setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      const userObj = userData ? JSON.parse(userData) : null;
      
      const res = await apiFunction(getUserApi, [], {}, "GET", true);
      if (res && res.success) {
        const notifs = res.user?.notifications || [];
        setNotifications([...notifs].reverse());
        const uId = res.user?.id;
        setUserId(uId);

        // MARK ALL AS READ AUTOMATICALLY
        if (uId && notifs.some((n: any) => n.unread)) {
            await apiFunction(markNotificationsAsReadApi(uId), [], {}, "PUT", true);
        }
      }
    } catch (error) {
      console.error("Fetch trainer notifications error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleClearNotifications = async () => {
      // Always get userId fresh from AsyncStorage as fallback
      let resolvedUserId = userId;
      if (!resolvedUserId) {
          try {
              const cached = await AsyncStorage.getItem('user');
              if (cached) resolvedUserId = JSON.parse(cached)?.id;
          } catch {}
      }

      console.log('=== handleClearNotifications DEBUG ===');
      console.log('userId from state:', userId);
      console.log('resolvedUserId:', resolvedUserId);
      const apiUrl = resolvedUserId ? clearNotificationsApi(resolvedUserId) : 'NO_USER_ID';
      console.log('API URL:', apiUrl);

      if (!resolvedUserId) {
          Alert.alert('Error', 'User identification not found. Please restart the app.');
          return;
      }

      setLoading(true);
      try {
          const res = await apiFunction(apiUrl, [], {}, 'PUT', true);
          console.log('clearNotifications API response:', JSON.stringify(res));
          if (res && res.success) {
              setNotifications([]);
              // Silent clear — no success alert needed
          } else {
              Alert.alert('Error', res?.message || 'Failed to clear notifications.');
          }
      } catch (error) {
          console.error('Clear notifications error:', error);
          Alert.alert('Error', 'Failed to clear notifications.');
      } finally {
          setLoading(false);
      }
  };


  const handleMorePress = () => {
      Alert.alert(
          "Clear Notifications",
          "Are you sure you want to clear all notifications?",
          [
              {
                  text: "Clear All",
                  onPress: handleClearNotifications,
                  style: "destructive"
              },
              {
                  text: "Cancel",
                  style: "cancel"
              }
          ]
      );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Bookings') return n.type === 'booking' || n.type === 'success';
    if (activeTab === 'Alerts') return n.type === 'alert' || n.type === 'reminder' || n.type === 'system';
    return true;
  });

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-[#e2d5c3] items-center justify-center mr-4"
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft color="#1a202c" size={24} />
                    </TouchableOpacity>
                    <Text className="text-[#1a202c] text-2xl font-extrabold">Office Inbox</Text>
                </View>
                {notifications.length > 0 && (
                    <TouchableOpacity
                        onPress={handleMorePress}
                        className="bg-red-50 border border-red-200 px-4 py-2 rounded-full"
                    >
                        <Text className="text-red-500 font-bold text-xs">Clear All</Text>
                    </TouchableOpacity>
                )}
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
                    <Text className="mt-4 text-[#8C4A28] font-bold">Fetching updates...</Text>
                </View>
            ) : (
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C4A28" />
                }
            >
                {filteredNotifications.length === 0 ? (
                    <View className="py-20 items-center justify-center opacity-40">
                        <Bell size={64} color="#94a3b8" />
                        <Text className="text-[#1a202c] font-black mt-4 text-lg">Empty Inbox</Text>
                        <Text className="text-[#64748b] font-bold text-center px-20 mt-2">Any official alerts or booking updates will appear here.</Text>
                    </View>
                ) : filteredNotifications.map((notif, index) => {
                    const rowBg = index % 2 === 0 ? 'bg-white/50' : 'bg-[#e2d5c3]/20';

                    return (
                        <View key={notif.id || index} className={`flex-row px-6 py-6 border-b border-[#e2d5c3]/30 ${rowBg}`}>
                            <View className={`w-[56px] h-[56px] rounded-[1.2rem] items-center justify-center shadow-sm ${getIconBg(notif.type)}`}>
                                {getIcon(notif.type)}
                            </View>
                            <View className="flex-1 ml-4 justify-center">
                                <View className="flex-row justify-between items-start mb-1.5">
                                    <Text className="text-[#1a202c] font-black text-[16px] leading-tight flex-1 mr-2">{notif.title}</Text>
                                    <Text className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest">{notif.time}</Text>
                                </View>
                                <Text className="text-[#64748b] text-[13px] font-medium leading-5 pr-4 mb-2">
                                    {notif.desc}
                                </Text>
                                {notif.horseName && (
                                    <View className="bg-[#8C4A28]/5 self-start px-2 py-1 rounded-lg border border-[#8C4A28]/10">
                                        <Text className="text-[#8C4A28] text-[9px] font-black uppercase">{notif.horseName} • {notif.horseBreed}</Text>
                                    </View>
                                )}
                                {notif.unread && (
                                    <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#8C4A28]" />
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
            )}
        </View>
    );
}
