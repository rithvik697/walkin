import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VenueRow } from '@/components/VenueRow';
import { BackButton, colors, Feather, font, Freshness, Segmented, StatusLine, VenueImage } from '@/components/ui';
import {
  CATEGORIES,
  GROUP_SIZES,
  isFresh,
  latestFor,
  nearbyAlternatives,
  STALE_AFTER_MINUTES,
  WAIT_LEVELS,
} from '@/lib/status';
import type { GroupSize } from '@/lib/types';
import { useLiveData } from '@/lib/useLiveData';

export default function VenueDetail() {
  const { id, group: groupParam } = useLocalSearchParams<{ id: string; group?: string }>();
  const [group, setGroup] = useState<GroupSize>(groupParam === 'large' ? 'large' : 'small');
  const { venues, reports, now, loading } = useLiveData();
  const insets = useSafeAreaInsets();
  const venue = venues.find((v) => v.id === id);

  if (!venue) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackButton />
        {loading ? (
          <ActivityIndicator style={{ marginTop: 120 }} color={colors.muted} />
        ) : (
          <Text style={styles.notFound}>This venue isn&apos;t listed anymore.</Text>
        )}
      </View>
    );
  }

  const report = latestFor(reports, venue.id, group);
  const alternatives = nearbyAlternatives(venue, venues, reports, group, now);
  const quickHere = isFresh(report, now) && WAIT_LEVELS[report.level].rank <= WAIT_LEVELS.short.rank;
  const placeUrl = venue.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;

  const meta = [CATEGORIES[venue.category].singular, venue.area, venue.priceLevel ? '₹'.repeat(venue.priceLevel) : null]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackButton />
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 48 }]}>
        <VenueImage venue={venue} size={{ width: '100%', height: 280 + insets.top }} radius={0} />

        <View style={styles.content}>
          <Text style={styles.meta}>{meta}</Text>
          <Text style={styles.name}>{venue.name}</Text>

          <View style={styles.statusCard}>
            <Text style={styles.cardLabel}>Wait right now</Text>
            <StatusLine report={report} now={now} size="lg" />
            <Freshness report={report} now={now} />
            <Segmented
              style={{ marginTop: 14 }}
              options={(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => ({ value: g, label: GROUP_SIZES[g] }))}
              value={group}
              onChange={setGroup}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
              onPress={() => Linking.openURL(directionsUrl)}
              accessibilityRole="link"
            >
              <Feather name="navigation" size={16} color="#fff" />
              <Text style={styles.primaryText}>Directions</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && { backgroundColor: colors.sunken }]}
              onPress={() => Linking.openURL(placeUrl)}
              accessibilityRole="link"
            >
              <Feather name="external-link" size={16} color={colors.ink} />
              <Text style={styles.secondaryText}>Menu & reviews</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>{quickHere ? 'Also nearby' : 'Shorter waits nearby'}</Text>
          {alternatives.length === 0 ? (
            <Text style={styles.muted}>
              No nearby {CATEGORIES[venue.category].label.toLowerCase()} have a shorter live wait right now.
            </Text>
          ) : (
            <View style={styles.group}>
              {alternatives.map((a, i) => (
                <VenueRow
                  key={a.venue.id}
                  venue={a.venue}
                  report={a.report}
                  group={group}
                  now={now}
                  distanceKm={a.km}
                  divider={i > 0}
                />
              ))}
            </View>
          )}

          <View style={styles.footnote}>
            <Feather name="info" size={14} color={colors.faint} style={{ marginTop: 2 }} />
            <Text style={styles.footnoteText}>
              Wait times are posted by venue staff and expire after {STALE_AFTER_MINUTES} minutes, so what you see
              is always recent.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 680, width: '100%', alignSelf: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  meta: { fontFamily: font.medium, fontSize: 13, color: colors.muted },
  name: { fontFamily: font.serif, fontSize: 40, lineHeight: 44, color: colors.ink, letterSpacing: -0.6, marginTop: 6 },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    gap: 8,
    marginTop: 22,
  },
  cardLabel: { fontFamily: font.medium, fontSize: 12.5, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primary: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    height: 50,
  },
  primaryText: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  secondary: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
    height: 50,
  },
  secondaryText: { fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  section: { fontFamily: font.semibold, fontSize: 17, color: colors.ink, marginTop: 32, marginBottom: 10 },
  group: { borderRadius: 18, borderWidth: 1, borderColor: colors.hairline, overflow: 'hidden' },
  muted: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  footnote: { flexDirection: 'row', gap: 8, marginTop: 32 },
  footnoteText: { flex: 1, fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: colors.faint },
  notFound: { fontFamily: font.regular, fontSize: 15, color: colors.muted, padding: 24, marginTop: 80 },
});
