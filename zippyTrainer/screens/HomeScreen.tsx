import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Bell, ChevronRight, Bookmark } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getSessionsByTrainerApi, getAllHorsesApi, getAllTrainersApi, getUserApi } from '../api/api';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [trainer, setTrainer] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [assignedHorses, setAssignedHorses] = useState<any[]>([]);
    const [stats, setStats] = useState({
       todaySessions: 0,
       totalSessions: 0,
       assignedHorsesCount: 0
    });

    useFocusEffect(
       React.useCallback(() => {
          fetchDashboardData();
       }, [])
    );

    const fetchDashboardData = async (isRefresh = false) => {
       if (isRefresh) setRefreshing(true);
       else setLoading(true);

       try {
          const userData = await AsyncStorage.getItem('user');
          let parsedUser = userData ? JSON.parse(userData) : null;
          if (parsedUser) {
             setUser(parsedUser);
          }

          // Fetch latest user details (for live notifications count, etc.)
          const userRes = await apiFunction(getUserApi, [], {}, "GET", true);
          if (userRes && userRes.success && userRes.user) {
             parsedUser = userRes.user;
             setUser(parsedUser);
             await AsyncStorage.setItem('user', JSON.stringify(userRes.user));
          }

          const currentUserId = parsedUser?.id;
          if (currentUserId) {
             const trainerRes = await apiFunction(getAllTrainersApi, [], {}, "GET", true);
             if (trainerRes && trainerRes.success) {
                const trainerVal = trainerRes.trainers.find((t: any) => (t.userId || t.user_id) === currentUserId);
                setTrainer(trainerVal);

                if (trainerVal) {
                   // Fetch Sessions
                   const sessionRes = await apiFunction(getSessionsByTrainerApi(trainerVal.id), [], {}, "GET", true);
                   if (sessionRes && sessionRes.success) {
                      const allSessions = (sessionRes.sessions || []).filter((s: any) => s.status !== 'BLOCKED');
                      
                      // Filter today's sessions
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const todayDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                      
                      const todaySessions = allSessions.filter((s: any) => {
                         if (s.date === 'daily') return true;
                         if (s.date === todayDateStr) return true;
                         return false;
                      });

                      setSessions(todaySessions.slice(0, 3));
                      setStats(prev => ({
                         ...prev,
                         todaySessions: todaySessions.length,
                         totalSessions: allSessions.length
                      }));
                   }

                   // Fetch Horses
                   const horseRes = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
                   if (horseRes && horseRes.success) {
                      const allHorses = horseRes.horses || [];
                      const filtered = allHorses.filter((h: any) => h.trainerId === trainerVal.id || h.trainerId === currentUserId);
                      setAssignedHorses(filtered);
                      setStats(prev => ({ ...prev, assignedHorsesCount: filtered.length }));
                   }
                }
             }
          }
       } catch (error) {
          console.error("Home Dashboard data fetch error:", error);
       } finally {
          setLoading(false);
          setRefreshing(false);
       }
    };

   if (loading) {
      return (
         <View className="flex-1 bg-[#F5EDDF] justify-center items-center">
            <ActivityIndicator size="large" color="#8C4A28" />
            <Text className="mt-4 text-[#8C4A28] font-bold">Synchronizing Dashboard...</Text>
         </View>
      );
   }



   return (
      <View className="flex-1 bg-brand-beige">
         <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboardData(true)} colors={["#85431E"]} />
            }
         >
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-8">
               <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white rounded-full overflow-hidden mr-4 border-[3px] border-white shadow-xl">
                     <Image
                        source={{ uri: user?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                        className="w-full h-full"
                     />
                  </View>
                  <View>
                     <Text className="text-2xl font-display text-brand-brown leading-tight">{user?.name?.split(' ')[0] || 'Trainer'}</Text>
                     <Text className="text-[10px] font-body text-brand-brown/50 uppercase tracking-[2px]">Trainer Dashboard</Text>
                  </View>
               </View>
               <TouchableOpacity
                  onPress={() => navigation.navigate("Notification")}
                  className="w-11 h-11 bg-white/50 border border-brand-brown/5 rounded-full items-center justify-center shadow-sm"
               >
                  <Bell color="#85431E" size={20} strokeWidth={2.5} />
                  {(() => {
                     const unreadCount = (user?.notifications || []).filter((n: any) => n.unread).length;
                     return unreadCount > 0 ? (
                        <View className="absolute -top-1 -right-1 bg-brand-orange rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center border border-white">
                           <Text className="text-white text-[9px] font-black">{unreadCount}</Text>
                        </View>
                     ) : null;
                  })()}
               </TouchableOpacity>
            </View>

            {/* Premium Summary Cards */}
            <View className="flex-row justify-between mb-10">
               <View className="flex-1 bg-brand-brown rounded-[24px] p-5 mr-2 shadow-lg">
                  <Text className="text-white/60 text-[8px] font-display uppercase tracking-[2px] mb-2">Today</Text>
                  <Text className="text-white text-3xl font-display mb-1">{stats.todaySessions}</Text>
                  <Text className="text-white/40 text-[9px] font-body uppercase tracking-wider">Sessions</Text>
               </View>
               <View className="flex-1 bg-white border border-brand-brown/5 rounded-[24px] p-5 mr-2 shadow-sm">
                  <Text className="text-brand-brown/40 text-[8px] font-display uppercase tracking-[2px] mb-2">Total</Text>
                  <Text className="text-brand-brown text-3xl font-display mb-1">{stats.totalSessions}</Text>
                  <Text className="text-brand-brown/40 text-[9px] font-body uppercase tracking-wider">Sessions</Text>
               </View>
               <View className="flex-1 bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-5 shadow-sm">
                  <Text className="text-brand-brown/40 text-[8px] font-display uppercase tracking-[2px] mb-2">Fleet</Text>
                  <Text className="text-brand-brown text-3xl font-display mb-1">{stats.assignedHorsesCount}</Text>
                  <Text className="text-brand-brown/40 text-[9px] font-body uppercase tracking-wider">Assigned</Text>
               </View>
            </View>

            {trainer?.title?.toLowerCase() === 'head trainer' && (
               <TouchableOpacity
                  onPress={() => navigation.navigate('SlotManagement' as never)}
                  className="bg-white border border-brand-orange/20 rounded-[24px] p-5 mb-8 shadow-sm flex-row justify-between items-center"
               >
                  <View className="flex-1 pr-4">
                     <Text className="text-brand-orange text-[9px] font-display uppercase tracking-[2px] mb-1">Administrative</Text>
                     <Text className="text-brand-brown text-lg font-display mb-1">Slot Management</Text>
                     <Text className="text-brand-brown/50 text-[11px] font-body leading-tight">
                        Configure sessions, manage seats, and approve rider requests.
                     </Text>
                  </View>
                  <View className="w-12 h-12 rounded-2xl bg-brand-orange/10 items-center justify-center">
                     <ChevronRight color="#DA7347" size={20} strokeWidth={3} />
                  </View>
               </TouchableOpacity>
            )}

            {/* Today's Schedule */}
            <View className="flex-row justify-between items-center mb-6">
               <Text className="text-xl font-display text-brand-brown tracking-tight">Today's Schedule</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
                  <Text className="text-brand-orange font-display text-xs uppercase tracking-widest">View All</Text>
               </TouchableOpacity>
            </View>

            <View className="mb-10">
               {sessions.length === 0 ? (
                  <View className="bg-white/50 rounded-3xl p-10 items-center justify-center border border-dashed border-brand-brown/20">
                     <Text className="text-brand-brown/40 font-body text-sm">No entries for today</Text>
                  </View>
               ) : sessions.map((session) => (
                  <TouchableOpacity
                     key={session.id}
                     className="bg-white rounded-[28px] flex-row items-center p-4 mb-4 shadow-sm border border-brand-brown/5"
                     onPress={() => navigation.navigate('SessionDetail', { session })}
                  >
                     <View className="bg-brand-beige p-3 rounded-2xl items-center justify-center min-w-[70px] h-[70px] mr-5">
                        <Text className="text-brand-brown font-display text-[14px] leading-tight text-center">{session.timing?.split(' ')[0] || '08:00'}</Text>
                        <Text className="text-brand-brown/40 font-display text-[9px] uppercase tracking-widest">{session.timing?.split(' ')[1] || 'AM'}</Text>
                     </View>
                     <View className="flex-1">
                        <Text className="text-brand-brown font-display-reg font-bold text-[16px] mb-1">{session.title}</Text>
                        <View className="flex-row items-center">
                           <Bookmark size={10} color="#DA7347" className="mr-1" />
                           <Text className="text-brand-brown/40 font-body text-xs tracking-tight">
                              {session.location} • {session.participants?.length || 0} Riders
                           </Text>
                        </View>
                     </View>
                     <View className="w-8 h-8 rounded-full bg-brand-brown/5 items-center justify-center ml-2">
                        <ChevronRight color="#85431E" size={16} strokeWidth={3} />
                     </View>
                  </TouchableOpacity>
               ))}
            </View>

            {/* Assigned Horses */}
            <View className="flex-row justify-between items-center mb-6">
               <Text className="text-xl font-display text-brand-brown tracking-tight">Assigned Roster</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Horses')}>
                  <Text className="text-brand-orange font-display text-xs uppercase tracking-widest">Manage Fleet</Text>
               </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
               {assignedHorses.length === 0 ? (
                  <View className="bg-white/50 rounded-3xl p-8 w-72 items-center justify-center border border-dashed border-brand-brown/20">
                     <Text className="text-brand-brown/40 font-body text-sm">Stable roster empty</Text>
                  </View>
               ) : assignedHorses.map((horse) => (
                  <TouchableOpacity
                     key={horse.id}
                     onPress={() => navigation.navigate("HorseDetail", { horse })}
                     className="bg-white rounded-[32px] p-4 mr-5 shadow-sm border border-brand-brown/5 w-44"
                  >
                     <Image
                        source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=300&auto=format&fit=crop' }}
                        className="w-full h-40 rounded-[24px] mb-4"
                     />
                     <View className="px-1">
                        <Text className="text-brand-brown font-display-reg font-bold text-[15px] mb-1 leading-tight">{horse.name}</Text>
                        <Text className="text-brand-orange text-[9px] font-display uppercase tracking-widest">{horse.title || 'Fit for service'}</Text>
                     </View>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </ScrollView>
      </View>

   );
}
