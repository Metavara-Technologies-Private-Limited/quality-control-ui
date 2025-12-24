import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { getMockChartData } from "@/utils/mockData";

interface AverageHumidityProps {
  equipmentId: number;
}

/* ✅ FIXED TYPE */
type IncubatorHumidity = {
  name: string;
  value: number;
};

/* ✅ FIXED HELPER FUNCTION (NO TS ERROR) */
const getHumidityByIncubator = (
  equipmentId: number
): IncubatorHumidity[] => {
  const chart = getMockChartData(equipmentId, "humidity");
  if (!chart || !chart.data || chart.data.length === 0) return [];

  const latest = chart.data[
    chart.data.length - 1
  ] as Record<string, number>;

  return [
    { name: "Incubator A", value: latest["Incubator A"] ?? 0 },
    { name: "Incubator B", value: latest["Incubator B"] ?? 0 },
    { name: "Incubator C", value: latest["Incubator C"] ?? 0 },
    { name: "Incubator D", value: latest["Incubator D"] ?? 0 },
  ];
};

const AverageHumidity: React.FC<AverageHumidityProps> = ({ equipmentId }) => {
  const incubators = useMemo(
    () => getHumidityByIncubator(equipmentId),
    [equipmentId]
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontFamily: "sans-serif",
            fontWeight: 700,
          }}
        >
          Average Humidity
        </Typography>

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
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        {incubators.map((item) => (
          <Box
            key={item.name}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: "#F9FAFB",
            }}
          >
            <Typography fontSize={14} fontFamily="sans-serif" color="text.secondary">
              {item.name}
            </Typography>

            <Typography fontSize={26} fontWeight={700} fontFamily="sans-serif">
              {item.value}%
            </Typography>

            <Typography
              fontSize={13}
              fontFamily="sans-serif"
              color={item.value >= 85 ? "#22c55e" : "#ef4444"}
            >
              {item.value >= 85 ? "▲" : "▼"} 2.5% vs last week
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default AverageHumidity;
