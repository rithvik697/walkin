import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, Feather, font, StatusLine, VenueImage } from '@/components/ui';
import { type Alternative, CATEGORIES, formatAge, isFresh, WAIT_LEVELS } from '@/lib/status';
import type { GroupSize, StatusReport, Venue } from '@/lib/types';

export function VenueRow({
  venue,
  report,
  alternative,
  group,
  now,
  distanceKm,
  divider,
}: {
  venue: Venue;
  report: StatusReport | null;
  alternative?: Alternative;
  group: GroupSize;
  now: number;
  distanceKm?: number;
  divider?: boolean;
}) {
  const meta = [
    CATEGORIES[venue.category].singular,
    distanceKm !== undefined ? `${distanceKm.toFixed(1)} km` : null,
    venue.priceLevel ? '₹'.repeat(venue.priceLevel) : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Link href={{ pathname: '/venue/[id]', params: { id: venue.id, group } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${venue.name}, ${isFresh(report, now) ? WAIT_LEVELS[report.level].label : 'no update yet'}`}
        style={styles.row}
      >
        <VenueImage venue={venue} size={64} />
        <View style={[styles.body, divider && styles.divider]}>
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {venue.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {meta}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.faint} />
          </View>

          <View style={styles.statusRow}>
            <StatusLine report={report} now={now} />
            {isFresh(report, now) && <Text style={styles.age}>{formatAge(report.reportedAt, now)}</Text>}
          </View>

          {alternative && (
            <View style={styles.alt}>
              <Feather name="corner-down-right" size={13} color={colors.success} />
              <Text style={styles.altText} numberOfLines={1}>
                Try <Text style={styles.altName}>{alternative.venue.name}</Text>
                {'  ·  '}
                {WAIT_LEVELS[alternative.report.level].label.toLowerCase()}, {alternative.km.toFixed(1)} km
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 14, backgroundColor: colors.surface },
  body: { flex: 1, paddingVertical: 14, paddingRight: 14, gap: 8 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: font.semibold, fontSize: 16, color: colors.ink, letterSpacing: -0.2 },
  meta: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  age: { fontFamily: font.regular, fontSize: 12.5, color: colors.muted },
  alt: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  altText: { flex: 1, fontFamily: font.regular, fontSize: 13, color: colors.success },
  altName: { fontFamily: font.semibold },
});
