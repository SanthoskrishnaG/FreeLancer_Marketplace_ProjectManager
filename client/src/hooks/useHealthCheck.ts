import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../api/health.api.js';
import { HealthResponse } from '../types/index.js';

export function useHealthCheck() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getHealth();
      setData(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to backend server');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    data,
    isLoading,
    error,
    isHealthy: data?.success === true,
    refetch: checkHealth,
  };
}
