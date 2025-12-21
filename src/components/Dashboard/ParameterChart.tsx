import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Dialog,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

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

import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import { CHART_COLORS } from '@/utils/constants';
import type { ParameterChartData } from '@/types';

interface ParameterChartProps {
  equipmentId: number;
  parameterId: number;
  parameterName: string;
  unit: string;
}

const CO2_BAR_COLORS = ['#6B7280', '#9CA3AF', '#FBCFE8', '#F97316'];

const ParameterChart: React.FC<ParameterChartProps> = ({
  equipmentId,
  parameterId,
  parameterName,
  unit,
}) => {
  const [chartData, setChartData] = useState<ParameterChartData | null>(null);
  const [loading, setLoading] = useState(true);

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const [chartMenuAnchor, setChartMenuAnchor] =
    useState<null | HTMLElement>(null);

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

  const displayData = useMemo(() => {
    if (!chartData) return [];

    const today = dayjs();
    if (selectedDate.isSame(today, 'day')) {
      return chartData.data;
    }
    return [];
  }, [chartData, selectedDate]);

const INCUBATOR_BULLET_COLORS: Record<string, string> = {
  A: '#232323',     // Incubator A bullet color
  B: '#DDDDDD',     // Incubator B bullet color
  C: '#FFD0C7',     // Incubator C bullet color
  D: '#E17E61',     // Incubator D bullet color in the legend
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

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <CardContent>
        {/* HEADER */}
        <Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={2}
>
  {/* LEFT: TITLE ONLY */}
  <Typography fontWeight={700}>
    {parameterName} Chart
  </Typography>

  {/* RIGHT: LEGEND + ICONS ----- Incubator A B C D -------- on top of chart */}
  <Box display="flex" alignItems="center" gap={2}>
    
    <Box display="flex" alignItems="center" gap={1}>
      {chartData.equipment_names.map((name, index) => (
        <Box key={name} display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor:
                INCUBATOR_BULLET_COLORS[name] ||
                chartType === 'bar'
                  ? CO2_BAR_COLORS[index % CO2_BAR_COLORS.length]
                  : CHART_COLORS[index % CHART_COLORS.length],
            }}
          />
          <Typography variant="caption">{name}</Typography>
        </Box>
      ))}
    </Box>
</Box>
          <Box display="flex" gap={1}>
            {/* CHART SWITCH WITH DROPDOWN */}
            <IconButton
              size="small"
              onClick={(e) => setChartMenuAnchor(e.currentTarget)}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              {chartType === 'line' ? (
                <ShowChartIcon fontSize="small" sx={{ color: '#E17E61' }} />
              ) : (
                <BarChartIcon fontSize="small" sx={{ color: '#E17E61' }} />
              )}

              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{ color: '#111827' }}
              />
            </IconButton>

            <Menu
              anchorEl={chartMenuAnchor}
              open={Boolean(chartMenuAnchor)}
              onClose={() => setChartMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setChartType('line');
                  setChartMenuAnchor(null);
                }}
              >
                <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
                Line Chart
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setChartType('bar');
                  setChartMenuAnchor(null);
                }}
              >
                <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
                Bar Chart
              </MenuItem>
            </Menu>

            {/* CALENDAR ICON */}
            <IconButton
              size="small"
              onClick={() => setCalendarOpen(true)}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '4px',
              }}
            >
              <EventOutlinedIcon fontSize="small" sx={{ color: '#6B7280' }} />
            </IconButton>
          </Box>
        </Box>

        {/* CALENDAR DIALOG */}
        <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
          <Box p={2}>
            <Typography fontWeight={600} mb={1}>
              Select Date
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue!);
                  setCalendarOpen(false);
                }}
                showDaysOutsideCurrentMonth
              />
            </LocalizationProvider>
          </Box>
        </Dialog>

        <Box sx={{ position: 'relative', left: -16, width: 'calc(100% + 32px)', mb: 2 }}>
  <Divider />
</Box>


        {/* NO DATA / GRAPH */}
        {displayData.length === 0 ? (
          <Box
            height={320}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography fontWeight={600} color="text.secondary">
              NO DATA THIS DAY
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'bar' ? (
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                
                {chartData.equipment_names.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    fill={CO2_BAR_COLORS[index % CO2_BAR_COLORS.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
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
        )}
      </CardContent>
    </Card>
  );
};

export default ParameterChart;
