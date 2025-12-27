import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import {
  WaterDrop,
  PersonAdd,
  Close,
  TrendingUp,
  Air,
} from "@mui/icons-material";
import { formatTimeAgo } from "@/utils/formatters";

/* =========================
   Types
========================= */
type ActivityType = "temperature" | "co2" | "humidity" | "airflow";

type Activity = {
  id: number;
  equipment_id: number;
  type: ActivityType;
  message: string;
  timestamp: string;
};

/* =========================
   Helpers
========================= */
const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "");

const buildDetailIdLabelMap = (clinic: any): Record<number, string> => {
  const map: Record<number, string> = {};

  clinic.department?.forEach((d: any) => {
    d.equipments?.forEach((e: any) => {
      e.equipment_details?.forEach((ed: any) => {
        map[ed.id] = ed.equipment_num;
      });
    });
  });

  return map;
};
  const getParameterType = (name: string) => {
    const n = name.toLowerCase().replace('₂', '2');
    if (n.includes('co2')) return 'co2';
    if (n.includes('humid')) return 'humidity';
    if (n.includes('air')) return 'airflow';
    return 'temperature';
  };

/* =========================
   Activity Deriver
========================= */
export function deriveTrendActivities(
  readings: any[],
  parameterType: ActivityType,
  equipmentId: number,
  unit: string,
  detailIdToLabel: Record<number, string>,
  deltaThreshold = 0.5
): Activity[] {
  if (readings.length < 2) return [];

  const grouped: Record<number, any[]> = {};

  readings.forEach((r) => {
    grouped[r.equipment_detail_id] ??= [];
    grouped[r.equipment_detail_id].push(r);
  });

  let id = 1;

  return Object.entries(grouped).flatMap(([detailId, values]) => {
    values.sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() -
        new Date(b.recorded_at).getTime()
    );

    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    if (!latest || !previous) return [];

    const diff = Number(latest.value) - Number(previous.value);
    if (Math.abs(diff) < deltaThreshold) return [];

    const direction = diff > 0 ? "rise" : "drop";
    const magnitude = Math.abs(diff).toFixed(1);
    const label = detailIdToLabel[Number(detailId)] ?? `Unit-${detailId}`;

    return [
      {
        id: id++,
        equipment_id: equipmentId,
        type: parameterType,
        message: `${label} ${direction} in ${parameterType} by ${magnitude}${unit} compared to last reading`,
        timestamp: latest.recorded_at,
      },
    ];
  });
}

/* =========================
   Component
========================= */
interface RecentActivityProps {
  parameterName: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ parameterName }) => {
  
  const parameterType = getParameterType(parameterName);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const rawClinic = localStorage.getItem("clinic");
    if (!rawClinic) {
      setActivities([]);
      return;
    }

    const clinic = JSON.parse(rawClinic);
    const detailIdToLabel = buildDetailIdLabelMap(clinic);
    const normalizedType = normalize(parameterType);

    const equipments =
      clinic.department?.flatMap((d: any) => d.equipments || []) || [];

    const derived = equipments.flatMap((equipment: any) =>
      equipment.parameters?.flatMap((parameter: any) => {
        const content = parameter.parameter_values?.[0]?.content;
        if (!content?.readings?.length) return [];

        const paramName = normalize(parameter.parameter_name ?? "");

        const matches =
          paramName.includes(normalizedType) ||
          (normalizedType === "temperature" && paramName.includes("temp"));

        if (!matches) return [];

        return deriveTrendActivities(
          content.readings,
          parameterType as ActivityType,
          equipment.id,
          content.unit ?? "",
          detailIdToLabel
        );
      }) ?? []
    );

    setActivities(derived);
  }, [parameterType]);

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "temperature":
        return <TrendingUp sx={{ color: "#ef4444", fontSize: 18 }} />;
      case "co2":
        return <TrendingUp sx={{ color: "#8b5cf6", fontSize: 18 }} />;
      case "humidity":
        return <WaterDrop sx={{ color: "#3b82f6", fontSize: 18 }} />;
      case "airflow":
        return <Air sx={{ color: "#0ea5e9", fontSize: 18 }} />;
      default:
        return <PersonAdd sx={{ color: "#10b981", fontSize: 18 }} />;
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Recent Activity</Typography>
          <Button
            size="small"
            onClick={() => setActivities([])}
            sx={{ textTransform: "none" }}
          >
            Clear All
          </Button>
        </Box>

        <List sx={{ maxHeight: 400, overflowY: "auto" }}>
          {activities.length === 0 && (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: "#9ca3af", py: 3 }}
            >
              No recent activity
            </Typography>
          )}

          {activities.map((a) => (
            <ListItem key={a.id} divider>
              <ListItemIcon>{getIcon(a.type)}</ListItemIcon>
              <ListItemText
                primary={a.message}
                secondary={formatTimeAgo(a.timestamp)}
              />
              <IconButton
                onClick={() =>
                  setActivities((prev) =>
                    prev.filter((x) => x.id !== a.id)
                  )
                }
              >
                <Close fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
