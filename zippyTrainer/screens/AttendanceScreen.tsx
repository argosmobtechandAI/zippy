import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Platform, RefreshControl, Modal, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertTriangle, CalendarOff, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getSessionsByTrainerApi, getAllTrainersApi, getUserApi, updateAttendanceApi, updateLeaveApi, updateLeaveRequestApi, updateSessionApi, getAllHorsesApi } from '../api/api';
import RNDateTimePicker from '@react-native-community/datetimepicker';

const formatTimeWithAMPM = (timeStr: string) => {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'daily') return 'Daily';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${parts[2]}`;
    }
  }
  return dateStr;
};

export default function AttendanceScreen({ onBack }: { onBack?: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Attendance");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'noshow' | null>>({});
  const [individualRemarks, setIndividualRemarks] = useState<Record<string, string>>({});
  const [individualHorses, setIndividualHorses] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [allHorses, setAllHorses] = useState<any[]>([]);
  const [showHorseModal, setShowHorseModal] = useState(false);
  const [activeRiderForHorse, setActiveRiderForHorse] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSessions(), fetchTrainerData()]);
    setRefreshing(false);
  };
  const [showDatePicker, setShowDatePicker] = useState<'startDate' | 'endDate' | null>(null);
  const [date, setDate] = useState(new Date());
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    status: 'pending',
  });
  const [requesting, setRequesting] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [showAttendanceDatePicker, setShowAttendanceDatePicker] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  
  let filteredSessions = sessions.filter(s => {
    const sessionDate = s.date?.includes('T') ? s.date.split('T')[0] : s.date;
    
    if (selectedAttendanceDate) {
      return sessionDate === selectedAttendanceDate || sessionDate === "daily";
    } else {
      if (sessionDate === "daily") return true;
      if (!sessionDate) return false;
      return sessionDate >= todayStr;
    }
  });

  if (!selectedAttendanceDate) {
    filteredSessions = filteredSessions.sort((a, b) => {
      if (a.date === "daily") return -1;
      if (b.date === "daily") return 1;
      return a.date.localeCompare(b.date);
    }).slice(0, 9);
  }

  useEffect(() => {
    fetchSessions();
    fetchTrainerData();
  }, []);

  useEffect(() => {
    if (filteredSessions.length > 0) {
      const stillValid = filteredSessions.some(s => s.id === selectedSessionId);
      if (!stillValid) {
        handleSessionSwitch(filteredSessions[0].id);
      }
    } else {
      setSelectedSessionId(null);
      setAttendance({});
      setRemarks("");
    }
  }, [selectedAttendanceDate, sessions]);

  const handleSessionSwitch = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const initialAttendance: Record<string, any> = {};
      const initialRemarks: Record<string, string> = {};
      const initialHorses: Record<string, string> = {};
      session.participants?.forEach((p: any) => {
        initialAttendance[p.riderId] = p.status;
        initialRemarks[p.riderId] = p.remark || '';
        if (p.horse) initialHorses[p.riderId] = p.horse;
      });
      setAttendance(initialAttendance);
      setIndividualRemarks(initialRemarks);
      setIndividualHorses(initialHorses);
      setRemarks(session.note || "");
    }
  };

  const fetchHorses = async (tId: string, uId: string) => {
    try {
      const res = await apiFunction(getAllHorsesApi, [], {}, 'GET', true);
      if (res?.success) {
        // Only get horses assigned to this trainer
        console.log('Total horses fetched:', res.horses?.length);
        const trainerHorses = res.horses.filter((h: any) => {
           const match = h.trainerId === tId || h.trainer_id === tId || h.trainerId === uId || h.trainer_id === uId;
           if (match) console.log('Found assigned horse:', h.name, h.trainerId, h.trainer_id);
           return match;
        });
        console.log('Filtered trainer horses count:', trainerHorses.length, 'for tId:', tId, 'uId:', uId);
        setAllHorses(trainerHorses);
      }
    } catch (error) {
      console.error("Error fetching horses:", error);
    }
  };

  const fetchTrainerData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        const uid = parsedUser.id;
        setUserId(uid);
        const res = await apiFunction(getUserApi, [], {}, 'GET', true);
        const currentUserId = res?.success && res?.user ? res.user.id : uid;
        
        if (res?.success && res.user) {
          setTrainerData(res.user);
          if (res.user.leaveRequests) setLeaveRequests(res.user.leaveRequests);
        }
        
        const trainerRes = await apiFunction(getAllTrainersApi, [], {}, 'GET', true);
        const foundTrainer = trainerRes?.success ? trainerRes.trainers?.find((t: any) => (t.userId || t.user_id) === currentUserId) : null;
        if (foundTrainer) {
          fetchHorses(foundTrainer.id, currentUserId);
        } else {
          fetchHorses('', currentUserId);
        }
      }
    } catch (error) {
      console.error("Error fetching trainer data:", error);
    }
  };

  const fetchSessions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        Alert.alert('Error', 'User details not found. Please log in again.');
        return;
      }
      const currentUser = JSON.parse(userData);

      // Fetch latest user from API to get correct id
      const userRes = await apiFunction(getUserApi, [], {}, 'GET', true);
      const userId = userRes?.success ? userRes.user?.id : currentUser.id;

      if (!userId) {
        Alert.alert('Error', 'Could not resolve user identity.');
        return;
      }

      // Find trainer record by userId (same pattern as HomeScreen)
      const trainerRes = await apiFunction(getAllTrainersApi, [], {}, 'GET', true);
      if (!trainerRes?.success) {
        Alert.alert('Error', 'Could not load trainer data.');
        return;
      }

      const foundTrainer = trainerRes.trainers.find(
        (t: any) => (t.userId || t.user_id) === userId
      );

      if (!foundTrainer) {
        Alert.alert('Error', 'Trainer profile not found for this account.');
        return;
      }

      const res = await apiFunction(getSessionsByTrainerApi(foundTrainer.id), [], {}, 'GET', true);
      if (res?.success) {
        setSessions(res.sessions || []);
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === selectedSessionId);

  const handleAttendance = async (riderId: string, sessionId: string, status: 'present' | 'noshow') => {
    const resolvedSessionId = sessionId || currentSession?.id || '';

    // === DEBUG LOGS ===
    console.log('=== handleAttendance DEBUG ===');
    console.log('Input sessionId:', sessionId);
    console.log('Input riderId:', riderId);
    console.log('Input status:', status);
    console.log('currentSession:', JSON.stringify(currentSession));
    console.log('selectedSessionId state:', selectedSessionId);
    console.log('resolvedSessionId:', resolvedSessionId);
    console.log('All sessions IDs:', sessions.map((s: any) => s.id));
    console.log('Full API URL will be:', `${updateAttendanceApi}/${resolvedSessionId}/${riderId}`);
    // ==================

    if (!resolvedSessionId) {
      Alert.alert('Error', 'No session selected.');
      return;
    }
    if (!riderId) {
      Alert.alert('Error', 'Rider ID missing.');
      return;
    }
    // Optimistic UI update
    setAttendance(prev => ({ ...prev, [riderId]: status }));
    const res = await apiFunction(
      updateAttendanceApi,
      [resolvedSessionId, riderId],
      { status },
      'PUT',
      true
    );
    console.log('updateAttendance API response:', JSON.stringify(res));
    if (!res?.success) {
      // Revert on failure
      setAttendance(prev => ({ ...prev, [riderId]: null }));
      Alert.alert('Error', res?.message || 'Failed to update attendance. Please try again.');
    }
  };

  const handleAssignHorseImmediate = async (riderId: string, horseId: string) => {
    if (!selectedSessionId || !currentSession) return;
    
    setIndividualHorses(prev => ({ ...prev, [riderId]: horseId }));
    setShowHorseModal(false);

    const updatedParticipants = currentSession.participants.map((p: any) => ({
      ...p,
      horse: p.riderId === riderId ? horseId : (individualHorses[p.riderId] || p.horse || null)
    }));

    try {
      const res = await apiFunction(
        updateSessionApi,
        [selectedSessionId],
        { participants: updatedParticipants },
        'PUT',
        true
      );
      if (res?.success) {
        fetchSessions(true);
      } else {
        Alert.alert("Error", res?.message || "Failed to save assigned horse.");
      }
    } catch (error) {
      console.error("Assign horse error:", error);
      Alert.alert("Error", "Failed to assign horse to database.");
    }
  };

  const handleSaveSession = async () => {
    if (!selectedSessionId || !currentSession) return;

    setSaving(true);
    try {
      // Build updated participants with latest attendance marks
      const updatedParticipants = currentSession.participants.map((p: any) => ({
        ...p,
        attendance: attendance[p.riderId] || p.attendance || null,
        remark: individualRemarks[p.riderId] !== undefined ? individualRemarks[p.riderId] : (p.remark || ''),
        horse: individualHorses[p.riderId] || p.horse || null
      }));

      // apiFunction wraps body as { data: body }, so pass the object directly
      const res = await apiFunction(
        updateSessionApi,
        [selectedSessionId],
        { participants: updatedParticipants, note: remarks, status: 'COMPLETED' },
        'PUT',
        true
      );

      if (res && res.success) {
        Alert.alert('✅ Done', 'Session attendance saved and marked as completed.');
        fetchSessions();
      } else {
        Alert.alert('Error', res?.message || 'Failed to save session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!currentSession) return;
    
    try {
      const headers = ["Session Title", "Date", "Time", "Location", "Rider Name", "Horse Name", "Attendance", "Individual Remark"];
      let csvContent = headers.join(",") + "\n";

      const escapedTitle = `"${(currentSession.title || '').replace(/"/g, '""')}"`;
      const escapedLocation = `"${(currentSession.location || '').replace(/"/g, '""')}"`;
      const timing = `"${currentSession.timing || currentSession.time || ''}"`;
      const date = `"${currentSession.date || ''}"`;

      if (!currentSession.participants || currentSession.participants.length === 0) {
        const row = [escapedTitle, date, timing, escapedLocation, '""', '""', '""', '""'];
        csvContent += row.join(",") + "\n";
      } else {
        currentSession.participants.forEach((p: any) => {
          const horseId = individualHorses[p.riderId] || p.horse;
          const assignedHorse = allHorses.find((h: any) => h.id === horseId);
          const horseName = assignedHorse ? assignedHorse.name : '';
          
          const row = [
            escapedTitle,
            date,
            timing,
            escapedLocation,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${horseName.replace(/"/g, '""')}"`,
            `"${(attendance[p.riderId] || p.attendance || 'Pending').replace(/"/g, '""')}"`,
            `"${(individualRemarks[p.riderId] !== undefined ? individualRemarks[p.riderId] : (p.remark || '')).replace(/"/g, '""').replace(/\n/g, ' ')}"`
          ];
          csvContent += row.join(",") + "\n";
        });
      }

      const fileName = `session_${(currentSession.title || 'report').replace(/\s+/g, '_')}_${currentSession.date || 'date'}.csv`;
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, csvContent, 'utf8');

      await Share.open({
        title: 'Share Session CSV',
        url: `file://${path}`,
        type: 'text/csv',
        social: Share.Social.WHATSAPP
      });

    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error("Error sharing CSV:", error);
        Alert.alert("Share Error", "Could not share the file. Ensure WhatsApp is installed.");
      }
    }
  };


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
      const res = await apiFunction(updateLeaveApi, [userId], {
        leaves: {
          ...leaveForm,
          id: Math.random().toString(36).substr(2, 9),
          submittedAt: new Date().toISOString(),
          status: 'pending'
        }
      }, "PUT", true);

      if (res && res.success) {
        Alert.alert("Success", "Leave request submitted successfully.");
        setShowLeaveForm(false);
        setLeaveForm({
          reason: '',
          startDate: '',
          endDate: '',
          status: 'pending',
        });
        fetchTrainerData();
      } else {
        Alert.alert("Error", res?.message || "Failed to submit request.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setRequesting(false);
    }
  };

  console.log(trainerData, "trainerData")

  const handleApproveLeave = async (riderId: string, trainerId: string, status: string) => {
    try {
      const res = await apiFunction(updateLeaveRequestApi, [riderId, trainerId], {
        status
      }, "PUT", true);

      if (res && res.success) {
        Alert.alert("Success", "Leave request approved successfully.");
        fetchTrainerData();
      } else {
        Alert.alert("Error", res?.message || "Failed to approve request.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Custom Header */}
      <View className="flex-row items-center justify-start px-4 py-4 mb-2">
        <Text className="text-lg font-bold text-[#1a202c]">Session Attendance</Text>
      </View>

      <View className="flex-row border-b border-[#e2e8f0] mb-6">
        <TouchableOpacity
          className={`flex-1 items-center pb-3 ${activeTab === 'Attendance' ? 'border-b-2 border-[#1a202c]' : ''}`}
          onPress={() => setActiveTab('Attendance')}
        >
          <Text className={`font-bold ${activeTab === 'Attendance' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
            Attendance
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          className={`flex-1 items-center pb-3 ${activeTab === 'Leave Requests' ? 'border-b-2 border-[#1a202c]' : ''}`}
          onPress={() => setActiveTab('Leave Requests')}
        >
          <Text className={`font-bold ${activeTab === 'Leave Requests' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
            Leave Requests
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          className={`flex-1 items-center pb-3 ${activeTab === 'Apply Leave' ? 'border-b-2 border-[#1a202c]' : ''}`}
          onPress={() => setActiveTab('Apply Leave')}
        >
          <Text className={`font-bold ${activeTab === 'Apply Leave' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
            Apply Leave
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8C4A28" />
          <Text className="mt-4 text-[#8C4A28] font-bold">Loading sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <CalendarOff size={64} color="#94a3b8" />
          <Text className="mt-6 text-[#1a202c] text-xl font-bold text-center">No Sessions Scheduled</Text>
          <Text className="mt-2 text-[#64748b] text-center">You don't have any assigned riding sessions.</Text>
        </View>
      ) : activeTab === "Attendance" && <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C4A28" />
      }>
        {/* Date Filter Bar */}
        <View className="flex-row justify-between items-center mb-6">
           <TouchableOpacity
              onPress={() => setShowAttendanceDatePicker(true)}
              className="bg-white border border-[#e2e8f0] px-5 py-4 rounded-2xl flex-row items-center shadow-sm flex-1 mr-3"
           >
              <Calendar color="#8C4A28" size={18} className="mr-2" />
              <Text className="text-[#1a202c] font-bold text-sm">
                 {selectedAttendanceDate ? `Date: ${selectedAttendanceDate}` : "Show All Dates"}
              </Text>
           </TouchableOpacity>
           {selectedAttendanceDate && (
              <TouchableOpacity
                 onPress={() => setSelectedAttendanceDate(null)}
                 className="bg-[#e6d0b3] px-4 py-3.5 rounded-2xl"
              >
                 <Text className="text-[#8C4A28] font-bold text-xs">Clear Filter</Text>
              </TouchableOpacity>
           )}
        </View>

        {showAttendanceDatePicker && (
           <RNDateTimePicker
              value={selectedAttendanceDate ? new Date(selectedAttendanceDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                 setShowAttendanceDatePicker(false);
                 if (selectedDate) {
                    const formatted = selectedDate.toISOString().split('T')[0];
                    setSelectedAttendanceDate(formatted);
                 }
              }}
           />
        )}

        {/* Session Selector */}
        {filteredSessions.length === 0 ? (
           <View className="bg-white/50 border border-dashed border-[#e2e8f0] rounded-3xl p-8 items-center justify-center mb-6">
              <Text className="text-[#94a3b8] font-bold text-center">No sessions scheduled for this date</Text>
           </View>
        ) : (
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
             {filteredSessions.map(session => (
               <TouchableOpacity
                 key={session.id}
                 onPress={() => handleSessionSwitch(session.id)}
                 className={`mr-3 px-4 py-3 rounded-2xl border ${selectedSessionId === session.id ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2e8f0]'
                   }`}
               >
                  <Text className={`font-bold ${selectedSessionId === session.id ? 'text-white' : 'text-[#1a202c]'}`}>
                    {session.timing ? formatTimeWithAMPM(session.timing.includes(',') ? session.timing.split(',')[1].split('-')[0].trim() : session.timing.split('-')[0].trim()) : 'N/A'}
                  </Text>
                  <Text className={`text-[10px] font-semibold mt-0.5 ${selectedSessionId === session.id ? 'text-[#e6d0b3]' : 'text-[#8C4A28]'}`}>
                    {formatDate(session.date)}
                  </Text>
                  <Text className={`text-xs mt-1 ${selectedSessionId === session.id ? 'text-[#e6d0b3]' : 'text-[#64748b]'}`}>
                    {session.title}
                  </Text>
               </TouchableOpacity>
             ))}
           </ScrollView>
        )}

        {currentSession && (
          <>
            {/* Session Details Card */}
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-[#facc15]/20 px-2 py-1 rounded">
                  <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest uppercase">{currentSession.level || 'STANDARD'}</Text>
                </View>
                <Text className="text-[#94a3b8] text-[10px] font-bold ml-2">SESSION DETAILS</Text>
              </View>
          <Text className="text-[#1a202c] text-xl font-bold mb-3">{currentSession?.title}</Text>

          <View className="flex-row items-center mb-2">
            <View className="w-5 items-center mr-1">
              <Clock color="#64748b" size={14} />
            </View>
            <Text className="text-[#64748b] text-sm">{currentSession?.timing} • {currentSession?.date}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-5 items-center mr-1">
              <MapPin color="#64748b" size={14} />
            </View>
            <Text className="text-[#64748b] text-sm">{currentSession?.location}</Text>
          </View>

          <Image
            source={{ uri: currentSession?.image || 'https://images.unsplash.com/photo-1594911874499-28c0c4a4f896?q=80&w=600&auto=format&fit=crop' }}
            className="w-full h-40 rounded-xl"
          />
        </View>

        {/* Rider List */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-[#1a202c]">Rider List</Text>
          <Text className="text-[#64748b] text-sm font-semibold">{(currentSession?.participants?.filter((p: any) => p.status?.toUpperCase() === 'CONFIRMED') || []).length} Registered</Text>
        </View>

        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
          {(currentSession?.participants?.filter((p: any) => p.status?.toUpperCase() === 'CONFIRMED') || []).map((rider: any, index: number, arr: any[]) => (
            <View key={rider.riderId} className={index !== arr.length - 1 ? 'border-b border-[#e2e8f0]' : ''}>
              <View className="flex-row items-center py-4">
                <Image source={{ uri: rider.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }} className="w-12 h-12 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-[#1a202c] font-bold text-[15px] mb-0.5">{rider.name}</Text>
                  <Text className="text-[#94a3b8] text-xs font-semibold">
                    Role: <Text className="text-[#8C4A28]">{rider.type || 'Rider'}</Text>
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg items-center justify-center border ${(attendance[rider.riderId] === "present" || rider?.attendance?.toLowerCase() === "present")
                      ? 'bg-[#8C4A28] border-[#8C4A28]'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    onPress={() => handleAttendance(rider.riderId, currentSession.id, 'present')}
                  >
                    <Text className={`text-xs font-bold ${(attendance[rider.riderId] === "present" || rider?.attendance?.toLowerCase() === "present") ? 'text-white' : 'text-[#64748b]'
                      }`}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg items-center justify-center border ${(attendance[rider.riderId] === "noshow" || rider?.attendance?.toLowerCase() === 'noshow')
                      ? 'bg-red-500 border-red-500'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    onPress={() => handleAttendance(rider.riderId, currentSession.id, 'noshow')}
                  >
                    <Text className={`text-xs font-bold ${(attendance[rider.riderId] === "noshow" || rider.attendance?.toLowerCase() === 'noshow') ? 'text-white' : 'text-[#64748b]'
                      }`}>No-Show</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="pb-4 px-2 mt-[-8px]">
                <TextInput
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a202c] text-sm mb-2"
                  placeholder={`Add a specific remark for ${rider.name}...`}
                  placeholderTextColor="#94a3b8"
                  value={individualRemarks[rider.riderId] || ''}
                  onChangeText={(text) => setIndividualRemarks(prev => ({ ...prev, [rider.riderId]: text }))}
                  multiline
                />
                
                <TouchableOpacity 
                  className="bg-[#F6EDE2] border border-[#E6D9CC] rounded-xl px-4 py-2.5 flex-row justify-between items-center"
                  onPress={() => {
                    setActiveRiderForHorse(rider.riderId);
                    setShowHorseModal(true);
                  }}
                >
                  <Text className="text-[#8C4A28] font-semibold text-xs">
                    {individualHorses[rider.riderId] 
                      ? `Assigned Horse: ${allHorses.find((h: any) => h.id === individualHorses[rider.riderId])?.name || individualHorses[rider.riderId]}` 
                      : 'Assign a Horse'}
                  </Text>
                  <ChevronRight size={16} color="#8C4A28" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Trainer Remarks */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-[#1a202c] mb-4">Trainer Remarks</Text>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
            <TextInput
              className="text-[#1a202c] min-h-[80px]"
              placeholder="Enter session notes, performance feedback, or incidents..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>

          <View className="flex-row flex-wrap mb-8">
            <TouchableOpacity onPress={() => setRemarks("Good Progress")} className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-[#64748b] text-xs font-semibold">Good Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRemarks("Needs Drill Practice")} className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-[#64748b] text-xs font-semibold">Needs Drill Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRemarks("Equipment Check Required")} className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mb-2">
              <Text className="text-[#64748b] text-xs font-semibold">Equipment Check Required</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button — hidden when session already completed */}
        {currentSession?.status === 'COMPLETED' ? (
          <View className="w-full py-4 rounded-xl items-center flex-row justify-center mb-3 bg-green-50 border border-green-200">
            <CheckCircle2 color="#16a34a" size={20} />
            <Text className="text-green-700 font-bold text-lg ml-2">Session Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            className={`w-full py-4 rounded-xl items-center flex-row justify-center mb-3 ${saving ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
            onPress={handleSaveSession}
            disabled={saving}
          >
            {saving ? <ActivityIndicator size="small" color="white" /> : <CheckCircle2 color="white" size={20} className="mr-2" />}
            <Text className="text-white font-bold text-lg ml-2">{saving ? 'Saving...' : 'Complete & Save Session'}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          className="w-full py-4 rounded-xl items-center flex-row justify-center mb-3 bg-[#25D366]"
          onPress={handleShareWhatsApp}
        >
          <Text className="text-white font-bold text-lg">Share CSV to WhatsApp</Text>
        </TouchableOpacity>

          <Text className="text-center text-[#94a3b8] text-xs font-semibold mb-6">
            {currentSession.status === 'COMPLETED'
              ? 'This session has been completed and logged.'
              : 'Saving will notify riders and update their training logs.'}
          </Text>
          </>
        )}

      </ScrollView>}


      {activeTab === "Apply Leave" &&
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C4A28" />
        }>
          {!showLeaveForm ? (
            <>
              <TouchableOpacity
                onPress={() => setShowLeaveForm(true)}
                className="bg-[#8C4A28] flex-row justify-center items-center py-4 rounded-xl mb-6 shadow-sm"
              >
                <CalendarRange color="white" size={20} className="mr-2" />
                <Text className="text-white font-bold text-lg">Request New Leave</Text>
              </TouchableOpacity>

              <Text className="text-lg font-bold text-[#1a202c] mb-4">Pending Requests</Text>
              {trainerData?.leaves?.filter((r: any) => r.status.toLowerCase() === 'pending').length > 0 ? (
                trainerData.leaves.filter((r: any) => r.status.toLowerCase() === 'pending').map((r: any) => (
                  <View key={r.id} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="text-[#1a202c] font-bold text-lg mb-1">{r.reason}</Text>
                        <Text className="text-[#64748b] text-xs font-semibold">{r.startDate} - {r.endDate}</Text>
                      </View>
                      <View className="bg-[#fef08a]/40 px-3 py-1.5 rounded-lg border border-[#fef08a]">
                        <Text className="text-[#ca8a04] text-[10px] font-bold tracking-wider">PENDING</Text>
                      </View>
                    </View>
                    <Text className="text-[#64748b] text-sm mb-2">{r.reason}</Text>
                    <Text className="text-[#94a3b8] text-[10px]">Submitted on {new Date(r.submittedAt).toLocaleDateString()}</Text>
                  </View>
                ))
              ) : (
                <View className="bg-white/50 border border-dashed border-[#e2e8f0] rounded-3xl p-8 items-center justify-center mb-8">
                  <Text className="text-[#94a3b8] font-bold">No pending requests</Text>
                </View>
              )}

              <Text className="text-lg font-bold text-[#1a202c] mb-4">Leave History</Text>
              {trainerData?.leaves?.length > 0 ? (
                trainerData.leaves?.map((r: any) => (
                  <View key={r.id} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View>
                        <Text className="text-[#1a202c] font-bold text-lg mb-1">{r.reason}</Text>
                        <Text className="text-[#64748b] text-xs font-semibold">{r.startDate} - {r.endDate}</Text>
                      </View>
                      <View className={`px-3 py-1.5 rounded-lg border ${r.status === 'APPROVED' ? 'bg-[#f0fff4] border-[#c6f6d5]' : 'bg-red-50 border-red-100'}`}>
                        <Text className={`text-[10px] font-bold tracking-wider ${r.status === 'APPROVED' ? 'text-[#16a34a]' : 'text-red-600'}`}>{r.status}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="bg-white/50 border border-dashed border-[#e2e8f0] rounded-3xl p-8 items-center justify-center">
                  <Text className="text-[#94a3b8] font-bold">No past leaves recorded</Text>
                </View>
              )}
            </>
          ) : (
            <View className="bg-white rounded-3xl p-6 shadow-md border border-[#e2e8f0]">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-xl font-bold text-[#1a202c]">Request Leave</Text>
                <TouchableOpacity onPress={() => setShowLeaveForm(false)}>
                  <XCircle color="#94a3b8" size={24} />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Leave Reason</Text>
                <View className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl overflow-hidden">
                  <TextInput
                    value={leaveForm.reason}
                    onChangeText={t => setLeaveForm({ ...leaveForm, reason: t })}
                    placeholder="e.g. Annual Vacation, Medical"
                    placeholderTextColor="#94a3b8"
                    className="px-4 py-4 text-[#1a202c] font-bold"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                  <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Start Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker('startDate')}>
                    <View pointerEvents="none">
                      <TextInput
                        value={leaveForm.startDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-4 text-[#1a202c] font-bold"
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">End Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker('endDate')}>
                    <View pointerEvents="none">
                      <TextInput
                        value={leaveForm.endDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-4 text-[#1a202c] font-bold"
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <RNDateTimePicker
                  value={leaveForm[showDatePicker] ? new Date(leaveForm[showDatePicker]) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(null);
                    if (selectedDate) {
                      const formatted = selectedDate.toISOString().split('T')[0];
                      setLeaveForm(prev => ({
                        ...prev,
                        [showDatePicker]: formatted
                      }));
                    }
                  }}
                />
              )}



              <TouchableOpacity
                onPress={handleRequestLeave}
                disabled={requesting}
                className={`py-4 rounded-xl items-center justify-center flex-row ${requesting ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
              >
                {requesting ? <ActivityIndicator color="white" size="small" /> : <CalendarRange color="white" size={20} className="mr-2" />}
                <Text className="text-white font-bold text-lg ml-2">{requesting ? 'Submitting...' : 'Submit Request'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      }

      {activeTab === "Leave Requests" &&
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C4A28" />
        }>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-[#1a202c]">Leave Requests</Text>
            <View className="bg-[#8C4A28] px-3 py-1.5 rounded-lg">
              <Text className="text-white text-[10px] font-bold">{leaveRequests.length} Actionable</Text>
            </View>
          </View>

          {/* Request 1 */}
          {leaveRequests?.length === 0 ? (
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
              <Text className="text-[#1a202c] font-bold text-lg mb-1">No Leave Requests</Text>
            </View>
          ) : (
            leaveRequests?.map((request, index) => (
              <View key={index} className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
                <View className="flex-row justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-2">{request.startDate} - {request.endDate}</Text>
                    <Text className="text-[#1a202c] font-bold text-lg mb-1">{request.name}</Text>
                    <Text className="text-[#64748b] text-xs font-semibold mb-2">Reason: {request.reason}</Text>
                  </View>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                    className="w-16 h-16 rounded-full ml-3"
                  />
                </View>

                {/* Actions */}
                <View className="flex-row justify-between pt-4 border-t border-[#f1f5f9]">
                  <TouchableOpacity onPress={() => handleApproveLeave(request.riderId, trainerData.id, "APPROVED")} className="flex-1 bg-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center mr-2">
                    <CheckCircle2 color="white" size={18} className="mr-2" />
                    <Text className="text-white font-bold">Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleApproveLeave(request.riderId, trainerData.id, "REJECTED")} className="flex-1 bg-white border border-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center ml-2">
                    <XCircle color="#8C4A28" size={18} className="mr-2" />
                    <Text className="text-[#8C4A28] font-bold">Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )))}



          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#1a202c]">Recently Processed</Text>
          </View>

          {/* Processed Request */}
          {/* <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0]">
            <View className="flex-row justify-between mb-2">
              <View className="flex-1">
                <Text className="text-[#1a202c] font-bold text-base mb-1">Sarah Chen</Text>
                <Text className="text-[#64748b] text-xs font-semibold">NOV 05 - NOV 06 • School Exams</Text>
              </View>
              <View className="bg-[#f0fff4] px-3 py-1.5 rounded-lg border border-[#c6f6d5] self-start">
                <Text className="text-[#16a34a] text-[10px] font-bold tracking-wider">APPROVED</Text>
              </View>
            </View>
          </View> */}
        </ScrollView>
      }

      {showHorseModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showHorseModal}
          onRequestClose={() => setShowHorseModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#F5EDDF] rounded-t-3xl max-h-[80%]">
              <View className="p-4 border-b border-[#E6D9CC] flex-row justify-between items-center">
                <Text className="text-lg font-bold text-[#5C2E0E]">Assign Horse</Text>
                <TouchableOpacity onPress={() => setShowHorseModal(false)}>
                  <XCircle color="#85431E" size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {allHorses.length === 0 ? (
                  <Text className="text-center text-gray-500 my-4">No horses available for this trainer.</Text>
                ) : (
                  allHorses.map(horse => (
                    <TouchableOpacity
                      key={horse.id}
                      className="bg-white border border-[#E6D9CC] p-4 rounded-xl mb-3 flex-row items-center shadow-sm"
                      onPress={() => {
                        if (activeRiderForHorse) {
                          handleAssignHorseImmediate(activeRiderForHorse, horse.id);
                        } else {
                          setShowHorseModal(false);
                        }
                      }}
                    >
                      <View className="w-10 h-10 rounded-full bg-[#F6EDE2] items-center justify-center mr-3 border border-[#E6D9CC]">
                        <Text className="text-[#8C4A28] font-black">{horse.name?.charAt(0)}</Text>
                      </View>
                      <Text className="text-[#5C2E0E] font-bold flex-1">{horse.name}</Text>
                      {activeRiderForHorse && individualHorses[activeRiderForHorse] === horse.id && (
                        <CheckCircle2 color="#16a34a" size={20} />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}
