import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [refreshKey, setRefreshKey] = useState(0); 
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserRole = await AsyncStorage.getItem('userRole');
                if (storedUserRole) {
                    setUserRole(JSON.parse(storedUserRole));
                } else {
                    setUserRole(null); // 如果没有存储的角色，确保设置为 null
                }
            } catch (error) {
                console.error('Error fetching user data', error);
            }
        };
        fetchUserData();
    }, []); // 只在组件挂载时运行
    
    const handleTabPress = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarStyle: { display: 'flex' }, // 显示标签栏
            }}>
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
                    ),
                }}
                key={refreshKey}
                listeners={{
                    tabPress: (e) => {
                        handleTabPress();
                    },
                }}
            />
            <Tabs.Screen
                name="myAccount"
                options={{
                    title: 'My Account',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
                    ),
                }}
                key={refreshKey}
                listeners={{
                    tabPress: (e) => {
                        handleTabPress();
                    },
                }}
            />
             <Tabs.Screen
                name="bookHistory"
                options={{
                    title: 'bookHistory',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} />
                    ),
                }}
                key={refreshKey}
                listeners={{
                    tabPress: (e) => {
                        handleTabPress();
                    },
                }}
            />
                  <Tabs.Screen
                name="manage"
                options={{
                    title: 'manage',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'ticket' : 'ticket-outline'} color={color} />
                    ),
                }}
                key={refreshKey}
                listeners={{
                    tabPress: (e) => {
                        handleTabPress();
                    },
                }}
            />
           
           
            
        </Tabs>
    );
}
