import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import Icon from '@/constants/icon';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const TabBarBackgroundBlur = () => {
    return (
      <BlurView
        intensity={80}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          borderRadius: 35,
          overflow: 'hidden',
        }}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4925E9",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: Platform.OS === 'ios' ? TabBarBackgroundBlur : TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent', // Transparent to show blur
            position: 'absolute',
            bottom: 25,
            marginHorizontal: 20,
            height: 70,
            borderRadius: 35,
            elevation: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            paddingBottom: 5,
            paddingTop: 5,
          },
          android: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            position: 'absolute',
            bottom: 25,
            marginHorizontal: 20, 
            height: 70,
            borderRadius: 35,
            elevation: 24,
            paddingBottom: 5,
            paddingTop: 5,
          },
          default: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            position: 'absolute',
            bottom: 25,
            marginHorizontal: 20,
            height: 70,
            borderRadius: 35,
            elevation: 6,
            paddingBottom: 5,
            paddingTop: 5,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="Home" color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Icon name="CalendarDays" color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Icon name="MessageCircleMore" color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color }) => <Icon name="Bell" color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="User" color={color} size={24}/>,
        }}
      />
    </Tabs>
  );
}