import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { ArrowLeft, User, Mail, Phone, ShieldAlert } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { apiFunction } from '../api/apiFunction';
import { updateUserApi, uploadProfilePictureApi, baseURL } from '../api/api';

export default function PersonalInformationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setForm({
          fullName: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.mobile || '',
          emergencyContact: parsed.emergencyContact || '',
        });
      }
    } catch (error) {
      console.error("Load user data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleChangeProfilePicture = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel || response.errorCode || !response.assets) return;
      if (response.assets.length > 0) {
        const photo = response.assets[0];

        const data = new FormData();
        data.append('photo', {
          name: photo.fileName || 'photo.jpg',
          type: photo.type || 'image/jpeg',
          uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        } as any);

        setSaving(true);
        try {
          const res = await apiFunction(uploadProfilePictureApi(user.id), [], data, 'POST_FORM', true);
          if (res && res.success) {
            Toast.show({ type: 'success', text1: 'Success', text2: 'Profile picture updated' });
            const updatedProfilePic = res.profilePicture;
            const updatedUser = { ...user, profilePicture: updatedProfilePic };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } else {
            Toast.show({ type: 'error', text1: 'Error', text2: res?.message || 'Upload failed' });
          }
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Network error occurred' });
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await apiFunction(`${updateUserApi}/${user.id}`, [], {
        name: form.fullName,
        email: form.email,
        mobile: form.phone,
        emergencyContact: form.emergencyContact
      }, "PUT", true);

      if (res && res.success) {
        // Update local storage
        const updatedUser = { ...user, name: form.fullName, email: form.email, mobile: form.phone, emergencyContact: form.emergencyContact };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", res?.message || "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (icon: any, label: string, value: string, key: string, keyboardType: any = 'default') => {
    const IconComponent = icon;
    return (
      <View className="mb-6">
        <Text className="text-[#64748b] text-xs font-bold tracking-widest uppercase mb-2 ml-1">{label}</Text>
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] shadow-sm">
          <IconComponent color="#94a3b8" size={20} className="mr-3" />
          <TextInput
            value={value}
            onChangeText={(text) => updateForm(key, text)}
            keyboardType={keyboardType}
            className="flex-1 text-[#1a202c] font-medium py-3 text-base"
            placeholderTextColor="#cbd5e1"
          />
        </View>
      </View>
    );
  };

  if (loading) {
     return (
        <View className="flex-1 bg-[#F5EDDF] items-center justify-center">
           <ActivityIndicator size="large" color="#8C4A28" />
        </View>
     );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
            <ArrowLeft color="#8C4A28" size={24} />
          </TouchableOpacity>
          <Text className="text-[#8C4A28] font-bold text-xl">Personal Information</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8 mt-2">
            <View className="w-24 h-24 bg-[#eabba4] rounded-full items-center justify-center mb-4 overflow-hidden border-2 border-white shadow">
              {user?.profilePicture ? (
                 <Image 
                   source={{ uri: `${baseURL.replace('/api', '')}${user.profilePicture}` }} 
                   className="w-full h-full" 
                   resizeMode="cover" 
                 />
              ) : (
                 <User color="#8C4A28" size={40} />
              )}
            </View>
            <TouchableOpacity onPress={handleChangeProfilePicture}>
              <Text className="text-[#8C4A28] font-bold text-sm underline">Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          {renderInput(User, 'Full Name', form.fullName, 'fullName')}
          {renderInput(Mail, 'Email Address', form.email, 'email', 'email-address')}
          {renderInput(Phone, 'Phone Number', form.phone, 'phone', 'phone-pad')}
          {renderInput(ShieldAlert, 'Emergency Contact', form.emergencyContact, 'emergencyContact')}

        </ScrollView>

        {/* Footer Action */}
        <View className="p-4 bg-white border-t border-[#e2e8f0]">
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center shadow-sm ${saving ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
