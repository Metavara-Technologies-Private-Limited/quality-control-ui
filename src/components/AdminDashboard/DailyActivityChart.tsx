import React from 'react';
import {
  Card,
  CardContent,
  Typography,
 
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyActivityChartProps {
  chartType: 'line' | 'bar';
}

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ chartType }) => {
  const data = [
    { day: 'Mon', Value1: 300, Value2: 349 },
    { day: 'Tue', Value1: 150, Value2: 100 },
    { day: 'Wed', Value1: 180, Value2: 120 },
    { day: 'Thu', Value1: 140, Value2: 90 },
    { day: 'Fri', Value1: 200, Value2: 130 },
    { day: 'Sat', Value1: 160, Value2: 110 },
    { day: 'Sun', Value1: 190, Value2: 125 },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
          Daily Activity
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.75rem' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Value1"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Value2"
                stroke="#14b8a6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#14b8a6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.75rem' }}
                iconType="square"
              />
              <Bar dataKey="Value1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Value2" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DailyActivityChart;
