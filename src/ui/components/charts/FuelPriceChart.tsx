import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, formatCurrency } from '@web/shared/helpers/format';

interface FuelPriceData {
  timestamp: number;
  pricePerLiter: number;
}

interface FuelPriceChartProps {
  data: FuelPriceData[];
}

export function FuelPriceChart({ data }: FuelPriceChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.timestamp),
    price: item.pricePerLiter,
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
          label={{ value: 'Price (₦/L)', angle: -90, position: 'insideLeft' }}
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
          formatter={(value: number) => [formatCurrency(value), 'Price per Liter']}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
