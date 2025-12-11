export interface MileageLog {
  id: string;
  currentReading: number;
  fuelGauge: number;
  justBoughtFuel: boolean;
  fuelAmount?: number;
  timestamp: number;
  // Enhanced fuel tracking
  fuelPricePerLiter?: number;
  fuelLiters?: number;
  fillingStation?: string; // Name of gas station
  // Car display data
  carRangeEstimate?: number; // Distance to empty shown by car (miles)
  carTankAverage?: number; // MPG shown by car
  // Additional info
  notes?: string; // General notes
  tripKilometers?: number; // Trip distance in km (stored for reference)
}

export interface MileageAnalytics {
  averageFuelPerMile: number;
  longestMilePerGaugeTick: number;
  totalLogs: number;
  totalMilesCovered: number;
  totalFuelSpent: number;
  averageFuelPerGaugeTick: number;
  // Enhanced analytics
  actualMPG: number; // Calculated from fuel consumption
  averageFuelPricePerLiter: number;
  totalFuelLiters: number;
  averageMilesPerFillup: number;
  carEstimatedMPG: number; // Average of car's displayed MPG
  mpgAccuracy: number; // Percentage difference between car estimate and actual
  rangeAccuracy: number; // How accurate car's range estimates are
  bestMPG: number;
  worstMPG: number;
}
