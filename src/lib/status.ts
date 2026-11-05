import type { Category, GroupSize, Source, StatusReport, Venue, WaitLevel } from './types';

// A report older than this is shown as "may be out of date" and never treated as live.
export const STALE_AFTER_MINUTES = 45;

export const WAIT_LEVELS: Record<WaitLevel, { label: string; short: string; rank: number; color: string }> = {
  none: { label: 'No wait', short: 'No wait', rank: 0, color: '#1f9d55' },
  short: { label: 'Under 15 min', short: '<15 min', rank: 1, color: '#7cb518' },
  medium: { label: '15–30 min', short: '15–30 min', rank: 2, color: '#e0a100' },
  long: { label: '30–45+ min', short: '30–45+ min', rank: 3, color: '#e8590c' },
  full: { label: 'Not taking walk-ins', short: 'Full', rank: 4, color: '#c92a2a' },
};

export const WAIT_LEVEL_ORDER: WaitLevel[] = ['none', 'short', 'medium', 'long', 'full'];

export const CATEGORIES: Record<Category, { label: string; singular: string; emoji: string }> = {
  cafe: { label: 'Cafes', singular: 'Cafe', emoji: '☕' },
  brewery: { label: 'Breweries', singular: 'Brewery', emoji: '🍺' },
  restaurant: { label: 'Restaurants', singular: 'Restaurant', emoji: '🍽️' },
  bowling: { label: 'Bowling', singular: 'Bowling', emoji: '🎳' },
};

export const GROUP_SIZES: Record<GroupSize, string> = {
  small: '2–4 people',
  large: '5+ people',
};

export const SOURCES: Record<Source, string> = {
  venue: 'Venue-verified',
  community: 'Community-reported',
  estimate: 'Estimated',
};

export function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function isFresh(report: StatusReport | null, now: number): report is StatusReport {
  return report !== null && minutesSince(report.reportedAt, now) <= STALE_AFTER_MINUTES;
}

export function formatAge(iso: string, now: number): string {
  const mins = minutesSince(iso, now);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return hours < 24 ? `${hours} h ago` : `${Math.floor(hours / 24)} d ago`;
}

export function latestFor(
  reports: StatusReport[],
  venueId: string,
  groupSize: GroupSize,
): StatusReport | null {
  let latest: StatusReport | null = null;
  for (const r of reports) {
    if (r.venueId !== venueId || r.groupSize !== groupSize) continue;
    if (!latest || r.reportedAt > latest.reportedAt) latest = r;
  }
  return latest;
}

// Sort key: fresh statuses by wait (shortest first), then stale/unknown last.
export function sortRank(report: StatusReport | null, now: number): number {
  return isFresh(report, now) ? WAIT_LEVELS[report.level].rank : 10;
}

export function distanceKm(a: Venue, b: Venue): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export interface Alternative {
  venue: Venue;
  report: StatusReport;
  km: number;
}

const MAX_ALTERNATIVE_KM = 6;

// "Packed? Try these nearby": same category, live status with a shorter wait, closest first.
export function nearbyAlternatives(
  venue: Venue,
  venues: Venue[],
  reports: StatusReport[],
  groupSize: GroupSize,
  now: number,
  limit = 3,
): Alternative[] {
  const own = latestFor(reports, venue.id, groupSize);
  const ownRank = isFresh(own, now) ? WAIT_LEVELS[own.level].rank : Infinity;

  return venues
    .filter((v) => v.id !== venue.id && v.category === venue.category)
    .map((v) => ({ venue: v, report: latestFor(reports, v.id, groupSize), km: distanceKm(venue, v) }))
    .filter(
      (a): a is Alternative =>
        isFresh(a.report, now) && WAIT_LEVELS[a.report.level].rank < ownRank && a.km <= MAX_ALTERNATIVE_KM,
    )
    .sort((a, b) => WAIT_LEVELS[a.report.level].rank - WAIT_LEVELS[b.report.level].rank || a.km - b.km)
    .slice(0, limit);
}

export function needsAlternative(report: StatusReport | null, now: number): boolean {
  return isFresh(report, now) && WAIT_LEVELS[report.level].rank >= WAIT_LEVELS.long.rank;
}
