import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, MapPin, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [token, setToken] = useState(null)
  useEffect(()=>{
    const checkLogin = async () => {
      const tokenn = await AsyncStorage.getItem('token');
      if (tokenn) {
        setToken(tokenn)
      }
    };
    checkLogin();
  },[])
  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Top Image Section */}
      <View className="h-[45%] w-full relative">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80' }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Placeholder for the circular logo icon */}
        <View className="absolute -bottom-6 self-center h-14 w-14 rounded-full border border-[#8C4A28] items-center justify-center bg-transparent z-10">
          <Text className="text-[#8C4A28] text-2xl font-bold">Z</Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} className="flex-1 px-6 pt-10 pb-6 justify-between">
        <View className="items-center">
          <Text className="text-3xl font-bold text-[#1a202c] text-center leading-10">
            Experience the{'\n'}Heritage of{' '}
            <Text className="text-[#8C4A28]">Equestrian{'\n'}Excellence</Text>
          </Text>

          <Text className="text-[#8C4A28] text-center mt-4 text-sm px-2 leading-relaxed">
            Join the elite circle of horse riding enthusiasts. World-class facilities, expert trainers, and the finest pedigree horses await you at zippy.
          </Text>
        </View>

        <View className="space-y-4 mt-8">
          <TouchableOpacity
            className="w-full bg-[#8C4A28] py-4 rounded-xl items-center shadow-sm"
            onPress={() => token ? navigation.navigate("Tabs") : navigation.navigate("Login")}
          >
            <Text className="text-white font-bold text-lg">{token ? "Go to App" : "Get Started"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-xl items-center border border-[#8C4A28] mt-3"
            onPress={() => { }}
          >
            <Text className="text-[#8C4A28] font-bold text-lg">Take a Virtual Tour</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Features */}
        <View className="flex-row justify-between items-center mt-10 border-t border-[#e2d5c3] pt-6 pb-2">
          <View className="items-center flex-1">
            <View className="mb-2">
              <Crown color="#8C4A28" size={24} />
            </View>
            <Text className="text-[#7d8b99] text-[10px] uppercase font-bold text-center">Elite Coaching</Text>
          </View>
          <View className="w-[1px] h-8 bg-[#e2d5c3]" />
          <View className="items-center flex-1">
            <View className="mb-2">
              <MapPin color="#8C4A28" size={24} />
            </View>
            <Text className="text-[#7d8b99] text-[10px] uppercase font-bold text-center">Pristine Arenas</Text>
          </View>
          <View className="w-[1px] h-8 bg-[#e2d5c3]" />
          <View className="items-center flex-1">
            <View className="mb-2">
              <ShieldCheck color="#8C4A28" size={24} />
            </View>
            <Text className="text-[#7d8b99] text-[10px] uppercase font-bold text-center">Safety First</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
