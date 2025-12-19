import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
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
  ReferenceDot,
} from 'recharts';
import { FilterList, GetApp } from '@mui/icons-material';
import { CHART_COLORS } from '@/utils/constants';
import type { ParameterChartData } from '@/types';

interface ParameterChartProps {
  equipmentId: number;
  parameterId: number;
  parameterName: string;
  unit: string;
}

const CO2_BAR_COLORS = [
  '#6B7280', // Incubator A
  '#9CA3AF', // Incubator B
  '#FBCFE8', // Incubator C
  '#F97316', // Incubator D
];

const ParameterChart: React.FC<ParameterChartProps> = ({
  equipmentId,
  parameterId,
  parameterName,
  unit,
}) => {
  const [chartData, setChartData] = useState<ParameterChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [equipmentId, parameterId]);

  const loadChartData = async () => {
    setLoading(true);
    const { getMockChartData } = await import('@/utils/mockData');
    const mockData = getMockChartData(equipmentId, parameterName);

    setChartData({
      ...mockData,
      parameter_name: parameterName,
      unit,
    });
    setLoading(false);
  };

  if (loading || !chartData) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading chart...</Typography>
        </CardContent>
      </Card>
    );
  }

  const isCO2 = parameterName
    .toLowerCase()
    .replace('₂', '2')
    .includes('co2');

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight={600}>
            {parameterName} Chart
          </Typography>
          <Box>
            <IconButton size="small"><FilterList fontSize="small" /></IconButton>
            <IconButton size="small"><GetApp fontSize="small" /></IconButton>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={320}>
          {isCO2 ? (
            /* ================= CO₂ BAR CHART ================= */
            <BarChart
              data={chartData.data}
              barCategoryGap={18}
              barGap={4}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />

              <YAxis
                domain={[5, 7]}
                tickCount={5}
                tickFormatter={(v) => `${v.toFixed(1)}`}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{
                  value: 'CO₂ Conc. (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6B7280', fontSize: 12 },
                }}
              />

              <Tooltip formatter={(v: number) => `${v}%`} />

              <Legend iconType="circle" />

              {chartData.equipment_names.map((name, index) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={CO2_BAR_COLORS[index]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={26}
                />
              ))}

              {/* Highlight bubble (Tuesday – Incubator C) */}
              <ReferenceDot
                x="Tuesday"
                y={6.39}
                r={0}
                label={{
                  value: '6.39%',
                  position: 'top',
                  fill: '#111827',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </BarChart>
          ) : (
            /* ================= LINE CHART ================= */
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              {chartData.equipment_names.map((name, index) => (
                <Line
                  key={name}
                  dataKey={name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ParameterChart;