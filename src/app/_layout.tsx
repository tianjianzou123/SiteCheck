import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReportProvider } from '@/context/ReportContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <ReportProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="report/form" options={{ title: 'Facility inspection', presentation: 'card' }} />
        <Stack.Screen name="report/[id]" options={{ title: 'Inspection details' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </ReportProvider>
  );
}
