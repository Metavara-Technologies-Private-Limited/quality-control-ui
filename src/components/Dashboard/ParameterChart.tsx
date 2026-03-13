import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Dialog,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { EquipmentDetail, ParameterChartData } from "@/types";

interface ParameterChartProps {
  equipmentDetails: EquipmentDetail[];
  parameterName: string;
  unit: string;
  parameterConfig?: {
    min_value?: number | string | null;
    max_value?: number | string | null;
    content?: {
      min_value?: number | string | null;
      max_value?: number | string | null;
    };
    Content?: {
      min_value?: number | string | null;
      max_value?: number | string | null;
    };
  };
  parameterMeta?: any;
  values: any[];
  loading: boolean;
}

const CHART_COLORS = ["#6C6C6C", "#9B9B9B", "#FFD0C7", "#EF9685"];

const ParameterChart: React.FC<ParameterChartProps> = ({
  equipmentDetails,
  parameterName,
  unit,
  parameterConfig,
  parameterMeta,
  values,
  loading,
}) => {
  const [chartData, setChartData] = useState<ParameterChartData | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("bar");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [chartMenuAnchor, setChartMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const toFiniteNumber = (value: unknown): number | null => {
    if (value == null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const configContent =
    parameterMeta?.config?.content ?? parameterMeta?.config?.Content;
  const rootContent = parameterMeta?.Content ?? parameterMeta?.content;

  const resolvedMinRaw =
    parameterConfig?.min_value ??
    parameterConfig?.content?.min_value ??
    parameterConfig?.Content?.min_value ??
    parameterMeta?.config?.min_value ??
    configContent?.min_value ??
    rootContent?.min_value;

  const resolvedMaxRaw =
    parameterConfig?.max_value ??
    parameterConfig?.content?.max_value ??
    parameterConfig?.Content?.max_value ??
    parameterMeta?.config?.max_value ??
    configContent?.max_value ??
    rootContent?.max_value;

  const configuredMin = toFiniteNumber(resolvedMinRaw);
  const configuredMax = toFiniteNumber(resolvedMaxRaw);
  const hasConfiguredRange =
    configuredMin != null &&
    configuredMax != null &&
    configuredMin < configuredMax;

  const yAxisTicks = React.useMemo(() => {
    if (!hasConfiguredRange || configuredMin == null || configuredMax == null) {
      return undefined;
    }

    const range = configuredMax - configuredMin;
    const approxStep = range / 4;
    const step = Math.max(0.1, Math.round(approxStep * 10) / 10);
    const ticks: number[] = [];

    for (
      let value = configuredMin;
      value <= configuredMax + 1e-9;
      value += step
    ) {
      ticks.push(Number(value.toFixed(2)));
    }

    if (ticks[ticks.length - 1] !== configuredMax) {
      ticks.push(Number(configuredMax.toFixed(2)));
    }

    return ticks;
  }, [hasConfiguredRange, configuredMin, configuredMax]);

  const yAxisDomain = useMemo<[number, number] | [string, string]>(() => {
    if (!hasConfiguredRange || configuredMin == null || configuredMax == null) {
      return ["dataMin", "dataMax"];
    }

    const range = configuredMax - configuredMin;
    const visualPad = Math.max(0.1, range * 0.08);
    return [configuredMin - visualPad, configuredMax + visualPad];
  }, [hasConfiguredRange, configuredMin, configuredMax]);

  const yAxisProps = {
    label: {
      value: `${parameterName} (${unit})`,
      angle: -90,
      position: "insideLeft",
      offset: 20,
      style: {
        textAnchor: "middle",
        fill: "#374151",
        opacity: 0.6,
        fontSize: 12,
        fontWeight: 600,
      },
    },
    domain: yAxisDomain,
    allowDataOverflow: true,
    tickCount: hasConfiguredRange ? 6 : 5,
    allowDecimals: true,
    ticks: yAxisTicks,
  };

  const dayLabels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const xAxisProps = {
    dataKey: "date",
    label: {
      value: "Days",
      position: "insideBottom",
      offset: -5,
      style: {
        fill: "#6B7280",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    tick: {
      fontSize: 12,
      fill: "#6B7280",
    },
    tickMargin: 8,
    axisLine: { stroke: "#E5E7EB" },
    tickLine: false,
  };

  useEffect(() => {
    if (!values.length) {
      setChartData(null);
      return;
    }

    const selected = selectedDate.startOf("day");
    const mondayOffset = (selected.day() + 6) % 7;
    const weekStart = selected.subtract(mondayOffset, "day").startOf("day");
    const weekEnd = weekStart.add(6, "day").endOf("day");

    const detailMap = equipmentDetails.reduce<Record<number, string>>(
      (acc, { id, equipment_num }) => {
        if (id != null) acc[id] = equipment_num;
        return acc;
      },
      {},
    );

    const equipmentNames = new Set<string>();
    const bucketMap: Record<string, { value: number | null; ts: number }[]> =
      {};

    values.forEach((v: any) => {
      if (!v.equipment_details_id) return;

      const day = dayjs(v.created_at);
      if (!day.isValid()) return;
      if (day.isBefore(weekStart) || day.isAfter(weekEnd)) return;

      const eqName = detailMap[Number(v.equipment_details_id)];
      if (!eqName) return;

      const numericValue = Number(v.content);
      if (!Number.isFinite(numericValue)) return;

      equipmentNames.add(eqName);

      const dayIndex = (day.day() + 6) % 7;
      bucketMap[eqName] ??= Array.from({ length: 7 }, () => ({
        value: null,
        ts: -1,
      }));

      const ts = day.valueOf();
      if (ts >= bucketMap[eqName][dayIndex].ts) {
        bucketMap[eqName][dayIndex].value = numericValue;
        bucketMap[eqName][dayIndex].ts = ts;
      }
    });

    if (!equipmentNames.size) {
      setChartData(null);
      return;
    }

    const data = dayLabels.map((label, index) => {
      const row: Record<string, string | number | null> = { date: label };

      equipmentNames.forEach((eqName) => {
        const bucket = bucketMap[eqName]?.[index];
        if (!bucket || bucket.value == null) {
          row[eqName] = null;
          return;
        }

        // Use latest entered value for that day.
        row[eqName] = Number(bucket.value.toFixed(2));
      });

      return row;
    });

    setChartData({
      chartType: "line",
      unit,
      parameter_name: parameterName,
      equipment_names: [...equipmentNames],
      data: data as any,
    });
  }, [values, selectedDate, equipmentDetails, parameterName, unit]);

  const displayData = chartData?.data ?? [];

  const lineDisplayData = useMemo(() => {
    if (!chartData?.equipment_names?.length || !displayData.length) {
      return displayData;
    }

    const normalized = displayData.map((row) => ({ ...row })) as Array<
      Record<string, string | number | null>
    >;

    chartData.equipment_names.forEach((eqName) => {
      const values = normalized.map((row) => {
        const raw = row[eqName];
        return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
      });

      const knownIndices = values
        .map((value, idx) => (value != null ? idx : -1))
        .filter((idx) => idx >= 0);

      if (!knownIndices.length) {
        return;
      }

      // Interpolate gaps between known weekday points for smooth waves.
      for (let k = 0; k < knownIndices.length - 1; k++) {
        const startIdx = knownIndices[k];
        const endIdx = knownIndices[k + 1];
        const startVal = values[startIdx] as number;
        const endVal = values[endIdx] as number;
        const distance = endIdx - startIdx;

        if (distance <= 1) continue;

        for (let i = startIdx + 1; i < endIdx; i++) {
          const ratio = (i - startIdx) / distance;
          values[i] = Number(
            (startVal + (endVal - startVal) * ratio).toFixed(2),
          );
        }
      }

      values.forEach((v, idx) => {
        normalized[idx][eqName] = v;
      });
    });

    return normalized;
  }, [displayData, chartData?.equipment_names]);

  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
      <CardContent>
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {/* LEFT: TITLE ONLY */}
          <Typography fontWeight={700}>{parameterName} Chart</Typography>

          {/* RIGHT: LEGEND + ICONS ----- Incubator A B C D -------- on top of chart */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {chartData?.equipment_names?.map((name, index) => (
                <Box key={name} display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
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
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "4px 6px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              {chartType === "line" ? (
                <ShowChartIcon fontSize="small" sx={{ color: "#E17E61" }} />
              ) : (
                <BarChartIcon fontSize="small" sx={{ color: "#E17E61" }} />
              )}

              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{ color: "#111827" }}
              />
            </IconButton>

            <Menu
              anchorEl={chartMenuAnchor}
              open={Boolean(chartMenuAnchor)}
              onClose={() => setChartMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setChartType("line");
                  setChartMenuAnchor(null);
                }}
              >
                <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
                Line Chart
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setChartType("bar");
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
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              <EventOutlinedIcon fontSize="small" sx={{ color: "#6B7280" }} />
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

        <Box
          sx={{
            position: "relative",
            left: -16,
            width: "calc(100% + 32px)",
            mb: 2,
          }}
        >
          <Divider />
        </Box>

        {/* NO DATA / GRAPH */}
        <Box height={320}>
          {loading ? (
            <Box
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography>Loading chart...</Typography>
            </Box>
          ) : displayData.length === 0 ? (
            <Box
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography fontWeight={600} color="text.secondary">
                NO DATA THIS DAY
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip />
                  {chartData?.equipment_names?.map((name, index) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={[6, 6, 0, 0]}
                      barSize={18}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={lineDisplayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip />
                  {chartData?.equipment_names?.map((name, index) => (
                    <Line
                      key={name}
                      dataKey={name}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                      type="monotone"
                      connectNulls
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ParameterChart;
