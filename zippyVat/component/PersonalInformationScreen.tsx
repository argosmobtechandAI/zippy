import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { ArrowLeft, User, Mail, Phone, ShieldAlert, Camera, Fingerprint, BadgeCheck, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getUserApi, uploadProfilePictureApi } from '../api/api';
import { Config } from '../api/config';
import { launchImageLibrary } from 'react-native-image-picker';

const getImageUrl = (url: string) => url?.startsWith('/') ? `${Config.BASE_URL}${url}` : url;

export default function PersonalInformationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    emergencyContact: '',
  });

  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    loadCurrentData();
  }, []);

  const loadCurrentData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user');
      if (userDataStr) {
        const parsedUser = JSON.parse(userDataStr);
        setUserId(parsedUser.id || parsedUser._id);
        setUserMetadata(parsedUser);
        
        setForm({
          name: parsedUser.name || parsedUser.fullName || '',
          email: parsedUser.email || '',
          mobile: parsedUser.mobile || parsedUser.phone || '',
          emergencyContact: parsedUser.emergencyContact || '',
        });

        const res = await apiFunction(getUserApi, [], {}, 'GET', true);
        if (res && res.success && res.user) {
          setForm({
            name: res.user.name || res.user.fullName || '',
            email: res.user.email || '',
            mobile: res.user.mobile || res.user.phone || '',
            emergencyContact: res.user.emergencyContact || '',
          });
          setUserMetadata(res.user);
          await AsyncStorage.setItem('user', JSON.stringify(res.user));
        }
      }
    } catch (error) {
      console.error("Load personal info error:", error);
    } finally {
      setFetching(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleChangeProfilePicture = () => {
    if (!userId) return;
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        const photo = response.assets[0];

        const formData = new FormData();
        formData.append('photo', {
          name: photo.fileName || 'profile.jpg',
          type: photo.type || 'image/jpeg',
          uri: Platform.OS === 'ios' ? photo.uri!.replace('file://', '') : photo.uri,
        } as any);

        setLoading(true);
        try {
          const res = await apiFunction(uploadProfilePictureApi(userId), [], formData, 'POST_FORM', true);
          if (res && res.success && res.url) {
            // Save the new URL locally so all screens show it immediately
            const updatedUser = { ...userMetadata, profilePicture: res.url };
            setUserMetadata(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            Alert.alert('Success', 'Profile picture updated!');
          } else {
            Alert.alert('Error', res?.message || 'Upload failed. Please try again.');
          }
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Network error. Could not upload photo.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const res = await apiFunction(getUserApi, [userId], form, 'PUT', true);
      if (res && res.success) {
        const updatedUser = { ...userMetadata, ...form };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert("Success", "Professional Identity synchronized.");
        navigation.goBack();
      } else {
        Alert.alert("Sync Error", res?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Network Error", "Unable to synchronize changes. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon: any, label: string, value: string, key: string, keyboardType: any = 'default') => {
    const IconComponent = icon;
    const isFocused = focusedField === key;

    return (
      <View className="mb-6">
        <Text className="text-brand-brown/40 text-[10px] font-body uppercase tracking-[2px] font-bold mb-2 ml-1">{label}</Text>
        <View 
          className={`flex-row items-center bg-brand-beige/20 rounded-2xl px-4 py-0.5 border ${isFocused ? 'border-brand-orange bg-white' : 'border-brand-brown/5'}`}
        >
          <IconComponent color={isFocused ? "#DA7347" : "#85431E"} opacity={isFocused ? 1 : 0.4} size={18} className="mr-3" />
          <TextInput
            value={value}
            onFocus={() => setFocusedField(key)}
            onBlur={() => setFocusedField(null)}
            onChangeText={(text) => updateForm(key, text)}
            keyboardType={keyboardType}
            className="flex-1 text-brand-brown font-display-reg text-base py-4"
            placeholderTextColor="#cbd5e1"
            editable={!loading}
          />
          {value.length > 3 && !isFocused && <CheckCircle2 color="#DA7347" size={14} opacity={0.3} />}
        </View>
      </View>
    );
  };

  if (fetching) {
    return (
      <View className="flex-1 bg-brand-beige items-center justify-center">
        <ActivityIndicator color="#85431E" />
        <Text className="mt-5 text-brand-brown/40 font-display text-[11px] uppercase tracking-[4px]">Accessing Vault...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-beige">
      <View className="flex-1">
        
        {/* Stable Header */}
        <View className="flex-row items-center px-8 py-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]"
          >
            <ArrowLeft color="#85431E" size={20} />
          </TouchableOpacity>
          <View className="ml-5">
             <Text className="text-brand-brown font-display text-xl tracking-tight">Identity Details</Text>
             <Text className="text-brand-orange/40 text-[9px] font-body uppercase tracking-[1.5px] font-bold">Clinical Personnel Profile</Text>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* Elegant Circular Avatar */}
            <View className="items-center mb-10 mt-4">
              <View className="relative">
                <View className="w-32 h-32 border-[3px] border-white rounded-full items-center justify-center shadow-xl bg-white overflow-hidden">
                   {userMetadata?.profilePicture ? (
                     <Image source={{ uri: getImageUrl(userMetadata.profilePicture) }} className="w-full h-full" />
                   ) : (
                     <User color="#85431E" opacity={0.08} size={60} />
                   )}
                </View>
                <TouchableOpacity 
                  onPress={handleChangeProfilePicture}
                  activeOpacity={0.9}
                  className="absolute bottom-0 right-0 bg-brand-orange w-10 h-10 border-[3px] border-white rounded-full items-center justify-center shadow-md"
                >
                  <Camera color="white" size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-5 bg-brand-orange/5 px-4 py-1.5 rounded-full">
                 <BadgeCheck color="#DA7347" size={12} className="mr-2" />
                 <Text className="text-brand-orange/80 font-body text-[9px] uppercase tracking-[2px] font-bold">Verified Account</Text>
              </View>
            </View>

            {/* High-Contrast Form Card */}
            <View className="bg-white rounded-[32px] p-6 shadow-sm border border-brand-brown/5">
               {renderInput(User, 'Full Name', form.name, 'name')}
               {renderInput(Mail, 'Email Address', form.email, 'email', 'email-address')}
               {renderInput(Phone, 'Mobile Number', form.mobile, 'mobile', 'phone-pad')}
               {renderInput(ShieldAlert, 'Emergency Contact', form.emergencyContact, 'emergencyContact')}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Stable Footer Action */}
        <View className="px-8 py-6 bg-brand-beige border-t border-brand-brown/5">
          <TouchableOpacity 
            className={`py-5 rounded-2xl items-center flex-row justify-center shadow-lg ${loading ? 'bg-brand-orange/60' : 'bg-brand-orange'}`}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                 <Fingerprint color="white" size={20} className="mr-2" />
                 <Text className="text-white font-display text-base tracking-tight ml-1">Commit Credentials</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
