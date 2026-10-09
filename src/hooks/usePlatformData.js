
import { useState, useEffect, useCallback } from 'react';

import { db } from '@/api/base44Client';

function safeParse(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch (e) { return null; }
}

export function usePlatformData(platformId) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await db.entities.PlatformData.filter({ platform_id: platformId }, '-created_date', 1);
      const rec = res?.[0];
      if (rec) {
        setData({
          activityPeaks: safeParse(rec.activity_peaks) || {},
          dayMultipliers: safeParse(rec.day_multipliers) || {},
          updatedDate: rec.created_date || rec.updated_date,
        });
      } else {
        setData(null);
      }
    } catch (e) {
      setData(null);
    }
  }, [platformId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await db.functions.invoke('refreshPlatformData', { platform_id: platformId });
      const d = res?.data;
      if (d) {
        const next = {
          activityPeaks: d.activityPeaks || {},
          dayMultipliers: d.dayMultipliers || {},
          updatedDate: d.updated_date || new Date().toISOString(),
        };
        setData(next);
        return next;
      }
    } catch (e) {
      // silently fail — baseline data still used
    } finally {
      setRefreshing(false);
    }
  }, [platformId]);

  useEffect(() => { load(); }, [load]);

  return { data, refreshing, refresh, reload: load };
}