import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function SuccessScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-[#8C4A28]">
      {/* Close Button Header */}
      <View className="px-4 py-4 items-end">
        <TouchableOpacity
          className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Tabs')}
        >
          <X color="white" size={24} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-6 -mt-10">

        {/* Animated Check Circle Placeholder */}
        <View className="w-32 h-32 bg-[#2c5f43] rounded-full border-4 border-white items-center justify-center mb-8 shadow-xl">
          <Check color="white" size={64} />
        </View>

        <Text className="text-4xl font-bold text-white text-center mb-4">You're All Set!</Text>

        <View className="bg-white/10 p-6 rounded-3xl mb-12 border border-white/20 w-full">
          <Text className="text-[#fceddf] text-center text-base leading-relaxed mb-4">
            Your rider profile is complete and your indemnity agreement has been securely saved.
          </Text>
          <View className="bg-black/20 p-4 rounded-xl items-center">
            <Text className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">MEMBERSHIP ID</Text>
            <Text className="text-white text-xl font-bold font-mono tracking-widest">ZIP-4592-AE</Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-white py-4 rounded-xl items-center shadow-lg"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-[#8C4A28] font-bold text-lg">Go to Login</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
