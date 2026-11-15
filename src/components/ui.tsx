import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatAge, isFresh, minutesSince, SOURCES, STALE_AFTER_MINUTES, WAIT_LEVELS } from '@/lib/status';
import type { Category, StatusReport, Venue } from '@/lib/types';

// ---------- Tokens ----------

export const colors = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  sunken: '#F1EEE9',
  ink: '#141311',
  text: '#2A2723',
  muted: '#8A857D',
  faint: '#B5B0A8',
  hairline: '#E9E5DF',
  success: '#1E8A4C',
};

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  serif: 'InstrumentSerif_400Regular',
};

export const shadow = { boxShadow: '0 1px 2px rgba(20, 19, 17, 0.04), 0 4px 16px rgba(20, 19, 17, 0.05)' } as const;

// Quiet, tonal placeholders until a venue has a real photo.
const CATEGORY_TONE: Record<Category, { bg: string; fg: string }> = {
  cafe: { bg: '#EDE4D8', fg: '#7A5B40' },
  brewery: { bg: '#F1E6CC', fg: '#8C6418' },
  restaurant: { bg: '#F1DFD8', fg: '#8E4535' },
  bowling: { bg: '#E1E3F1', fg: '#4A4F86' },
};

function initials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^the$/i.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

// ---------- Venue imagery ----------

export function VenueImage({
  venue,
  size,
  radius = 14,
  style,
}: {
  venue: Venue;
  size: number | { width?: number | `${number}%`; height: number };
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const dims = typeof size === 'number' ? { width: size, height: size } : size;
  const tone = CATEGORY_TONE[venue.category];
  const fontSize = Math.round(dims.height * 0.42);
  return (
    <View style={[dims, { borderRadius: radius, overflow: 'hidden', backgroundColor: tone.bg }, style]}>
      {venue.imageUrl ? (
        <Image source={venue.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      ) : (
        <View style={styles.center}>
          <Text style={{ fontFamily: font.serif, fontSize, lineHeight: fontSize * 1.1, color: tone.fg }}>
            {initials(venue.name)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------- Status ----------

export function statusOf(report: StatusReport | null, now: number) {
  if (isFresh(report, now)) {
    const level = WAIT_LEVELS[report.level];
    return { live: true, label: level.label, color: level.color };
  }
  return { live: false, label: 'No update yet', color: colors.faint };
}

export function StatusLine({ report, now, size = 'md' }: { report: StatusReport | null; now: number; size?: 'md' | 'lg' }) {
  const s = statusOf(report, now);
  const lg = size === 'lg';
  return (
    <View style={styles.statusRow}>
      <View style={[styles.dot, { backgroundColor: s.color }, lg && styles.dotLg]} />
      <Text
        style={[
          lg ? styles.statusLg : styles.status,
          { color: s.live ? s.color : colors.muted },
        ]}
        numberOfLines={1}
      >
        {s.label}
      </Text>
    </View>
  );
}

// "From the venue · 6 min ago", or a staleness note so old data is never passed off as live.
export function Freshness({ report, now }: { report: StatusReport | null; now: number }) {
  if (!report) return <Text style={styles.meta}>Waiting for today&apos;s first update</Text>;
  if (minutesSince(report.reportedAt, now) > STALE_AFTER_MINUTES) {
    return <Text style={styles.meta}>Last update {formatAge(report.reportedAt, now)} · may be out of date</Text>;
  }
  return (
    <Text style={styles.meta}>
      {SOURCES[report.source]} · {formatAge(report.reportedAt, now)}
    </Text>
  );
}

// ---------- Controls ----------

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segment, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function BackButton() {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      style={({ pressed }) => [styles.back, { top: insets.top + 10 }, pressed && { opacity: 0.7 }]}
    >
      <Feather name="chevron-left" size={22} color={colors.ink} />
    </Pressable>
  );
}

export { Feather };

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLg: { width: 10, height: 10, borderRadius: 5 },
  status: { fontFamily: font.semibold, fontSize: 14 },
  statusLg: { fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.4 },
  meta: { fontFamily: font.regular, fontSize: 12.5, color: colors.muted },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: font.medium, fontSize: 13.5, color: colors.text },
  chipTextSelected: { color: '#fff' },
  segment: { flexDirection: 'row', backgroundColor: colors.sunken, borderRadius: 12, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 },
  segmentItemActive: { backgroundColor: colors.surface, ...shadow },
  segmentText: { fontFamily: font.medium, fontSize: 13.5, color: colors.muted },
  segmentTextActive: { fontFamily: font.semibold, color: colors.ink },
  back: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
});
