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
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import { EquipmentDetail, ParameterContent } from "@/types";

interface IncidentsChartProps {
  equipmentDetails: EquipmentDetail[];
  values: any[];
  parameterConfig: ParameterContent;
}

const COLORS = ["#F25B5B", "#47B35F", "#9E9E9E"]; // high, normal, low

const IncidentsChart: React.FC<IncidentsChartProps> = ({
  equipmentDetails,
  values,
  parameterConfig,
}) => {
  const { high, normal, low } = useMemo(() => {
    let highCount = 0,
      normalCount = 0,
      lowCount = 0;

    const min = Number(parameterConfig?.min_value);
    const max = Number(parameterConfig?.max_value);

    equipmentDetails.forEach((ed) => {
      // Filter values for this equipment detail
      const edValues = values
        .filter((v) => v.equipment_details_id === ed.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      if (!edValues.length) return;

      const latest = edValues[edValues.length - 1];
      const val = Number(latest.content);
      if (isNaN(val)) return;

      if (!isNaN(max) && val > max) highCount++;
      else if (!isNaN(min) && val < min) lowCount++;
      else normalCount++;
    });

    return { high: highCount, normal: normalCount, low: lowCount };
  }, [equipmentDetails, values, parameterConfig]);

  const total = high + normal + low;

  return (
    <Card sx={{ height: "100%", minHeight: 350, borderRadius: 3 }}>
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

      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 3,
        }}
      >
        <Box sx={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "High", value: high },
                  { name: "Normal", value: normal },
                  { name: "Low", value: low },
                ]}
                dataKey="value"
                innerRadius={60}  // make inner circle smaller
                outerRadius={80}  // reduce outer radius to fit container
                paddingAngle={2}  // optional: add small gaps between slices
              >
                {COLORS.map((color, idx) => (
                  <Cell key={idx} fill={color} />
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SummaryRow
            label={`High (${high})`}
            color="#F25B5B"
            icon={<ArrowUpwardIcon />}
          />
          <SummaryRow
            label={`Normal (${normal})`}
            color="#47B35F"
            icon={<RemoveIcon />}
          />
          <SummaryRow
            label={`Low (${low})`}
            color="#9E9E9E"
            icon={<ArrowDownwardIcon />}
          />
        </Box>
      </Box>
    </Card>
  );
};

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
