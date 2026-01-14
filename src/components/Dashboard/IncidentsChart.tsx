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
import { EquipmentDetail } from "@/types";

/* -----------------------------
   TYPES
----------------------------- */
type IncidentSummary = {
  high: number;
  normal: number;
  low: number;
};

interface IncidentsChartProps {
  equipmentId: number;
  equipmentDetails: EquipmentDetail[];
}

/* -----------------------------
   COLORS
----------------------------- */
const INCUBATOR_COLORS = ["#6B7280", "#9CA3AF", "#FBCFE8", "#FB7185"];

/* -----------------------------
   INCIDENT LOGIC (API BASED)
----------------------------- */
const getIncidentSummary = (equipmentId: number): IncidentSummary => {
  const rawClinic = localStorage.getItem("clinic");
  if (!rawClinic) return { high: 0, normal: 0, low: 0 };

  const clinic = JSON.parse(rawClinic);
  let high = 0;
  let normal = 0;
  let low = 0;

  clinic.department?.forEach((dept: any) => {
    dept.equipments
      ?.filter((e: any) => e.id === equipmentId)
      .forEach((equipment: any) => {
        equipment.parameters?.forEach((param: any) => {
          const pv = param.parameter_values?.[0];
          const readings = pv?.content?.readings ?? [];
          const min = Number(pv?.content?.min_value);
          const max = Number(pv?.content?.max_value);

          // group by equipment_detail_id
          const byDetail: Record<number, any[]> = {};
          readings.forEach((r: any) => {
            byDetail[r.equipment_detail_id] ??= [];
            byDetail[r.equipment_detail_id].push(r);
          });

          Object.values(byDetail).forEach((list) => {
            if (list.length === 0) return;

            const sorted = list.sort(
              (a, b) =>
                new Date(a.recorded_at).getTime() -
                new Date(b.recorded_at).getTime()
            );

            const latest = sorted[sorted.length - 1];

            if (!latest) return;

            const value = Number(latest.value);

            if (value > max) high++;
            else if (value < min) low++;
            else normal++;
          });
        });
      });
  });

  return { high, normal, low };
};

/* -----------------------------
   COMPONENT
----------------------------- */
const IncidentsChart: React.FC<IncidentsChartProps> = ({
  equipmentId,
  equipmentDetails,
}) => {
  const { high, normal, low } = useMemo(
    () => getIncidentSummary(equipmentId),
    [equipmentId]
  );

  const total = high + normal + low;

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
        }}
      >
        {/* DONUT */}
        <Box sx={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {INCUBATOR_COLORS.map((color, idx) => (
                <Pie
                  key={idx}
                  data={[{ value: total }]}
                  dataKey="value"
                  innerRadius={90 - idx * 12}
                  outerRadius={100 - idx * 12}
                  fill={color}
                  stroke="none"
                />
              ))}
            </PieChart>
          </ResponsiveContainer>

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
              {total}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Total Logs
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SummaryRow
            label={`High (${high} logs)`}
            color="#F25B5B"
            icon={<ArrowUpwardIcon />}
          />
          <SummaryRow
            label={`Normal (${normal} logs)`}
            color="#47B35F"
            icon={<RemoveIcon />}
          />
          <SummaryRow
            label={`Low (${low} logs)`}
            color="#9E9E9E"
            icon={<ArrowDownwardIcon />}
          />

          {/* LEGEND */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {equipmentDetails.map((ed, idx) => (
              <Box key={ed.id} sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      INCUBATOR_COLORS[idx % INCUBATOR_COLORS.length],
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
   SMALL UI HELPER
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
