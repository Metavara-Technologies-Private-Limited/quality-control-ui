import {
  Dialog,
  Box,
  IconButton,
  Typography,
  DialogContent,
  Autocomplete,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Assignee } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface AssigneeDialogProps {
  open: boolean;
  onClose: () => void;
  filteredAssignees: Assignee[];
  selectedAssignee: Assignee | null;
  setSelectedAssignee: Dispatch<SetStateAction<Assignee | null>>;
  handleAddAssignee: () => void;
}

const AssigneeDialog = ({
  open,
  onClose,
  filteredAssignees,
  selectedAssignee,
  setSelectedAssignee,
  handleAddAssignee,
}: AssigneeDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: "16px", width: 520 },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        py={2}
        borderBottom="1px solid #E5E7EB"
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#374151",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { backgroundColor: "#F3F4F6" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>

          <Typography fontSize={18} fontWeight={600} color="#000000">
            Select Assignee
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ color: "#6B7280" }}>
          ✕
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3 }}>
        <Autocomplete
          options={filteredAssignees}
          value={selectedAssignee}
          onChange={(_, v) => setSelectedAssignee(v)}
          getOptionLabel={(option) => option.emp_name}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Assignee"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  minHeight: 52,
                  color: "#000000",
                  "&:hover fieldset": { borderColor: "#D1D5DB" },
                  "&.Mui-focused fieldset": { borderColor: "#D1D5DB" },
                },
                "& .MuiInputLabel-root": { color: "#000000" },
              }}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            border: "1px solid #D1D5DB",
            color: "#000000",
            px: 3,
            height: 44,
            fontWeight: 500,
            backgroundColor: "#FFFFFF",
            "&:hover": { backgroundColor: "#FFFFFF" },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleAddAssignee}
          disabled={!selectedAssignee}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            backgroundColor: "#000000",
            color: "#FFFFFF",
            px: 4,
            height: 44,
            fontWeight: 500,
            "&:hover": { backgroundColor: "#000000" },
            "&:disabled": {
              backgroundColor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssigneeDialog;
