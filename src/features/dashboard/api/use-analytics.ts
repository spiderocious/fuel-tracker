import { useState, useEffect } from 'react';
import type { MileageAnalytics } from '@web/shared/types/mileage.types';
import { appService } from '@web/shared/services/app.service';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<MileageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
