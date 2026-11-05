import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { SAMPLE_VENUES, sampleReports, sampleToken } from './sampleData';
import type { GroupSize, StatusReport, Venue, WaitLevel } from './types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// No Supabase keys in .env → run on in-memory sample data so the app is usable immediately.
const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

export const isDemoMode = supabase === null;

let demoReports = sampleReports();

// Only reports from the last day matter; older ones can't be "live".
const lookbackIso = () => new Date(Date.now() - 24 * 60 * 60000).toISOString();

export async function fetchVenues(): Promise<Venue[]> {
  if (!supabase) return SAMPLE_VENUES;
  const { data, error } = await supabase.from('venues').select('id, name, category, area, lat, lng').order('name');
  if (error) throw error;
  return data as Venue[];
}

export async function fetchReports(): Promise<StatusReport[]> {
  if (!supabase) return demoReports;
  const { data, error } = await supabase
    .from('status_reports')
    .select('venue_id, group_size, level, source, reported_at')
    .gte('reported_at', lookbackIso())
    .order('reported_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    venueId: r.venue_id,
    groupSize: r.group_size,
    level: r.level,
    source: r.source,
    reportedAt: r.reported_at,
  }));
}

export async function fetchVenueForToken(token: string): Promise<Venue | null> {
  if (!supabase) return SAMPLE_VENUES.find((v) => sampleToken(v.id) === token) ?? null;
  const { data, error } = await supabase.rpc('venue_for_token', { p_token: token });
  if (error) throw error;
  return (data as Venue[])[0] ?? null;
}

export async function submitVenueStatus(token: string, groupSize: GroupSize, level: WaitLevel): Promise<void> {
  if (!supabase) {
    const venue = SAMPLE_VENUES.find((v) => sampleToken(v.id) === token);
    if (!venue) throw new Error('Invalid link');
    demoReports = [
      { venueId: venue.id, groupSize, level, source: 'venue', reportedAt: new Date().toISOString() },
      ...demoReports,
    ];
    return;
  }
  const { error } = await supabase.rpc('submit_venue_status', {
    p_token: token,
    p_group_size: groupSize,
    p_level: level,
  });
  if (error) throw error;
}
