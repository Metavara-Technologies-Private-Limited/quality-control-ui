// pages/Quality_Control/QcLab/Department/LabEnvironmentComplianceChart.tsx

import { useEffect, useState } from "react";
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
import { environmentParameterValueApi } from "@/services/api";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  environmentId: number;
  parameters: any[];
};

export default function LabEnvironmentComplianceChart({
  environmentId,
  parameters,
}: Props) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const map: Record<string, any> = {};

      WEEK_DAYS.forEach((d) => {
        map[d] = {
          day: d,
          compliant: 0,
          nonCompliant: 0,
        };
      });

      for (const p of parameters) {
        const cfg = p.config;
        if (cfg?.min_value == null || cfg?.max_value == null) continue;

        const { data = [] } =
          await environmentParameterValueApi.listByParameter(p.id);

        data.forEach((row: any) => {
          const value = Number(row.content);
          if (isNaN(value)) return;

          const day = WEEK_DAYS[new Date(row.log_time).getDay()];

          if (value >= cfg.min_value && value <= cfg.max_value) {
            map[day].compliant += 1;
          } else {
            // negative for stacked sign chart (same as equipment)
            map[day].nonCompliant -= 1;
          }
        });
      }

      setChartData(WEEK_DAYS.map((d) => map[d]));
    };

    load();
  }, [environmentId, parameters]);

  return (
    <Box
      sx={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        p: "24px",
      }}
    >
      <Box sx={{ fontWeight: 700, mb: 2 }}>Activity</Box>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} stackOffset="sign">
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip
            formatter={(v: number, n: string) => [
              Math.abs(v),
              n === "compliant" ? "Compliant" : "Non-Compliant",
            ]}
          />
          <ReferenceLine y={0} stroke="#e5e7eb" />

          <Bar dataKey="compliant" fill="#6c6c6c">
            <LabelList position="top" />
          </Bar>

          <Bar dataKey="nonCompliant" fill="#EF9685">
            <LabelList position="top" formatter={(v: number) => Math.abs(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
