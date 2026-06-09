import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, MapPin, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestUserPermission } from '../utils/firebaseUtils';

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
    requestUserPermission();
  },[])
  return (
    <ImageBackground 
      source={require('../assets/splash.jpeg')} 
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/40">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-6 pb-6 justify-between">
          <View className="flex-1" />

          <View className="w-full">
            <TouchableOpacity
              className="w-full bg-[#8C4A28] py-4 rounded-xl items-center shadow-sm mb-6"
              onPress={() => token ? navigation.navigate("Tabs") : navigation.navigate("Login")}
            >
              <Text className="text-white font-bold text-lg">{token ? "Go to App" : "Get Started"}</Text>
            </TouchableOpacity>

            {/* Footer Features */}
            <View className="flex-row justify-between items-center border-t border-white/30 pt-6 pb-2">
              <View className="items-center flex-1">
                <View className="mb-2">
                  <Crown color="#FFF" size={24} />
                </View>
                <Text className="text-white/90 text-[10px] uppercase font-bold text-center">Elite Coaching</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/30" />
              <View className="items-center flex-1">
                <View className="mb-2">
                  <MapPin color="#FFF" size={24} />
                </View>
                <Text className="text-white/90 text-[10px] uppercase font-bold text-center">Pristine Arenas</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/30" />
              <View className="items-center flex-1">
                <View className="mb-2">
                  <ShieldCheck color="#FFF" size={24} />
                </View>
                <Text className="text-white/90 text-[10px] uppercase font-bold text-center">Safety First</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
