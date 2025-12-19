import React, { useState, useEffect } from "react";
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
import { WaterDrop, PersonAdd, Close, TrendingUp, Air } from "@mui/icons-material";
import { formatTimeAgo } from "@/utils/formatters";
import type { Activity } from "@/types";
import { mockActivities } from "@/utils/mockData";

interface RecentActivityProps {
  parameterType: "temperature" | "co2" | "humidity" | "airflow" | "assignee";
}

const RecentActivity: React.FC<RecentActivityProps> = ({ parameterType }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // ===============================
  // FILTER AND SORT ACTIVITIES
  // ===============================
  useEffect(() => {
    const filtered = mockActivities.filter((a) => {
      if (parameterType === "airflow") {
        return a.type === "other" && a.message.toLowerCase().includes("airflow");
      }
      return a.type === parameterType;
    });

    const sorted = filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setActivities(sorted);
  }, [parameterType]);

  const handleRemove = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "temperature":
        return <TrendingUp sx={{ color: "#ef4444", fontSize: 18 }} />;
      case "co2":
        return <TrendingUp sx={{ color: "#8b5cf6", fontSize: 18 }} />;
      case "humidity":
        return <WaterDrop sx={{ color: "#3b82f6", fontSize: 18 }} />;
      case "other":
        return <Air sx={{ color: "#0ea5e9", fontSize: 18 }} />;
      case "assignee":
        return <PersonAdd sx={{ color: "#10b981", fontSize: 18 }} />;
      default:
        return <TrendingUp sx={{ color: "#6b7280", fontSize: 18 }} />;
    }
  };

  const getTitle = () => {
    if (parameterType === "airflow") return "Airflow / Laminar Flow Activity";
    return "Recent Activity";
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {/* Title + Clear All Button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">{getTitle()}</Typography>
          <Button size="small" onClick={() => setActivities([])} sx={{ textTransform: "none" }}>
            Clear All
          </Button>
        </Box>

        <List sx={{ maxHeight: 400, overflowY: "auto" }}>
          {activities.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: "center", color: "#9ca3af", py: 3 }}>
              No recent activity
            </Typography>
          )}

          {activities.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemIcon>{getActivityIcon(activity.type)}</ListItemIcon>
              <ListItemText
                primary={activity.message}
                secondary={formatTimeAgo(activity.timestamp)}
              />
              <IconButton onClick={() => handleRemove(activity.id)}>
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
