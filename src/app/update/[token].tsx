import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip, colors } from '@/components/ui';
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

      <View style={styles.groupRow}>
        {(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => (
          <Chip key={g} label={GROUP_SIZES[g]} selected={group === g} onPress={() => setGroup(g)} />
        ))}
      </View>

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
          <Text style={styles.buttonText}>{WAIT_LEVELS[level].label}</Text>
        </Pressable>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && (
        <View style={styles.saved}>
          <Text style={styles.savedText}>
            ✓ Saved {WAIT_LEVELS[saved.level].label} for {GROUP_SIZES[saved.group]} at{' '}
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
  venue: { fontSize: 24, fontWeight: '800', color: colors.text },
  prompt: { fontSize: 16, color: colors.muted, marginTop: 6, marginBottom: 16 },
  groupRow: { flexDirection: 'row', marginBottom: 16 },
  button: { borderRadius: 14, paddingVertical: 20, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 19, fontWeight: '800' },
  saved: { backgroundColor: '#eef6ee', borderRadius: 12, padding: 14, marginTop: 8 },
  savedText: { fontSize: 15, fontWeight: '700', color: '#1f5130' },
  hint: { fontSize: 13, color: '#3d6b4a', marginTop: 4 },
  error: { color: '#c92a2a', marginTop: 8, fontSize: 15 },
  message: { padding: 24, fontSize: 16, color: colors.muted },
});
