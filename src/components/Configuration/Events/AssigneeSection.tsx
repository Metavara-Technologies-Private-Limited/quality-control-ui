import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { Assignee } from "@/types";

interface AssigneeSectionProps {
  selectedDepartmentId: number | null;
  setAssigneeDialogOpen: Dispatch<SetStateAction<boolean>>;
  addedAssignee: Assignee | null;
  setAddedAssignee: Dispatch<SetStateAction<Assignee | null>>;
}

const AssigneeSection = ({
  selectedDepartmentId,
  setAssigneeDialogOpen,
  addedAssignee,
  setAddedAssignee,
}: AssigneeSectionProps) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
      >
        <Typography fontWeight={700} color="#000000">
          Assignee
        </Typography>

        <Button
          onClick={() => setAssigneeDialogOpen(true)}
          disabled={!selectedDepartmentId}
          sx={{
            color: selectedDepartmentId ? "#2563EB" : "#9CA3AF",
            fontWeight: 500,
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: selectedDepartmentId ? "pointer" : "not-allowed",
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: selectedDepartmentId ? "underline" : "none",
            },
          }}
        >
          + Add Assignee
        </Button>
      </Box>

      <Stack direction="row" spacing={1} mt={1}>
        {addedAssignee && (
          <Chip
            label={addedAssignee.emp_name}
            onDelete={() => setAddedAssignee(null)}
            sx={{
              backgroundColor: "#F5F7FA",
              color: "#000000",
              fontWeight: 500,
            }}
          />
        )}
      </Stack>
    </>
  );
};

export default AssigneeSection;
