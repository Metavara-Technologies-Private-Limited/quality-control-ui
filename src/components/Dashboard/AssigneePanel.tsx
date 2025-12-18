import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { mockAssignees, mockEquipments } from "@/utils/mockData";

interface AssigneePanelProps {
  equipmentId: number;
}

const AssigneePanel: React.FC<AssigneePanelProps> = ({ equipmentId }) => {
  const assigned = mockAssignees.filter(
    (a) => a.equipment_id === equipmentId
  );

  const available = mockAssignees.filter(
    (a) => a.equipment_id === null
  );

  const equipmentName =
    mockEquipments.find((e) => e.id === equipmentId)?.equipment_name ||
    "Incubator";

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
        <Typography fontWeight={700}>Incubator Assignees</Typography>
        <IconButton size="small">
          <SearchIcon />
        </IconButton>
      </CardContent>

      <Divider />

      <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {assigned.map((a) => (
          <Box
            key={a.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              backgroundColor: "#f3f4f6",
            }}
          >
            <Avatar src={a.avatar} sx={{ width: 28, height: 28 }} />
            <Box>
              <Typography fontSize={13} fontWeight={500}>
                {a.name}
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                {equipmentName}
              </Typography>
            </Box>
            <IconButton size="small">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {available.map((a) => (
          <Box
            key={a.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar src={a.avatar} />
              <Typography>{a.name}</Typography>
            </Box>
            <IconButton size="small">
              <AddIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default AssigneePanel;
