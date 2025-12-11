import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, formatCurrency } from '@web/shared/helpers/format';

interface CostData {
  timestamp: number;
  costPerMile: number;
}

interface CostPerMileChartProps {
  data: CostData[];
}

export function CostPerMileChart({ data }: CostPerMileChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.timestamp),
    cost: item.costPerMile,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis
          label={{ value: 'Cost per Mile (₦)', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `₦${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          formatter={(value: number) => [formatCurrency(value), 'Cost per Mile']}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
