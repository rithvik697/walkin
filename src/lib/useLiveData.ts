import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { fetchReports, fetchVenues } from './api';
import type { StatusReport, Venue } from './types';

const REFRESH_MS = 60_000;
const CLOCK_TICK_MS = 30_000;

// Venues + latest reports, refetched every minute and whenever the screen regains focus.
// `now` ticks so "updated 5 min ago" and staleness stay correct without a refetch.
export function useLiveData() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [reports, setReports] = useState<StatusReport[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [v, r] = await Promise.all([fetchVenues(), fetchReports()]);
      setVenues(v);
      setReports(r);
      setNow(Date.now());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load venues');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const refreshTimer = setInterval(refresh, REFRESH_MS);
    const clockTimer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(clockTimer);
    };
  }, [refresh]);

  return { venues, reports, now, loading, error, refresh };
}
