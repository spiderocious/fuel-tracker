import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDate } from '@web/shared/helpers/format';

interface MPGData {
  timestamp: number;
  actualMPG: number;
  carEstimatedMPG?: number;
}

interface MPGTrendChartProps {
  data: MPGData[];
}

export function MPGTrendChart({ data }: MPGTrendChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.timestamp),
    'Actual MPG': item.actualMPG,
    'Car Estimated MPG': item.carEstimatedMPG || null,
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
          label={{ value: 'MPG', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Actual MPG"
          stroke="#0361f0"
          strokeWidth={2}
          dot={{ fill: '#0361f0', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Car Estimated MPG"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
