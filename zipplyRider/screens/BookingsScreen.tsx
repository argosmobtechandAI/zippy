import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, TextInput, Alert, Platform } from 'react-native';
import { ArrowLeft, Info, ArrowUpRight, Calendar, User as UserIcon, Clock, Star, CalendarRange, XCircle } from 'lucide-react-native';
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
    const isJoined = rider?.joinedSessions?.includes(s.id);
    if (!isJoined) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    return !isSessionPassed(bookedDate, s.timing);
  });

  const pendingSessions = sessions.filter(s => {
    const isPending = rider?.pendingSessions?.includes(s.id);
    if (!isPending) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    return !isSessionPassed(bookedDate, s.timing);
  });

  const pastSessions = sessions.filter(s => {
    const isAssociated = rider?.joinedSessions?.includes(s.id) || rider?.pendingSessions?.includes(s.id);
    if (!isAssociated) return false;

    const me = s.participants?.find((p: any) =>
      p.riderId && currentRiderId && String(p.riderId).toLowerCase() === String(currentRiderId).toLowerCase()
    );
    const bookedDate = me?.date || s.date;
    const status = me?.status?.toUpperCase();

    return status === 'PRESENT' || status === 'NOSHOW' || isSessionPassed(bookedDate, s.timing);
  });

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-lg">MY BOOKINGS</Text>
      </View>

      {/* Top Tabs */}
      <View className="flex-row bg-white border-b border-[#e2e8f0]">
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === 'CONFIRMED' ? 'border-[#8C4A28]' : 'border-transparent'}`}
          onPress={() => setTab('CONFIRMED')}
        >
          <Text className={`font-bold text-xs ${tab === 'CONFIRMED' ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>CONFIRMED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === 'PENDING' ? 'border-[#8C4A28]' : 'border-transparent'}`}
          onPress={() => setTab('PENDING')}
        >
          <Text className={`font-bold text-xs ${tab === 'PENDING' ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>PENDING</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === 'PAST' ? 'border-[#8C4A28]' : 'border-transparent'}`}
          onPress={() => setTab('PAST')}
        >
          <Text className={`font-bold text-xs ${tab === 'PAST' ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>PAST</Text>
        </TouchableOpacity>
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
                <Text className="text-[#64748b] text-xs leading-relaxed mb-2">
                  Cancellations made within 24 hours of the session start time are non-refundable. Please contact support for emergencies or specific inquiries.
                </Text>
                <TouchableOpacity className="flex-row items-center text-[#8C4A28]">
                  <Text className="text-[#8C4A28] font-bold text-xs mr-1">Full Policy</Text>
                  <ArrowUpRight color="#8C4A28" size={12} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (Platform.OS === 'android') setShowDatePicker(null);
                    if (selectedDate) {
                      setLeaveForm({
                        ...leaveForm,
                        [showDatePicker]: selectedDate.toISOString().split('T')[0],
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
                          <Text className="text-[#64748b] text-xs">{session.timing} • {bookedDate}</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <View className="w-6 items-center mr-1">
                            <UserIcon color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs">Location: {session.location}</Text>
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
                            <TextInput
                              value={leaveForm.reason}
                              onChangeText={t => setLeaveForm({ ...leaveForm, reason: t })}
                              placeholder="e.g. Vacation, Medical"
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
                          <Text className="text-[#64748b] text-xs">{session.timing} • {bookedDate}</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                          <View className="w-6 items-center mr-1">
                            <UserIcon color="#8C4A28" size={14} />
                          </View>
                          <Text className="text-[#64748b] text-xs">Location: {session.location}</Text>
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
                  <Text className="text-[#64748b] text-sm">Review your previous rides and ratings.</Text>
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
                        <Text className="text-[#64748b] text-sm ml-2">{session.timing} • {bookedDate}</Text>
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
                          <Text className="text-xs text-[#64748b] mr-2">Your Rating:</Text>
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
    </View>
  );
}
