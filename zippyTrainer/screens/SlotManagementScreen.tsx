import React, { useState, useEffect, useCallback } from 'react';
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   TextInput,
   ActivityIndicator,
   RefreshControl,
   Alert,
   StyleSheet
} from 'react-native';
import {
   ArrowLeft,
   Plus,
   Trash2,
   Ban,
   Edit,
   CheckCircle2,
   X,
   Clock,
   Calendar,
   Users,
   ChevronRight,
   Bookmark,
   ShieldAlert,
   Check,
   ChevronDown
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import {
   getAllUsersApi,
   getAllTrainersApi,
   getAllSessionsApi,
   getAllHorsesApi,
   getAllBatchesApi,
   createBatchApi,
   updateBatchApi,
   deleteBatchApi,
   createSessionApi,
   deleteSessionApi,
   updateTrainerApi,
   getAllStablesApi
} from '../api/api';

export default function SlotManagementScreen() {
   const navigation = useNavigation();
   const [activeTab, setActiveTab] = useState<'slots' | 'trainers'>('slots');
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);

   // Core Data States
   const [currentUser, setCurrentUser] = useState<any>(null);
   const [currentTrainer, setCurrentTrainer] = useState<any>(null);
   const [currentStable, setCurrentStable] = useState<any>(null);

   const [batches, setBatches] = useState<any[]>([]);
   const [sessions, setSessions] = useState<any[]>([]);
   const [trainers, setTrainers] = useState<any[]>([]);
   const [trainerUsers, setTrainerUsers] = useState<any[]>([]);
   const [horses, setHorses] = useState<any[]>([]);
   const [stables, setStables] = useState<any[]>([]);

   // Selected Batch View State
   const [selectedBatch, setSelectedBatch] = useState<any>(null);

   // Modal/Form States
   const [showBatchModal, setShowBatchModal] = useState(false);
   const [batchToEdit, setBatchToEdit] = useState<any>(null);
   const [batchForm, setBatchForm] = useState({
      title: '',
      startTime: '09:00',
      endTime: '10:30',
      isDaily: true,
      date: '',
      joiningAmount: '100',
   });

   const [showSlotModal, setShowSlotModal] = useState(false);
   const [slotToEdit, setSlotToEdit] = useState<any>(null);
   const [slotForm, setSlotForm] = useState<{
      totalSeats: string;
      trainerId: string;
      horseId: string[];
   }>({
      totalSeats: '10',
      trainerId: '',
      horseId: [],
   });

   const [showTrainerModal, setShowTrainerModal] = useState(false);
   const [editingTrainerUser, setEditingTrainerUser] = useState<any>(null);
   const [editingTrainerRecord, setEditingTrainerRecord] = useState<any>(null);
   const [selectedTrainerStable, setSelectedTrainerStable] = useState('');

   useEffect(() => {
      loadInitialData();
   }, []);

   const loadInitialData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
   };

   const fetchData = async () => {
      try {
         const userData = await AsyncStorage.getItem('user');
         if (!userData) return;
         const parsedUser = JSON.parse(userData);
         setCurrentUser(parsedUser);

         // Fetch all raw resources
         const [
            stablesRes,
            batchesRes,
            sessionsRes,
            trainersRes,
            usersRes,
            horsesRes
         ] = await Promise.all([
            apiFunction(getAllStablesApi, [], {}, 'GET', true),
            apiFunction(getAllBatchesApi, [], {}, 'GET', true),
            apiFunction(getAllSessionsApi, [], {}, 'GET', true),
            apiFunction(getAllTrainersApi, [], {}, 'GET', true),
            apiFunction(getAllUsersApi, [], {}, 'GET', true),
            apiFunction(getAllHorsesApi, [], {}, 'GET', true)
         ]);

         let loggedInTrainer: any = null;
         let activeStable: any = null;

         // Get current trainer profile
         if (trainersRes?.success) {
            loggedInTrainer = trainersRes.trainers.find((t: any) => t.userId === parsedUser.id);
            setCurrentTrainer(loggedInTrainer);
         }

         // Get current stable details
         if (stablesRes?.success) {
            setStables(stablesRes.stables || []);
            if (loggedInTrainer) {
               activeStable = stablesRes.stables.find((s: any) => s.id === loggedInTrainer.stableId);
               setCurrentStable(activeStable);
            }
         }

         // Filter batches and sessions for the current stable
         if (batchesRes?.success && activeStable) {
            const filteredBatches = (batchesRes.batch || []).filter(
               (b: any) => b.location === activeStable.name
            );
            setBatches(filteredBatches);
         }

         if (sessionsRes?.success) {
            setSessions(sessionsRes.sessions || []);
         }

         // Filter trainers in the same stable
         if (trainersRes?.success && loggedInTrainer) {
            const sameStableTrainers = trainersRes.trainers.filter(
               (t: any) => t.stableId === loggedInTrainer.stableId
            );
            setTrainers(sameStableTrainers);

            if (usersRes?.success) {
               const filteredTrainerUsers = (usersRes.users || []).filter(
                  (u: any) => u.type === 'trainer'
               );
               setTrainerUsers(filteredTrainerUsers);
            }
         }

         // Filter horses in the same stable
         if (horsesRes?.success && loggedInTrainer) {
            const filteredHorses = (horsesRes.horses || []).filter(
               (h: any) => h.stableId === loggedInTrainer.stableId
            );
            setHorses(filteredHorses);
         }

      } catch (error) {
         console.error('Error fetching slot management dashboard data:', error);
         Alert.alert('Error', 'Failed to synchronize stable database.');
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchData();
      setRefreshing(false);
   };

   // --- BATCH CRUD ACTIONS ---
   const openBatchModal = (batch: any = null) => {
      if (batch) {
         setBatchToEdit(batch);
         const [start, end] = (batch.timing || '09:00 - 10:30').split('-').map((s: string) => s.trim());
         setBatchForm({
            title: batch.title,
            startTime: start || '09:00',
            endTime: end || '10:30',
            isDaily: batch.date === 'daily',
            date: batch.date === 'daily' ? '' : batch.date,
            joiningAmount: String(batch.joiningAmount || 100),
         });
      } else {
         setBatchToEdit(null);
         setBatchForm({
            title: '',
            startTime: '09:00',
            endTime: '10:30',
            isDaily: true,
            date: '',
            joiningAmount: '100',
         });
      }
      setShowBatchModal(true);
   };

   const handleSaveBatch = async () => {
      if (!batchForm.title.trim()) {
         Alert.alert('Validation Error', 'Batch title is required.');
         return;
      }

      // Calculate duration & timing string
      const startStr = batchForm.startTime.trim();
      const endStr = batchForm.endTime.trim();
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);
      if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
         Alert.alert('Validation Error', 'Please enter valid HH:MM times.');
         return;
      }

      let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (durationMins < 0) durationMins += 24 * 60;
      const duration = `${durationMins} Min`;
      const timing = `${startStr} - ${endStr}`;

      const finalData = {
         title: batchForm.title,
         timing,
         duration,
         date: batchForm.isDaily ? 'daily' : batchForm.date || new Date().toISOString().split('T')[0],
         joiningAmount: parseInt(batchForm.joiningAmount) || 100,
         location: currentStable?.name || '',
         status: batchToEdit?.status || 'ACTIVE',
      };

      try {
         let res;
         if (batchToEdit) {
            res = await apiFunction(updateBatchApi, [batchToEdit.id], finalData, 'PUT', true);
         } else {
            res = await apiFunction(createBatchApi, [], finalData, 'POST', true);
         }

         if (res?.success) {
            Alert.alert('Success', `Batch ${batchToEdit ? 'updated' : 'created'} successfully!`);
            setShowBatchModal(false);
            fetchData();
         } else {
            Alert.alert('Error', res?.message || 'Failed to save batch details.');
         }
      } catch (e) {
         Alert.alert('Error', 'Network request failed.');
      }
   };

   const handleDeleteBatch = (id: string) => {
      Alert.alert(
         'Confirm Deletion',
         'Are you sure you want to delete this batch? All associated slots will be orphaned.',
         [
            { text: 'Cancel', style: 'cancel' },
            {
               text: 'Delete',
               style: 'destructive',
               onPress: async () => {
                  const res = await apiFunction(deleteBatchApi, [id], {}, 'DELETE', true);
                  if (res?.success) {
                     Alert.alert('Success', 'Batch deleted successfully.');
                     if (selectedBatch?.id === id) {
                        setSelectedBatch(null);
                     }
                     fetchData();
                  } else {
                     Alert.alert('Error', 'Failed to delete batch.');
                  }
               }
            }
         ]
      );
   };

   // --- SLOTS CRUD ACTIONS ---
   const openSlotModal = (slot: any = null) => {
      if (slot) {
         setSlotToEdit(slot);
         setSlotForm({
            totalSeats: String(slot.totalSeats || 10),
            trainerId: slot.trainerId || '',
            horseId: slot.horseId || [],
         });
      } else {
         setSlotToEdit(null);
         setSlotForm({
            totalSeats: '10',
            trainerId: '',
            horseId: [],
         });
      }
      setShowSlotModal(true);
   };

   const handleSaveSlot = async () => {
      const seats = parseInt(slotForm.totalSeats) || 10;
      const batchSlotsCount = sessions.filter(s => s.batchsId === selectedBatch.id).length;
      const title = slotToEdit ? slotToEdit.title : `Slot ${batchSlotsCount + 1}`;

      const finalData = {
         title,
         timing: selectedBatch.timing,
         date: selectedBatch.date,
         joiningAmount: selectedBatch.joiningAmount,
         duration: selectedBatch.duration,
         location: selectedBatch.location,
         batchsId: selectedBatch.id,
         totalSeats: seats,
         trainerId: slotForm.trainerId || null,
         horseId: slotForm.horseId,
      };

      try {
         let res;
         if (slotToEdit) {
            res = await apiFunction(updateSessionApi, [slotToEdit.id], finalData, 'PUT', true);
         } else {
            res = await apiFunction(createSessionApi, [], finalData, 'POST', true);
         }

         if (res?.success) {
            Alert.alert('Success', `Slot ${slotToEdit ? 'updated' : 'created'} successfully!`);
            setShowSlotModal(false);
            fetchData();
         } else {
            Alert.alert('Error', res?.message || 'Failed to save slot configurations.');
         }
      } catch (e) {
         Alert.alert('Error', 'Network connection issue.');
      }
   };

   const handleDeleteSlot = (id: string) => {
      Alert.alert(
         'Confirm Delete Slot',
         'Are you sure you want to delete this slot permanently?',
         [
            { text: 'Cancel', style: 'cancel' },
            {
               text: 'Delete',
               style: 'destructive',
               onPress: async () => {
                  const res = await apiFunction(deleteSessionApi, [id], {}, 'DELETE', true);
                  if (res?.success) {
                     Alert.alert('Success', 'Slot deleted.');
                     fetchData();
                  } else {
                     Alert.alert('Error', 'Failed to delete slot.');
                  }
               }
            }
         ]
      );
   };

   const handleBlockSlot = async (slot: any) => {
      const newStatus = slot.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      const res = await apiFunction(updateSessionApi, [slot.id], { status: newStatus }, 'PUT', true);
      if (res?.success) {
         Alert.alert('Success', `Slot has been ${newStatus === 'BLOCKED' ? 'Blocked' : 'Unblocked'}.`);
         fetchData();
      } else {
         Alert.alert('Error', 'Failed to update slot status.');
      }
   };

   const handleBookingStatus = async (sessionId: string, riderId: string, newStatus: 'CONFIRMED' | 'REJECTED') => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      let updatedParticipants;
      if (newStatus === 'REJECTED') {
         updatedParticipants = (session.participants || []).filter((p: any) => p.riderId !== riderId);
      } else {
         updatedParticipants = (session.participants || []).map((p: any) =>
            p.riderId === riderId ? { ...p, status: newStatus } : p
         );
      }

      try {
         const res = await apiFunction(updateSessionApi, [sessionId], { participants: updatedParticipants }, 'PUT', true);
         if (res?.success) {
            Alert.alert('Success', newStatus === 'REJECTED' ? 'Booking rejected.' : 'Booking approved.');
            fetchData();
         } else {
            Alert.alert('Error', res?.message || 'Update failed.');
         }
      } catch (error) {
         Alert.alert('Error', 'Unable to complete action.');
      }
   };

   const toggleHorseSelection = (horseId: string) => {
      setSlotForm(prev => {
         const exists = prev.horseId.includes(horseId);
         const updated = exists
            ? prev.horseId.filter(id => id !== horseId)
            : [...prev.horseId, horseId];
         return { ...prev, horseId: updated };
      });
   };

   // --- TRAINERS CRUD ACTIONS ---
   const openTrainerModal = (user: any, trainerRecord: any) => {
      setEditingTrainerUser(user);
      setEditingTrainerRecord(trainerRecord);
      setSelectedTrainerStable(trainerRecord?.stableId || '');
      setShowTrainerModal(true);
   };

   const handleSaveTrainerStable = async () => {
      if (!selectedTrainerStable) {
         Alert.alert('Validation Error', 'Please select a stable.');
         return;
      }

      try {
         const res = await apiFunction(updateTrainerApi, [editingTrainerRecord?.id], {
            stableId: selectedTrainerStable,
         }, 'PUT', true);

         if (res?.success) {
            Alert.alert('Success', 'Trainer stable updated successfully.');
            setShowTrainerModal(false);
            fetchData();
         } else {
            Alert.alert('Error', 'Failed to update trainer stable.');
         }
      } catch (e) {
         Alert.alert('Error', 'Network request failed.');
      }
   };

   const getTrainerName = (userId: string) => {
     
      const user = trainerUsers.find(u => u.id === userId);
      return user ? user.name : 'Unknown';
   };

   
   if (loading) {
      return (
         <View className="flex-1 bg-brand-beige justify-center items-center">
            <ActivityIndicator size="large" color="#85431E" />
            <Text className="mt-4 text-brand-brown font-display-reg">Syncing Stable Registry...</Text>
         </View>
      );
   }

   // Filter sessions for selected batch
   const batchSlots = selectedBatch
      ? sessions.filter(s => s.batchsId === selectedBatch.id).sort((a, b) => a.title.localeCompare(b.title))
      : [];

   const pendingParticipants = selectedBatch
      ? batchSlots.flatMap(s =>
           (s.participants || [])
              .filter((p: any) => p.status?.toLowerCase() === 'pending')
              .map((p: any) => ({ ...p, session: s }))
        )
      : [];

   return (
      <View className="flex-1 bg-brand-beige">
         {/* HEADER */}
         <View className="bg-white px-6 pt-12 pb-6 border-b border-brand-brown/10 shadow-sm flex-row items-center justify-between">
            <TouchableOpacity onPress={() => selectedBatch ? setSelectedBatch(null) : navigation.goBack()} className="p-2 -ml-2">
               <ArrowLeft color="#85431E" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="items-center">
               <Text className="text-brand-brown font-display text-lg">Head Trainer</Text>
               <Text className="text-brand-orange font-body text-xs uppercase tracking-widest">{ currentUser.name || 'Loading Trainer...'}</Text>
            </View>
            <View className="w-10" />
         </View>

         {/* TABS (Only visible if not drilling into a batch) */}
         {!selectedBatch && (
            <View className="flex-row bg-white border-b border-brand-brown/10">
               <TouchableOpacity
                  onPress={() => setActiveTab('slots')}
                  className={`flex-1 py-4 items-center border-b-[3px] ${
                     activeTab === 'slots' ? 'border-brand-brown' : 'border-transparent'
                  }`}
               >
                  <Text className={`font-display-reg text-sm ${activeTab === 'slots' ? 'text-brand-brown font-bold' : 'text-brand-brown/40'}`}>
                     Batches & Slots
                  </Text>
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={() => setActiveTab('trainers')}
                  className={`flex-1 py-4 items-center border-b-[3px] ${
                     activeTab === 'trainers' ? 'border-brand-brown' : 'border-transparent'
                  }`}
               >
                  <Text className={`font-display-reg text-sm ${activeTab === 'trainers' ? 'text-brand-brown font-bold' : 'text-brand-brown/40'}`}>
                     Trainers Directory
                  </Text>
               </TouchableOpacity>
            </View>
         )}

         {/* MAIN CONTENT AREA */}
         <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            refreshControl={
               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#85431E']} />
            }
         >
            {/* VIEW 1: BATCHES LIST */}
            {!selectedBatch && activeTab === 'slots' && (
               <View>
                  <View className="flex-row justify-between items-center mb-6">
                     <View>
                        <Text className="text-xl font-display text-brand-brown leading-tight">Batch Directory</Text>
                        <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Manage schedules and slots.</Text>
                     </View>
                     <TouchableOpacity
                        onPress={() => openBatchModal()}
                        className="bg-brand-brown px-4 py-2.5 rounded-full flex-row items-center shadow-md"
                     >
                        <Plus color="#FFFFFF" size={16} strokeWidth={3} className="mr-1" />
                        <Text className="text-white font-display-reg text-xs uppercase tracking-wider">Add Batch</Text>
                     </TouchableOpacity>
                  </View>

                  {batches.length === 0 ? (
                     <View className="bg-white/40 border border-dashed border-brand-brown/20 rounded-3xl p-10 items-center justify-center">
                        <Text className="text-brand-brown/40 font-body text-center">No batches configured for this stable. Create one to begin.</Text>
                     </View>
                  ) : (
                     batches.map(batch => {
                        const slotsCount = sessions.filter(s => s.batchsId === batch.id).length;
                        return (
                           <View key={batch.id} className="bg-white rounded-3xl p-5 mb-5 border border-brand-brown/5 shadow-sm">
                              <View className="flex-row justify-between items-start mb-3">
                                 <View className={`px-3 py-1 rounded-full ${batch.status === 'INACTIVE' ? 'bg-red-100' : 'bg-green-100'}`}>
                                    <Text className={`text-[9px] font-display uppercase tracking-widest ${batch.status === 'INACTIVE' ? 'text-red-700' : 'text-green-700'}`}>
                                       {batch.status || 'ACTIVE'}
                                    </Text>
                                 </View>
                                 <View className="flex-row gap-2">
                                    <TouchableOpacity onPress={() => openBatchModal(batch)} className="p-1">
                                       <Edit color="#85431E" size={16} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteBatch(batch.id)} className="p-1">
                                       <Trash2 color="#EF4444" size={16} />
                                    </TouchableOpacity>
                                 </View>
                              </View>

                              <Text className="text-brand-brown font-display text-lg mb-1">{batch.title}</Text>
                              <Text className="text-brand-orange font-display-reg text-sm mb-3">
                                 {batch.timing} • {batch.duration}
                              </Text>

                              <View className="bg-brand-beige/30 border border-brand-brown/5 rounded-2xl p-3 mb-4 flex-row justify-between items-center">
                                 <View>
                                    <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-wider">Schedule</Text>
                                    <Text className="text-brand-brown font-body text-xs mt-0.5">{batch.date === 'daily' ? 'Daily Batch' : batch.date}</Text>
                                 </View>
                                 <View className="items-end">
                                    <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-wider">Joining Amt</Text>
                                    <Text className="text-brand-brown font-body text-xs mt-0.5">${batch.joiningAmount}</Text>
                                 </View>
                              </View>

                              <TouchableOpacity
                                 onPress={() => setSelectedBatch(batch)}
                                 className="bg-brand-beige border border-brand-brown/15 py-3 rounded-2xl items-center justify-center"
                              >
                                 <Text className="text-brand-brown font-display-reg text-xs uppercase tracking-widest font-bold">
                                    Manage Slots ({slotsCount})
                                 </Text>
                              </TouchableOpacity>
                           </View>
                        );
                     })
                  )}
               </View>
            )}

            {/* VIEW 2: SLOTS VIEW (DRILLDOWN INSIDE BATCH) */}
            {selectedBatch && (
               <View>
                  <View className="flex-row items-center gap-2 mb-4 bg-brand-brown/5 p-3 rounded-2xl border border-brand-brown/10">
                     <Calendar color="#85431E" size={18} />
                     <View className="flex-1">
                        <Text className="text-brand-brown font-display text-sm">{selectedBatch.title}</Text>
                        <Text className="text-brand-brown/50 font-body text-xs">
                           {selectedBatch.timing} • {selectedBatch.date === 'daily' ? 'Daily' : selectedBatch.date}
                        </Text>
                     </View>
                  </View>

                  <View className="flex-row justify-between items-center mb-6">
                     <View>
                        <Text className="text-xl font-display text-brand-brown">Session Slots</Text>
                        <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Define seats, trainers, and fleet.</Text>
                     </View>
                     <TouchableOpacity
                        onPress={() => openSlotModal()}
                        disabled={batchSlots.length >= 10}
                        className={`px-4 py-2.5 rounded-full flex-row items-center shadow-md ${
                           batchSlots.length >= 10 ? 'bg-gray-300' : 'bg-brand-brown'
                        }`}
                     >
                        <Plus color="#FFFFFF" size={16} strokeWidth={3} className="mr-1" />
                        <Text className="text-white font-display-reg text-xs uppercase tracking-wider">
                           Add Slot {batchSlots.length >= 10 ? '(Max 10)' : ''}
                        </Text>
                     </TouchableOpacity>
                  </View>

                  {batchSlots.length === 0 ? (
                     <View className="bg-white/40 border border-dashed border-brand-brown/20 rounded-3xl p-10 items-center justify-center mb-10">
                        <Text className="text-brand-brown/40 font-body text-center">No slots created for this batch yet.</Text>
                     </View>
                  ) : (
                     <View className="mb-10">
                        {batchSlots.map(slot => {
                           const trainerRecord = trainers.find(t => t.id === slot.trainerId);
                           const trainerName = trainerRecord ? getTrainerName(trainerRecord.userId) : 'Unassigned';
                           const slotHorses = horses.filter(h => slot.horseId?.includes(h.id));
                           const ridersCount = slot.participants?.length || 0;
                           const totalSeats = slot.totalSeats || 10;
                           const progressWidth = Math.min(100, (ridersCount / totalSeats) * 100);

                           const isBlocked = slot.status === 'BLOCKED';

                           return (
                              <View
                                 key={slot.id}
                                 className={`rounded-3xl p-5 mb-5 border shadow-sm ${
                                    isBlocked ? 'bg-red-50/70 border-red-200' : 'bg-white border-brand-brown/5'
                                 }`}
                              >
                                 <View className="flex-row justify-between items-start mb-3">
                                    <View className={`px-3 py-1 rounded-full ${isBlocked ? 'bg-red-100' : 'bg-brand-brown/10'}`}>
                                       <Text className={`text-[9px] font-display uppercase tracking-widest ${isBlocked ? 'text-red-700' : 'text-brand-brown'}`}>
                                          {slot.status || 'ACTIVE'}
                                       </Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                       <TouchableOpacity onPress={() => openSlotModal(slot)} className="p-1">
                                          <Edit color="#85431E" size={16} />
                                       </TouchableOpacity>
                                       <TouchableOpacity onPress={() => handleDeleteSlot(slot.id)} className="p-1">
                                          <Trash2 color="#EF4444" size={16} />
                                       </TouchableOpacity>
                                    </View>
                                 </View>

                                 <Text className="text-brand-brown font-display text-lg mb-4">{slot.title}</Text>

                                 <View className="bg-brand-beige/20 border border-brand-brown/5 rounded-2xl p-4 mb-4 space-y-2">
                                    <View className="flex-row justify-between items-center">
                                       <Text className="text-brand-brown/40 font-display-reg text-[10px] uppercase">🐎 Assigned Horses</Text>
                                       <Text className="text-brand-brown font-body text-xs text-right max-w-[150px]" numberOfLines={1}>
                                          {slotHorses.length > 0 ? slotHorses.map(h => h.name).join(', ') : 'None'}
                                       </Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                       <Text className="text-brand-brown/40 font-display-reg text-[10px] uppercase">🧑‍🏫 Specialist Trainer</Text>
                                       <Text className="text-brand-brown font-body text-xs font-bold">{trainerName}</Text>
                                    </View>
                                 </View>

                                 <View className="mb-4">
                                    <View className="flex-row justify-between text-[11px] font-body text-brand-brown/60 mb-2">
                                       <Text>Capacity utilization</Text>
                                       <Text className="font-bold text-brand-brown">{ridersCount}/{totalSeats} Riders</Text>
                                    </View>
                                    <View className="w-full bg-brand-brown/10 h-2 rounded-full overflow-hidden">
                                       <View
                                          className={`h-full rounded-full ${isBlocked ? 'bg-red-500' : 'bg-brand-orange'}`}
                                          style={{ width: `${progressWidth}%` }}
                                       />
                                    </View>
                                 </View>

                                 <TouchableOpacity
                                    onPress={() => handleBlockSlot(slot)}
                                    className="bg-white border border-brand-brown/15 py-3 rounded-2xl items-center justify-center flex-row"
                                 >
                                    <Ban color={isBlocked ? '#EF4444' : '#85431E'} size={14} className="mr-1.5" />
                                    <Text className={`font-display-reg text-xs uppercase tracking-widest font-bold ${isBlocked ? 'text-red-600' : 'text-brand-brown'}`}>
                                       {isBlocked ? 'Unblock Slot' : 'Block Slot'}
                                    </Text>
                                 </TouchableOpacity>
                              </View>
                           );
                        })}
                     </View>
                  )}

                  {/* Pending requests under this batch */}
                  <View className="mt-4">
                     <Text className="text-lg font-display text-brand-brown mb-4">Rider Booking Requests</Text>

                     {pendingParticipants.length === 0 ? (
                        <View className="bg-white/40 border border-dashed border-brand-brown/20 rounded-3xl p-8 items-center justify-center">
                           <Text className="text-brand-brown/40 font-body text-center text-sm">No pending rider requests for this batch.</Text>
                        </View>
                     ) : (
                        pendingParticipants.map((p, idx) => (
                           <View key={idx} className="bg-white rounded-3xl p-5 mb-4 border border-brand-brown/5 shadow-sm">
                              <View className="flex-row items-center mb-3">
                                 <View className="w-10 h-10 rounded-full bg-brand-brown/10 items-center justify-center mr-3">
                                    <Text className="text-brand-brown font-display text-base">{p.name?.charAt(0) || 'R'}</Text>
                                 </View>
                                 <View className="flex-1">
                                    <Text className="text-brand-brown font-display text-sm">{p.name}</Text>
                                    <Text className="text-brand-brown/40 font-body text-xs">{p.session?.title} • {p.session?.timing}</Text>
                                 </View>
                              </View>

                              <View className="flex-row justify-between items-center mb-4 border-t border-brand-brown/5 pt-3">
                                 <View className="flex-row items-center bg-brand-orange/10 px-2.5 py-1 rounded-md">
                                    <Text className="text-brand-orange text-[9px] font-display uppercase tracking-wider">{p.status || 'PENDING'}</Text>
                                 </View>
                                 <View className="flex-row items-center">
                                    <Text className="text-brand-brown/40 font-body text-xs mr-1">Paid Status:</Text>
                                    <CheckCircle2 color={p.paid ? '#22C55E' : '#D1D5DB'} size={18} strokeWidth={2.5} />
                                 </View>
                              </View>

                              <View className="flex-row gap-3">
                                 <TouchableOpacity
                                    onPress={() => handleBookingStatus(p.session.id, p.riderId, 'CONFIRMED')}
                                    className="flex-1 bg-green-600 py-3 rounded-2xl items-center justify-center shadow-sm"
                                 >
                                    <Text className="text-white font-display-reg text-xs uppercase tracking-wider font-bold">Approve</Text>
                                 </TouchableOpacity>
                                 <TouchableOpacity
                                    onPress={() => handleBookingStatus(p.session.id, p.riderId, 'REJECTED')}
                                    className="flex-1 bg-white border border-brand-brown/15 py-3 rounded-2xl items-center justify-center"
                                 >
                                    <Text className="text-brand-brown/60 font-display-reg text-xs uppercase tracking-wider font-bold">Reject</Text>
                                 </TouchableOpacity>
                              </View>
                           </View>
                        ))
                     )}
                  </View>
               </View>
            )}

            {/* VIEW 3: TRAINERS DIRECTORY */}
            {!selectedBatch && activeTab === 'trainers' && (
               <View>
                  <View className="mb-6">
                     <Text className="text-xl font-display text-brand-brown leading-tight">Specialist Roster</Text>
                     <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Manage assignments and review roles.</Text>
                  </View>

                  {trainers.length === 0 ? (
                     <View className="bg-white/40 border border-dashed border-brand-brown/20 rounded-3xl p-10 items-center justify-center">
                        <Text className="text-brand-brown/40 font-body text-center">No other trainers listed at this stable.</Text>
                     </View>
                  ) : (
                     trainers.map((t, idx) => {
                        const user = trainerUsers.find(u => u.id === t.userId);
                        if (!user) return null;

                        return (
                           <View key={t.id || idx} className="bg-white rounded-3xl p-6 mb-5 border border-brand-brown/5 shadow-sm">
                              <View className="flex-row items-center mb-4">
                                 <View className="w-14 h-14 bg-brand-brown/10 rounded-2xl items-center justify-center mr-4 border border-brand-brown/10">
                                    <Text className="text-brand-brown font-display text-xl">{user.name?.charAt(0) || 'T'}</Text>
                                 </View>
                                 <View className="flex-1">
                                    <Text className="text-brand-brown font-display text-base mb-0.5">{user.name}</Text>
                                    <View className="flex-row items-center flex-wrap gap-2">
                                       <View className="bg-brand-beige px-2 py-0.5 rounded-md">
                                          <Text className="text-brand-brown text-[8px] font-display uppercase tracking-widest">{t.title || 'Trainer'}</Text>
                                       </View>
                                       <View className="flex-row items-center">
                                          <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'OFF-DUTY' ? 'bg-amber-600' : (user.status === 'ON-LEAVE' ? 'bg-red-500' : 'bg-green-600')}`} />
                                          <Text className="text-brand-brown/50 text-[10px] font-display-reg uppercase tracking-wider">{user.status || 'AVAILABLE'}</Text>
                                       </View>
                                    </View>
                                 </View>
                              </View>

                              {/* Experience & Contact Info */}
                              <View className="border-t border-b border-brand-brown/5 py-3 mb-4 flex-row justify-between flex-wrap gap-y-2">
                                 <View className="w-[48%]">
                                    <Text className="text-brand-brown/40 text-[8px] font-display uppercase tracking-wider">Experience</Text>
                                    <Text className="text-brand-brown font-body text-xs font-bold mt-0.5">{t.experience || 'N/A'}</Text>
                                 </View>
                                 <View className="w-[48%] items-end">
                                    <Text className="text-brand-brown/40 text-[8px] font-display uppercase tracking-wider">Mobile Number</Text>
                                    <Text className="text-brand-brown font-body text-xs font-bold mt-0.5">{user.mobile || 'N/A'}</Text>
                                 </View>
                              </View>

                              {/* Action Button */}
                              {/* <TouchableOpacity
                                 onPress={() => openTrainerModal(user, t)}
                                 className="bg-brand-beige border border-brand-brown/15 py-3 rounded-2xl items-center justify-center"
                              >
                                 <Text className="text-brand-brown font-display-reg text-xs uppercase tracking-widest font-bold">
                                    Update Center / Role
                                 </Text>
                              </TouchableOpacity> */}
                           </View>
                        );
                     })
                  )}
               </View>
            )}
         </ScrollView>

         {/* MODAL 1: BATCH CONFIG MODAL */}
         {showBatchModal && (
            <View style={StyleSheet.absoluteFillObject} className="bg-black/60 justify-end z-50">
               <View className="bg-white rounded-t-[32px] p-6 pb-10 space-y-4 max-h-[85%]">
                  <View className="flex-row justify-between items-center pb-4 border-b border-brand-brown/10">
                     <View>
                        <Text className="text-lg font-display text-brand-brown">{batchToEdit ? 'Edit Schedule Batch' : 'Create New Batch'}</Text>
                        <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Configure center time slot and rates.</Text>
                     </View>
                     <TouchableOpacity onPress={() => setShowBatchModal(false)} className="p-2 bg-brand-brown/5 rounded-full">
                        <X color="#85431E" size={20} strokeWidth={2.5} />
                     </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 pt-4">
                     {/* Batch Title */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Batch Title</Text>
                        <TextInput
                           value={batchForm.title}
                           onChangeText={text => setBatchForm(prev => ({ ...prev, title: text }))}
                           placeholder="e.g. Intermediate Show Jumping"
                           placeholderTextColor="#D1C5B4"
                           className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                        />
                     </View>

                     {/* Start & End Times */}
                     <View className="flex-row justify-between">
                        <View className="w-[48%]">
                           <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Start Time (HH:MM)</Text>
                           <TextInput
                              value={batchForm.startTime}
                              onChangeText={text => setBatchForm(prev => ({ ...prev, startTime: text }))}
                              placeholder="09:00"
                              placeholderTextColor="#D1C5B4"
                              className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                           />
                        </View>
                        <View className="w-[48%]">
                           <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">End Time (HH:MM)</Text>
                           <TextInput
                              value={batchForm.endTime}
                              onChangeText={text => setBatchForm(prev => ({ ...prev, endTime: text }))}
                              placeholder="10:30"
                              placeholderTextColor="#D1C5B4"
                              className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                           />
                        </View>
                     </View>

                     {/* Location / Stable (Read-only) */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Center Location</Text>
                        <TextInput
                           value={currentStable?.name || ''}
                           editable={false}
                           className="bg-brand-brown/5 border border-brand-brown/10 rounded-2xl p-4 text-brand-brown/55 font-body text-sm"
                        />
                     </View>

                     {/* Joining Amount */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Joining Amount ($)</Text>
                        <TextInput
                           value={batchForm.joiningAmount}
                           onChangeText={text => setBatchForm(prev => ({ ...prev, joiningAmount: text }))}
                           keyboardType="numeric"
                           placeholder="100"
                           placeholderTextColor="#D1C5B4"
                           className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                        />
                     </View>

                     {/* Schedule Select */}
                     <View className="pt-2">
                        <TouchableOpacity
                           onPress={() => setBatchForm(prev => ({ ...prev, isDaily: !prev.isDaily }))}
                           className="flex-row items-center"
                        >
                           <View className={`w-5 h-5 rounded border border-brand-brown justify-center items-center mr-2 ${
                              batchForm.isDaily ? 'bg-brand-brown' : 'bg-transparent'
                           }`}>
                              {batchForm.isDaily && <Check color="#FFFFFF" size={12} strokeWidth={4} />}
                           </View>
                           <Text className="text-brand-brown font-display-reg text-xs uppercase tracking-wider">Daily Recurring Batch</Text>
                        </TouchableOpacity>

                        {!batchForm.isDaily && (
                           <View className="mt-3">
                              <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Custom Batch Date (YYYY-MM-DD)</Text>
                              <TextInput
                                 value={batchForm.date}
                                 onChangeText={text => setBatchForm(prev => ({ ...prev, date: text }))}
                                 placeholder="e.g. 2026-06-01"
                                 placeholderTextColor="#D1C5B4"
                                 className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                              />
                           </View>
                        )}
                     </View>

                     {/* Action Buttons */}
                     <View className="flex-row gap-3 pt-6">
                        <TouchableOpacity
                           onPress={() => setShowBatchModal(false)}
                           className="flex-1 bg-white border border-brand-brown/15 py-4 rounded-2xl items-center justify-center"
                        >
                           <Text className="text-brand-brown/60 font-display-reg text-xs uppercase tracking-widest font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={handleSaveBatch}
                           className="flex-1 bg-brand-brown py-4 rounded-2xl items-center justify-center shadow-md"
                        >
                           <Text className="text-white font-display-reg text-xs uppercase tracking-widest font-bold">Save Batch</Text>
                        </TouchableOpacity>
                     </View>
                  </ScrollView>
               </View>
            </View>
         )}

         {/* MODAL 2: SLOT CONFIG MODAL */}
         {showSlotModal && (
            <View style={StyleSheet.absoluteFillObject} className="bg-black/60 justify-end z-50">
               <View className="bg-white rounded-t-[32px] p-6 pb-10 space-y-4 max-h-[85%]">
                  <View className="flex-row justify-between items-center pb-4 border-b border-brand-brown/10">
                     <View>
                        <Text className="text-lg font-display text-brand-brown">{slotToEdit ? 'Edit Slot Properties' : 'Create Session Slot'}</Text>
                        <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Assign trainer and horse fleet roster.</Text>
                     </View>
                     <TouchableOpacity onPress={() => setShowSlotModal(false)} className="p-2 bg-brand-brown/5 rounded-full">
                        <X color="#85431E" size={20} strokeWidth={2.5} />
                     </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 pt-4">
                     {/* Capacity Seats */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Capacity Limit (Seats)</Text>
                        <TextInput
                           value={slotForm.totalSeats}
                           onChangeText={text => setSlotForm(prev => ({ ...prev, totalSeats: text }))}
                           keyboardType="numeric"
                           placeholder="10"
                           placeholderTextColor="#D1C5B4"
                           className="bg-brand-beige/20 border border-brand-brown/15 rounded-2xl p-4 text-brand-brown font-body text-sm"
                        />
                     </View>

                     {/* Assigned Trainer selection */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">Assigned Specialist Trainer</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-1">
                           <TouchableOpacity
                              onPress={() => setSlotForm(prev => ({ ...prev, trainerId: '' }))}
                              className={`px-4 py-3 rounded-2xl border ${
                                 slotForm.trainerId === '' ? 'bg-brand-brown border-transparent' : 'bg-brand-beige/10 border-brand-brown/15'
                              }`}
                           >
                              <Text className={`font-display-reg text-[11px] uppercase tracking-wider ${slotForm.trainerId === '' ? 'text-white' : 'text-brand-brown'}`}>
                                 None Assigned
                              </Text>
                           </TouchableOpacity>

                           {trainers.map(t => {
                              const name = getTrainerName(t.userId);
                              const isSelected = slotForm.trainerId === t.id;
                              return (
                                 <TouchableOpacity
                                    key={t.id}
                                    onPress={() => setSlotForm(prev => ({ ...prev, trainerId: t.id }))}
                                    className={`px-4 py-3 rounded-2xl border ${
                                       isSelected ? 'bg-brand-brown border-transparent' : 'bg-brand-beige/10 border-brand-brown/15'
                                    }`}
                                 >
                                    <Text className={`font-display-reg text-[11px] uppercase tracking-wider ${isSelected ? 'text-white' : 'text-brand-brown'}`}>
                                       {name}
                                    </Text>
                                 </TouchableOpacity>
                              );
                           })}
                        </ScrollView>
                     </View>

                     {/* Assigned Horses selection */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-2 ml-1">Assigned Fleet (Multiple Horses)</Text>
                        <View className="bg-brand-beige/10 border border-brand-brown/15 rounded-3xl p-3 max-h-48 overflow-hidden">
                           <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true} contentContainerStyle={{ gap: 8 }}>
                              {horses.length === 0 ? (
                                 <Text className="text-brand-brown/30 font-body text-center py-4 text-xs">No horses registered under this stable.</Text>
                              ) : (
                                 horses.map(h => {
                                    const isSelected = slotForm.horseId.includes(h.id);
                                    return (
                                       <TouchableOpacity
                                          key={h.id}
                                          onPress={() => toggleHorseSelection(h.id)}
                                          className="flex-row items-center bg-white/60 p-3 rounded-xl border border-brand-brown/5"
                                       >
                                          <View className={`w-5 h-5 rounded border border-brand-brown justify-center items-center mr-3.5 ${
                                             isSelected ? 'bg-brand-brown' : 'bg-transparent'
                                          }`}>
                                             {isSelected && <Check color="#FFFFFF" size={12} strokeWidth={4} />}
                                          </View>
                                          <View>
                                             <Text className="text-brand-brown font-display text-sm leading-none mb-1">{h.name}</Text>
                                             <Text className="text-brand-brown/40 font-body text-[10px] uppercase">{h.title || 'Fit for service'}</Text>
                                          </View>
                                       </TouchableOpacity>
                                    );
                                 })
                              )}
                           </ScrollView>
                        </View>
                     </View>

                     {/* Action Buttons */}
                     <View className="flex-row gap-3 pt-6">
                        <TouchableOpacity
                           onPress={() => setShowSlotModal(false)}
                           className="flex-1 bg-white border border-brand-brown/15 py-4 rounded-2xl items-center justify-center"
                        >
                           <Text className="text-brand-brown/60 font-display-reg text-xs uppercase tracking-widest font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={handleSaveSlot}
                           className="flex-1 bg-brand-brown py-4 rounded-2xl items-center justify-center shadow-md"
                        >
                           <Text className="text-white font-display-reg text-xs uppercase tracking-widest font-bold">Save Slot</Text>
                        </TouchableOpacity>
                     </View>
                  </ScrollView>
               </View>
            </View>
         )}

         {/* MODAL 3: TRAINER MANAGEMENT ROLE MODAL */}
         {showTrainerModal && editingTrainerUser && (
            <View style={StyleSheet.absoluteFillObject} className="bg-black/60 justify-end z-50">
               <View className="bg-white rounded-t-[32px] p-6 pb-10 space-y-4 max-h-[85%]">
                  <View className="flex-row justify-between items-center pb-4 border-b border-brand-brown/10">
                     <View>
                        <Text className="text-lg font-display text-brand-brown">Update Center & Role</Text>
                        <Text className="text-brand-brown/40 font-body text-xs mt-0.5">Assign stable node and manage privileges.</Text>
                     </View>
                     <TouchableOpacity onPress={() => setShowTrainerModal(false)} className="p-2 bg-brand-brown/5 rounded-full">
                        <X color="#85431E" size={20} strokeWidth={2.5} />
                     </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 pt-4">
                     {/* Specialist name */}
                     <View className="bg-brand-brown/5 border border-brand-brown/10 rounded-2xl p-4 mb-2">
                        <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-wider">Trainer Selected</Text>
                        <Text className="text-brand-brown font-display text-base mt-0.5">{editingTrainerUser.name}</Text>
                        <Text className="text-brand-brown/50 font-body text-xs">{editingTrainerUser.email}</Text>
                     </View>

                     {/* Stable select */}
                     <View>
                        <Text className="text-brand-brown/50 text-[10px] font-display uppercase tracking-widest mb-1.5 ml-1">ASSIGN STABLE CENTER</Text>
                        <View className="bg-brand-beige/20 border border-brand-brown/15 rounded-3xl p-2 max-h-44">
                           <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true} contentContainerStyle={{ gap: 6 }}>
                              {stables.map(stable => {
                                 const isSelected = selectedTrainerStable === stable.id;
                                 return (
                                    <TouchableOpacity
                                       key={stable.id}
                                       onPress={() => setSelectedTrainerStable(stable.id)}
                                       className={`p-3.5 rounded-xl border flex-row justify-between items-center ${
                                          isSelected ? 'bg-brand-brown border-transparent' : 'bg-white border-brand-brown/5'
                                       }`}
                                    >
                                       <View>
                                          <Text className={`font-display text-sm leading-none mb-1 ${isSelected ? 'text-white' : 'text-brand-brown'}`}>
                                             {stable.name}
                                          </Text>
                                          <Text className={`font-body text-[10px] uppercase ${isSelected ? 'text-white/60' : 'text-brand-brown/40'}`}>
                                             {stable.location}
                                          </Text>
                                       </View>
                                       {isSelected && <Check color="#FFFFFF" size={16} strokeWidth={3.5} />}
                                    </TouchableOpacity>
                                 );
                              })}
                           </ScrollView>
                        </View>
                     </View>

                     {/* Head Trainer switch (disabled check) */}
                     <View className="flex-row items-center border border-yellow-200/50 bg-yellow-50/45 p-4 rounded-3xl mt-2 gap-3">
                        <View className="w-5 h-5 rounded border border-gray-300 bg-gray-100 justify-center items-center opacity-60">
                           {editingTrainerRecord?.title === 'Head Trainer' && <Check color="#6B7280" size={12} strokeWidth={4} />}
                        </View>
                        <View className="flex-1">
                           <Text className="text-gray-400 font-display text-xs">Assign as Head Trainer role</Text>
                           <Text className="text-[10px] font-body text-yellow-700/60 mt-0.5">
                              ⚠️ Only Stable Owners have permission to elevate other specialists to Head Trainer.
                           </Text>
                        </View>
                     </View>

                     {/* Action Buttons */}
                     <View className="flex-row gap-3 pt-6">
                        <TouchableOpacity
                           onPress={() => setShowTrainerModal(false)}
                           className="flex-1 bg-white border border-brand-brown/15 py-4 rounded-2xl items-center justify-center"
                        >
                           <Text className="text-brand-brown/60 font-display-reg text-xs uppercase tracking-widest font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={handleSaveTrainerStable}
                           className="flex-1 bg-brand-brown py-4 rounded-2xl items-center justify-center shadow-md"
                        >
                           <Text className="text-white font-display-reg text-xs uppercase tracking-widest font-bold">Save Changes</Text>
                        </TouchableOpacity>
                     </View>
                  </ScrollView>
               </View>
            </View>
         )}
      </View>
   );
}
