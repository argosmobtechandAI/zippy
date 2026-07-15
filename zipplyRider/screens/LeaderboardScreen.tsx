import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Award, Medal, Crown, X, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { apiFunction } from '../api/apifunction';
import { getLeaderboardApi } from '../api/api';
import { Config } from '../api/config';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const { user: currentUser, rider: currentRider } = useSelector((state: any) => state.getData);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedRider, setSelectedRider] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiFunction(getLeaderboardApi, [], {}, "GET", true);
      if (res && res.success) {
        const activeLeaderboard = (res.leaderboard || []).filter(
          (item: any) => (item.championshipPoints || 0) > 0
        );
        setLeaderboard(activeLeaderboard);
      }
    } catch (error) {
      console.error("Fetch leaderboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: '#FEF9C3',
          border: '#FDE047',
          text: '#854D0E',
          iconColor: '#EAB308',
          icon: Crown
        };
      case 2:
        return {
          bg: '#F1F5F9',
          border: '#E2E8F0',
          text: '#334155',
          iconColor: '#94A3B8',
          icon: Medal
        };
      case 3:
        return {
          bg: '#FFEDD5',
          border: '#FED7AA',
          text: '#9A3412',
          iconColor: '#F97316',
          icon: Medal
        };
      default:
        return {
          bg: '#fff',
          border: '#f1f5f9',
          text: '#64748b',
          iconColor: '#cbd5e1',
          icon: Award
        };
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 1).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Find current user's position in leaderboard
  const currentUserRankIndex = leaderboard.findIndex(
    (item) => item.userId === currentUser?.id || item.id === currentRider?.id
  );
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;
  const currentUserData = currentUserRankIndex !== -1 ? leaderboard[currentUserRankIndex] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDDF' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#e2d5c3' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16, padding: 8, backgroundColor: '#fceddf', borderRadius: 20 }}>
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text style={{ color: '#8C4A28', fontWeight: 'bold', fontSize: 20 }}>Global Leaderboard</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8C4A28" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: currentUserRank ? 100 : 40 }} showsVerticalScrollIndicator={false}>
            {leaderboard.length === 0 ? (
              <View style={{ py: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 24 }}>
                <Trophy color="#cbd5e1" size={48} />
                <Text style={{ color: '#64748b', fontWeight: 'bold', marginTop: 16 }}>No riders on the leaderboard yet.</Text>
              </View>
            ) : (
              leaderboard.map((item, index) => {
                const rank = index + 1;
                const config = getRankStyle(rank);
                const IconComp = config.icon;
                const isMe = item.userId === currentUser?.id || item.id === currentRider?.id;

                 return (
                  <TouchableOpacity
                    key={item.id || index}
                    onPress={() => setSelectedRider(item)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: config.bg,
                      borderRadius: 24,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isMe ? '#DA7347' : config.border,
                      shadowColor: '#85431E',
                      shadowOpacity: rank <= 3 ? 0.08 : 0.03,
                      shadowRadius: 8,
                      elevation: rank <= 3 ? 3 : 1
                    }}
                  >
                    {/* Rank Badge */}
                    <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      {rank <= 3 ? (
                        <IconComp color={config.iconColor} size={26} strokeWidth={2.5} />
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: '800', color: config.text }}>#{rank}</Text>
                      )}
                    </View>

                    {/* Avatar */}
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAF3EC', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: 'rgba(133,67,30,0.1)' }}>
                      {item.profilePicture ? (
                        <Image
                          source={{ uri: item.profilePicture.startsWith('http') ? item.profilePicture : `${Config.API_BASE_URL.replace('/api', '')}${item.profilePicture}` }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#8C4A28' }}>
                          {getInitials(item.name)}
                        </Text>
                      )}
                    </View>

                    {/* Name */}
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          fontWeight: isMe ? '800' : '700',
                          color: isMe ? '#DA7347' : '#1a202c'
                        }}
                      >
                        {item.name}
                        {isMe && ' (You)'}
                      </Text>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(133,67,30,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                        {item.championshipRecords?.length || 0} Competitions
                      </Text>
                    </View>

                    {/* Points Pill */}
                    <View style={{ backgroundColor: rank <= 3 ? 'rgba(255,255,255,0.6)' : '#FAF3EC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: isMe ? '#DA7347' : '#8C4A28' }}>
                        {item.championshipPoints || 0} pts
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Sticky My Rank Bar */}
          {currentUserRank && currentUserRank > 3 && currentUserData && (
            <TouchableOpacity
              onPress={() => setSelectedRider(currentUserData)}
              activeOpacity={0.9}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#8C4A28',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 10
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff', marginRight: 16 }}>#{currentUserRank}</Text>
              
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF3EC', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                {currentUser?.profilePicture ? (
                  <Image
                    source={{ uri: currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `${Config.API_BASE_URL.replace('/api', '')}${currentUser.profilePicture}` }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#8C4A28' }}>
                    {getInitials(currentUser?.name)}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
                  {currentUser?.name}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Your Standing</Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff' }}>
                {currentUserData.championshipPoints || 0} pts
              </Text>
            </TouchableOpacity>
          )}

          {/* Points History Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={selectedRider !== null}
            onRequestClose={() => setSelectedRider(null)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => setSelectedRider(null)}
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            >
              <TouchableOpacity 
                activeOpacity={1}
                style={{
                  backgroundColor: '#F5EDDF',
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                  maxHeight: '80%',
                  paddingTop: 8,
                }}
              >
                {/* Drag handle */}
                <View style={{
                  width: 40,
                  height: 5,
                  backgroundColor: 'rgba(140, 74, 40, 0.2)',
                  borderRadius: 2.5,
                  alignSelf: 'center',
                  marginVertical: 8,
                }} />

                {/* Modal Header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingBottom: 15,
                  borderBottomWidth: 1,
                  borderColor: '#e2d5c3'
                }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '800', color: '#8C4A28' }}>
                      {selectedRider?.name}'s History
                    </Text>
                    <Text style={{ fontSize: 12, color: 'rgba(140, 74, 40, 0.6)', fontWeight: '600', marginTop: 2 }}>
                      Total Points: {selectedRider?.championshipPoints || 0} pts
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedRider(null)}
                    style={{
                      padding: 6,
                      backgroundColor: '#fceddf',
                      borderRadius: 20,
                    }}
                  >
                    <X color="#8C4A28" size={20} />
                  </TouchableOpacity>
                </View>

                {/* History List */}
                <FlatList
                  data={selectedRider?.championshipRecords || []}
                  keyExtractor={(rec, idx) => rec.id || idx.toString()}
                  contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2d5c3', borderStyle: 'dashed', marginVertical: 20 }}>
                      <Award color="#cbd5e1" size={48} strokeWidth={1.5} />
                      <Text style={{ color: '#64748b', fontWeight: 'bold', marginTop: 16 }}>No points history found.</Text>
                    </View>
                  )}
                  renderItem={({ item: rec, index: idx }) => (
                    <View style={{
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      shadowColor: '#85431E',
                      shadowOpacity: 0.03,
                      shadowRadius: 4,
                      elevation: 1,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#fceddf',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Award color="#8C4A28" size={20} />
                      </View>

                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '700', color: '#1a202c', marginBottom: 2 }}>
                          {rec.competitionName}
                        </Text>
                        {(() => {
                          const catOrRound = rec.categoryOrRound || '';
                          const parts = catOrRound.split(' • ');
                          const category = parts.length > 1 ? parts[0] : '';
                          const round = parts.length > 1 ? parts[1] : parts[0];
                          return (
                            <View style={{ marginBottom: 4 }}>
                              {category ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                  <Text style={{ fontSize: 9, color: 'rgba(140, 74, 40, 0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Category: </Text>
                                  <Text style={{ fontSize: 9, color: '#8C4A28', fontWeight: '800', backgroundColor: '#fceddf', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, textTransform: 'uppercase' }}>
                                    {category}
                                  </Text>
                                </View>
                              ) : null}
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#8C4A28' }}>
                                {round || 'General'}
                              </Text>
                            </View>
                          );
                        })()}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Calendar color="#94a3b8" size={12} />
                          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', marginLeft: 4 }}>
                            {rec.date}
                          </Text>
                        </View>
                      </View>

                      <View style={{
                        backgroundColor: '#E8F5E9',
                        borderColor: '#C8E6C9',
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}>
                        <Text style={{ color: '#2E7D32', fontWeight: '800', fontSize: 13 }}>
                          +{rec.points}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}
