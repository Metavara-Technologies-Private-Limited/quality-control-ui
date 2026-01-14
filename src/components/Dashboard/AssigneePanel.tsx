import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Divider,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAvatarForId } from "@/utils/mockData";

interface AssigneePanelProps {
  equipmentId: number;
  equipmentName: string;
}

const AssigneePanel: React.FC<AssigneePanelProps> = ({
  // equipmentId,
  equipmentName,
}) => {
  const assigneesFromStore = useSelector(
    (state: RootState) => state.assignees.data
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /** ✅ KEEP LOCAL STATE (same logic as before) */
  const [assignees, setAssignees] = useState(assigneesFromStore);

  /** Sync once store is loaded */
  useEffect(() => {
    setAssignees(assigneesFromStore);
  }, [assigneesFromStore]);

  const assigned = assignees.filter((a) => a.department_name === equipmentName);

  const available = assignees.filter(
    (a) => a.department_name !== equipmentName
  );

  /** 🔁 SAME LOGIC — UNCHANGED */
  const handleAssign = (id: number) => {
    setAssignees((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, department_name: equipmentName } : a
      )
    );
  };

  const handleUnassign = (id: number) => {
    setAssignees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, department_name: null } : a))
    );
  };

  const filteredAssigned = assigned.filter((a) =>
    a.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = available.filter((a) =>
    a.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card sx={{ height: "100%", minHeight: 350, borderRadius: 3 }}>
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontWeight={700}>{equipmentName} Assignees</Typography>
        <IconButton size="small" onClick={() => setShowSearch((prev) => !prev)}>
          <SearchIcon />
        </IconButton>

        {showSearch && (
          <TextField
            size="small"
            placeholder="Search Assignees"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 1 }}
          />
        )}
      </CardContent>

      <Divider />

      {/* Assigned */}
      <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filteredAssigned.map((a) => (
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
            <Avatar src={getAvatarForId(a.id)} sx={{ width: 28, height: 28 }} />
            <Box>
              <Typography fontSize={13} fontWeight={500}>
                {a.emp_name}
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                {equipmentName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => handleUnassign(a.id)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Available */}
      <Box sx={{ p: 2 }}>
        {filteredAvailable.map((a) => (
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
              <Avatar src={getAvatarForId(a.id)} />
              <Typography>{a.emp_name}</Typography>
            </Box>
            <IconButton size="small" onClick={() => handleAssign(a.id)}>
              <AddIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default AssigneePanel;
