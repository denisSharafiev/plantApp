import { Tabs } from 'expo-router';
import React from 'react';
import TabBarIcon from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#32CD32',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'home' : 'home-outline'} 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Календарь',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'calendar' : 'calendar-outline'} 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Добавить',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Заметки',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'document-text' : 'document-text-outline'} 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Архив',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'archive' : 'archive-outline'} 
              focused={focused} 
            />
          ),
        }}
      />
    </Tabs>
  );
}