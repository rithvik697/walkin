import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, font } from '@/components/ui';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    InstrumentSerif_400Regular,
    ...Feather.font,
  });

  // Avoid a flash of system font; fonts are bundled so this is near-instant.
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: font.semibold, fontSize: 16 },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'WalkIn', headerShown: false }} />
        <Stack.Screen name="venue/[id]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="update/[token]" options={{ title: 'Update wait time' }} />
      </Stack>
    </>
  );
}
