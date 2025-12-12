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
      'Filling Station',
      'Car Range Estimate (miles)',
      'Car Tank Average (MPG)',
      'Trip Kilometers',
      'Notes'
    ];
    const rows = logs.map(log => {
      // Helper to escape CSV values
      const escapeCSV = (value: string) => {
        // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      return [
        escapeCSV(new Date(log.timestamp).toLocaleString()),
        log.currentReading.toString(),
        log.fuelGauge.toString(),
        log.justBoughtFuel ? 'Yes' : 'No',
        log.fuelAmount?.toString() ?? 'N/A',
        log.fuelPricePerLiter?.toString() ?? 'N/A',
        log.fuelLiters?.toString() ?? 'N/A',
        escapeCSV(log.fillingStation ?? 'N/A'),
        log.carRangeEstimate?.toString() ?? 'N/A',
        log.carTankAverage?.toString() ?? 'N/A',
        log.tripKilometers?.toString() ?? 'N/A',
        escapeCSV(log.notes ?? 'N/A'),
      ];
    });

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

  async importFromCSV(csvContent: string): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    try {
      const lines = csvContent.trim().split('\n');

      if (lines.length < 2) {
        errors.push('CSV file is empty or has no data rows');
        return { success: 0, errors };
      }

      // Skip header row
      const dataRows = lines.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed

        try {
          // Parse CSV row (handle quoted values with commas)
          const row = this.parseCSVRow(dataRows[i]);

          if (row.length < 4) {
            errors.push(`Row ${rowNumber}: Insufficient columns`);
            continue;
          }

          // Parse date
          const timestamp = new Date(row[0]).getTime();
          if (isNaN(timestamp)) {
            errors.push(`Row ${rowNumber}: Invalid date format`);
            continue;
          }

          // Parse required fields
          const currentReading = parseFloat(row[1]);
          const fuelGauge = parseFloat(row[2]);
          const justBoughtFuel = row[3].toLowerCase() === 'yes';

          if (isNaN(currentReading) || currentReading <= 0) {
            errors.push(`Row ${rowNumber}: Invalid current reading`);
            continue;
          }

          if (isNaN(fuelGauge) || fuelGauge < 1 || fuelGauge > 11) {
            errors.push(`Row ${rowNumber}: Invalid fuel gauge (must be 1-11)`);
            continue;
          }

          // Parse optional fields
          const fuelAmount = row[4] && row[4] !== 'N/A' ? parseFloat(row[4]) : undefined;
          const fuelPricePerLiter = row[5] && row[5] !== 'N/A' ? parseFloat(row[5]) : undefined;
          const fuelLiters = row[6] && row[6] !== 'N/A' ? parseFloat(row[6]) : undefined;
          const fillingStation = row[7] && row[7] !== 'N/A' ? row[7] : undefined;
          const carRangeEstimate = row[8] && row[8] !== 'N/A' ? parseFloat(row[8]) : undefined;
          const carTankAverage = row[9] && row[9] !== 'N/A' ? parseFloat(row[9]) : undefined;
          const tripKilometers = row[10] && row[10] !== 'N/A' ? parseFloat(row[10]) : undefined;
          const notes = row[11] && row[11] !== 'N/A' ? row[11].replace(/""/g, '"') : undefined;

          // Create log entry
          const newLog: MileageLog = {
            id: crypto.randomUUID(),
            currentReading,
            fuelGauge,
            justBoughtFuel,
            timestamp,
            fuelAmount,
            fuelPricePerLiter,
            fuelLiters,
            fillingStation,
            carRangeEstimate,
            carTankAverage,
            tripKilometers,
            notes,
          };

          // Add to storage
          const logs = await this.getMileages();
          const updatedLogs = [...logs, newLog];
          await storageService.setItem(storageService.getMileageLogsKey(), updatedLogs);

          successCount++;
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { success: successCount, errors };
    } catch (error) {
      errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: successCount, errors };
    }
  }

  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Double quote escape
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());

    return result;
  }
}

export const appService = new AppService();
