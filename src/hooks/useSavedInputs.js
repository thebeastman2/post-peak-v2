
import { useState, useEffect, useCallback } from 'react';

import { db } from '@/api/base44Client';

export function useSavedInputs() {
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('pp-session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('pp-session', id);
    }
    return id;
  });
  const [savedInputs, setSavedInputs] = useState([]);

  const loadSaved = useCallback(async () => {
    try {
      const res = await db.functions.invoke('saveInput', { session_id: sessionId });
      setSavedInputs(res.data?.saved || []);
    } catch (e) {
      // silently fail — saved inputs are a convenience, not critical
    }
  }, [sessionId]);

  const saveInput = useCallback(async (inputData) => {
    try {
      const res = await db.functions.invoke('saveInput', {
        session_id: sessionId,
        input_data: JSON.stringify(inputData),
        platform: inputData.platform
      });
      setSavedInputs(res.data?.saved || []);
    } catch (e) {
      // silently fail
    }
  }, [sessionId]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  return { savedInputs, saveInput };
}