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
import { toast } from "react-toastify";

const DEFAULT_ENVIRONMENT_NAME = "Environment Details";

const AddEnvironmentPopup: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic?.department ?? [];

  const [departmentId, setDepartmentId] = useState<number | "">("");

  const hasEnvironment = (deptId: number) => {
    const dept = departments.find((d) => d.id === deptId);
    return (dept?.environments?.length ?? 0) > 0;
  };

  useEffect(() => {
    if (!open) {
      setDepartmentId("");
    }
  }, [open]);

  const handleAdd = () => {
    if (!departmentId) return;

    if (hasEnvironment(departmentId)) {
      toast.info("Environment already exists for this department");
      return;
    }

    const departmentName =
      departments.find((d) => d.id === departmentId)?.name || "";

    onClose();
    navigate("/configuration/environment/add-parameter", {
      state: {
        environmentName: DEFAULT_ENVIRONMENT_NAME,
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
            .map((dept) => {
              const disabled = hasEnvironment(dept.id);

              return (
                <MenuItem
                  key={dept.id}
                  value={dept.id}
                  disabled={disabled}
                  sx={{
                    opacity: disabled ? 0.5 : 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{dept.name}</span>
                  {disabled && (
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      Already added
                    </span>
                  )}
                </MenuItem>
              );
            })}
        </TextField>

        {/* ACTIONS */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
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
