import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";

import { EquipmentDetail, ParameterContent } from "@/types";

interface IncidentsChartProps {
  equipmentDetails: EquipmentDetail[];
  values: any[];
  parameterConfig: ParameterContent;
}

/* -----------------------------
   EQUIPMENT COLORS (FIGMA)
----------------------------- */
const EQUIPMENT_COLORS = [
  "#6B7280", // Incubator A
  "#9CA3AF", // Incubator B
  "#FBCFE8", // Incubator C
  "#FB7185", // Incubator D
];

/* -----------------------------
   STATUS COLORS
----------------------------- */
const STATUS_COLORS = {
  high: "#F25B5B",
  normal: "#47B35F",
  low: "#9E9E9E",
};

const IncidentsChart: React.FC<IncidentsChartProps> = ({
  equipmentDetails,
  values,
  parameterConfig,
}) => {
  const validEquipmentDetailIds = useMemo(
    () => new Set(equipmentDetails.map((ed) => ed.id).filter(Boolean)),
    [equipmentDetails],
  );

  /* -----------------------------
     LOG-LEVEL INCIDENT SUMMARY
     (THIS FIXES 4 vs 124 ISSUE)
  ----------------------------- */
  const summary = useMemo(() => {
    let high = 0;
    let normal = 0;
    let low = 0;

    const min =
      parameterConfig?.min_value != null
        ? Number(parameterConfig.min_value)
        : null;

    const max =
      parameterConfig?.max_value != null
        ? Number(parameterConfig.max_value)
        : null;

    const thresholdApplicable =
      (min !== null && !isNaN(min)) || (max !== null && !isNaN(max));

    if (!thresholdApplicable) {
      return { high: 0, normal: 0, low: 0, total: 0 };
    }

    values
      .filter(
        (v) =>
          !v.is_deleted && validEquipmentDetailIds.has(v.equipment_details_id),
      )
      .forEach((v) => {
        const val = Number(v.content);
        if (isNaN(val)) return;

        if (max !== null && val > max) high++;
        else if (min !== null && val < min) low++;
        else normal++;
      });

    return {
      high,
      normal,
      low,
      total: high + normal + low,
    };
  }, [values, parameterConfig]);

  /* -----------------------------
     RENDER
  ----------------------------- */
  return (
    <Card sx={{ height: "100%", minHeight: 350, borderRadius: 3 }}>
      {/* HEADER */}
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700}>Incidents</Typography>
        <IconButton size="small">
          <FilterAltOutlinedIcon fontSize="small" />
        </IconButton>
      </CardContent>

      <Divider />

      {/* BODY */}
      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 3,
          alignItems: "center",
        }}
      >
        {/* CONCENTRIC RINGS */}
        <Box sx={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {equipmentDetails.map((ed, idx) => {
                const outer = 80 - idx * 12;
                const inner = outer - 8;

                return (
                  <Pie
                    key={ed.id ?? idx}
                    data={[{ value: 1 }]}
                    dataKey="value"
                    innerRadius={inner}
                    outerRadius={outer}
                    fill={EQUIPMENT_COLORS[idx % EQUIPMENT_COLORS.length]}
                    stroke="none"
                    isAnimationActive={false}
                  />
                );
              })}
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER TEXT */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography fontSize={28} fontWeight={700}>
              {summary.total}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Total Logs
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SummaryRow
            label={`High (${summary.high} logs)`}
            color={STATUS_COLORS.high}
            icon={<ArrowUpwardIcon />}
          />
          <SummaryRow
            label={`Normal (${summary.normal} logs)`}
            color={STATUS_COLORS.normal}
            icon={<RemoveIcon />}
          />
          <SummaryRow
            label={`Low (${summary.low} logs)`}
            color={STATUS_COLORS.low}
            icon={<ArrowDownwardIcon />}
          />

          {/* EQUIPMENT LEGEND */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mt: 1,
            }}
          >
            {equipmentDetails.map((ed, idx) => (
              <Box key={ed.id ?? idx} sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      EQUIPMENT_COLORS[idx % EQUIPMENT_COLORS.length],
                  }}
                />
                <Typography fontSize={12}>{ed.equipment_num}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

/* -----------------------------
   SUMMARY ROW
----------------------------- */
const SummaryRow = ({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1.2,
      borderRadius: 3,
      backgroundColor: "#F9FAFB",
    }}
  >
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      {icon}
    </Box>
    <Typography fontWeight={600}>{label}</Typography>
  </Box>
);

export default IncidentsChart;
