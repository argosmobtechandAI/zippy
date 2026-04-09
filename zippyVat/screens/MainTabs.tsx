import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Shield, Stethoscope, ClipboardList, User } from 'lucide-react-native';
import HomeScreen from './HomeScreen';
import HorsesScreen from './HorsesScreen';
import HealthScreen from './HealthScreen';
import RecordsScreen from './RecordsScreen';
import ProfileScreen from './ProfileScreen';

export default function MainTabs({ onNavigateGlobal }: { onNavigateGlobal: (screen: string) => void }) {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen setActiveTab={setActiveTab} />;
      case 'Horses':
        return <HorsesScreen />;
      case 'Health':
        return <HealthScreen />;
      case 'Records':
        return <RecordsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} />;
    }
  };

  const tabs = [
    { id: 'Home', icon: Home, label: 'HOME' },
    { id: 'Horses', icon: Shield, label: 'HORSES' },
    { id: 'Health', icon: Stethoscope, label: 'HEALTH' },
    { id: 'Records', icon: ClipboardList, label: 'RECORDS' },
    { id: 'Profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View className="bg-[#F5EDDF] flex-row justify-around items-center pt-3 pb-6 border-t border-[#d1c2a3] shadow-lg">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              className="items-center justify-center pt-2 w-[18%]"
              onPress={() => setActiveTab(tab.id)}
            >
              <View className={`mb-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                <IconComponent color={isActive ? '#8C4A28' : '#9ca3af'} size={24} />
              </View>
              <Text
                className={`text-[8px] font-bold tracking-widest ${
                  isActive ? 'text-[#8C4A28]' : 'text-[#9ca3af]'
                }`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
