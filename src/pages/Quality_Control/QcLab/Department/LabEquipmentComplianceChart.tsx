import { useEffect, useState } from "react";
import Chart_activity from "@/assets/icons/Chart_activity.svg";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  LabelList,
} from "recharts";
import { Box } from "@mui/material";
import { parameterValueApi } from "@/services/api";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  equipmentDetailId: number;
  parameters: any[];
};

export default function LabEquipmentComplianceChart({
  equipmentDetailId,
  parameters,
}: Props) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const map: Record<string, any> = {};
      WEEK_DAYS.forEach((d) => {
        map[d] = { day: d, compliant: 0, nonCompliant: 0 };
      });

      for (const p of parameters) {
        if (!p.config?.min_value || !p.config?.max_value) continue;

        const { data = [] } = await parameterValueApi.listByParameter(p.id);

        data.forEach((row: any) => {
          if (row.equipment_details_id !== equipmentDetailId) return;

          const value = Number(row.content);
          if (isNaN(value)) return;

          const day = WEEK_DAYS[new Date(row.created_at).getDay()];
          const min = Number(p.config.min_value);
          const max = Number(p.config.max_value);

          if (value >= min && value <= max) {
            map[day].compliant += 1;
          } else {
            map[day].nonCompliant -= 1;
          }
        });
      }

      setChartData(WEEK_DAYS.map((d) => map[d]));
    };

    load();
  }, [equipmentDetailId, parameters]);

  return (
    <Box
      sx={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        p: "24px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* LEFT: Icon + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src={Chart_activity}
            alt="Activity"
            style={{ width: 16, height: 16 }}
          />
          <Box sx={{ fontWeight: 600 }}>Activity</Box>
        </Box>

        {/* RIGHT: Legend */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#6c6c6c",
              }}
            />
            <Box sx={{ fontSize: "12px", color: "#6B7280" }}>Compliant</Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#EF9685",
              }}
            />
            <Box sx={{ fontSize: "12px", color: "#6B7280" }}>
              Non - Compliant
            </Box>
          </Box>
        </Box>
      </Box>
      {/*For the Horizontal line after the heading of the chart */}
      <Box
        sx={{
          height: "1px",
          backgroundColor: "#E5E7EB",
          mx: "-24px",
          mb: 2,
        }}
      />

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          stackOffset="sign"
          margin={{ top: 20, right: 10, left: 10, bottom: 30 }} 
        >
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#8c8c8c", fontSize: 12 }}
            label={{
              value: "Days",
              position: "bottom",
              offset: 20,
              style: {
                fill: "#8c8c8c",
                fontSize: 12,
              },
            }}
          />

          <YAxis
            tick={{ fill: "#8c8c8c", fontSize: 12 }}
            axisLine={{ stroke: "#8c8c8c" }}
            tickLine={false}
            allowDecimals={false}
            width={40}
            label={{
              value: "No of Parameters",
              angle: -90,
              position: "insideLeft",
              dy: 40,
              style: {
                fill: "#8c8c8c",
                fontSize: 12,
              },
            }}
          />

          <Tooltip
            formatter={(v: number, n: string) => [
              Math.abs(v),
              n === "compliant" ? "Compliant" : "Non-Compliant",
            ]}
          />
          <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />

          <Bar
            dataKey="compliant"
            stackId="a"
            fill="#6c6c6c"
            barSize={22}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              position="top"
              formatter={(v: number) => (v === 0 ? "" : v)}
              style={{
                fontSize: 12, 
                fill: "#6c6c6c",
              }}
            />
          </Bar>

          <Bar
            dataKey="nonCompliant"
            stackId="a"
            fill="#EF9685"
            barSize={22}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              position="top"
              formatter={(v: number) => (v === 0 ? "" : Math.abs(v))}
              style={{
                fontSize: 12, 
                fill: "#EF9685",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
