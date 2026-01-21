import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const DEFAULT_ENVIRONMENT_NAME = "Environment Details";

const AddEnvironmentPopup: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic?.department ?? [];

  const [departmentId, setDepartmentId] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setDepartmentId("");
    }
  }, [open]);

  const handleAdd = () => {
    if (!departmentId) {
      alert("Please select department");
      return;
    }

    const departmentName =
      departments.find((d) => d.id === departmentId)?.name || "";

    onClose();
    navigate("/configuration/environment/add-parameter", {
    state: {
    environmentName: "Environment Details",
    departmentName,
    departmentId,
  },
});

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          "& .MuiDialogTitle-root + .MuiDialogContent-root": { pt: "6px" },
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Add Environment
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ENVIRONMENT NAME (PRE-FILLED & DISABLED) */}
        <TextField
          label="Environment Name"
          fullWidth
          size="small"
          value={DEFAULT_ENVIRONMENT_NAME}
          disabled
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#CFD1D4" },
            },
          }}
        />

        {/* DEPARTMENT SELECT */}
        <TextField
          label="Department"
          select
          fullWidth
          size="small"
          value={departmentId || ""}
          onChange={(e) => setDepartmentId(Number(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
            },
          }}
        >
          {departments
            .filter((d) => d.is_active)
            .map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
        </TextField>

        {/* ACTIONS */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#505050",
              width: "100px",
              borderRadius: "10px",
              borderColor: "#505050",
              "&:hover": { borderColor: "#505050", backgroundColor: "white" },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              width: "100px",
              borderRadius: "10px",
              background: "#383838",
              textTransform: "none",
              "&:hover": { background: "#2f2f2f" },
            }}
            disabled={!departmentId}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddEnvironmentPopup;
