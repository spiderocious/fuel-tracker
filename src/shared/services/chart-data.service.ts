import type { MileageLog } from '@web/shared/types/mileage.types';

export interface ChartDataPoint {
  timestamp: number;
  actualMPG?: number;
  carEstimatedMPG?: number;
  pricePerLiter?: number;
  miles?: number;
  costPerMile?: number;
}

class ChartDataService {
  getTimeSeriesData(logs: MileageLog[]): ChartDataPoint[] {
    if (logs.length < 2) return [];

    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const dataPoints: ChartDataPoint[] = [];

    for (let i = 1; i < sortedLogs.length; i++) {
      const prev = sortedLogs[i - 1];
      const current = sortedLogs[i];

      const milesCovered = current.currentReading - prev.currentReading;

      if (milesCovered <= 0) continue;

      const dataPoint: ChartDataPoint = {
        timestamp: current.timestamp,
        miles: milesCovered,
      };

      // Calculate MPG if fuel was purchased
      if (current.justBoughtFuel && current.fuelLiters && milesCovered > 0) {
        const gallons = current.fuelLiters * 0.264172; // Convert liters to gallons
        dataPoint.actualMPG = milesCovered / gallons;
      }

      // Add car estimated MPG
      if (current.carTankAverage) {
        dataPoint.carEstimatedMPG = current.carTankAverage;
      }

      // Add fuel price
      if (current.fuelPricePerLiter) {
        dataPoint.pricePerLiter = current.fuelPricePerLiter;
      }

      // Calculate cost per mile
      if (current.fuelAmount && milesCovered > 0) {
        dataPoint.costPerMile = current.fuelAmount / milesCovered;
      }

      dataPoints.push(dataPoint);
    }

    return dataPoints;
  }

  getMPGData(logs: MileageLog[]) {
    const data = this.getTimeSeriesData(logs);
    return data
      .filter(d => d.actualMPG !== undefined || d.carEstimatedMPG !== undefined)
      .map(d => ({
        timestamp: d.timestamp,
        actualMPG: d.actualMPG || 0,
        carEstimatedMPG: d.carEstimatedMPG,
      }));
  }

  getFuelPriceData(logs: MileageLog[]) {
    const data = this.getTimeSeriesData(logs);
    return data
      .filter(d => d.pricePerLiter !== undefined)
      .map(d => ({
        timestamp: d.timestamp,
        pricePerLiter: d.pricePerLiter!,
      }));
  }

  getMilesPerFillupData(logs: MileageLog[]) {
    const data = this.getTimeSeriesData(logs);
    return data
      .filter(d => d.miles !== undefined)
      .map(d => ({
        timestamp: d.timestamp,
        miles: d.miles!,
      }));
  }

  getCostPerMileData(logs: MileageLog[]) {
    const data = this.getTimeSeriesData(logs);
    return data
      .filter(d => d.costPerMile !== undefined)
      .map(d => ({
        timestamp: d.timestamp,
        costPerMile: d.costPerMile!,
      }));
  }
}

export const chartDataService = new ChartDataService();
