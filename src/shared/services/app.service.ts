import type { MileageLog, MileageAnalytics } from '@web/shared/types/mileage.types';
import { storageService } from './storage.service';

class AppService {
  async getMileages(): Promise<MileageLog[]> {
    const logs = await storageService.getItem<MileageLog[]>(
      storageService.getMileageLogsKey()
    );
    return logs ?? [];
  }

  async addMileage(log: Omit<MileageLog, 'id' | 'timestamp'>): Promise<MileageLog> {
    const logs = await this.getMileages();

    const newLog: MileageLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const updatedLogs = [...logs, newLog];
    await storageService.setItem(storageService.getMileageLogsKey(), updatedLogs);

    return newLog;
  }

  async deleteMileage(id: string): Promise<void> {
    const logs = await this.getMileages();
    const updatedLogs = logs.filter(log => log.id !== id);
    await storageService.setItem(storageService.getMileageLogsKey(), updatedLogs);
  }

  async clearAllData(): Promise<void> {
    await storageService.clear();
  }

  async getAnalytics(): Promise<MileageAnalytics> {
    const logs = await this.getMileages();

    if (logs.length === 0) {
      return {
        averageFuelPerMile: 0,
        longestMilePerGaugeTick: 0,
        totalLogs: 0,
        totalMilesCovered: 0,
        totalFuelSpent: 0,
        averageFuelPerGaugeTick: 0,
        actualMPG: 0,
        averageFuelPricePerLiter: 0,
        totalFuelLiters: 0,
        averageMilesPerFillup: 0,
        carEstimatedMPG: 0,
        mpgAccuracy: 0,
        rangeAccuracy: 0,
        bestMPG: 0,
        worstMPG: 0,
      };
    }

    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

    let totalMilesCovered = 0;
    let totalFuelSpent = 0;
    let totalGaugeTicks = 0;
    let maxMilePerGaugeTick = 0;
    let totalFuelLiters = 0;
    let totalFuelPriceSum = 0;
    let fuelPriceCount = 0;
    let totalCarEstimatedMPG = 0;
    let carMPGCount = 0;
    let fillupCount = 0;
    let totalMilesPerFillup = 0;
    const mpgValues: number[] = [];
    let totalRangeError = 0;
    let rangeEstimateCount = 0;

    for (let i = 1; i < sortedLogs.length; i++) {
      const prev = sortedLogs[i - 1];
      const current = sortedLogs[i];

      const milesCovered = current.currentReading - prev.currentReading;
      const gaugeDifference = Math.abs(current.fuelGauge - prev.fuelGauge);

      if (milesCovered > 0) {
        totalMilesCovered += milesCovered;

        if (gaugeDifference > 0) {
          totalGaugeTicks += gaugeDifference;
          const milePerTick = milesCovered / gaugeDifference;
          maxMilePerGaugeTick = Math.max(maxMilePerGaugeTick, milePerTick);
        }
      }

      // Enhanced fuel tracking
      if (current.justBoughtFuel) {
        fillupCount++;

        if (current.fuelAmount) {
          totalFuelSpent += current.fuelAmount;
        }

        if (current.fuelLiters) {
          totalFuelLiters += current.fuelLiters;

          // Calculate MPG for this fillup if we have miles and liters
          if (milesCovered > 0) {
            const gallons = current.fuelLiters * 0.264172; // Convert liters to gallons
            const mpg = milesCovered / gallons;
            mpgValues.push(mpg);
            totalMilesPerFillup += milesCovered;
          }
        }

        if (current.fuelPricePerLiter) {
          totalFuelPriceSum += current.fuelPricePerLiter;
          fuelPriceCount++;
        }
      }

      // Car display data tracking
      if (current.carTankAverage) {
        totalCarEstimatedMPG += current.carTankAverage;
        carMPGCount++;
      }

      // Range accuracy: compare previous range estimate to actual miles driven
      if (prev.carRangeEstimate && milesCovered > 0) {
        const rangeError = Math.abs(prev.carRangeEstimate - milesCovered) / prev.carRangeEstimate;
        totalRangeError += rangeError;
        rangeEstimateCount++;
      }
    }

    const averageFuelPerMile = totalMilesCovered > 0 ? totalFuelSpent / totalMilesCovered : 0;
    const averageFuelPerGaugeTick = totalGaugeTicks > 0 ? totalFuelSpent / totalGaugeTicks : 0;
    const actualMPG = mpgValues.length > 0 ? mpgValues.reduce((a, b) => a + b, 0) / mpgValues.length : 0;
    const averageFuelPricePerLiter = fuelPriceCount > 0 ? totalFuelPriceSum / fuelPriceCount : 0;
    const averageMilesPerFillup = fillupCount > 0 ? totalMilesPerFillup / fillupCount : 0;
    const carEstimatedMPG = carMPGCount > 0 ? totalCarEstimatedMPG / carMPGCount : 0;
    const mpgAccuracy = carEstimatedMPG > 0 && actualMPG > 0
      ? ((actualMPG - carEstimatedMPG) / carEstimatedMPG) * 100
      : 0;
    const rangeAccuracy = rangeEstimateCount > 0
      ? (1 - totalRangeError / rangeEstimateCount) * 100
      : 0;
    const bestMPG = mpgValues.length > 0 ? Math.max(...mpgValues) : 0;
    const worstMPG = mpgValues.length > 0 ? Math.min(...mpgValues) : 0;

    return {
      averageFuelPerMile,
      longestMilePerGaugeTick: maxMilePerGaugeTick,
      totalLogs: logs.length,
      totalMilesCovered,
      totalFuelSpent,
      averageFuelPerGaugeTick,
      actualMPG,
      averageFuelPricePerLiter,
      totalFuelLiters,
      averageMilesPerFillup,
      carEstimatedMPG,
      mpgAccuracy,
      rangeAccuracy,
      bestMPG,
      worstMPG,
    };
  }

  async exportToCSV(): Promise<string> {
    const logs = await this.getMileages();

    if (logs.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'Date',
      'Current Reading (miles)',
      'Fuel Gauge',
      'Just Bought Fuel',
      'Fuel Amount (₦)',
      'Fuel Price/Liter (₦)',
      'Fuel Liters',
      'Car Range Estimate (miles)',
      'Car Tank Average (MPG)'
    ];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.currentReading.toString(),
      log.fuelGauge.toString(),
      log.justBoughtFuel ? 'Yes' : 'No',
      log.fuelAmount?.toString() ?? 'N/A',
      log.fuelPricePerLiter?.toString() ?? 'N/A',
      log.fuelLiters?.toString() ?? 'N/A',
      log.carRangeEstimate?.toString() ?? 'N/A',
      log.carTankAverage?.toString() ?? 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  downloadCSV(csvContent: string, filename: string = 'mileage-logs.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const appService = new AppService();
