import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import { MoreHoriz } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ... existing imports
import AddEnvParameterPopup from "@/pages/Quality_Control/Configuration/AddEnvParameterPopup"; // Adjust the path as needed
import { equipmentApi } from "@/services/api";
import { useDispatch } from "react-redux";
import { fetchClinic } from "@/store/clinicSlice";
import type { AppDispatch } from "@/store";



const ENVIRONMENT_NAME = "Environment Details";

const AddEnvironmentParameter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const departmentName = location.state?.departmentName || "";
  const departmentId = location.state?.departmentId || null;

  const [parameters, setParameters] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const [openParamPopup, setOpenParamPopup] = useState(false);
  const [paramToEdit, setParamToEdit] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [toggleAction, setToggleAction] =
  useState<"activate" | "inactivate" | null>(null);

  /* -------------------- MENU HANDLERS -------------------- */

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setAnchorEl(e.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
const resetMenuState = () => {
  setAnchorEl(null);
  setMenuIndex(null);
};

  const handleEditParameter = () => {
    if (menuIndex === null) return;
    setParamToEdit(parameters[menuIndex]);
    setEditingIndex(menuIndex);
    setOpenParamPopup(true);
    handleMenuClose();
  };

  const handleDeleteParameter = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteParameter = () => {
    if (menuIndex === null) return;
    setParameters((prev) => prev.filter((_, i) => i !== menuIndex));
    toast.info("Parameter deleted");
    setDeleteDialogOpen(false);
    resetMenuState();
  };

  /* -------------------- PARAMETER ADD -------------------- */

const handleAddParameter = (data: any) => {
  const paramWithStatus = {
    ...data,
    is_active: data.is_active ?? true, // 👈 DEFAULT ACTIVE
  };

  if (editingIndex !== null) {
    setParameters((prev) =>
      prev.map((p, i) => (i === editingIndex ? paramWithStatus : p)),
    );
    toast.success("Parameter updated");
  } else {
    setParameters((prev) => [...prev, paramWithStatus]);
    toast.success("Parameter added");
  }

  setOpenParamPopup(false);
  setParamToEdit(null);
  setEditingIndex(null);
};


  /* -------------------- FINAL SAVE -------------------- */

  const handleSaveEnvironment = async () => {
    if (!departmentId) {
      toast.error("Department not found");
      return;
    }

    if (parameters.length === 0) {
      toast.error("Please add at least one parameter");
      return;
    }

    try {
      await equipmentApi.create(departmentId, {
        equipment_name: ENVIRONMENT_NAME,
        is_active: true,
        equipment_details: [],
        parameters: parameters.map((p) => ({
          parameter_name: p.name || p.title,
          is_active: true,
          config: {
            data_type: p.data_type || p.field_type,
            default_value: p.default_value ?? null,
            min_value: p.min_value ?? null,
            max_value: p.max_value ?? null,
            unit: p.unit ?? null,
            text: p.text ?? null,
            text_type: p.text_type ?? null,
            boolean_type: p.boolean_type ?? null,
            dropdown: p.dropdown ?? [],
            selection_type: p.selection_type ?? null,
            percentage: p.percentage ?? null,
          },
        })),
      });

      toast.success("Environment created successfully");
      dispatch(fetchClinic(1));

      setTimeout(() => {
        navigate("/configuration/environment", { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save environment");
    }
  };

  /* -------------------- RENDER -------------------- */

  return (
    <Box sx={{ background: "#FFFFFF", minHeight: "100vh", p: 2 }}>
      <ToastContainer />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={() => navigate("/configuration/environment")}
          sx={{
            width: 24,
            height: 24,
            padding: "10px",
            boxShadow: "3px 3px 6px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
          }}
        >
          <TurnLeftIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
          Add Environment
        </Typography>
      </Box>

      <Box sx={{ height: "1px", background: "#E5E7EB", my: 2 }} />

      {/* Environment Card */}
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          p: 2,
          width: "320px",
          background: "#FFFFFF",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
          {ENVIRONMENT_NAME}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
            Department
          </Typography>
          <Chip
            label={departmentName}
            sx={{
              mt: 0.5,
              borderColor: "#47B35F",
              color: "#47B35F",
              fontWeight: 600,
              fontSize: "12px",
            }}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
            Parameters
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {String(parameters.length).padStart(2, "0")}
          </Typography>
        </Box>
      </Box>

      {/* Parameters Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >



        <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
          Parameters
        </Typography>

        <Box
          sx={{ cursor: "pointer", display: "flex", gap: 1 }}
          onClick={() => {
            setParamToEdit(null);
            setEditingIndex(null);
            setOpenParamPopup(true);
            resetMenuState();
          }}
        >
          <Typography sx={{ color: "#2563EB", fontSize: "14px" }}>+</Typography>
          <Typography sx={{ color: "#2563EB", fontSize: "14px" }}>
            Add Parameters
          </Typography>
        </Box>
      </Box>

      {/* Parameter Cards */}
      {parameters.length > 0 && (
        <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {parameters.map((p, index) => (
  <Box
    key={index}
    sx={{
      width: "260px",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      p: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      opacity: p.is_active === false ? 0.5 : 1,
    }}
  >
    {/* ACTIVE / INACTIVE PILL – ENVIRONMENT PARAMETERS */}
<Box
  sx={{
    position: "absolute",
    top: 12,
    right: 12,
    px: 1.2,
    py: 0.4,
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    backgroundColor:
      p.is_active === false ? "#FEE2E2" : "#DCFCE7",
    color:
      p.is_active === false ? "#B91C1C" : "#15803D",
  }}
>
  {p.is_active === false ? "Inactive" : "Active"}
</Box>

    
    {/* Top content */}
    <Box>
      <Typography sx={{ fontWeight: 600 }}>
        {p.name || p.title}
      </Typography>

      <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
        Data Type: {p.data_type || p.field_type}
      </Typography>
    </Box>

    {/* Bottom-right 3 dots (ENVIRONMENT ONLY) */}
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
      <IconButton
        size="small"
        onClick={(e) => handleMenuOpen(e, index)}
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          width: 32,
          height: 32,
        }}
      >
        <MoreHoriz sx={{ fontSize: 18, color: "#6B7280" }} />
      </IconButton>
    </Box>
  </Box>
))}
  
        </Box>
  

      )}

      {/* Footer */}
      <Box sx={{ mt: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSaveEnvironment}
          sx={{
            borderRadius: "10px",
            background: "#505050",
            "&:hover": { background: "#232323" },
            px: 4,
          }}
        >
          Save
        </Button>
      </Box>

      {/* Menu */}
<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
  {menuIndex !== null && parameters[menuIndex]?.is_active !== false ? (
    <MenuItem
      onClick={() => {
        setToggleAction("inactivate");
        handleMenuClose();
      }}
    >
      Inactivate
    </MenuItem>
  ) : (
    <MenuItem
      onClick={() => {
        setToggleAction("activate");
        handleMenuClose();
      }}
    >
      Activate
    </MenuItem>
  )}

  <MenuItem onClick={handleEditParameter}>Edit</MenuItem>

  <MenuItem
    onClick={handleDeleteParameter}
    sx={{ color: "error.main" }}
  >
    Delete
  </MenuItem>
</Menu>


      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Parameter</DialogTitle>
        <DialogContent>
          <Typography>Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteParameter} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
{/* Activate and Inactivate Dialog */}
<Dialog
  open={toggleAction !== null}
  onClose={() => {
    setToggleAction(null);
    resetMenuState();
  }}
>
  <DialogTitle>
    {toggleAction === "activate"
      ? "Activate Parameter"
      : "Inactivate Parameter"}
  </DialogTitle>

  <DialogContent>
    <Typography>
      Are you sure you want to{" "}
      {toggleAction === "activate" ? "activate" : "inactivate"} this parameter?
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => {
        setToggleAction(null);
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={() => {
if (menuIndex === null) return;
        setParameters((prev) =>
          prev.map((p, i) =>
            i === menuIndex
              ? { ...p, is_active: toggleAction === "activate" }
              : p,
          ),
        );

        toast.success(
          toggleAction === "activate"
            ? "Parameter activated"
            : "Parameter inactivated",
        );

        setToggleAction(null);
        resetMenuState();
      }}
    >
      {toggleAction === "activate" ? "Activate" : "Inactivate"}
    </Button>
  </DialogActions>
</Dialog>


      {/* Add Parameter Popup */}
<AddEnvParameterPopup
        open={openParamPopup}
        onClose={() => {
          setOpenParamPopup(false);
          setParamToEdit(null);
          setEditingIndex(null);
        }}
        onAdd={handleAddParameter}
        initialData={paramToEdit}
      />
    </Box>
  );
};

export default AddEnvironmentParameter;
