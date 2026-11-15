import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, Feather, font, Segmented } from '@/components/ui';
import { fetchVenueForToken, submitVenueStatus } from '@/lib/api';
import { GROUP_SIZES, STALE_AFTER_MINUTES, WAIT_LEVEL_ORDER, WAIT_LEVELS } from '@/lib/status';
import type { GroupSize, Venue, WaitLevel } from '@/lib/types';

// Staff screen opened from the venue's private link or QR code. No login: the token is the key.
// Goal: one tap, under 5 seconds.
export default function UpdateStatus() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined);
  const [group, setGroup] = useState<GroupSize>('small');
  const [saving, setSaving] = useState<WaitLevel | null>(null);
  const [saved, setSaved] = useState<{ level: WaitLevel; group: GroupSize; at: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVenueForToken(token)
      .then(setVenue)
      .catch(() => setVenue(null));
  }, [token]);

  if (venue === undefined) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (venue === null) {
    return <Text style={styles.message}>This update link isn&apos;t valid. Ask the WalkIn team for a new one.</Text>;
  }

  const submit = async (level: WaitLevel) => {
    setSaving(level);
    setError(null);
    try {
      await submitVenueStatus(token, group, level);
      setSaved({ level, group, at: new Date() });
    } catch {
      setError('Could not save. Check your connection and tap again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.venue}>{venue.name}</Text>
      <Text style={styles.prompt}>How long is the wait for a walk-in right now?</Text>

      <Segmented
        style={styles.groupRow}
        options={(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => ({ value: g, label: `For ${GROUP_SIZES[g]}` }))}
        value={group}
        onChange={setGroup}
      />

      {WAIT_LEVEL_ORDER.map((level) => (
        <Pressable
          key={level}
          onPress={() => submit(level)}
          disabled={saving !== null}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: WAIT_LEVELS[level].color, opacity: pressed || saving === level ? 0.7 : 1 },
          ]}
        >
          {saving === level ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{WAIT_LEVELS[level].label}</Text>
          )}
        </Pressable>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && (
        <View style={styles.saved}>
          <Text style={styles.savedText}>
            <Feather name="check-circle" size={15} color={colors.success} /> Saved {WAIT_LEVELS[saved.level].label} for {GROUP_SIZES[saved.group]} at{' '}
            {saved.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </Text>
          <Text style={styles.hint}>
            Customers will see this for {STALE_AFTER_MINUTES} minutes. Tap again whenever the wait changes.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 48, maxWidth: 480, width: '100%', alignSelf: 'center' },
  venue: { fontFamily: font.serif, fontSize: 36, lineHeight: 40, color: colors.ink, letterSpacing: -0.5 },
  prompt: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 6, marginBottom: 18 },
  groupRow: { marginBottom: 18 },
  button: { borderRadius: 16, height: 62, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  buttonText: { fontFamily: font.semibold, color: '#fff', fontSize: 18 },
  saved: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  savedText: { fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  hint: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 4 },
  error: { fontFamily: font.medium, color: '#B9312F', marginTop: 8, fontSize: 14 },
  message: { fontFamily: font.regular, padding: 24, fontSize: 15, color: colors.muted },
});
