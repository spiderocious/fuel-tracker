import { useState, useEffect } from 'react';
import type { MileageLog } from '@web/shared/types/mileage.types';
import { appService } from '@web/shared/services/app.service';

export function useMileages() {
  const [mileages, setMileages] = useState<MileageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMileages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appService.getMileages();
      setMileages(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      setError('Failed to load mileages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMileage = async (id: string) => {
    try {
      await appService.deleteMileage(id);
      await fetchMileages();
    } catch (err) {
      setError('Failed to delete mileage');
      console.error(err);
    }
  };

  const clearAllData = async () => {
    try {
      await appService.clearAllData();
      await fetchMileages();
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
    }
  };

  const exportToCSV = async () => {
    try {
      const csvContent = await appService.exportToCSV();
      appService.downloadCSV(csvContent);
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMileages();
  }, []);

  return {
    mileages,
    loading,
    error,
    refetch: fetchMileages,
    deleteMileage,
    clearAllData,
    exportToCSV,
  };
}
