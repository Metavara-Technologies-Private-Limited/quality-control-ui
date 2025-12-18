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
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";

import { mockActivities } from "@/utils/mockData";

interface IncidentsChartProps {
  equipmentId: number;
}

/* -----------------------------
   INCUBATOR COLORS
----------------------------- */
const INCUBATOR_COLORS = [
  "#6B7280", // Incubator A
  "#9CA3AF", // Incubator B
  "#FBCFE8", // Incubator C
  "#FB7185", // Incubator D
];

/* -----------------------------
   INCIDENT SUMMARY
----------------------------- */
const getIncidentSummary = (equipmentId: number) => {
  const activities = mockActivities.filter(
    (a) => a.equipment_id === equipmentId
  );

  let high = 0;
  let normal = 0;
  let low = 0;

  activities.forEach((a) => {
    if (a.type === "temperature" || a.type === "co2") high++;
    else if (a.type === "humidity") normal++;
    else low++;
  });

  return { high, normal, low };
};

/* -----------------------------
   PIE DATA
----------------------------- */
const buildPieData = (high: number, normal: number, low: number) => {
  return [
    { name: "High", value: high, color: INCUBATOR_COLORS[3] },
    { name: "Normal", value: normal, color: INCUBATOR_COLORS[2] },
    { name: "Low", value: low, color: INCUBATOR_COLORS[1] },
  ];
};

/* -----------------------------
   COMPONENT
----------------------------- */
const IncidentsChart: React.FC<IncidentsChartProps> = ({ equipmentId }) => {
  const { high, normal, low } = useMemo(
    () => getIncidentSummary(equipmentId),
    [equipmentId]
  );

  const total = high + normal + low || 0;
  const pieData = useMemo(
    () => buildPieData(high, normal, low),
    [high, normal, low]
  );

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 350,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        {/* DONUT */}
        <Box sx={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: total }]}
                dataKey="value"
                innerRadius={85}
                outerRadius={100}
                fill="#E5E7EB"
                stroke="none"
              />

              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
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
          {/* HIGH */}
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
                backgroundColor: "#F25B5B", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: 14, color: "#fff" }} />
            </Box>
            <Typography fontWeight={600}>
              High ({high} logs)
            </Typography>
          </Box>

          {/* NORMAL */}
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
                backgroundColor: "#47B35F", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RemoveIcon sx={{ fontSize: 14, color: "#fff" }} /> {/* stays white */}
            </Box>
            <Typography fontWeight={600}>
              Normal ({normal} logs)
            </Typography>
          </Box>

          {/* LOW */}
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
                backgroundColor: "#9E9E9E", // 🔁 change here for LOW
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowDownwardIcon sx={{ fontSize: 14, color: "#fff" }} />
            </Box>
            <Typography fontWeight={600}>
              Low ({low} logs)
            </Typography>
          </Box>

          {/* INCUBATOR LEGEND */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mt: 1,
            }}
          >
            {["Incubator A", "Incubator B", "Incubator C", "Incubator D"].map(
              (name, idx) => (
                <Box key={name} sx={{ display: "flex", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: INCUBATOR_COLORS[idx],
                    }}
                  />
                  <Typography fontSize={12}>{name}</Typography>
                </Box>
              )
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default IncidentsChart;
