import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, Freshness, StatusPill } from '@/components/ui';
import { CATEGORIES, GROUP_SIZES, isFresh, latestFor, nearbyAlternatives, WAIT_LEVELS } from '@/lib/status';
import type { GroupSize } from '@/lib/types';
import { useLiveData } from '@/lib/useLiveData';

export default function VenueDetail() {
  const { id, group: groupParam } = useLocalSearchParams<{ id: string; group?: string }>();
  const group: GroupSize = groupParam === 'large' ? 'large' : 'small';
  const { venues, reports, now, loading } = useLiveData();
  const venue = venues.find((v) => v.id === id);

  if (!venue) {
    return <Text style={styles.empty}>{loading ? 'Loading…' : 'Venue not found.'}</Text>;
  }

  const report = latestFor(reports, venue.id, group);
  const alternatives = nearbyAlternatives(venue, venues, reports, group, now);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: venue.name }} />
      <Text style={styles.name}>{venue.name}</Text>
      <Text style={styles.sub}>
        {CATEGORIES[venue.category].emoji} {CATEGORIES[venue.category].singular} · {venue.area}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Right now</Text>
        {(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => {
          const r = latestFor(reports, venue.id, g);
          return (
            <View key={g} style={[styles.groupRow, g === group && styles.groupRowActive]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupName}>{GROUP_SIZES[g]}</Text>
                <Freshness report={r} now={now} />
              </View>
              <StatusPill report={r} now={now} />
            </View>
          );
        })}
      </View>

      <Text style={styles.section}>
        {isFresh(report, now) && WAIT_LEVELS[report.level].rank <= WAIT_LEVELS.short.rank
          ? 'Other options nearby'
          : 'Shorter waits nearby'}
      </Text>
      {alternatives.length === 0 && (
        <Text style={styles.muted}>No nearby {CATEGORIES[venue.category].label.toLowerCase()} with a shorter live wait.</Text>
      )}
      {alternatives.map((a) => (
        <Link key={a.venue.id} href={{ pathname: '/venue/[id]', params: { id: a.venue.id, group } }} asChild>
          <Pressable style={styles.altCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.altName}>{a.venue.name}</Text>
              <Text style={styles.muted}>
                {a.km.toFixed(1)} km away · {a.venue.area}
              </Text>
            </View>
            <StatusPill report={a.report} now={now} />
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 48, maxWidth: 640, width: '100%', alignSelf: 'center' },
  name: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.muted, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 18, gap: 8 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10 },
  groupRowActive: { backgroundColor: '#f1efe9' },
  groupName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 8 },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  altName: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  empty: { padding: 24, color: colors.muted },
});
