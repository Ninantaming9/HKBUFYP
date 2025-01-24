import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    const [refreshKey, setRefreshKey] = useState(0); 

    const handleTabPress = () => {
  
        setRefreshKey(prevKey => prevKey + 1);
    };


    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
                    ),
                }}
                key={refreshKey} // 使用动态值
                listeners={{
                    tabPress: (e) => {
                        // 在 tab 被点击时更新 refreshKey
                        handleTabPress();
                    },
                }}
            />
            <Tabs.Screen
                name="myAccount"
                options={{
                    title: 'myAccount',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
                    ),
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
                  key={refreshKey} // 使用动态值
                    listeners={{
                        tabPress: (e) => {
                            // 在 tab 被点击时更新 refreshKey
                            handleTabPress();
                        },
                    }}
            />
        </Tabs>
    );
}
