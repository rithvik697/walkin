import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/components/ui';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'WalkIn' }} />
        <Stack.Screen name="venue/[id]" options={{ title: '' }} />
        <Stack.Screen name="update/[token]" options={{ title: 'Update wait time' }} />
      </Stack>
    </>
  );
}
