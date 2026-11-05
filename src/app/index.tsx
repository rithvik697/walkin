import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip, colors, Freshness, StatusPill } from '@/components/ui';
import { isDemoMode } from '@/lib/api';
import {
  CATEGORIES,
  GROUP_SIZES,
  latestFor,
  nearbyAlternatives,
  needsAlternative,
  sortRank,
  WAIT_LEVELS,
} from '@/lib/status';
import type { Category, GroupSize } from '@/lib/types';
import { useLiveData } from '@/lib/useLiveData';

export default function VenueList() {
  const { venues, reports, now, loading, error } = useLiveData();
  const [category, setCategory] = useState<Category | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupSize>('small');

  const areas = useMemo(() => [...new Set(venues.map((v) => v.area))].sort(), [venues]);

  const rows = useMemo(
    () =>
      venues
        .filter((v) => (!category || v.category === category) && (!area || v.area === area))
        .map((venue) => {
          const report = latestFor(reports, venue.id, group);
          const alternative = needsAlternative(report, now)
            ? nearbyAlternatives(venue, venues, reports, group, now, 1)[0]
            : undefined;
          return { venue, report, alternative };
        })
        .sort((a, b) => sortRank(a.report, now) - sortRank(b.report, now)),
    [venues, reports, category, area, group, now],
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.venue.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Where can we go right now?</Text>
          {isDemoMode && (
            <Text style={styles.demo}>Sample data: these are made-up venues for testing.</Text>
          )}

          <Text style={styles.label}>Group size</Text>
          <View style={styles.row}>
            {(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => (
              <Chip key={g} label={GROUP_SIZES[g]} selected={group === g} onPress={() => setGroup(g)} />
            ))}
          </View>

          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
            {(Object.keys(CATEGORIES) as Category[]).map((c) => (
              <Chip
                key={c}
                label={`${CATEGORIES[c].emoji} ${CATEGORIES[c].label}`}
                selected={category === c}
                onPress={() => setCategory(category === c ? null : c)}
              />
            ))}
          </ScrollView>

          <Text style={styles.label}>Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
            <Chip label="All areas" selected={!area} onPress={() => setArea(null)} />
            {areas.map((a) => (
              <Chip key={a} label={a} selected={area === a} onPress={() => setArea(area === a ? null : a)} />
            ))}
          </ScrollView>

          {loading && <ActivityIndicator style={{ marginTop: 24 }} />}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      }
      ListEmptyComponent={loading ? undefined : <Text style={styles.empty}>No venues match these filters.</Text>}
      renderItem={({ item: { venue, report, alternative } }) => (
        <Link href={{ pathname: '/venue/[id]', params: { id: venue.id, group } }} asChild>
          <Pressable style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{venue.name}</Text>
                <Text style={styles.sub}>
                  {CATEGORIES[venue.category].emoji} {venue.area}
                </Text>
              </View>
              <StatusPill report={report} now={now} />
            </View>
            <Freshness report={report} now={now} />
            {alternative && (
              <View style={styles.alt}>
                <Text style={styles.altText}>
                  Try instead: <Text style={{ fontWeight: '700' }}>{alternative.venue.name}</Text>
                  {' · '}
                  {WAIT_LEVELS[alternative.report.level].short} · {alternative.km.toFixed(1)} km
                </Text>
              </View>
            )}
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 48, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  demo: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  alt: { backgroundColor: '#eef6ee', borderRadius: 8, padding: 8, marginTop: 4 },
  altText: { fontSize: 13, color: '#1f5130' },
  error: { color: '#c92a2a', marginTop: 16 },
  empty: { color: colors.muted, marginTop: 24, textAlign: 'center' },
});
