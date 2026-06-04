import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, ShieldAlert, ClipboardList, Stethoscope } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, fetchRider } from '../redux/getDataSlice';
import { apiFunction } from '../api/apifunction';
import { updateUserApi, uploadProfilePictureApi } from '../api/api';
import { Config } from '../api/config';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export default function PersonalInformationScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<any>();
  const { user, rider, loading: reduxLoading } = useSelector((state: any) => state.getData);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    safetyInstructions: '',
    medicalConditions: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.mobile || '',
        emergencyContact: user.emergencyContact || '',
        safetyInstructions: rider?.instructions || '',
        medicalConditions: rider?.medical || '',
      });
    } else {
      dispatch(fetchUser());
    }
    if (!rider) {
      dispatch(fetchRider());
    }
  }, [user, rider]);

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleChangeProfilePicture = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        const photo = response.assets[0];
        
        const data = new FormData();
        data.append('photo', {
          name: photo.fileName || 'photo.jpg',
          type: photo.type || 'image/jpeg',
          uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        });

        setLoading(true);
        try {
          const res = await apiFunction(uploadProfilePictureApi(user.id), [], data, 'POST_FORM', true);
          if (res && res.success) {
            Toast.show({ type: 'success', text1: 'Success', text2: 'Profile picture updated' });
            dispatch(fetchUser());
          } else {
            Toast.show({ type: 'error', text1: 'Error', text2: res?.message || 'Upload failed' });
          }
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Network error occurred' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.fullName,
        email: form.email,
        mobile: form.phone,
        emergencyContact: form.emergencyContact,
        instructions: form.safetyInstructions,
        medical: form.medicalConditions
      };

      const res = await apiFunction(updateUserApi, [user.id], payload, 'PUT', true);
      if (res && res.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile updated successfully'
        });
        dispatch(fetchUser());
        dispatch(fetchRider());
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: res?.message || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error occurred'
      });
    } finally {
      setLoading(false);
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
                  source={{ uri: user.profilePicture.startsWith('http') ? user.profilePicture : `${Config.API_BASE_URL.replace('/api', '')}${user.profilePicture}` }} 
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
          {renderInput(ClipboardList, 'Safety Instructions', form.safetyInstructions, 'safetyInstructions')}
          {renderInput(Stethoscope, 'Medical Information', form.medicalConditions, 'medicalConditions')}

        </ScrollView>

        {/* Footer Action */}
        <View className="p-4 bg-white border-t border-[#e2e8f0]">
          <TouchableOpacity 
            className="bg-[#8C4A28] py-4 rounded-xl items-center shadow-sm"
            onPress={handleSave}
            disabled={loading || reduxLoading}
          >
            {loading || reduxLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
