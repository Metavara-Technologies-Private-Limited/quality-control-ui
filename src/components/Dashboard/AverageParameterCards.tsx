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

interface AverageParameterProps {
  equipmentId: number;
  parameterName: string;
}

// ------------------------------
// Helpers
// ------------------------------
const normalize = (name: string) =>
  name.toLowerCase().replace("₂", "2").trim();

const getTitle = (param: string) => {
  if (param.includes("co2")) return "Average CO₂";
  if (param.includes("humidity")) return "Average Humidity";
  if (param.includes("airflow")) return "Average Airflow";
  return "Average Temperature";
};

const getUnit = (param: string) => {
  if (param.includes("co2")) return "%";
  if (param.includes("humidity")) return "%";
  if (param.includes("airflow")) return " m/s";
  return " °C";
};

const getValuesByIncubator = (
  equipmentId: number,
  parameterName: string
) => {
  const chart = getMockChartData(equipmentId, parameterName);
  if (!chart?.data?.length) return [];

  const latest = chart.data[chart.data.length - 1];

  return chart.equipment_names.map((name: string) => ({
    name,
    value: latest[name],
  }));
};

// ------------------------------
// Component
// ------------------------------
const AverageParameterCards: React.FC<AverageParameterProps> = ({
  equipmentId,
  parameterName,
}) => {
  const param = normalize(parameterName);

  const incubators = useMemo(
    () => getValuesByIncubator(equipmentId, param),
    [equipmentId, param]
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
      {/* Header */}
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontWeight={700}>
          {getTitle(param)}
        </Typography>
        <IconButton size="small">
          <FilterAltOutlinedIcon fontSize="small" />
        </IconButton>
      </CardContent>

      <Divider />

      {/* Body */}
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
              {item.value}
              {getUnit(param)}
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

export default AverageParameterCards;