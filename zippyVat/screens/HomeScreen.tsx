import { Bell, ChevronRight, Activity, Stethoscope, Loader2, ClipboardCheck, ArrowUpRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getHorsesByVat } from '../api/api';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../api/config';

const getImageUrl = (url: string) => url?.startsWith('/') ? `${Config.BASE_URL}${url}` : url;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
   const navigation = useNavigation<any>();
   const [horses, setHorses] = useState([]);
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState<any>(null);

   const [refreshing, setRefreshing] = useState(false);

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchHorses();
      setRefreshing(false);
   };

   const fetchHorses = async () => {
      try {
         const res = await apiFunction(getHorsesByVat, [], {}, "GET", true);
         console.log(res)
         if (res && res.success) {
            setHorses(res.horses || []);
         }
      } catch (error) {
         console.error("Fetch horses error", error);
      } finally {
         setLoading(false);
      }
   };

   const loadUserData = async () => {
      try {
         const userData = await AsyncStorage.getItem('user');
         if (userData) {
            setUser(JSON.parse(userData));
         }
      } catch (error) {
         console.error("Load user data error", error);
      }
   };

   useEffect(() => {
      loadUserData();
      fetchHorses();
   }, []);

   const criticalHorses = useMemo(() => {
      if (horses) {
         return horses.filter((h: any) => h.healthStatus?.status?.toLowerCase() === 'unfit')
      }
      return []
   }, [horses])

   return (
      <View className="flex-1 bg-brand-beige">
         <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#85431E"
                  colors={["#85431E"]}
               />
            }
         >
            {/* Header Section - High-Fidelity Professional Profile */}
            <View className="flex-row justify-between items-center mb-10 mt-8">
               <View className="flex-row items-center">
                  <View className="w-16 h-16 rounded-full border-[4px] border-white shadow-xl overflow-hidden bg-white">
                     {user?.profilePicture ? (
                        <Image
                           source={{ uri: user.profilePicture }}
                           className="w-full h-full"
                        />
                     ) : (
                        <View className="w-full h-full bg-brand-beige items-center justify-center">
                           <Stethoscope color="#85431E" size={24} />
                        </View>
                     )}
                  </View>
                  <View className="ml-5">
                     <Text className="text-2xl font-display text-brand-brown leading-tight">{user?.name}</Text>
                     <View className="flex-row items-center mt-1">
                        <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                        <Text className="text-[10px] font-body text-brand-brown/50 uppercase tracking-[2px]">{user?.type === 'vet' ? 'Chief Veterinarian' : (user?.type || 'Specialist')}</Text>
                     </View>
                  </View>
               </View>
               <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Notification')}
                  className="w-12 h-12 bg-white/50 rounded-2xl items-center justify-center border border-brand-brown/5 shadow-sm"
               >
                  <Bell color="#85431E" size={22} strokeWidth={2.5} />
                  <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-brand-beige" />
               </TouchableOpacity>
            </View>

            {/* Premium Clinical Metrics */}
            <View className="flex-row justify-between mb-10 gap-5">
               <TouchableOpacity
                  activeOpacity={0.9}
                  className="flex-[1.2] bg-brand-brown rounded-[32px] p-8 justify-between shadow-2xl shadow-brand-brown/30 relative overflow-hidden"
                  onPress={() => navigation.navigate('Health')}
               >
                  <View className="absolute -top-12 -right-12 w-36 h-36 bg-white opacity-5 rounded-full" />

                  <View>
                     <View className="bg-white/10 self-start p-3.5 rounded-2xl mb-8 border border-white/10">
                        <Stethoscope color="white" size={26} strokeWidth={2.5} />
                     </View>
                     <Text className="text-white text-5xl font-display tracking-tighter leading-none">{horses.length}</Text>
                     <Text className="text-white/50 text-[10px] font-display uppercase tracking-[3px] mt-2">Active Fleet</Text>
                  </View>

                  <View className="flex-row items-center gap-2 mt-6">
                     <Text className="text-white/40 text-[9px] font-body uppercase tracking-widest">Live Roster Monitor</Text>
                     <ArrowUpRight color="white" opacity={0.3} size={14} />
                  </View>
               </TouchableOpacity>

               <View className="flex-1 gap-5">
                  <TouchableOpacity
                     activeOpacity={0.8}
                     className="bg-white rounded-[28px] p-6 shadow-sm border border-brand-brown/5 flex-col justify-between"
                     onPress={() => navigation.navigate('Horses')}
                  >
                     <View className="bg-brand-orange/10 self-start p-3 rounded-2xl mb-3">
                        <Activity color="#DA7347" size={20} strokeWidth={2.5} />
                     </View>
                     <View>
                        <Text className="text-brand-brown font-display text-lg tracking-tight leading-tight">{criticalHorses.length} Care</Text>
                        <Text className="text-brand-brown/40 text-[8px] font-body uppercase tracking-[2px] mt-0.5">Alerts</Text>
                     </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                     activeOpacity={0.8}
                     className="bg-[#FDF8F2] rounded-[28px] p-6 shadow-sm border border-brand-brown/5 flex-col justify-between"
                     onPress={() => navigation.navigate('Records')}
                  >
                     <View className="bg-brand-brown/5 self-start p-3 rounded-2xl mb-3">
                        <ClipboardCheck color="#85431E" size={20} strokeWidth={2.5} />
                     </View>
                     <View>
                        <Text className="text-brand-brown font-display text-lg tracking-tight leading-tight">Stable</Text>
                        <Text className="text-brand-brown/40 text-[8px] font-body uppercase tracking-[2px] mt-0.5">Records</Text>
                     </View>
                  </TouchableOpacity>
               </View>
            </View>

            {/* High-Fidelity Health Roster */}
            <View className="flex-row justify-between items-center mb-8 px-1">
               <View className="flex-row items-center">
                  <Stethoscope color="#85431E" size={22} className="mr-3" />
                  <Text className="text-2xl font-display text-brand-brown tracking-tight ml-2">Clinical Queue</Text>
               </View>
               <TouchableOpacity onPress={() => navigation.navigate('Health')} activeOpacity={0.6}>
                  <Text className="text-brand-orange font-display text-[10px] uppercase tracking-[2px]">See All</Text>
               </TouchableOpacity>
            </View>

            {loading ? (
               <View className="py-20 justify-center items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-brown" />
                  <Text className="mt-4 text-brand-brown/40 font-display text-[10px] uppercase tracking-[3px]">Syncing Laboratory...</Text>
               </View>
            ) : criticalHorses?.length === 0 ? (
               <View className="bg-white/50 rounded-[40px] p-16 items-center border-2 border-dashed border-brand-brown/10">
                  <Stethoscope color="#85431E" opacity={0.1} size={48} className="mb-6" />
                  <Text className="text-brand-brown/40 font-body text-[10px] uppercase tracking-[2.5px] text-center">No Priority cases detected</Text>
               </View>
            ) : (
               <View className="gap-5">
                  {criticalHorses?.map((horse, idx) => (
                     <TouchableOpacity
                        key={horse.id}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("HorseDetail", { horse })}
                        className="bg-white rounded-[32px] p-5 shadow-sm border border-brand-brown/5 flex-row items-center"
                     >
                        <View className="w-20 h-20 rounded-[22px] overflow-hidden bg-brand-beige/30 items-center justify-center border border-brand-brown/5 shadow-inner">
                           <Image
                              source={{ uri: horse.imageUrl || horse.image ? getImageUrl(horse.imageUrl || horse.image) : "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800" }}
                              className="w-full h-full"
                           />
                           <View className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white" />
                        </View>

                        <View className="flex-1 ml-6">
                           <View className="flex-row justify-between items-center mb-1">
                              <Text className="text-brand-brown font-display-reg font-bold text-lg leading-tight tracking-tight">{horse.name}</Text>
                              <View className="bg-brand-orange/10 px-3 py-1.5 rounded-2xl">
                                 <Text className="text-[9px] font-display text-brand-orange uppercase tracking-widest leading-none">{horse.healthStatus?.status || 'Unfit'}</Text>
                              </View>
                           </View>
                           <View className="flex-row items-center">
                              <Text className="text-brand-brown/40 font-body text-[10px] uppercase tracking-[1.5px]">{horse.title || 'General Checkup'}</Text>
                              <View className="w-1 h-1 rounded-full bg-brand-brown/10 mx-2" />
                              <Text className="text-brand-brown/40 font-body text-[10px] uppercase tracking-[1.5px] flex-1" numberOfLines={1}>{horse.location}</Text>
                           </View>
                        </View>
                        <View className="w-10 h-10 rounded-2xl bg-brand-brown/5 items-center justify-center ml-3">
                           <ChevronRight color="#85431E" size={16} strokeWidth={3} />
                        </View>
                     </TouchableOpacity>
                  ))}
               </View>
            )}

            {/* Fleet Showcase - Horizontal Slider */}
            <View className="flex-row justify-between items-center mt-12 mb-8 px-1">
               <View className="flex-row items-center">
                  <Text className="text-2xl font-display text-brand-brown tracking-tight">Patient Showcase</Text>
               </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
               {horses.map((horse) => (
                  <TouchableOpacity
                     key={horse.id}
                     activeOpacity={0.9}
                     onPress={() => navigation.navigate("HorseDetail", { horse })}
                     className="bg-white rounded-[40px] p-4 mr-6 shadow-xl shadow-brand-brown/5 border border-brand-brown/5 w-60"
                  >
                     <View className="relative">
                        <Image
                           source={{ uri: horse.imageUrl || horse.image ? getImageUrl(horse.imageUrl || horse.image) : "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800" }}
                           className="w-full h-72 rounded-[32px] border-2 border-white/50"
                        />
                        <View className="absolute bottom-4 left-4 right-4 bg-white/95 p-5 rounded-[24px] shadow-sm">
                           <Text className="text-brand-brown font-display text-lg tracking-tight leading-tight">{horse.name}</Text>
                           <Text className="text-brand-orange text-[9px] font-display uppercase tracking-[2px] mt-1">{horse.location}</Text>
                        </View>
                     </View>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </ScrollView>
      </View>

   );
}
