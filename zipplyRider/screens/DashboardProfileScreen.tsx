import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Check, Info, AlertOctagon, Stethoscope, ClipboardList, Trophy, Medal, Star, Award, Wallet } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { Config } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { updateUserApi } from '../api/api';
import Toast from 'react-native-toast-message';

const getIconComp = (iconName: string) => {
  switch (iconName) {
    case 'Medal': return Medal;
    case 'Star': return Star;
    case 'Award': return Award;
    default: return Trophy;
  }
};

export default function DashboardProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, rider } = useSelector((state: any) => state.getData)
  const dispatch = useDispatch<any>();

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [updatingWallet, setUpdatingWallet] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser())
    }
    if (!rider) {
      dispatch(fetchRider())
    }
  }, [dispatch])

  const handleAddMoney = async () => {
    if (!amountToAdd || isNaN(Number(amountToAdd))) return;
    setUpdatingWallet(true);
    try {
      const currentWallet = Number(rider?.wallet || user?.riderWallet || 0);
      const newWallet = currentWallet + Number(amountToAdd);
      
      const payload = {
        riderWallet: newWallet,
        wallet: newWallet
      };

      const res = await apiFunction(updateUserApi, [user.id], payload, 'PUT', true);
      if (res && res.success) {
        Toast.show({
          type: 'success',
          text1: 'Wallet Updated',
          text2: `Successfully added ₹${amountToAdd} to your wallet.`
        });
        setAmountToAdd('');
        setShowAddMoney(false);
        dispatch(fetchUser());
        dispatch(fetchRider());
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update',
          text2: res?.message || 'Please try again'
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error occurred'
      });
    } finally {
      setUpdatingWallet(false);
    }
  };

  const essentialDetails = [
    { icon: AlertOctagon, title: 'Emergency Contact', desc: user?.emergencyContact || 'Not Set', color: '#85431E' },
    { icon: Stethoscope, title: 'Medical Information', desc: rider?.medical || 'No medical conditions reported.', color: '#DA7347' },
    { icon: ClipboardList, title: 'Safety Instructions', desc: rider?.instructions || 'Standard safety rules apply.', color: '#526FAE' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-beige">
      {/* Premium Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
        >
          <ArrowLeft color="#85431E" size={20} />
        </TouchableOpacity>
        <Text className="text-brand-brown font-display text-lg uppercase tracking-widest">Rider's Profile</Text>
        <TouchableOpacity 
           onPress={() => navigation.navigate("Settings")}
           className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
        >
          <Settings color="#85431E" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info Section */}
        <View className="items-center mt-4 mb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl items-center justify-center overflow-hidden bg-white">
              <Image
                source={{ uri: user?.profilePicture ? `${Config.API_BASE_URL.replace('/api', '')}${user.profilePicture}` : 'https://images.unsplash.com/photo-1579975002161-0f4db23932e6?auto=format&fit=crop&w=300&q=80' }}
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-brand-orange w-9 h-9 rounded-full border-[3px] border-white items-center justify-center shadow-lg">
              <Check color="white" size={18} strokeWidth={3} />
            </View>
          </View>
          
          <View className="items-center mt-5">
            <Text className="text-3xl font-display text-brand-brown text-center leading-tight">
              {user?.name?.split(' ')[0] || 'Alex'} <Text className="font-display-reg font-light">{user?.name?.split(' ')[1] || 'Sterling'}</Text>
            </Text>
            <Text className="text-brand-brown/60 font-body text-sm mt-1 uppercase tracking-widest">
              Advanced Equestrian • Level {rider?.level || 8}
            </Text>
            <Text className="text-brand-brown/40 font-body-light text-xs mt-1">
              Member since {user?.createdAt?.split("-")[0] || "April 2021"}
            </Text>
        </View>

        {/* Premium Wallet Balance Card */}
        <View className="mx-6 mb-8 bg-[#FAF3EC] border border-brand-brown/15 rounded-[28px] p-6 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white w-12 h-12 rounded-2xl items-center justify-center border border-brand-brown/10 shadow-xs mr-3">
                <Wallet color="#85431E" size={24} />
              </View>
              <View>
                <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2.5px]">Your Wallet</Text>
                <Text className="text-2xl font-display text-brand-brown">₹{(rider?.wallet || user?.riderWallet || 0).toLocaleString()}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setShowAddMoney(true)}
              className="bg-brand-orange py-2.5 px-4 rounded-xl shadow-sm active:scale-95"
            >
              <Text className="text-white font-bold text-[11px] uppercase tracking-wider">Add Money</Text>
            </TouchableOpacity>
          </View>

          {showAddMoney && (
            <View className="mt-4 border-t border-brand-brown/10 pt-4">
              <Text className="text-brand-brown/60 font-body text-xs mb-2">Enter amount to add (₹):</Text>
              <View className="flex-row">
                <TextInput
                  value={amountToAdd}
                  onChangeText={setAmountToAdd}
                  placeholder="e.g. 500"
                  keyboardType="numeric"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 bg-white border border-brand-brown/10 rounded-xl px-3 py-2 text-brand-brown font-bold text-sm mr-2"
                />
                <TouchableOpacity 
                  onPress={handleAddMoney}
                  disabled={updatingWallet || !amountToAdd}
                  className="bg-brand-brown py-3 px-4 rounded-xl flex-row items-center justify-center mr-2"
                >
                  {updatingWallet ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Confirm</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => { setShowAddMoney(false); setAmountToAdd(''); }}
                  className="bg-white border border-brand-brown/10 px-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-brand-brown/60 font-bold text-xs">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* High-Fidelity Stats Row */}
        <View className="flex-row justify-between px-6 mb-10">
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center mr-2 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.sessionCount || 0}</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Total Rides</Text>
          </View>
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center mx-1 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.trophies?.length || 0}</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Trophies</Text>
          </View>
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center ml-2 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.safetyBriefing?.length || 100}%</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Safety Score</Text>
          </View>
        </View>

        {/* Essential Details Card Layout */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-5">
             <Text className="text-brand-brown font-display text-xl">Essential Details</Text>
             <Info color="#85431E" size={20} opacity={0.5} />
          </View>

          <View className="space-y-4">
            {essentialDetails.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <View key={idx} className="bg-white/70 border border-brand-brown/5 rounded-3xl p-5 flex-row items-center mb-4 shadow-sm">
                  <View style={{ backgroundColor: `${item.color}15` }} className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
                    <IconComp color={item.color} size={24} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-brand-brown font-display-reg font-bold text-sm mb-0.5">{item.title}</Text>
                    <Text className="text-brand-brown/50 font-body text-xs leading-relaxed">{item.desc}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Trophies Grid Section */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Trophy color="#85431E" size={22} className="mr-2" />
              <Text className="text-brand-brown font-display text-xl ml-2">My Trophies</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Trophies")}>
              <Text className="text-brand-orange font-bold text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {(!rider?.trophies || rider.trophies.length === 0) ? (
              <View className="w-full py-6 items-center justify-center bg-white border border-brand-brown/5 rounded-[28px] shadow-sm">
                <Trophy color="#cbd5e1" size={32} className="mb-3" />
                <Text className="text-brand-brown/60 font-body text-sm text-center">No trophies earned yet.</Text>
                <Text className="text-brand-brown/40 font-body text-xs text-center mt-1">Keep riding to unlock achievements!</Text>
              </View>
            ) : (
              rider.trophies.map((trophy: any, idx: number) => {
                const IconComp = getIconComp(trophy.icon);
                return (
                  <View key={idx} className="bg-white border border-brand-brown/5 rounded-[28px] p-5 w-[48%] mb-4 shadow-md relative overflow-hidden">
                    <View className="absolute -top-6 -right-6 w-20 h-20 bg-brand-beige/50 rounded-full" />
                    <View className="mb-4 bg-brand-beige/30 self-start p-3 rounded-2xl">
                      <IconComp color={trophy.color || '#85431E'} size={28} strokeWidth={2.5} />
                    </View>
                    <Text className="text-brand-brown font-display-reg font-bold text-[13px] mb-1">{trophy.title}</Text>
                    <Text className="text-brand-brown/40 font-body text-[10px] uppercase tracking-wider">{trophy.subtitle || trophy.date}</Text>
                  </View>
                )
              })
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

