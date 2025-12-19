import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import { getMockChartData } from "@/utils/mockData";

interface AverageHumidityProps {
  equipmentId: number;
}

const getHumidityByIncubator = (equipmentId: number) => {
  const chart = getMockChartData(equipmentId, "humidity");
  if (!chart?.data?.length) return [];

  const latest = chart.data[chart.data.length - 1];

  return [
    { name: "Incubator A", value: latest["Incubator A"] },
    { name: "Incubator B", value: latest["Incubator B"] },
    { name: "Incubator C", value: latest["Incubator C"] },
    { name: "Incubator D", value: latest["Incubator D"] },
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
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontWeight={700}>Average Humidity</Typography>
        <IconButton size="small">
          <FilterAltOutlinedIcon fontSize="small" />
        </IconButton>
      </CardContent>
          <Divider />
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
            <Typography fontSize={14} color="text.secondary">
              {item.name}
            </Typography>
            <Typography fontSize={26} fontWeight={700}>
              {item.value}%
            </Typography>
            <Typography
              fontSize={13}
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
