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
// import { getMockChartData } from "@/utils/mockData";

interface AverageHumidityProps {
  equipmentId: number;
}

/* ✅ Correct helper function */
type HumidityItem = {
  name: string;
  value: number | null;
};

const getHumidityByIncubator = (equipmentId: number): HumidityItem[] => {
  const rawClinic = localStorage.getItem("clinic");
  if (!rawClinic) return [];

  const clinic = JSON.parse(rawClinic);
  const result: HumidityItem[] = [];

  clinic.department?.forEach((dept: any) => {
    dept.equipments
      ?.filter((e: any) => e.id === equipmentId)
      .forEach((equipment: any) => {
        const humidityParam = equipment.parameters?.find((p: any) =>
          p.parameter_name?.toLowerCase().includes("humidity")
        );

        const pv = humidityParam?.parameter_values?.[0];
        const readings = pv?.content?.readings ?? [];

        // group readings by equipment_detail_id
        const byDetail: Record<number, any[]> = {};
        readings.forEach((r: any) => {
          byDetail[r.equipment_detail_id] ??= [];
          byDetail[r.equipment_detail_id].push(r);
        });

        equipment.equipment_details?.forEach((detail: any) => {
          const list = byDetail[detail.id];

          if (!list || list.length === 0) {
            // ✅ humidity missing OR no readings
            result.push({
              name: detail.equipment_num,
              value: null,
            });
            return;
          }

          const latest = list
            .sort(
              (a, b) =>
                new Date(a.recorded_at).getTime() -
                new Date(b.recorded_at).getTime()
            )
            .at(-1);

          result.push({
            name: detail.equipment_num,
            value: latest ? Number(latest.value) : null,
          });
        });
      });
  });

  return result;
};

const AverageHumidity: React.FC<AverageHumidityProps> = ({ equipmentId }) => {
  const incubators = useMemo(
    () => getHumidityByIncubator(equipmentId),
    [equipmentId]
  );

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
        {incubators.map((item) => {
          const isHigh = item.value !== null && item.value >= 85;

          return (
            <Box
              key={item.name}
              sx={{ p: 2, borderRadius: 3, backgroundColor: "#F9FAFB" }}
            >
              {/* 👇 Incubator label */}
              <Typography fontSize={15} fontWeight={600} mb={0.5}>
                {item.name}
              </Typography>

              {/* 👇 Value / Empty */}
              {item.value === null ? (
                <Typography fontSize={14} color="text.secondary">
                No humidity for this equipment
              </Typography>
              
              ) : (
                <>
                  <Typography fontSize={26} fontWeight={700}>
                    {item.value}%
                  </Typography>

                  <Typography
                    fontSize={13}
                    color={isHigh ? "#22c55e" : "#ef4444"}
                  >
                    {isHigh ? "▲" : "▼"} within range
                  </Typography>
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default AverageHumidity;
