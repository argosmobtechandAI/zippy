import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Bell, Lock, CircleHelp, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { resetData } from '../redux/getDataSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { apiFunction } from '../api/apiFunction';
import { deleteUserApi } from '../api/api';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.getData);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  React.useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('pushNotificationsEnabled');
        if (storedValue !== null) {
          setNotificationsEnabled(storedValue === 'true');
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    loadNotificationSettings();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('pushNotificationsEnabled', String(value));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      dispatch(resetData());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?.id) return;
              const res = await apiFunction(deleteUserApi, [user.id], {}, "DELETE", true);
              if (res && res.success) {
                await handleLogout();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete account");
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "An unexpected error occurred");
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (icon: any, title: string, hasAction: boolean = true, rightComponent: React.ReactNode = null, onPress?: () => void, isDestructive: boolean = false) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-4 border-b border-[#f1f5f9]">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 ${isDestructive ? 'bg-red-50' : 'bg-[#fceddf]'} rounded-full items-center justify-center mr-4`}>
            <IconComponent color={isDestructive ? "#ef4444" : "#8C4A28"} size={20} />
          </View>
          <Text className={`${isDestructive ? 'text-red-500' : 'text-[#1a202c]'} font-medium text-base`}>{title}</Text>
        </View>
        {rightComponent ? rightComponent : hasAction ? <ChevronRight color="#94a3b8" size={20} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-[#8C4A28] font-bold text-sm tracking-widest uppercase mb-4 ml-2">Account</Text>
          <View className="bg-white rounded-3xl px-4 py-2 shadow-sm border border-[#e2e8f0]">
            {renderSettingItem(User, 'Personal Information', true, null, () => navigation.navigate('PersonalInformation'))}
            {renderSettingItem(Lock, 'Privacy & Security', true, null, () => navigation.navigate('PrivacySecurity'))}
            {renderSettingItem(User, 'Delete Account', true, null, handleDeleteAccount, true)}
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-[#8C4A28] font-bold text-sm tracking-widest uppercase mb-4 ml-2">Preferences</Text>
          <View className="bg-white rounded-3xl px-4 py-2 shadow-sm border border-[#e2e8f0]">
            {renderSettingItem(Bell, 'Push Notifications', false, (
              <Switch 
                value={notificationsEnabled} 
                onValueChange={toggleNotifications} 
                trackColor={{ false: '#cbd5e1', true: '#8C4A28' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f8fafc'}
              />
            ))}
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-8">
          <Text className="text-[#8C4A28] font-bold text-sm tracking-widest uppercase mb-4 ml-2">Support & About</Text>
          <View className="bg-white rounded-3xl px-4 py-2 shadow-sm border border-[#e2e8f0]">
            {renderSettingItem(CircleHelp, 'Help Center', true, null, () => navigation.navigate('HelpCenter'))}
            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#fceddf] rounded-full items-center justify-center mr-4">
                  <LogOut color="#ef4444" size={20} />
                </View>
                <Text className="text-[#ef4444] font-medium text-base">Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-center text-[#94a3b8] text-xs">App Version 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}
