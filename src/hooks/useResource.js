import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/errors';

// Loads data from an API function. Keeps loading / error / data and a reload().
export function useResource(fetcher, { enabled = true, initial = null, deps = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;
  const seq = useRef(0);

  const reload = useCallback(async ({ silent = false } = {}) => {
    const id = ++seq.current;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchRef.current();
      if (id === seq.current) setData(result);
      return result;
    } catch (e) {
      if (id === seq.current) setError(getErrorMessage(e));
      return null;
    } finally { if (id === seq.current) setLoading(false); }
  }, []);

  useEffect(() => {
    if (enabled) reload();
    else { seq.current += 1; setData(initial); setLoading(false); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps]);

  return { data, setData, loading, error, reload };
}
