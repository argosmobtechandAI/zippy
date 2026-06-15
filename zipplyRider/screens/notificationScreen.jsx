import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, CheckCircle, Calendar, Clock, AlertTriangle, RefreshCcw, Home, ClipboardList, Bell, User, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getUserApi, clearNotificationsApi, markNotificationsAsReadApi, getBroadcastsApi } from '../api/api';

const getIcon = (type) => {
    switch (type) {
        case 'booking': return <Calendar size={22} color="#8C4A28" />;
        case 'alert': return <AlertTriangle size={22} color="#DC143C" />;
        case 'success': return <CheckCircle size={22} color="white" />;
        case 'reminder': return <Clock size={22} color="#8C4A28" />;
        case 'marketing': return <Bell size={22} color="white" />;
        default: return <Bell size={22} color="#8C4A28" />;
    }
};

const getIconBg = (type) => {
    switch (type) {
        case 'success': return 'bg-[#8C4A28]';
        case 'alert': return 'bg-[#FADCD9]';
        case 'marketing': return 'bg-[#E3A358]';
        default: return 'bg-[#e2d5c3]';
    }
};

export default function NotificationScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [debugError, setDebugError] = useState(null);

    const tabs = ['All', 'Bookings', 'Alerts'];

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // 1. Fetch personal notifications
            const userRes = await apiFunction(getUserApi, [], {}, "GET", true);
            let personalNotifs = [];
            let uId = null;
            if (userRes && userRes.success) {
                personalNotifs = userRes.user?.notifications || [];
                uId = userRes.user?.id;
                setUserId(uId);
            }

            // 2. Fetch broadcast notifications
            const broadcastRes = await apiFunction(getBroadcastsApi, [], {}, "GET", true);
            let broadcasts = [];
            if (broadcastRes && broadcastRes.success) {
                // Filter broadcasts where target_type is 'rider' or null (all users)
                const rawBroadcasts = broadcastRes.broadcasts || [];
                broadcasts = rawBroadcasts
                    .filter(b => !b.target_type || b.target_type === 'rider' || b.target_type === 'all')
                    .map(b => {
                        let parsedTime = "Just now";
                        try {
                            parsedTime = new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch (e) {}

                        return {
                            id: b.id,
                            title: b.title,
                            desc: b.desc,
                            type: 'marketing',
                            image: b.image || null,
                            time: parsedTime,
                            unread: true, // For simplicity, always show broadcasts
                            date: b.created_at || new Date().toISOString()
                        }
                    });
            } else {
                setDebugError(JSON.stringify(broadcastRes));
            }

            // 3. Combine and sort
            const combinedNotifs = [...personalNotifs, ...broadcasts].sort((a, b) => new Date(b.date) - new Date(a.date));
            setNotifications(combinedNotifs);

            // Auto-mark personal notifications as read if there are unread ones
            const hasUnread = personalNotifs.some(n => n.unread);
            if (hasUnread && uId) {
                await apiFunction(markNotificationsAsReadApi(uId), [], {}, "PUT", true);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
            setDebugError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearNotifications = async () => {
        if (!userId) {
            Alert.alert("Error", "User identification not found.");
            return;
        }
        setLoading(true);
        try {
            const res = await apiFunction(clearNotificationsApi(userId), [], {}, "PUT", true);
            if (res && res.success) {
                setNotifications([]);
                Alert.alert("Success", "Notifications cleared successfully.");
            } else {
                Alert.alert("Error", res?.message || "Failed to clear notifications.");
            }
        } catch (error) {
            console.error("Clear notifications error:", error);
            Alert.alert("Error", "Failed to clear notifications.");
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

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Bookings') return n.type === 'booking' || n.type === 'success';
        if (activeTab === 'Alerts') return n.type === 'alert' || n.type === 'reminder';
        return true;
    });

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
                <TouchableOpacity 
                    className="w-10 h-10 items-center justify-center"
                    onPress={handleMorePress}
                >
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
                {debugError && (
                    <View className="p-4 bg-red-100 rounded-lg m-4">
                        <Text className="text-red-800 font-bold">Debug Error: {debugError}</Text>
                    </View>
                )}
                {filteredNotifications.length === 0 ? (
                    <View className="py-20 items-center justify-center">
                        <Bell size={48} color="#94a3b8" />
                        <Text className="text-[#64748b] font-bold mt-4">No notifications yet.</Text>
                    </View>
                ) : filteredNotifications.map((notif, index) => {
                    const rowBg = index % 2 === 0 ? 'bg-transparent' : 'bg-[#e2d5c3]/40';

                    return (
                        <TouchableOpacity 
                            key={notif.id || index} 
                            className={`flex-row px-6 py-5 ${rowBg}`}
                            onPress={() => {
                                if (notif.image || notif.type === 'marketing') {
                                    setSelectedNotification(notif);
                                    setModalVisible(true);
                                }
                            }}
                            activeOpacity={notif.image || notif.type === 'marketing' ? 0.7 : 1}
                        >
                            <View className={`w-[52px] h-[52px] rounded-2xl items-center justify-center overflow-hidden ${getIconBg(notif.type)}`}>
                                {notif.image ? (
                                    <Image source={{ uri: notif.image }} className="w-full h-full object-cover" />
                                ) : (
                                    getIcon(notif.type)
                                )}
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
                                <Text 
                                    className="text-[#64748b] text-[13px] leading-5 pr-4 font-normal"
                                    numberOfLines={(notif.image || notif.type === 'marketing') ? 2 : undefined}
                                >
                                    {notif.desc}
                                </Text>
                                {(notif.image || notif.type === 'marketing') && (
                                    <Text className="text-[#8C4A28] text-[12px] font-bold mt-1">View More</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            )}

            {/* Full View Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        {/* Close Button */}
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/40 rounded-full items-center justify-center backdrop-blur-sm"
                        >
                            <X color="white" size={20} />
                        </TouchableOpacity>

                        {/* Image Header */}
                        {selectedNotification?.image ? (
                            <Image 
                                source={{ uri: selectedNotification.image }} 
                                className="w-full h-48 bg-gray-100"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-32 bg-[#e2d5c3] items-center justify-center">
                                <Bell size={48} color="#8C4A28" />
                            </View>
                        )}

                        {/* Content */}
                        <ScrollView className="p-6 max-h-[60vh]">
                            <View className="flex-row items-center mb-2">
                                <Text className="text-[#8C4A28] font-bold text-[12px] uppercase tracking-wider bg-[#faeadd] px-2 py-1 rounded-md">
                                    Announcement
                                </Text>
                                <Text className="text-gray-400 text-[11px] font-semibold ml-auto">
                                    {selectedNotification?.time}
                                </Text>
                            </View>
                            <Text className="text-[#1a202c] font-extrabold text-[22px] mb-4 leading-tight">
                                {selectedNotification?.title}
                            </Text>
                            <Text className="text-[#64748b] text-[15px] leading-relaxed mb-6 font-normal">
                                {selectedNotification?.desc}
                            </Text>
                        </ScrollView>

                        {/* Action Button */}
                        <View className="p-6 pt-0">
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center shadow-lg"
                            >
                                <Text className="text-white font-bold text-[15px]">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
