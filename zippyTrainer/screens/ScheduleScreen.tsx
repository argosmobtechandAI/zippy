import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessionsByTrainerApi, getAllHorsesApi, createSessionApi } from '../api/api';
import { apiFunction } from '../api/apiFunction';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Menu, Bell, MapPin, CheckCircle2, XCircle, Clock, ChevronRight, Calendar as CalendarIcon, MoreVertical, Loader, X } from 'lucide-react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleScreen() {

   // Generate next 7 days dynamically
   const generateNext7Days = () => {
      const days = [];
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      for (let i = 0; i < 7; i++) {
         const date = new Date();
         date.setDate(date.getDate() + i);

         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
         const localDateString = `${year}-${month}-${day}`;

         days.push({
            day: dayNames[date.getDay()],
            dateNumber: String(date.getDate()).padStart(2, '0'),
            fullDate: localDateString
         });
      }
      return days;
   };

   const upcomingDays = generateNext7Days();
   const [selectedDate, setSelectedDate] = useState(upcomingDays[0].fullDate);
   const [sessions, setSessions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);
   const [assignedHorses, setAssignedHorses] = useState([]);
   const [currentUser, setCurrentUser] = useState<any>(null);
   const [showStartTimePicker, setShowStartTimePicker] = useState(false);
   const [showEndTimePicker, setShowEndTimePicker] = useState(false);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const navigation = useNavigation();

   const formatTimeTo24h = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
   };

   const formatTimeTo12h = (time24: string) => {
      if (!time24) return '';
      const [hoursStr, minutesStr] = time24.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${formattedHours}:${minutes} ${ampm}`;
   };

   const getSafeTimeDateObj = (time24: string) => {
      const d = new Date();
      if (!time24) return d;
      const [h, m] = time24.split(':').map(Number);
      d.setHours(h);
      d.setMinutes(m);
      return d;
   };

   useFocusEffect(
      React.useCallback(() => {
         fetchSessions();
      }, [])
   );

   const fetchSessions = async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
         const userData = await AsyncStorage.getItem('user');
         if (userData) {
            const parsedUser = JSON.parse(userData);
            setCurrentUser(parsedUser);

            const userId = parsedUser.id;
            const trainerId = parsedUser.trainerId;

            if (userId) {
               const res = await apiFunction(getSessionsByTrainerApi(trainerId || userId), [], {}, "GET", true);

               if (res && res.success) {
                  const horseRes = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
                  setAssignedHorses(horseRes.horses)
                  let sess = []
                  res.sessions.map((item: any) => {
                     let targetHorseId = null;
                     let horseIdVal = item.horseId;
                     if (typeof horseIdVal === 'string' && horseIdVal.trim().startsWith('[')) {
                        try {
                           horseIdVal = JSON.parse(horseIdVal);
                        } catch (e) {}
                     }
                     if (horseIdVal) {
                        if (Array.isArray(horseIdVal)) {
                           targetHorseId = horseIdVal.find((id: any) => typeof id === 'string' && id.trim().length === 36);
                        } else if (typeof horseIdVal === 'string' && horseIdVal.trim().length === 36) {
                           targetHorseId = horseIdVal.trim();
                        }
                     }
                     if (!targetHorseId && item.horse) {
                        if (typeof item.horse === 'object' && item.horse.id) {
                           targetHorseId = item.horse.id;
                        } else if (typeof item.horse === 'string' && item.horse.trim().length === 36) {
                           targetHorseId = item.horse.trim();
                        }
                     }
                     const filtered = (horseRes.horses || []).filter((h: any) => h.id === targetHorseId);
                     sess = [...sess, { ...item, horse: filtered[0] }]
                  })
                  console.log(sess, "sess")
                  setSessions(sess)
               }
            }
         }
      } catch (e) {
         console.error("Failed to fetch trainer sessions", e);
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   console.log(sessions, "sessions")

   const [newSession, setNewSession] = useState({
      title: '',
      date: selectedDate,
      timing: '',
      location: '',
      totalSeats: '10',
      duration: '1 hr',
      horseId: '',
      note: ''
   });

   const openAddModal = () => {
      setNewSession({
         title: '',
         date: selectedDate,
         startTime: '09:00',
         endTime: '10:30',
         location: '',
         totalSeats: '10',
         duration: '1.5 hr',
         horseId: '',
         note: ''
      });
      setShowAddModal(true);
   };

   const handleCreateSession = async () => {
      try {
         const userData = await AsyncStorage.getItem('user');
         if (!userData) return;
         const user = JSON.parse(userData);

         if (!newSession.title || !newSession.horseId) {
            Alert.alert("Missing Info", "Please provide at least a title and assign a horse.");
            return;
         }

         const startStr = newSession.startTime;
         const endStr = newSession.endTime;
         const [startH, startM] = startStr.split(':').map(Number);
         const [endH, endM] = endStr.split(':').map(Number);
         let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
         if (durationMins < 0) durationMins += 24 * 60;
         const duration = `${durationMins} Min`;
         const timing = `${startStr} - ${endStr}`;

         const payload = {
            title: newSession.title,
            timing,
            duration,
            date: newSession.date,
            location: newSession.location,
            totalSeats: parseInt(newSession.totalSeats) || 10,
            total_seats: parseInt(newSession.totalSeats) || 10,
            trainerId: user.trainerId || null,
            trainers: user.trainerId || null,
            horseId: [newSession.horseId],
            horse_id: [newSession.horseId],
            horse: newSession.horseId || null,
            note: newSession.note,
            status: "ACTIVE",
            joiningAmount: 0,
            joining_amount: 0
         };

         const res = await apiFunction(createSessionApi, [], payload, "POST", true);
         if (res && res.success) {
            Alert.alert("Success", "Session created successfully!");
            setShowAddModal(false);
            fetchSessions();
         } else {
            Alert.alert("Error", res?.message || "Failed to create session");
         }
      } catch (e) {
         Alert.alert("Error", "Network error while creating session");
      }
   };

   // Filter sessions by the currently selected fullDate (compare only YYYY-MM-DD) and exclude blocked ones
   const filteredSessions = sessions.filter(s => {
      if (!s.date || s.status === 'BLOCKED') return false;
      const sessionDate = s.date.includes('T') ? s.date.split('T')[0] : s.date;
      return sessionDate === selectedDate || sessionDate == "daily";
   });

   // Formatter for nicer date display - prevent UTC shifting
   const formatDateFriendly = (dateString) => {
      if(dateString === "daily") return "Daily";
      if (!dateString) return 'Today';
      const [year, month, day] = dateString.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
   };

   return (
      <View className="flex-1 bg-[#F5EDDF]">
         {/* Header */}
         <View className="flex-row justify-between items-center px-4 py-4 mb-2">
            <Text className="text-lg font-bold text-[#1a202c]">Schedule</Text>
            <TouchableOpacity
               onPress={openAddModal}
               className="w-10 h-10 bg-[#8C4A28] rounded-full items-center justify-center shadow-sm"
            >
               <Plus color="white" size={20} />
            </TouchableOpacity>
         </View>

         <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl refreshing={refreshing} onRefresh={() => fetchSessions(true)} colors={["#8C4A28"]} />
            }
         >



            <View>
               {/* Calendar / Date Selector */}
               <View className="flex-row justify-between items-center mb-6">
                  <View>
                     <Text className="text-2xl font-bold text-[#1a202c] mb-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                     <Text className="text-[#64748b] text-sm">{filteredSessions.length} Sessions Scheduled</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate("Pending", { sessions: sessions })} className="bg-white p-2 rounded-xl flex flex-row gap-2 items-center border border-[#e2e8f0]">
                     <Loader color="#8C4A28" size={20} />
                     <Text className="text-[#8C4A28] text-xs font-semibold">Pending Requests</Text>
                  </TouchableOpacity>
               </View>

               {/* Horizontal Day Selector */}
               <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                  {upcomingDays.map((item, index) => (
                     <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedDate(item.fullDate)}
                        className={`rounded-2xl p-4 items-center mr-3 min-w-[70px] ${selectedDate === item.fullDate
                           ? 'bg-[#8C4A28]'
                           : 'bg-white border border-[#e2e8f0]'
                           }`}
                     >
                        <Text className={`text-[10px] font-bold mb-2 ${selectedDate === item.fullDate ? 'text-white opacity-80' : 'text-[#94a3b8]'
                           }`}>
                           {item.day}
                        </Text>
                        <Text className={`font-bold text-xl ${selectedDate === item.fullDate ? 'text-white' : 'text-[#1a202c]'
                           }`}>
                           {item.dateNumber}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>

               {/* Sessions List */}
               <View className="mb-6">
                  <Text className="text-lg font-bold text-[#1a202c] mb-4">
                     Selected Date Sessions
                  </Text>

                  {filteredSessions.length === 0 && (
                     <Text className="text-center text-[#94a3b8] mt-4">No sessions scheduled.</Text>
                  )}
                  {filteredSessions.map((session, idx) => (
                     <TouchableOpacity
                        key={session.id || idx}
                        onPress={() => navigation.navigate("SessionDetail", { session })}
                        activeOpacity={0.7}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4 flex-row"
                     >
                        {/* Time column */}
                        <View className="items-center mr-4 w-12 pt-2">
                           <Text className="text-[#1a202c] font-bold text-base">{session.timing?.split('-')[0] || '12:00 PM'}</Text>
                        </View>

                        {/* Content */}
                        <View className="flex-1 bg-[#F5EDDF] rounded-2xl p-3 border border-[#e6d0b3]">
                           <View className="flex-row justify-between mb-2">
                              <Text className="bg-white px-2 py-1 rounded-md text-[#8C4A28] text-[10px] font-bold">{session.title || 'Session'}</Text>
                              <TouchableOpacity>
                                 <MoreVertical color="#8C4A28" size={16} />
                              </TouchableOpacity>
                           </View>
                           <Text className="text-[#1a202c] font-bold text-lg mb-1">{formatDateFriendly(session.date)}</Text>
                           <View className="flex-row items-center mb-3">
                              <Clock color="#8C4A28" size={12} className="mr-1" />
                              <Text className="text-[#8C4A28] text-xs font-semibold mr-3">{session.duration || '1 hr'}</Text>
                              <MapPin color="#8C4A28" size={12} className="mr-1" />
                              <Text className="text-[#8C4A28] text-xs font-semibold">{session.location || 'Arena'}</Text>
                           </View>
                           <View className="flex-row items-center bg-white p-2 rounded-xl">
                              <Image
                                 source={{ uri: session?.horse?.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                                 className="w-8 h-8 rounded-lg mr-2"
                              />
                              <View>
                                 <Text className="text-[#1a202c] font-bold text-xs">
                                    {session?.horse?.name || 'Unassigned'}
                                 </Text>
                              </View>
                           </View>
                        </View>
                     </TouchableOpacity>
                  ))}

               </View>
            </View>

         </ScrollView>

         {/* Add Session Modal */}
         <Modal visible={showAddModal} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/60 justify-end">
               <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="bg-[#F5EDDF] rounded-t-[3rem] p-6 max-h-[90%]">
                  <View className="flex-row justify-between items-center mb-6">
                     <View>
                        <Text className="text-2xl font-bold text-[#1a202c]">New Session</Text>
                        <Text className="text-xs font-semibold text-[#64748b]">Schedule a new training slot</Text>
                     </View>
                     <TouchableOpacity onPress={() => setShowAddModal(false)} className="bg-white p-2 rounded-full border border-[#e2e8f0]">
                        <X color="#1a202c" size={24} />
                     </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                     <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Session Title</Text>
                     <View className="bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] mb-4 shadow-sm">
                        <TextInput
                           placeholder="e.g. Morning Dressage"
                           className="py-3 text-[#1a202c] font-semibold"
                           value={newSession.title}
                           onChangeText={(t) => setNewSession(prev => ({ ...prev, title: t }))}
                        />
                     </View>

                     <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Session Date</Text>
                     <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="bg-white rounded-2xl px-4 py-4 border border-[#e2e8f0] mb-4 shadow-sm flex-row justify-between items-center"
                     >
                        <Text className="text-[#1a202c] font-bold text-sm">
                           {newSession.date || selectedDate}
                        </Text>
                        <CalendarIcon color="#8C4A28" size={16} />
                     </TouchableOpacity>

                     {showDatePicker && (
                        <RNDateTimePicker
                           value={newSession.date ? new Date(newSession.date) : new Date()}
                           mode="date"
                           display="default"
                           onChange={(event, selectedDateObj) => {
                              setShowDatePicker(false);
                              if (selectedDateObj) {
                                 const formatted = selectedDateObj.toISOString().split('T')[0];
                                 setNewSession(prev => ({ ...prev, date: formatted }));
                              }
                           }}
                        />
                     )}

                      <View className="flex-row justify-between mb-4">
                         <View className="flex-1 mr-2">
                            <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Start Time</Text>
                            <TouchableOpacity
                               onPress={() => setShowStartTimePicker(true)}
                               className="bg-white rounded-2xl px-4 py-4 border border-[#e2e8f0] shadow-sm flex-row justify-between items-center"
                            >
                               <Text className="text-[#1a202c] font-bold text-sm">
                                  {formatTimeTo12h(newSession.startTime) || '09:00 AM'}
                               </Text>
                               <Clock color="#8C4A28" size={16} />
                            </TouchableOpacity>
                         </View>
                         <View className="flex-1 mx-1">
                            <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">End Time</Text>
                            <TouchableOpacity
                               onPress={() => setShowEndTimePicker(true)}
                               className="bg-white rounded-2xl px-4 py-4 border border-[#e2e8f0] shadow-sm flex-row justify-between items-center"
                            >
                               <Text className="text-[#1a202c] font-bold text-sm">
                                  {formatTimeTo12h(newSession.endTime) || '10:30 AM'}
                               </Text>
                               <Clock color="#8C4A28" size={16} />
                            </TouchableOpacity>
                         </View>
                         <View className="w-16 ml-2">
                            <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Seats</Text>
                            <View className="bg-white rounded-2xl px-3 py-1 border border-[#e2e8f0] shadow-sm">
                               <TextInput
                                  placeholder="10"
                                  keyboardType="numeric"
                                  className="py-3 text-[#1a202c] font-bold text-center text-sm"
                                  value={newSession.totalSeats}
                                  onChangeText={(t) => setNewSession(prev => ({ ...prev, totalSeats: t }))}
                               />
                            </View>
                         </View>
                      </View>

                      {showStartTimePicker && (
                         <RNDateTimePicker
                            value={getSafeTimeDateObj(newSession.startTime)}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                               setShowStartTimePicker(false);
                               if (selectedTime) {
                                  setNewSession(prev => ({ ...prev, startTime: formatTimeTo24h(selectedTime) }));
                                }
                            }}
                         />
                      )}

                      {showEndTimePicker && (
                         <RNDateTimePicker
                            value={getSafeTimeDateObj(newSession.endTime)}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                               setShowEndTimePicker(false);
                               if (selectedTime) {
                                  setNewSession(prev => ({ ...prev, endTime: formatTimeTo24h(selectedTime) }));
                               }
                            }}
                         />
                      )}

                     <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Location</Text>
                     <View className="bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] mb-4 shadow-sm">
                        <TextInput
                           placeholder="Main Arena / Paddock B"
                           className="py-3 text-[#1a202c] font-semibold"
                           value={newSession.location}
                           onChangeText={(t) => setNewSession(prev => ({ ...prev, location: t }))}
                        />
                     </View>

                     <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Assign Horse</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                         {(assignedHorses || [])
                           .filter((h: any) => h.trainerId === currentUser?.id)
                           .map((horse: any) => {
                              const isSelected = newSession.horseId === horse.id;
                              return (
                                 <TouchableOpacity
                                    key={horse.id}
                                    onPress={() => setNewSession(prev => ({ ...prev, horseId: horse.id }))}
                                    className={`mr-3 p-2 rounded-2xl border ${
                                       isSelected ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2e8f0]'
                                    } items-center w-24`}
                                 >
                                    <Image
                                       source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                                       className="w-16 h-16 rounded-xl mb-2"
                                    />
                                    <Text
                                       className={`text-[10px] font-bold text-center ${
                                          isSelected ? 'text-white' : 'text-[#1a202c]'
                                       }`}
                                       numberOfLines={1}
                                    >
                                       {horse.name}
                                    </Text>
                                 </TouchableOpacity>
                              );
                           })}
                         {(assignedHorses || []).filter((h: any) => h.trainerId === currentUser?.id).length === 0 && (
                            <Text className="text-gray-400 font-bold italic py-4">No horses assigned to you</Text>
                         )}
                      </ScrollView>

                     <Text className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Training Notes</Text>
                     <View className="bg-white rounded-2xl px-4 py-3 border border-[#e2e8f0] mb-6 shadow-sm">
                        <TextInput
                           placeholder="Focus on..."
                           multiline
                           numberOfLines={3}
                           className="text-[#1a202c] font-semibold text-sm"
                           value={newSession.note}
                           onChangeText={(t) => setNewSession(prev => ({ ...prev, note: t }))}
                        />
                     </View>

                     <TouchableOpacity
                        onPress={handleCreateSession}
                        className="bg-[#8C4A28] py-4 rounded-2xl items-center shadow-lg shadow-[#8C4A28]/40 mb-10"
                     >
                        <Text className="text-white font-bold text-base">Generate Session</Text>
                     </TouchableOpacity>
                  </ScrollView>
               </KeyboardAvoidingView>
            </View>
         </Modal>
      </View>
   );
}
