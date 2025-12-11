import { FaGasPump, FaRoad, FaChartLine, FaClipboardList, FaCar, FaTachometerAlt } from 'react-icons/fa';
import { Card } from '@web/ui/components/Card';
import { useAnalytics } from '../api/use-analytics';
import { useMileages } from '@web/features/mileage-list/api/use-mileages';
import { formatCurrency, formatNumber } from '@web/shared/helpers/format';
import { chartDataService } from '@web/shared/services/chart-data.service';
import { MPGTrendChart } from '@web/ui/components/charts/MPGTrendChart';
import { FuelPriceChart } from '@web/ui/components/charts/FuelPriceChart';
import { MilesPerFillupChart } from '@web/ui/components/charts/MilesPerFillupChart';
import { CostPerMileChart } from '@web/ui/components/charts/CostPerMileChart';

export function DashboardScreen() {
  const { analytics, loading, error } = useAnalytics();
  const { mileages } = useMileages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <p className="text-red-500 text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.totalLogs === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center">
          <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Yet</h2>
          <p className="text-gray-600">
            Start tracking your mileage by adding your first log!
          </p>
        </Card>
      </div>
    );
  }

  // Get chart data
  const mpgData = chartDataService.getMPGData(mileages);
  const fuelPriceData = chartDataService.getFuelPriceData(mileages);
  const milesPerFillupData = chartDataService.getMilesPerFillupData(mileages);
  const costPerMileData = chartDataService.getCostPerMileData(mileages);

  const stats = [
    {
      icon: FaClipboardList,
      label: 'Total Logs',
      value: analytics.totalLogs.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FaRoad,
      label: 'Total Miles Covered',
      value: formatNumber(analytics.totalMilesCovered, 0),
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: FaGasPump,
      label: 'Total Fuel Spent',
      value: formatCurrency(analytics.totalFuelSpent),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: FaTachometerAlt,
      label: 'Actual MPG',
      value: analytics.actualMPG > 0 ? `${formatNumber(analytics.actualMPG, 1)} MPG` : 'N/A',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FaCar,
      label: 'Car Estimated MPG',
      value: analytics.carEstimatedMPG > 0 ? `${formatNumber(analytics.carEstimatedMPG, 1)} MPG` : 'N/A',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: FaChartLine,
      label: 'Avg Fuel per Mile',
      value: formatCurrency(analytics.averageFuelPerMile),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Your mileage tracking analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-2xl" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            MPG Comparison
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Your Actual MPG</span>
              <span className="font-semibold text-blue-600">
                {analytics.actualMPG > 0 ? `${formatNumber(analytics.actualMPG, 1)} MPG` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Car's Estimated MPG</span>
              <span className="font-semibold text-green-600">
                {analytics.carEstimatedMPG > 0 ? `${formatNumber(analytics.carEstimatedMPG, 1)} MPG` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">MPG Accuracy</span>
              <span className={`font-semibold ${analytics.mpgAccuracy > 0 ? 'text-green-600' : analytics.mpgAccuracy < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {analytics.mpgAccuracy !== 0 ? `${analytics.mpgAccuracy > 0 ? '+' : ''}${formatNumber(analytics.mpgAccuracy, 1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Range Accuracy</span>
              <span className="font-semibold text-gray-900">
                {analytics.rangeAccuracy > 0 ? `${formatNumber(analytics.rangeAccuracy, 1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best / Worst MPG</span>
              <span className="font-semibold text-gray-900">
                {analytics.bestMPG > 0 ? `${formatNumber(analytics.bestMPG, 1)} / ${formatNumber(analytics.worstMPG, 1)}` : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fuel Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Fuel Liters</span>
              <span className="font-semibold text-gray-900">
                {analytics.totalFuelLiters > 0 ? `${formatNumber(analytics.totalFuelLiters, 1)} L` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Avg Price per Liter</span>
              <span className="font-semibold text-gray-900">
                {analytics.averageFuelPricePerLiter > 0 ? formatCurrency(analytics.averageFuelPricePerLiter) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Avg Miles per Fillup</span>
              <span className="font-semibold text-gray-900">
                {analytics.averageMilesPerFillup > 0 ? `${formatNumber(analytics.averageMilesPerFillup, 0)} mi` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost per Mile</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analytics.averageFuelPerMile)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      {mileages.length > 1 && (
        <>
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Trends</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mpgData.length > 0 && (
              <Card>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">MPG Trend</h4>
                <MPGTrendChart data={mpgData} />
              </Card>
            )}

            {costPerMileData.length > 0 && (
              <Card>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost per Mile</h4>
                <CostPerMileChart data={costPerMileData} />
              </Card>
            )}

            {fuelPriceData.length > 0 && (
              <Card>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Fuel Price Trend</h4>
                <FuelPriceChart data={fuelPriceData} />
              </Card>
            )}

            {milesPerFillupData.length > 0 && (
              <Card>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Miles per Fillup</h4>
                <MilesPerFillupChart data={milesPerFillupData} />
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
