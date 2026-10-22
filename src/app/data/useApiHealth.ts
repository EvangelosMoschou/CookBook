import { useEffect, useState } from 'react';
import { isApiMode } from './config';
import { getHealth, type HealthDto } from './repositories';

export type ApiStatus = 'disabled' | 'checking' | 'online' | 'offline';

/**
 * Polls the API once on mount so the UI can show whether the real backend is
 * reachable. In mock mode it stays 'disabled' and never issues a request.
 */
export function useApiHealth(): { status: ApiStatus; counts: HealthDto['counts'] | null } {
  const [status, setStatus] = useState<ApiStatus>(isApiMode ? 'checking' : 'disabled');
  const [counts, setCounts] = useState<HealthDto['counts'] | null>(null);

  useEffect(() => {
    if (!isApiMode) return;

    let cancelled = false;
    getHealth()
      .then((health) => {
        if (cancelled) return;
        setCounts(health.counts);
        setStatus('online');
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, counts };
}
