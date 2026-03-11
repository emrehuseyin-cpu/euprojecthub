import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#4F6EF7',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: '#fff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                },
                headerTitleStyle: {
                    fontWeight: '800',
                    fontSize: 18,
                    color: '#1e293b',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Panel',
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="projeler"
                options={{
                    title: 'Projeler',
                    tabBarLabel: 'Projeler',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'folder' : 'folder-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="faaliyetler"
                options={{
                    title: 'Faaliyetler',
                    tabBarLabel: 'Faaliyetler',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="katilimcilar"
                options={{
                    title: 'Katılımcılar',
                    tabBarLabel: 'Katılımcılar',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="raporlar"
                options={{
                    title: 'Raporlar',
                    tabBarLabel: 'Raporlar',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
