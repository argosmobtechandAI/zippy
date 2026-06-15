import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, TextInput, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Info, ArrowUpRight, Calendar, User as UserIcon, Clock, Star, CalendarRange, XCircle, X, ChevronRight } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiFunction } from '../api/apifunction';
import { getSessionsByRiderApi, updateLeaveApi } from '../api/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';

export default function BookingsScreen() {
  const [tab, setTab] = useState('CONFIRMED');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [policyVisible, setPolicyVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch<any>();
  const { user, rider } = useSelector((state: any) => state.getData);

  const [activeLeaveSessionId, setActiveLeaveSessionId] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    status: 'pending',
  });

  const currentRiderId = rider?.id;

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser())
    }
    if (!rider) {
      dispatch(fetchRider())
    }
  }, [dispatch])

  const handleRequestLeave = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      Alert.alert("Error", "Start date cannot be after end date.");
      return;
    }

    setRequesting(true);
    try {
      const res = await apiFunction(updateLeaveApi, [user.id], {
        leaves: { ...leaveForm, sessionId: activeLeaveSessionId }
      }, "PUT", true);

      if (res && res.success) {
        Alert.alert("Success", "Leave request submitted successfully.");
        setActiveLeaveSessionId(null);
        setLeaveForm({
          reason: '',
          startDate: '',
          endDate: '',
          status: 'pending',
        });
        dispatch(fetchUser());
      } else {
        Alert.alert("Error", res?.message || "Failed to submit request.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Refreshing Bookings...");
      dispatch(fetchUser());
      dispatch(fetchRider());
      fetchBookings();
    });

    return unsubscribe;
  }, [navigation, currentRiderId, dispatch]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let activeRiderId = currentRiderId;
      dispatch(fetchRider());

      if (!activeRiderId) {
        // Try to fetch latest user data (self-healing)
        const res = await dispatch(fetchUser()).unwrap();
        activeRiderId = res?.riderId;
      }

      if (activeRiderId) {
        const res = await apiFunction(getSessionsByRiderApi(activeRiderId), [], {}, "GET", true);
        if (res && res.success) {
          setSessions(res.sessions || []);
        }
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions based on rider's status in the participants list
  const isSessionPassed = (date, timing) => {
    const now = new Date();
    const sessionDate = new Date(date);

    if (sessionDate.toDateString() === now.toDateString()) {
      try {
        const [startTime] = timing.split(' - ');
        const [hours, minutes] = startTime.split(':').map(Number);
        const sessionWithTime = new Date(sessionDate);
        sessionWithTime.setHours(hours, minutes, 0, 0);
        return sessionWithTime <= now;
      } catch (e) {
        return false;
      }
    }
    return sessionDate < now;
  };

  const confirmedSessions = sessions.filter(s => {
    const joinedArray = rider?.joined_sessions || rider?.joinedSessions || [];
    const isJoined = joinedArray.includes(s.id);
    if (!isJoined) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    return !isSessionPassed(bookedDate, s.timing);
  });

  const pendingSessions = sessions.filter(s => {
    const pendingArray = rider?.pending_sessions || rider?.pendingSessions || [];
    const isPending = pendingArray.includes(s.id);
    if (!isPending) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    return !isSessionPassed(bookedDate, s.timing);
  });

  // Rejected: participant exists in ANY session with REJECTED status
  const rejectedSessions = sessions.filter(s => {
    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    return me?.status?.toUpperCase() === 'REJECTED';
  });

  const pastSessions = sessions.filter(s => {
    const joinedArray = rider?.joined_sessions || rider?.joinedSessions || [];
    const pendingArray = rider?.pending_sessions || rider?.pendingSessions || [];
    const isAssociated = joinedArray.includes(s.id) || pendingArray.includes(s.id);
    if (!isAssociated) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    const status = me?.status?.toUpperCase();

    return status === 'PRESENT' || status === 'NOSHOW' || isSessionPassed(bookedDate, s.timing);
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Full Policy Bottom Sheet */}
      <Modal
        visible={policyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPolicyVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPolicyVisible(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
              {/* Handle */}
              <View className="w-12 h-1.5 bg-[#e2e8f0] rounded-full self-center mb-5" />
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-[#8C4A28] font-bold text-xl font-normal">Booking {"&"} Cancellation Policy</Text>
                <TouchableOpacity onPress={() => setPolicyVisible(false)} className="p-1">
                  <X color="#64748b" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  {
                    title: '⏰ Booking & Cancellation Window',
                    body: 'Riders may book, modify, or cancel sessions until 8:00 PM on the previous day of the scheduled session.'
                  },
                  {
                    title: '⏳ Cutoff Time',
                    body: 'After 8:00 PM on the previous day, no booking, rescheduling, or cancellation requests will be accepted through the system.'
                  },
                  {
                    title: '🚨 No-Show Policy',
                    body: 'Failure to attend a booked session without prior cancellation within the permitted timeframe will be treated as a No-Show, and the session will be considered utilized.'
                  },
                  {
                    title: '🌤 Zippy’s Rights & Rescheduling',
                    body: 'Zippy reserves the right to modify or cancel sessions due to weather conditions, horse welfare requirements, safety concerns, instructor availability, or unforeseen circumstances.'
                  }
                ].map((section, i) => (
                  <View key={i} className={`mb-5 ${i > 0 ? 'pt-5 border-t border-[#f1f5f9]' : ''}`}>
                    <Text className="text-[#1a202c] font-bold text-sm mb-1.5 font-normal">{section.title}</Text>
                    <Text className="text-[#64748b] text-xs leading-relaxed font-normal">{section.body}</Text>
                  </View>
                ))}

                <View className="bg-[#fceddf] rounded-2xl p-4 mt-2">
                  <Text className="text-[#8C4A28] font-bold text-xs mb-1">Need help?</Text>
                  <Text className="text-[#64748b] text-xs leading-relaxed font-normal">Contact our support team via the Help section in the app or email us at support@zippyequestrian.com</Text>
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-lg">MY BOOKINGS</Text>
      </View>

      {/* Top Tabs */}
      <View className="flex-row bg-white border-b border-[#e2e8f0]">
        {[{ key: 'CONFIRMED', label: 'CONFIRMED' }, { key: 'PENDING', label: 'PENDING' }, { key: 'REJECTED', label: 'REJECTED' }, { key: 'PAST', label: 'PAST' }].map(t => (
          <TouchableOpacity
            key={t.key}
            className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === t.key ? 'border-[#8C4A28]' : 'border-transparent'}`}
            onPress={() => setTab(t.key)}
          >
            <Text className={`font-bold text-[10px] ${tab === t.key ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8C4A28" />
          <Text className="mt-4 text-[#8C4A28] font-bold">Fetching your bookings...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchBookings} colors={['#8C4A28']} />
          }
        >
          {tab === 'CONFIRMED' && (
            <>
              {/* Cancellation Policy Alert */}
              <View className="bg-[#fceddf] border border-[#eabba4] rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="mr-2">
                    <Info color="#8C4A28" size={16} />
                  </View>
                  <Text className="text-[#8C4A28] font-bold text-sm">Cancellation Policy</Text>
                </View>
                <Text className="text-[#64748b] text-xs leading-relaxed mb-2 font-normal">
                  Bookings and cancellations are allowed until 8:00 PM on the previous day. After this cutoff time, no booking changes will be permitted. No-shows will result in session deduction.
                </Text>
                <TouchableOpacity className="flex-row items-center" onPress={() => setPolicyVisible(true)}>
                  <Text className="text-[#8C4A28] font-bold text-xs mr-1">Full Policy</Text>
                  <ArrowUpRight color="#8C4A28" size={12} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  textColor="#000000"
                  themeVariant="light"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (Platform.OS === 'android') setShowDatePicker(null);
                    if (selectedDate) {
                      const year = selectedDate.getFullYear();
                      const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const dayStr = String(selectedDate.getDate()).padStart(2, '0');
                      
                      setLeaveForm({
                        ...leaveForm,
                        [showDatePicker]: `${year}-${monthStr}-${dayStr}`,
                      });
                    }
                  }}
                />
              )}

              {/* Leaves List */}
              {user?.leaves?.length > 0 && (
                <View className="mb-8">
                  <View className="flex-row items-center mb-4">
                    <View className="w-1 h-5 bg-[#8C4A28] rounded mr-2" />
                    <Text className="text-[#1a202c] font-bold text-lg">Leave Requests</Text>
                  </View>
                  {user.leaves.slice().reverse().map((r: any, idx: number) => (
                    <View key={idx} className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text className="text-[#1a202c] font-bold text-lg mb-1">{r.reason}</Text>
                          <Text className="text-[#64748b] text-xs font-semibold">{r.startDate} - {r.endDate}</Text>
                        </View>
                        <View className={`px-3 py-1.5 rounded-lg border ${r.status?.toUpperCase() === 'APPROVED' ? 'bg-[#f0fff4] border-[#c6f6d5]' : r.status?.toUpperCase() === 'PENDING' ? 'bg-[#fef08a]/40 border-[#fef08a]' : 'bg-red-50 border-red-100'}`}>
                          <Text className={`text-[10px] font-bold tracking-wider ${r.status?.toUpperCase() === 'APPROVED' ? 'text-[#16a34a]' : r.status?.toUpperCase() === 'PENDING' ? 'text-[#ca8a04]' : 'text-red-600'}`}>{r.status?.toUpperCase() || 'PENDING'}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-[#8C4A28] rounded mr-2" />
                <Text className="text-[#1a202c] font-bold text-lg">Confirmed Sessions</Text>
              </View>

              <View className="space-y-4">
                {confirmedSessions.length === 0 ? (
                  <View className="p-8 items-center justify-center bg-white rounded-2xl border border-[#e2e8f0] mb-4">
                    <Text className="text-[#64748b] font-bold">No confirmed sessions found.</Text>
                  </View>
                ) : confirmedSessions.map((session, idx) => {
                  const me = session.participants?.find((p: any) =>
                    p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
                  );
                  const bookedDate = me?.date || session.date;
                  return (
                    <View key={idx} className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="px-2 py-1 rounded bg-green-100">
                          <Text className="font-bold text-[8px] tracking-widest uppercase text-green-700">
                            CONFIRMED
                          </Text>
                        </View>
                        <View className="bg-[#fceddf] p-1.5 rounded-lg">
                          <Calendar color="#8C4A28" size={16} />
                        </View>
                      </View>

                      <Text className="text-[#1a202c] font-bold text-lg mb-3">{session.title}</Text>

                      <View className="space-y-2 mb-4 mt-2">
                        <View className="flex-row items-center">
                          <View className="w-6 items-center mr-1">
                            <Calendar color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs font-normal">{session.timing} • {bookedDate}</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <View className="w-6 items-center mr-1">
                            <UserIcon color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs font-normal">Location: {session.location}</Text>
                        </View>
                      </View>

                      <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                      <View className="flex-row justify-between items-center mt-2">

                        <TouchableOpacity onPress={() => navigation.navigate("SessionDetail", { session, date: bookedDate })} className="bg-[#8C4A28] py-2 px-4 rounded-lg">
                          <Text className="text-white font-bold text-xs">View Details</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Inline Leave Form */}
                      {activeLeaveSessionId === session.id && (
                        <View className="mt-4 pt-4 border-t border-[#f1f5f9]">
                          <Text className="text-[#1a202c] font-bold text-sm mb-3">Request Leave</Text>

                          <View className="mb-3">
                            <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-1 ml-1">Leave Reason</Text>
                            <TextInput className="font-normal"
                              value={leaveForm.reason}
                              onChangeText={t => setLeaveForm({ ...leaveForm, reason: t })}
                              placeholder="e.g. Vacation, Medical"
                              placeholderTextColor="#94a3b8"
                              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a202c] font-bold text-xs"
                            />
                          </View>

                          <View className="flex-row gap-3 mb-4">
                            <View className="flex-1">
                              <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-1 ml-1">Start Date</Text>
                              <TouchableOpacity onPress={() => setShowDatePicker('startDate')}>
                                <View pointerEvents="none">
                                  <TextInput
                                    value={leaveForm.startDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    editable={false}
                                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a202c] font-bold text-xs"
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                              <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-1 ml-1">End Date</Text>
                              <TouchableOpacity onPress={() => setShowDatePicker('endDate')}>
                                <View pointerEvents="none">
                                  <TextInput
                                    value={leaveForm.endDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    editable={false}
                                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a202c] font-bold text-xs"
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={handleRequestLeave}
                            disabled={requesting}
                            className={`py-3 rounded-xl items-center justify-center flex-row ${requesting ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
                          >
                            {requesting ? <ActivityIndicator color="white" size="small" /> : <CalendarRange color="white" size={16} className="mr-2" />}
                            <Text className="text-white font-bold text-sm ml-1">{requesting ? 'Submitting...' : 'Submit Request'}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {tab === 'REJECTED' && (
            <>
              {/* Rejection Policy Alert */}
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <XCircle color="#dc2626" size={16} />
                  <Text className="text-red-700 font-bold text-sm ml-2">Rejection Policy</Text>
                </View>
                <Text className="text-[#64748b] text-xs leading-relaxed mb-2 font-normal">
                  When your booking is rejected by an admin, your session credit is automatically restored. You may rebook any available slot.
                </Text>
                <TouchableOpacity className="flex-row items-center" onPress={() => setPolicyVisible(true)}>
                  <Text className="text-[#8C4A28] font-bold text-xs mr-1">Full Policy</Text>
                  <ArrowUpRight color="#8C4A28" size={12} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-red-400 rounded mr-2" />
                <Text className="text-[#1a202c] font-bold text-lg">Rejected Sessions</Text>
              </View>

              {rejectedSessions.length === 0 ? (
                <View className="p-8 items-center justify-center bg-white rounded-2xl border border-[#e2e8f0] mb-4">
                  <XCircle color="#94a3b8" size={28} />
                  <Text className="text-[#64748b] font-bold mt-3">No rejected sessions.</Text>
                  <Text className="text-[#94a3b8] text-xs text-center mt-1 font-normal">All your bookings are in good standing!</Text>
                </View>
              ) : rejectedSessions.map((session: any, idx: number) => {
                const me = session.participants?.find((p: any) =>
                  p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
                );
                const bookedDate = me?.date || session.date;
                return (
                  <View key={idx} className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm mb-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="px-2 py-1 rounded bg-red-100">
                        <Text className="font-bold text-[8px] tracking-widest uppercase text-red-600">REJECTED</Text>
                      </View>
                      <View className="bg-red-50 p-1.5 rounded-lg">
                        <XCircle color="#dc2626" size={16} />
                      </View>
                    </View>

                    <Text className="text-[#1a202c] font-bold text-lg mb-3">{session.title}</Text>

                    <View className="space-y-2 mb-4 mt-2">
                      <View className="flex-row items-center">
                        <View className="w-6 items-center mr-1">
                          <Calendar color="#8C4A28" size={14} />
                        </View>
                        <Text className="text-[#64748b] text-xs font-normal">{session.timing} • {bookedDate}</Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <View className="w-6 items-center mr-1">
                          <UserIcon color="#8C4A28" size={14} />
                        </View>
                        <Text className="text-[#64748b] text-xs font-normal">Location: {session.location}</Text>
                      </View>
                    </View>

                    <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                    <View className="bg-red-50 rounded-xl p-3">
                      <Text className="text-red-600 text-xs font-bold">Your session credit has been restored to your plan balance.</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
          {tab === 'PENDING' && (
            <>
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-[#8C4A28] rounded mr-2" />
                <Text className="text-[#1a202c] font-bold text-lg">Pending Sessions</Text>
              </View>

              <View className="space-y-4">
                {pendingSessions.length === 0 ? (
                  <View className="p-8 items-center justify-center bg-white rounded-2xl border border-[#e2e8f0] mb-4">
                    <Text className="text-[#64748b] font-bold">No pending sessions found.</Text>
                  </View>
                ) : pendingSessions.map((session, idx) => {
                  const me = session.participants?.find((p: any) =>
                    p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
                  );
                  const bookedDate = me?.date || session.date;
                  return (
                    <View key={idx} className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="px-2 py-1 rounded bg-[#fceddf]">
                          <Text className="font-bold text-[8px] tracking-widest uppercase text-[#8C4A28]">
                            PENDING
                          </Text>
                        </View>
                        <View className="bg-[#fceddf] p-1.5 rounded-lg">
                          <Calendar color="#8C4A28" size={16} />
                        </View>
                      </View>

                      <Text className="text-[#1a202c] font-bold text-lg mb-3">{session.title}</Text>

                      <View className="space-y-2 mb-4 mt-2">
                        <View className="flex-row items-center">
                          <View className="w-6 items-center mr-1">
                            <Calendar color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs font-normal">{session.timing} • {bookedDate}</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <View className="w-6 items-center mr-1">
                            <UserIcon color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs font-normal">Location: {session.location}</Text>
                        </View>
                      </View>

                      <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                      <View className="flex-row justify-end items-center mt-2">
                        <TouchableOpacity onPress={() => navigation.navigate("SessionDetail", { session, date: bookedDate })} className="bg-[#8C4A28] py-2 px-4 rounded-lg">
                          <Text className="text-white font-bold text-xs">View Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {tab === 'PAST' && (
            <View className="flex-1">
              <View className="flex-row items-center mb-6 mt-2">
                <View>
                  <Text className="text-[#1a202c] font-bold text-xl">Past Sessions</Text>
                  <Text className="text-[#64748b] text-sm font-normal">Review your previous rides and ratings.</Text>
                </View>
              </View>

              <View className="space-y-4">
                {pastSessions.length === 0 ? (
                  <View className="p-8 items-center justify-center bg-white rounded-2xl border border-[#e2e8f0] mb-4">
                    <Text className="text-[#64748b] font-bold">No past sessions found.</Text>
                  </View>
                ) : pastSessions.map((session, idx) => {
                  const me = session.participants?.find((p: any) =>
                    p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
                  );
                  const bookedDate = me?.date || session.date;
                  return (
                    <View key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                      <View className="flex-row justify-between items-start mb-3">
                        <Text className="text-[#1a202c] font-bold text-lg flex-1 mr-2">{session.title}</Text>
                        <View className="bg-[#fceddf] px-2 py-1 rounded-lg">
                          <Text className="text-[#8C4A28] font-bold text-[8px] uppercase tracking-widest">
                            {me?.status || 'COMPLETED'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center space-x-2 mb-4">
                        <Clock color="#64748b" size={16} />
                        <Text className="text-[#64748b] text-sm ml-2 font-normal">{session.timing} • {bookedDate}</Text>
                      </View>

                      <View className="flex-row justify-between items-center bg-[#f8fafc] p-3 rounded-2xl mb-4">
                        <View className="flex-1 border-r border-[#e2e8f0]">
                          <Text className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider mb-1">Location</Text>
                          <Text className="text-[#1a202c] font-semibold text-sm">{session.location}</Text>
                        </View>
                        <View className="flex-1 pl-4">
                          <Text className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider mb-1">Status</Text>
                          <Text className="text-[#1a202c] font-semibold text-sm capitalize">
                            {me?.status?.toLowerCase() || 'completed'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center border-t border-[#f1f5f9] pt-4">
                        <View className="flex-row items-center">
                          <Text className="text-xs text-[#64748b] mr-2 font-normal">Your Rating:</Text>
                          <View className="flex-row">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} color={i < 5 ? '#f59e0b' : '#cbd5e1'} fill={i < 5 ? '#f59e0b' : 'transparent'} />
                            ))}
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("SessionDetail", { session, date: bookedDate })}>
                          <Text className="text-[#8C4A28] font-bold text-sm">View Details →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
