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
  };

  /* -------------------- PARAMETER ADD -------------------- */

  const handleAddParameter = (data: any) => {
    if (editingIndex !== null) {
      setParameters((prev) =>
        prev.map((p, i) => (i === editingIndex ? data : p)),
      );
      toast.success("Parameter updated");
    } else {
      setParameters((prev) => [...prev, data]);
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
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {p.name || p.title}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, index)}
                >
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Box>

              <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                Data Type: {p.data_type || p.field_type}
              </Typography>
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
        <MenuItem onClick={handleEditParameter}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteParameter}>Delete</MenuItem>
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

      {/* Add Parameter Popup */}

    </Box>
  );
};

export default AddEnvironmentParameter;
