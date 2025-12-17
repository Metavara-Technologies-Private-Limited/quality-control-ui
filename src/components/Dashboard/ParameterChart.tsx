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
  '#111827', // Incubator A
  '#D1D5DB', // Incubator B
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

  useEffect(() => {
    loadChartData();
  }, [equipmentId, parameterId]);

  const loadChartData = async () => {
    const { getMockChartData } = await import('@/utils/mockData');
    const data = getMockChartData(equipmentId, parameterName);

    setChartData({
      ...data,
      parameter_name: parameterName,
      unit,
      xAxisLabel: 'Time (in days)',
      yAxisLabel: `${parameterName} (${unit})`,
    });
  };

  if (!chartData) {
    return <Typography>Loading chart...</Typography>;
  }

  const isCO2 = parameterName
    .toLowerCase()
    .replace('₂', '2')
    .includes('co2');

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <CardContent>
        {/* HEADER */}
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
            /* ================= CO2 BAR ================= */
            <BarChart
              data={chartData.data}
              margin={{ top: 40, right: 30, left: 40, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <Legend
                verticalAlign="top"
                align="center"
                height={36}
                iconType="circle"
              />

              <XAxis
                dataKey="date"
                label={{
                  value: chartData.xAxisLabel,
                  position: 'insideBottom',
                  offset: -10,
                }}
              />

              <YAxis
                label={{
                  value: chartData.yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                }}
              />

              <Tooltip />

              {chartData.equipment_names.map((name, index) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={CO2_BAR_COLORS[index]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={26}
                />
              ))}
            </BarChart>
          ) : (
            /* ================= LINE CHART (FIGMA STYLE) ================= */
            <LineChart
              data={chartData.data}
              margin={{ top: 40, right: 30, left: 40, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              {/* LEGEND TOP CENTER */}
              <Legend
                verticalAlign="top"
                align="center"
                height={36}
                iconType="circle"
              />

              <XAxis
                dataKey="date"
                label={{
                  value: chartData.xAxisLabel,
                  position: 'insideBottom',
                  offset: -10,
                }}
              />

              <YAxis
                label={{
                  value: chartData.yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                }}
              />

              <Tooltip />

              {chartData.equipment_names.map((name, index) => (
                <Line
                  key={name}
                  dataKey={name}
                  stroke={CHART_COLORS[index]}
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
