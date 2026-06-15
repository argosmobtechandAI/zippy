import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../api/api';

export default function HelpCenterScreen() {
  const navigation = useNavigation<any>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill out both subject and message fields',
      });
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      let userId = null;
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      }

      const response = await fetch(`${baseURL}/help-center`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subject,
          message,
        }),
      });

      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON. Raw response:', responseText);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Server returned an invalid response',
        });
        setLoading(false);
        return;
      }

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your message has been sent to our support team.',
        });
        setSubject('');
        setMessage('');
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to submit form',
        });
      }
    } catch (error) {
      console.error('Submit help center form error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#1a202c] mb-2">How can we help?</Text>
          <Text className="text-[#64748b] font-normal">
            Fill out the form below and our support team will get back to you as soon as possible.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-[#1a202c] font-semibold text-xs mb-2">Subject</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 text-[#1e293b] font-normal"
            placeholder="What is this regarding?"
            placeholderTextColor="#94a3b8"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View className="mb-8">
          <Text className="text-[#1a202c] font-semibold text-xs mb-2">Message</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 text-[#1e293b] h-32 font-normal"
            placeholder="Describe your issue or question in detail..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center shadow"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Submit Request</Text>
              <Send color="white" size={20} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
