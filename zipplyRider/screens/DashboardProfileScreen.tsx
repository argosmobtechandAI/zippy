import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Check, Info, AlertOctagon, Stethoscope, ClipboardList, Trophy, Medal, Star, Award, Wallet } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { Config } from '../api/config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
  const { user, rider } = useSelector((state: any) => state.getData);
  const dispatch = useDispatch<any>();

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUser());
      dispatch(fetchRider());
    }, [dispatch])
  );

  const essentialDetails = [
    { icon: AlertOctagon, title: 'Emergency Contact', desc: user?.emergencyContact || 'Not Set', color: '#85431E' },
    { icon: Stethoscope, title: 'Medical Information', desc: rider?.medical || 'No medical conditions reported.', color: '#DA7347' },
    { icon: ClipboardList, title: 'Safety Instructions', desc: rider?.instructions || 'Standard safety rules apply.', color: '#526FAE' },
  ];

  const walletBalance = (rider?.wallet || user?.riderWallet || 0).toLocaleString();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDDF' }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(133,67,30,0.1)' }}
        >
          <ArrowLeft color="#85431E" size={20} />
        </TouchableOpacity>
        <Text style={{ color: '#85431E', fontSize: 14, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' }}>Rider's Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(133,67,30,0.1)' }}
        >
          <Settings color="#85431E" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        {/* Avatar + Name Hero */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 32, paddingHorizontal: 24 }}>
          <View style={{ position: 'relative', marginBottom: 20 }}>
            <View style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 5, borderColor: '#fff', shadowColor: '#85431E', shadowOpacity: 0.15, shadowRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
              <Image
                source={{ uri: user?.profilePicture ? `${Config.API_BASE_URL.replace('/api', '')}${user.profilePicture}` : 'https://images.unsplash.com/photo-1579975002161-0f4db23932e6?auto=format&fit=crop&w=300&q=80' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <View style={{ position: 'absolute', bottom: 2, right: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: '#DA7347', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Check color="white" size={16} strokeWidth={3} />
            </View>
          </View>

          <Text style={{ fontSize: 28, fontWeight: '700', color: '#5C2E0E', textAlign: 'center', marginBottom: 4 }}>
            {user?.name || 'Rider Name'}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(133,67,30,0.55)', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            {rider?.level || 'Novice'} Equestrian
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(133,67,30,0.35)', fontWeight: '400' }}>
            Member since {user?.createdAt?.split('-')[0] || '2024'}
          </Text>
        </View>

        {/* Wallet Card – read only */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: '#5C2E0E', borderRadius: 24, padding: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Your Wallet Balance</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Wallet color="#DA7347" size={22} />
            </View>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>₹{walletBalance}</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 10 }}>Contact your center admin to top up your wallet.</Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 10 }}>
          {[
            { label: 'Total Rides', value: rider?.session_count ?? rider?.sessionCount ?? 0 },
            { label: 'Trophies', value: rider?.trophies?.length || 0 },
            { label: 'Safety Score', value: `${rider?.safetyBriefing?.length || 100}%` },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 14, alignItems: 'center', shadowColor: '#85431E', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#5C2E0E', marginBottom: 2 }}>{stat.value}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(133,67,30,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Essential Details */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#5C2E0E' }}>Essential Details</Text>
            <Info color="#85431E" size={18} opacity={0.4} />
          </View>

          {essentialDetails.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <TouchableOpacity key={idx} onPress={() => navigation.navigate('PersonalInformation')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#85431E', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: `${item.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                  <IconComp color={item.color} size={22} strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#5C2E0E', marginBottom: 3 }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(133,67,30,0.5)', lineHeight: 18 }}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Trophies */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Trophy color="#85431E" size={20} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#5C2E0E', marginLeft: 8 }}>My Trophies</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Trophies')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#DA7347' }}>View All</Text>
            </TouchableOpacity>
          </View>

          {(!rider?.trophies || rider.trophies.length === 0) ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 24, paddingVertical: 36, alignItems: 'center', shadowColor: '#85431E', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Trophy color="#e2d5c3" size={36} />
              <Text style={{ color: 'rgba(133,67,30,0.5)', fontSize: 14, fontWeight: '600', marginTop: 12 }}>No trophies earned yet.</Text>
              <Text style={{ color: 'rgba(133,67,30,0.35)', fontSize: 12, marginTop: 4 }}>Keep riding to unlock achievements!</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {rider.trophies.map((trophy: any, idx: number) => {
                const IconComp = getIconComp(trophy.icon);
                return (
                  <View key={idx} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 14, shadowColor: '#85431E', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }}>
                    <View style={{ backgroundColor: '#FAF3EC', alignSelf: 'flex-start', padding: 10, borderRadius: 14, marginBottom: 12 }}>
                      <IconComp color={trophy.color || '#85431E'} size={26} strokeWidth={2.5} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#5C2E0E', marginBottom: 3 }}>{trophy.title}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(133,67,30,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{trophy.subtitle || trophy.date}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
