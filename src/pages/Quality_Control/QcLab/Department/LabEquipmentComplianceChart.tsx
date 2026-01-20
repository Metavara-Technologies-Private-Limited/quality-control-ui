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
import { parameterValueApi } from "@/services/api";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  equipmentDetailId: number;
  parameters: any[];
  //   refreshKey: number;
};

export default function LabEquipmentComplianceChart({
  equipmentDetailId,
  parameters,
  //   refreshKey,
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
