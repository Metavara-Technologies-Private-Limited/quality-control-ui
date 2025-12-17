import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
} from "@mui/material";
import {
  WaterDrop,
  PersonAdd,
  Close,
  TrendingUp,
  Air,
  FilterAlt,
  Lightbulb,
} from "@mui/icons-material";

import { formatTimeAgo } from "@/utils/formatters";
import type { Activity } from "@/types";
import { mockActivities } from "@/utils/mockData";

interface RecentActivityProps {
  equipmentId: number;
  parameterType:
    | "temperature"
    | "co2"
    | "humidity"
    | "airflow"
    | "other";
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  equipmentId,
  parameterType,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // ===============================
  // FILTER ACTIVITIES
  // ===============================
  useEffect(() => {
    const filtered = mockActivities.filter((a) => {
      if (parameterType === "airflow") {
        // airflow is stored as "other" in Activity.type
        return (
          a.equipment_id === equipmentId &&
          a.type === "other" &&
          a.message.toLowerCase().includes("airflow")
        );
      }

      if (parameterType === "other") {
        // Laminar Flow: airflow / HEPA / UV
        return (
          a.equipment_id === equipmentId &&
          a.type === "other"
        );
      }

      // Incubator: temperature / humidity / CO2
      return (
        a.equipment_id === equipmentId &&
        a.type === parameterType
      );
    });

    setActivities(filtered);
  }, [equipmentId, parameterType]);

  const handleRemove = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // ===============================
  // ICON MAPPING
  // ===============================
  const getActivityIcon = (
    message: string,
    type: Activity["type"]
  ) => {
    if (type === "other") {
      const msg = message.toLowerCase();
      if (msg.includes("airflow"))
        return <Air sx={{ color: "#0ea5e9", fontSize: 18 }} />;
      if (msg.includes("hepa"))
        return <FilterAlt sx={{ color: "#22c55e", fontSize: 18 }} />;
      if (msg.includes("uv"))
        return <Lightbulb sx={{ color: "#eab308", fontSize: 18 }} />;
      return <TrendingUp sx={{ color: "#6b7280", fontSize: 18 }} />;
    }

    switch (type) {
      case "temperature":
        return <TrendingUp sx={{ color: "#ef4444", fontSize: 18 }} />;
      case "co2":
        return <TrendingUp sx={{ color: "#8b5cf6", fontSize: 18 }} />;
      case "humidity":
        return <WaterDrop sx={{ color: "#3b82f6", fontSize: 18 }} />;
      case "assignee":
        return <PersonAdd sx={{ color: "#10b981", fontSize: 18 }} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (parameterType === "other") return "Laminar Flow Activity";
    if (parameterType === "airflow") return "Airflow Activity";
    return `Recent ${parameterType.toUpperCase()} Activity`;
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">{getTitle()}</Typography>

          <Button
            size="small"
            onClick={() => setActivities([])}
            sx={{ textTransform: "none" }}
          >
            Clear All
          </Button>
        </Box>

        <List sx={{ maxHeight: 350, overflowY: "auto" }}>
          {activities.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemIcon>
                {getActivityIcon(activity.message, activity.type)}
              </ListItemIcon>

              <ListItemText
                primary={activity.message}
                secondary={formatTimeAgo(activity.timestamp)}
              />

              <IconButton onClick={() => handleRemove(activity.id)}>
                <Close fontSize="small" />
              </IconButton>
            </ListItem>
          ))}

          {activities.length === 0 && (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: "#9ca3af", py: 3 }}
            >
              No recent activity
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
