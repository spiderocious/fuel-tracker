import { FaGasPump, FaRoad, FaChartLine, FaClipboardList } from 'react-icons/fa';
import { Card } from '@web/ui/components/Card';
import { useAnalytics } from '../api/use-analytics';
import { formatCurrency, formatNumber } from '@web/shared/helpers/format';

export function DashboardScreen() {
  const { analytics, loading, error } = useAnalytics();

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
      icon: FaChartLine,
      label: 'Avg Fuel per Mile',
      value: formatCurrency(analytics.averageFuelPerMile),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: FaGasPump,
      label: 'Longest Mile per Gauge Tick',
      value: `${formatNumber(analytics.longestMilePerGaugeTick, 1)} mi`,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
    {
      icon: FaChartLine,
      label: 'Avg Fuel per Gauge Tick',
      value: formatCurrency(analytics.averageFuelPerGaugeTick),
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
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
            Fuel Efficiency Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Cost per mile</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analytics.averageFuelPerMile)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Best efficiency (miles/tick)</span>
              <span className="font-semibold text-gray-900">
                {formatNumber(analytics.longestMilePerGaugeTick, 1)} mi
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost per gauge tick</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analytics.averageFuelPerGaugeTick)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total entries</span>
              <span className="font-semibold text-gray-900">
                {analytics.totalLogs}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Distance tracked</span>
              <span className="font-semibold text-gray-900">
                {formatNumber(analytics.totalMilesCovered, 0)} miles
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total spent on fuel</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analytics.totalFuelSpent)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
