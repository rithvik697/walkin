import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, colors, Feather, font, Segmented } from '@/components/ui';
import { VenueRow } from '@/components/VenueRow';
import { isDemoMode } from '@/lib/api';
import {
  CATEGORIES,
  GROUP_SIZES,
  isFresh,
  latestFor,
  nearbyAlternatives,
  needsAlternative,
  sortRank,
} from '@/lib/status';
import type { Category, GroupSize } from '@/lib/types';
import { useLiveData } from '@/lib/useLiveData';

const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

export default function VenueList() {
  const { venues, reports, now, loading, error, refresh } = useLiveData();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category | null>(null);
  const [group, setGroup] = useState<GroupSize>('small');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = venues
      .filter((v) => !category || v.category === category)
      .filter((v) => !q || v.name.toLowerCase().includes(q) || v.area.toLowerCase().includes(q))
      .map((venue) => {
        const report = latestFor(reports, venue.id, group);
        const alternative = needsAlternative(report, now)
          ? nearbyAlternatives(venue, venues, reports, group, now, 1)[0]
          : undefined;
        return { venue, report, alternative };
      })
      .sort((a, b) => sortRank(a.report, now) - sortRank(b.report, now) || a.venue.name.localeCompare(b.venue.name));

    const byArea = new Map<string, typeof rows>();
    for (const r of rows) byArea.set(r.venue.area, [...(byArea.get(r.venue.area) ?? []), r]);
    return [...byArea.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [venues, reports, category, group, query, now]);

  const liveCount = useMemo(
    () => venues.filter((v) => isFresh(latestFor(reports, v.id, group), now)).length,
    [venues, reports, group, now],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(r) => r.venue.id}
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} />}
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 18 }]}
      ListHeaderComponent={
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>WalkIn</Text>
            <View style={styles.livePill}>
              <View style={[styles.liveDot, liveCount === 0 && { backgroundColor: colors.faint }]} />
              <Text style={styles.liveText}>{liveCount} live now</Text>
            </View>
          </View>

          <Text style={styles.title}>Walk straight in.</Text>
          <Text style={styles.subtitle}>Live wait times at Hyderabad&apos;s busiest cafes, breweries and restaurants.</Text>
          {isDemoMode && <Text style={styles.demo}>Showing sample venues for testing.</Text>}

          <View style={styles.search}>
            <Feather name="search" size={17} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or area"
              placeholderTextColor={colors.faint}
              style={[styles.searchInput, webNoOutline]}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <Feather name="x-circle" size={17} color={colors.faint} />
              </Pressable>
            )}
          </View>

          <Text style={styles.label}>Group size</Text>
          <Segmented
            options={(Object.keys(GROUP_SIZES) as GroupSize[]).map((g) => ({ value: g, label: GROUP_SIZES[g] }))}
            value={group}
            onChange={setGroup}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
            {(Object.keys(CATEGORIES) as Category[]).map((c) => (
              <Chip
                key={c}
                label={CATEGORIES[c].label}
                selected={category === c}
                onPress={() => setCategory(category === c ? null : c)}
              />
            ))}
          </ScrollView>

          {!loading && venues.length > 0 && liveCount === 0 && (
            <View style={styles.notice}>
              <Feather name="clock" size={16} color={colors.muted} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>No live wait times yet</Text>
                <Text style={styles.noticeText}>
                  Venues post updates when it gets busy. Places with a live update move to the top of each area.
                </Text>
              </View>
            </View>
          )}

          {loading && <ActivityIndicator style={{ marginTop: 40 }} color={colors.muted} />}
          {error && <Text style={styles.error}>Couldn&apos;t load venues. Pull down to try again.</Text>}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      )}
      renderItem={({ item, index, section }) => (
        <View
          style={[
            styles.groupItem,
            index === 0 && styles.groupFirst,
            index === section.data.length - 1 && styles.groupLast,
          ]}
        >
          <VenueRow {...item} group={group} now={now} divider={index > 0} />
        </View>
      )}
      ListEmptyComponent={
        loading ? undefined : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{venues.length === 0 ? 'No venues yet' : 'Nothing matches'}</Text>
            <Text style={styles.emptyText}>
              {venues.length === 0 ? 'Venues will appear here once they are added.' : 'Try a different search or filter.'}
            </Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 64, maxWidth: 680, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: font.serif, fontSize: 26, color: colors.ink, letterSpacing: -0.3 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  liveText: { fontFamily: font.medium, fontSize: 12.5, color: colors.text },
  title: { fontFamily: font.serif, fontSize: 44, lineHeight: 48, color: colors.ink, letterSpacing: -0.8, marginTop: 28 },
  subtitle: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8, maxWidth: 420 },
  demo: { fontFamily: font.medium, fontSize: 12.5, color: colors.muted, marginTop: 8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 24,
  },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: 15, color: colors.ink, height: '100%' },
  label: { fontFamily: font.medium, fontSize: 12.5, color: colors.muted, marginTop: 20, marginBottom: 8 },
  chips: { marginTop: 14, marginHorizontal: -16, paddingHorizontal: 16 },
  notice: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.sunken,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
  },
  noticeTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  noticeText: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 28, marginBottom: 10, paddingHorizontal: 2 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 17, color: colors.ink, letterSpacing: -0.2 },
  sectionCount: { fontFamily: font.regular, fontSize: 13, color: colors.muted },
  groupItem: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.hairline,
  },
  groupFirst: { borderTopWidth: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  groupLast: { borderBottomWidth: 1, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  error: { fontFamily: font.regular, color: '#B9312F', marginTop: 16 },
  empty: { alignItems: 'center', marginTop: 48, gap: 6 },
  emptyTitle: { fontFamily: font.serif, fontSize: 26, color: colors.ink },
  emptyText: { fontFamily: font.regular, fontSize: 14, color: colors.muted },
});
