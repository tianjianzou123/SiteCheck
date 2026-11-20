import { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const icon: IconName = route.name === 'map' ? 'map-outline' : 'grid-outline';
        const activeIcon: IconName = route.name === 'map' ? 'map' : 'grid';
        return {
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '800' },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            height: 66,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size, focused }) => {
            const iconColor = typeof color === 'string' ? color : colors.textMuted;
            return <Ionicons name={focused ? activeIcon : icon} size={size} color={iconColor} />;
          },
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }} />
      <Tabs.Screen name="map" options={{ title: 'Site map', tabBarLabel: 'Map' }} />
    </Tabs>
  );
}
