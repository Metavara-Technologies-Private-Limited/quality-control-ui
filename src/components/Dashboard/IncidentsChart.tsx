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
   INCIDENT SUMMARY (LOGIC FIXED)
----------------------------- */
const getIncidentSummary = () => {
  let high = 0;
  let normal = 0;
  let low = 0;

  mockActivities.forEach((a) => {
    if (a.type === "temperature" || a.type === "co2") high++;
    else if (a.type === "humidity") normal++;
    else low++;
  });

  return { high, normal, low };
};

/* -----------------------------
   COMPONENT
----------------------------- */
const IncidentsChart: React.FC<IncidentsChartProps> = ({ equipmentId }) => {
  const { high, normal, low } = useMemo(() => getIncidentSummary(), []);

  const total = high + normal + low;

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
        {/* TOTAL DONUT (MATCHES IMAGE STYLE) */}
        <Box sx={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Incubator A */}
              <Pie
                data={[{ value: total }]}
                dataKey="value"
                innerRadius={90}
                outerRadius={100}
                fill={INCUBATOR_COLORS[0]}
                stroke="none"
              />

              {/* Incubator B */}
              <Pie
                data={[{ value: total }]}
                dataKey="value"
                innerRadius={78}
                outerRadius={86}
                fill={INCUBATOR_COLORS[1]}
                stroke="none"
              />

              {/* Incubator C */}
              <Pie
                data={[{ value: total }]}
                dataKey="value"
                innerRadius={66}
                outerRadius={74}
                fill={INCUBATOR_COLORS[2]}
                stroke="none"
              />

              {/* Incubator D */}
              <Pie
                data={[{ value: total }]}
                dataKey="value"
                innerRadius={54}
                outerRadius={62}
                fill={INCUBATOR_COLORS[3]}
                stroke="none"
              />
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
              {total}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Total Logs
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL (UNCHANGED) */}
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
              <RemoveIcon sx={{ fontSize: 14, color: "#fff" }} />
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
                backgroundColor: "#9E9E9E",
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
