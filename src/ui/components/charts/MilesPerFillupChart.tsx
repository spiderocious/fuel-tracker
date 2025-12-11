import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@web/shared/helpers/format';

interface FillupData {
  timestamp: number;
  miles: number;
}

interface MilesPerFillupChartProps {
  data: FillupData[];
}

export function MilesPerFillupChart({ data }: MilesPerFillupChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.timestamp),
    miles: item.miles,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis
          label={{ value: 'Miles', angle: -90, position: 'insideLeft' }}
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
        <Bar dataKey="miles" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
