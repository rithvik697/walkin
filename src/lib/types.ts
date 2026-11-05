export type Category = 'cafe' | 'brewery' | 'restaurant' | 'bowling';

// Breweries and restaurants often seat 2 people instantly but make 6+ wait,
// so every status is reported per group size.
export type GroupSize = 'small' | 'large';

export type WaitLevel = 'none' | 'short' | 'medium' | 'long' | 'full';

export type Source = 'venue' | 'community' | 'estimate';

export interface Venue {
  id: string;
  name: string;
  category: Category;
  area: string;
  lat: number;
  lng: number;
}

export interface StatusReport {
  venueId: string;
  groupSize: GroupSize;
  level: WaitLevel;
  source: Source;
  reportedAt: string; // ISO timestamp
}
