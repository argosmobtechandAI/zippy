import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, ChevronRight, CheckCircle2, XCircle, AlertCircle, Edit } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { workoutsApi } from '../api/api';

const STATUS_TABS = [
    { key: 'ALL', label: 'All' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' }
];

export default function TrainerWorkoutsScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [trainerId, setTrainerId] = useState('');

    // Modal state for updating workout
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [workoutStatus, setWorkoutStatus] = useState('Scheduled');
    const [trainerComment, setTrainerComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchWorkouts = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                const id = parsed.id;
                setTrainerId(id);

                const res = await apiFunction(workoutsApi, [], { trainerId: id }, 'GET', true);
                if (res && res.success) {
                    setWorkouts(res.workouts || []);
                } else {
                    Alert.alert('Error', 'Failed to retrieve workouts.');
                }
            }
        } catch (err) {
            console.error('Failed to fetch trainer workouts:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    const handleOpenModal = (w: any) => {
        setSelectedWorkout(w);
        setWorkoutStatus(w.status || 'Scheduled');
        setTrainerComment(w.trainerComment || '');
        setModalVisible(true);
    };

    const handleSaveWorkout = async () => {
        if (!selectedWorkout) return;
        setIsSaving(true);
        try {
            const res = await apiFunction(
                `${workoutsApi}/${selectedWorkout.id}`,
                [],
                { status: workoutStatus, trainerComment },
                'PUT',
                true
            );

            if (res && res.success) {
                Alert.alert('Success', 'Workout updated successfully.');
                setModalVisible(false);
                setSelectedWorkout(null);
                fetchWorkouts();
            } else {
                Alert.alert('Error', res?.message || 'Failed to update workout.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredWorkouts = workouts.filter(w => {
        return activeTab === 'ALL' || w.status === activeTab;
    });

    return (
        <SafeAreaView className="flex-1 bg-brand-beige">
            {/* Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-brand-brown/5">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10 mr-4"
                >
                    <ArrowLeft color="#85431E" size={20} />
                </TouchableOpacity>
                <Text className="text-brand-brown font-display text-lg uppercase tracking-widest flex-1">Assigned Workouts</Text>
            </View>

            {/* Status Tabs */}
            <View className="flex-row px-4 py-3 bg-white/50 border-b border-brand-brown/5">
                {STATUS_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 mx-1 rounded-xl items-center ${activeTab === tab.key ? 'bg-brand-brown' : 'bg-transparent'}`}
                    >
                        <Text className={`text-[11px] font-display uppercase tracking-widest ${activeTab === tab.key ? 'text-white' : 'text-brand-brown/60'}`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#85431E" />
                    <Text className="text-brand-brown/50 font-body text-xs mt-4">Loading assigned workouts...</Text>
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWorkouts(true)} colors={['#85431E']} />}
                >
                    {filteredWorkouts.length === 0 ? (
                        <View className="items-center py-20">
                            <Calendar color="#85431E" size={40} opacity={0.3} />
                            <Text className="text-brand-brown/40 font-body text-sm mt-4 text-center">No workouts assigned for this selection.</Text>
                        </View>
                    ) : (
                        filteredWorkouts.map((w) => {
                            const isCompleted = w.status === 'Completed';
                            const isCancelled = w.status === 'Cancelled';

                            return (
                                <View key={w.id} className="bg-white rounded-[24px] p-5 mb-4 border border-brand-brown/5 shadow-sm">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1">
                                            <Text className="text-brand-brown font-display text-lg mb-0.5">{w.horseName}</Text>
                                            <Text className="text-brand-orange font-body text-xs font-bold">{w.workoutType} • {w.duration} Min</Text>
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-full ${isCompleted ? 'bg-green-50' : isCancelled ? 'bg-red-50' : 'bg-blue-50'}`}>
                                            <Text className={`text-[9px] font-display uppercase tracking-widest ${isCompleted ? 'text-green-600' : isCancelled ? 'text-red-500' : 'text-blue-600'}`}>
                                                {w.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Stats */}
                                    <View className="flex-row items-center border-t border-b border-brand-brown/5 py-3 mb-3 gap-4">
                                        <View className="flex-row items-center gap-1.5">
                                            <Calendar color="#85431E" size={14} opacity={0.6} />
                                            <Text className="text-brand-brown/60 text-xs font-semibold">{w.date}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1.5">
                                            <Clock color="#85431E" size={14} opacity={0.6} />
                                            <Text className="text-brand-brown/60 text-xs font-semibold">{w.intensity} Intensity</Text>
                                        </View>
                                    </View>

                                    {/* Stable Instructions */}
                                    {w.notes ? (
                                        <View className="bg-brand-beige/30 p-3.5 rounded-xl border border-brand-brown/5 mb-3">
                                            <Text className="text-[10px] font-display uppercase tracking-widest text-brand-brown/40 mb-1">Stable Instructions</Text>
                                            <Text className="text-brand-brown/80 font-body text-xs leading-relaxed">{w.notes}</Text>
                                        </View>
                                    ) : null}

                                    {/* Trainer Comment */}
                                    {w.trainerComment ? (
                                        <View className="bg-green-50/20 p-3.5 rounded-xl border border-green-700/5 mb-3">
                                            <Text className="text-[10px] font-display uppercase tracking-widest text-green-700/40 mb-1">Your Comment</Text>
                                            <Text className="text-green-800 font-body text-xs leading-relaxed">{w.trainerComment}</Text>
                                        </View>
                                    ) : null}

                                    {/* Action button */}
                                    {w.status === 'Scheduled' && (
                                        <TouchableOpacity 
                                            onPress={() => handleOpenModal(w)}
                                            className="bg-brand-brown mt-2 py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                                        >
                                            <Edit color="white" size={16} />
                                            <Text className="text-white font-display text-xs uppercase tracking-widest">Update Workout</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* Edit / Update Status Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-brand-brown font-display text-lg uppercase tracking-wider">Update Workout Plan</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <XCircle color="#85431E" size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-brand-brown/60 text-xs font-semibold uppercase tracking-wider mb-2">Select Status</Text>
                        <View className="flex-row gap-2 mb-5">
                            {['Completed', 'Cancelled'].map(status => {
                                const isActive = workoutStatus === status;
                                return (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => setWorkoutStatus(status)}
                                        className={`flex-1 py-3 rounded-xl border items-center ${isActive ? 'bg-brand-brown border-brand-brown' : 'bg-white border-brand-brown/20'}`}
                                    >
                                        <Text className={`text-xs font-display uppercase tracking-wider ${isActive ? 'text-white' : 'text-brand-brown/60'}`}>
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text className="text-brand-brown/60 text-xs font-semibold uppercase tracking-wider mb-2">Trainer's Observations / Comment</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            value={trainerComment}
                            onChangeText={setTrainerComment}
                            placeholder="Enter any physical comments, performance feedback, or remarks..."
                            placeholderTextColor="#A59588"
                            className="bg-[#FDF8F2] border border-brand-brown/10 rounded-2xl p-4 text-xs font-semibold text-brand-brown mb-6"
                            style={{ height: 100, textAlignVertical: 'top' }}
                        />

                        <TouchableOpacity 
                            disabled={isSaving}
                            onPress={handleSaveWorkout}
                            className="bg-brand-orange py-4 rounded-xl items-center"
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-display text-xs uppercase tracking-widest">Submit Update</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(30, 35, 48, 0.6)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        backgroundColor: '#FDF8F2',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    }
});
