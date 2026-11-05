import type { GroupSize, StatusReport, Venue, WaitLevel } from './types';

// Made-up venues used until Supabase is connected. Not real businesses.
export const SAMPLE_VENUES: Venue[] = [
  { id: 'c1', name: 'Filter & Foam', category: 'cafe', area: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { id: 'c2', name: 'Morning Ritual Cafe', category: 'cafe', area: 'Gachibowli', lat: 17.4435, lng: 78.3552 },
  { id: 'c3', name: 'Courtyard Coffee Co.', category: 'cafe', area: 'Hitech City', lat: 17.4474, lng: 78.3762 },
  { id: 'c4', name: 'Slow Pour House', category: 'cafe', area: 'Jubilee Hills', lat: 17.4326, lng: 78.4071 },
  { id: 'c5', name: 'Little Lane Bakery Cafe', category: 'cafe', area: 'Jubilee Hills', lat: 17.4291, lng: 78.4125 },
  { id: 'b1', name: 'Hoppers Yard', category: 'brewery', area: 'Gachibowli', lat: 17.4382, lng: 78.3621 },
  { id: 'b2', name: 'Copper Kettle Brewing', category: 'brewery', area: 'Hitech City', lat: 17.4502, lng: 78.3811 },
  { id: 'b3', name: 'Barrel Room Taphouse', category: 'brewery', area: 'Jubilee Hills', lat: 17.4312, lng: 78.4098 },
  { id: 'r1', name: 'Saffron Table', category: 'restaurant', area: 'Jubilee Hills', lat: 17.4339, lng: 78.4049 },
  { id: 'r2', name: 'Coastal Kitchen', category: 'restaurant', area: 'Hitech City', lat: 17.4489, lng: 78.3794 },
  { id: 'l1', name: 'Strike Zone Arena', category: 'bowling', area: 'Hitech City', lat: 17.4457, lng: 78.3779 },
  { id: 'l2', name: 'Tenpin Social', category: 'bowling', area: 'Gachibowli', lat: 17.4413, lng: 78.3577 },
];

// Private staff links in demo mode are /update/demo-<venue id>.
export const sampleToken = (venueId: string) => `demo-${venueId}`;

// [venue, group, level, minutes ago, source]
const SEED: [string, GroupSize, WaitLevel, number, StatusReport['source']][] = [
  ['c1', 'small', 'long', 6, 'venue'],
  ['c1', 'large', 'full', 6, 'venue'],
  ['c2', 'small', 'none', 12, 'venue'],
  ['c2', 'large', 'short', 12, 'venue'],
  ['c3', 'small', 'short', 20, 'community'],
  ['c3', 'large', 'medium', 20, 'community'],
  ['c4', 'small', 'medium', 95, 'venue'], // stale
  ['c5', 'small', 'none', 3, 'venue'],
  ['c5', 'large', 'medium', 3, 'venue'],
  ['b1', 'small', 'medium', 9, 'venue'],
  ['b1', 'large', 'long', 9, 'venue'],
  ['b2', 'small', 'none', 15, 'venue'],
  ['b2', 'large', 'short', 15, 'venue'],
  ['b3', 'small', 'full', 4, 'venue'],
  ['b3', 'large', 'full', 4, 'venue'],
  ['r1', 'small', 'long', 18, 'venue'],
  ['r1', 'large', 'full', 18, 'venue'],
  ['r2', 'small', 'short', 30, 'community'],
  ['l1', 'small', 'long', 10, 'venue'],
  ['l1', 'large', 'long', 10, 'venue'],
  ['l2', 'small', 'short', 7, 'venue'],
  ['l2', 'large', 'medium', 7, 'venue'],
];

export function sampleReports(now = Date.now()): StatusReport[] {
  return SEED.map(([venueId, groupSize, level, minsAgo, source]) => ({
    venueId,
    groupSize,
    level,
    source,
    reportedAt: new Date(now - minsAgo * 60000).toISOString(),
  }));
}
