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

// Validation function for alphanumeric input starting with alphabets
const validateAlphanumericInput = (value: string): boolean => {
  if (value === "") return true; // Allow empty string
  // Check if first character is an alphabet
  if (!/^[A-Za-z]/.test(value)) return false;
  // Check if all characters are alphanumeric (letters, numbers, spaces)
  if (!/^[A-Za-z0-9\s]*$/.test(value)) return false;
  return true;
};

const AddEquipmentPopup: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const navigate = useNavigate();

  // Use rawData so ALL departments (lab + clinical) appear in the dropdown
  const { rawData: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic?.department ?? [];

  const [equipmentName, setEquipmentName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setEquipmentName("");
      setDepartmentId("");
    }
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateAlphanumericInput(value)) {
      setEquipmentName(value);
    } else {
      toast.error("Enter Alphanumeric only", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleAdd = () => {
    if (!equipmentName.trim() || !departmentId) {
      toast.error("Please enter all fields", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!validateAlphanumericInput(equipmentName)) {
      toast.error("Enter Alphanumeric only", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const tempEquipmentId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const selectedDept = departments.find((d) => d.id === departmentId);
    const departmentName = selectedDept?.name || "";

    onClose();
    navigate("/configuration/equipment/add-parameter", {
      state: {
        tempEquipmentId,
        equipmentName: equipmentName.trim(),
        departmentName,
        departmentId, // ← pass the actual ID so backend save works
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
        Add Equipment
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Equipment Name"
          fullWidth
          variant="outlined"
          size="small"
          value={equipmentName}
          onChange={handleNameChange}
          sx={{
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
            },
          }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Department"
          select
          fullWidth
          size="small"
          variant="outlined"
          value={departmentId || ""}
          onChange={(e) => setDepartmentId(Number(e.target.value))}
          sx={{
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
            },
          }}
          InputLabelProps={{ shrink: true }}
        >
          {departments
            .filter((d) => d.is_active)
            .map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
        </TextField>

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
            disabled={!equipmentName.trim() || !departmentId}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentPopup;
