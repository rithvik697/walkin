import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatAge, isFresh, minutesSince, SOURCES, STALE_AFTER_MINUTES, WAIT_LEVELS } from '@/lib/status';
import type { StatusReport } from '@/lib/types';

export const colors = {
  bg: '#f6f5f2',
  card: '#ffffff',
  text: '#1c1b19',
  muted: '#6b6862',
  border: '#e4e1da',
  accent: '#2b5fd9',
  stale: '#9a968e',
};

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({ report, now }: { report: StatusReport | null; now: number }) {
  if (!isFresh(report, now)) {
    return (
      <View style={[styles.pill, { backgroundColor: '#ecebe7' }]}>
        <Text style={[styles.pillText, { color: colors.stale }]}>No live info</Text>
      </View>
    );
  }
  const level = WAIT_LEVELS[report.level];
  return (
    <View style={[styles.pill, { backgroundColor: level.color }]}>
      <Text style={[styles.pillText, { color: '#fff' }]}>{level.short}</Text>
    </View>
  );
}

// "Venue-verified · 6 min ago", or a staleness warning so old data is never passed off as live.
export function Freshness({ report, now }: { report: StatusReport | null; now: number }) {
  if (!report) return <Text style={styles.meta}>No updates yet today</Text>;
  if (minutesSince(report.reportedAt, now) > STALE_AFTER_MINUTES) {
    return (
      <Text style={[styles.meta, { color: colors.stale }]}>
        Last update {formatAge(report.reportedAt, now)}, may be out of date
      </Text>
    );
  }
  return (
    <Text style={styles.meta}>
      {SOURCES[report.source]} · {formatAge(report.reportedAt, now)}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, color: colors.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pillText: { fontSize: 13, fontWeight: '700' },
  meta: { fontSize: 12, color: colors.muted },
});
