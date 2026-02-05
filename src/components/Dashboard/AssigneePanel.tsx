import React, { useMemo, useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAvatarForId } from "@/utils/mockData";

interface AssigneePanelProps {
  departmentName: string;
  equipmentId: number | null;
}

const AssigneePanel: React.FC<AssigneePanelProps> = ({ departmentName, equipmentId }) => {
  const assigneesFromStore = useSelector(
    (state: RootState) => state.assignees.data
  );
  const events = useSelector((state: RootState) => state.events.data);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /* -------------------------------------------------
     BUILD: equipment → assignees map (SOURCE OF TRUTH)
  -------------------------------------------------- */
  const equipmentName = useMemo(() => {
    if (!equipmentId) return "";
  
    for (const event of events) {
      const eq = event.equipments?.find(
        (e: any) => e.equipment_details__equipment__id === equipmentId
      );
  
      if (eq) {
        return eq.equipment_details__equipment__equipment_name;
      }
    }
  
    return "";
  }, [events, equipmentId]);
  
  const assigneesUsedInEvents = useMemo(() => {
    if (!equipmentId) return new Set<string>();
  
    const set = new Set<string>();
  
    events.forEach((event: any) => {
      if (event.department !== departmentName) return;
  
      const isRelatedToEquipment = event.equipments?.some(
        (eq: any) => eq.equipment_details__equipment__id === equipmentId
      );
  
      if (!isRelatedToEquipment) return;
  
      if (event.assignment) {
        set.add(event.assignment);
      }
    });
  
    return set;
  }, [events, departmentName, equipmentId]);  

  /* -------------------------------------------------
   FUTURE: ID-BASED ASSIGNEE MATCHING (COMMENTED)
   Requires backend to expose event.assignee_id
-------------------------------------------------- */

// const assigneesUsedInEventsById = useMemo(() => {
//   if (!equipmentId) return new Set<number>();

//   const set = new Set<number>();

//   events.forEach((event: any) => {
//     if (event.department !== departmentName) return;

//     const isRelatedToEquipment = event.equipments?.some(
//       (eq: any) => eq.equipment_details__equipment__id === equipmentId
//     );

//     if (!isRelatedToEquipment) return;

//     if (event.assignee_id) {
//       set.add(event.assignee_id);
//     }
//   });

//   return set;
// }, [events, departmentName, equipmentId]);
/*#####################   uncomment the above and remove the old
########################  assigneesUsedInEvents#######*/

  /* -------------------------------------------------
     DERIVED LISTS (NO MUTATION)
  -------------------------------------------------- */
  const assigned = assigneesFromStore.filter((a) =>
    assigneesUsedInEvents.has(a.emp_name)
  );
  
  const available = assigneesFromStore.filter(
    (a) => !assigneesUsedInEvents.has(a.emp_name)
  );  


  // const assigned = assigneesFromStore.filter((a) =>
//   assigneesUsedInEventsById.has(a.id)
// );

// const available = assigneesFromStore.filter(
//   (a) => !assigneesUsedInEventsById.has(a.id)
// );
/*################# uncomment above 2 states and remove old states ###########*/
  /* -------------------------------------------------
     SEARCH
  -------------------------------------------------- */
  const filteredAssigned = assigned.filter((a) =>
    a.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = available.filter((a) =>
    a.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card sx={{ height: "100%", minHeight: 350, borderRadius: 3 }}>
      {/* HEADER */}
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontWeight={700}>
        {equipmentName} Assignees
        </Typography>

        <IconButton
          size="small"
          onClick={() => setShowSearch((prev) => !prev)}
        >
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

      {/* ASSIGNED */}
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
                Active in events
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* AVAILABLE */}
      <Box sx={{ p: 2 }}>
        {filteredAvailable.map((a) => (
          <Box
            key={a.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Avatar src={getAvatarForId(a.id)} />
            <Typography>{a.emp_name}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default AssigneePanel;




// TODO (backend dependency):
// Switch assignee matching from emp_name to emp_id once events API exposes assignee_id.
// Prepared ID-based logic is added below and currently commented.
