import React, { CSSProperties, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Chip,
  TextField,
  IconButton,
} from "@mui/material";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import { useNavigate, useLocation } from "react-router-dom";
import AddParameterPopup from "./AddParameterPopup";
import { MoreHoriz } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

import { fetchClinic } from "@/store/clinicSlice";
import { environmentApi, equipmentApi } from "@/services/api";
import { ParameterContent } from "@/types";

const PARAM_DRAFT_STORAGE_KEY = "equipment_parameters_draft";

const normalizeDropdownValue = (data: any): string[] => {
  if (Array.isArray(data)) {
    return data.map(String).filter(Boolean);
  }
  if (typeof data === "string" && data.trim()) {
    return data
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const AddParameterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { data: clinic } = useSelector((state: RootState) => state.clinic);

  const entityType: "equipment" | "environment" = location.pathname.includes(
    "/environment",
  )
    ? "environment"
    : "equipment";

  const isEnvironment = entityType === "environment";
  const isEquipment = entityType === "equipment";

  const [equipmentName, setEquipmentName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [openParamPopup, setOpenParamPopup] = useState(false);
  const [parameters, setParameters] = useState<ParameterContent[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuParamIndex, setMenuParamIndex] = useState<number | null>(null);
  const [paramIndexToDelete, setParamIndexToDelete] = useState<number | null>(
    null,
  );
  const open = Boolean(anchorEl);
  const equipmentQuantity = Array.from({ length: count }, (_, i) => i + 1);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [equipmentTable, setEquipmentTable] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);
  const [nextSrNo, setNextSrNo] = useState(1);

  const [paramToEdit, setParamToEdit] = useState<any>(null);
  const [editingParamIndex, setEditingParamIndex] = useState<number | null>(
    null,
  );

  const [deleteParamDialogOpen, setDeleteParamDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const saveParametersToLocalStorage = (params: any[]) => {
    try {
      localStorage.setItem(PARAM_DRAFT_STORAGE_KEY, JSON.stringify(params));
    } catch (error) {
      console.error("Error saving parameters to localStorage:", error);
    }
  };

  const loadParametersFromLocalStorage = (): any[] => {
    try {
      const storedParams = localStorage.getItem(PARAM_DRAFT_STORAGE_KEY);
      return storedParams ? JSON.parse(storedParams) : [];
    } catch (error) {
      console.error("Error loading parameters from localStorage:", error);
      return [];
    }
  };

  useEffect(() => {
    const passedEquipment = location.state?.equipment;
    if (isEnvironment) {
      setEquipmentName(
        location.state?.environmentName || "Environment Details"
      );
    }    
    const equipmentId = passedEquipment?.id;
    const storeEquipment = clinic?.department
      .flatMap((d) => d.equipments)
      .find((e) => e.id === equipmentId);

    if (storeEquipment) {
      setIsEditMode(true);
      setOriginalEquipment(storeEquipment);
      setEquipmentName(storeEquipment.equipment_name || "");

      const dept = clinic?.department.find((d) =>
        d.equipments.some((e) => e.id === storeEquipment.id),
      );

      setDepartmentName(dept?.name || "");
      setDepartmentId(dept?.id || null);

      // ✅ FIXED: Load equipment details with make and model
      const loadedEquipmentTable = (storeEquipment.equipment_details || []).map(
        (detail: any, index: number) => {
          const numMatch = detail.equipment_num?.match(/-(\d+)$/);
          const srNo = numMatch ? parseInt(numMatch[1]) : index + 1;

          return {
            id: detail.id,
            sr: srNo,
            equipmentNum: srNo,
            make: detail.make || "",
            model: detail.model || "",
          };
        },
      );

      setEquipmentTable(loadedEquipmentTable);

      if (loadedEquipmentTable.length > 0) {
        const maxSrNo = Math.max(
          ...loadedEquipmentTable.map((item: any) => item.sr),
        );
        setCount(maxSrNo);
        setSelected([]);
        setNextSrNo(maxSrNo + 1);
      }
      const loadedParams = storeEquipment.parameters.map((p: any) => {
        let cfg = p.config || {};

        // Get the latest config from history if it exists
        if (cfg.history?.length) {
          cfg = cfg.history[cfg.history.length - 1];
        }

        // Create the base parameter object
        const param: any = {
          id: p.id,
          name: p.parameter_name,
          title: p.parameter_name,
          data_type: cfg.data_type,
          field_type: cfg.data_type,
          mandatory: p.mandatory || false,
        };

        // Handle different data types
        switch (cfg.data_type) {
          case "Integer":
            param.default_value = cfg.default_value || cfg.integer_value || "";
            param.integer_value = cfg.integer_value || cfg.default_value || "";
            param.unit = cfg.unit || "";
            param.min_value = cfg.min_value || "";
            param.max_value = cfg.max_value || "";
            break;

          case "Decimal":
            param.default_value = cfg.default_value || "";
            param.unit = cfg.unit || "";
            param.min_value = cfg.min_value || "";
            param.max_value = cfg.max_value || "";
            break;

          case "Text":
            param.text_type = cfg.text_type || "single";
            param.text = cfg.text || "";
            break;

          case "Boolean":
            param.boolean_type = cfg.boolean_type || "yesno";
            break;

          case "Dropdown":
            // Ensure dropdown is properly formatted as array
            param.dropdown = normalizeDropdownValue(cfg.dropdown);
            param.selection_type = cfg.selection_type || "single";
            break;
        }

        // Keep original values for display
        param.percentage = cfg.percentage || null;

        return param;
      });

      setParameters(loadedParams);
      localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);

      setParameters(loadedParams);
      localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
    } else {
      setIsEditMode(false);
      if (isEquipment) {
        setEquipmentName(location.state?.equipmentName || "");
      }
    
      if (isEnvironment) {
        setEquipmentName(
          location.state?.environmentName || "Environment Details"
        );
      }
      setDepartmentName(location.state?.departmentName || "");

      const dept = clinic?.department.find(
        (d) =>
          d.name.toLowerCase() ===
          location.state?.departmentName?.toLowerCase(),
      );
      setDepartmentId(dept?.id || null);

      setParameters(loadParametersFromLocalStorage());
    }
  }, [location, clinic]);

  useEffect(() => {
    if (!isEditMode) {
      saveParametersToLocalStorage(parameters);
    }
  }, [parameters, isEditMode]);

  const toggleSelection = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num],
    );
  };

  useEffect(() => {
    if (isEditMode) return;
    if (equipmentTable.length === 0) return;

    const currentMaxNum = Math.max(
      ...equipmentTable.map((row) => row.equipmentNum),
      0,
    );

    if (count > currentMaxNum) {
      const newEntries: {
        sr: number;
        equipmentNum: number;
        make: string;
        model: string;
      }[] = [];
      for (let i = currentMaxNum + 1; i <= count; i++) {
        newEntries.push({
          sr: nextSrNo + newEntries.length,
          equipmentNum: i,
          make: "",
          model: "",
        });
      }
      if (newEntries.length) {
        setEquipmentTable((prev) => [...prev, ...newEntries]);
        setNextSrNo((prev) => prev + newEntries.length);
      }
    }

    if (count < currentMaxNum) {
      setEquipmentTable((prev) => prev.filter((r) => r.equipmentNum <= count));
      setSelected((prev) => prev.filter((n) => n <= count));
    }
  }, [count, isEditMode]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuParamIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuParamIndex(null);
  };

  const handleEditParameter = () => {
    if (menuParamIndex !== null) {
      const param = parameters[menuParamIndex];

      // Create a complete copy with all necessary fields
      const paramToEditData = {
        id: param.id,
        name: param.name || param.title,
        title: param.title || param.name,
        mandatory: param.mandatory || false,
        field_type: param.field_type || param.data_type,
        data_type: param.data_type || param.field_type,

        // Integer
        default_value: param.default_value || param.integer_value || "",
        unit: param.unit || "",
        min_value: param.min_value || "",
        max_value: param.max_value || "",
        integer_value: param.integer_value || "",

        // Decimal (same structure as integer)

        // Text
        text_type: param.text_type || "single",
        text: param.text || "",

        // Boolean
        boolean_type: param.boolean_type || "yesno",

        // Dropdown
        dropdown: param.dropdown || [],
        selection_type: param.selection_type || "single",

        // Other
        percentage: param.percentage || null,
      };

      setParamToEdit(paramToEditData);
      setEditingParamIndex(menuParamIndex);
      setOpenParamPopup(true);
    }
    handleClose();
  };

  const handleDeleteParameter = () => {
    setParamIndexToDelete(menuParamIndex);
    setDeleteParamDialogOpen(true);
    handleClose();
  };

  const confirmDeleteParameter = async () => {
    if (paramIndexToDelete === null) return;

    const param = parameters[paramIndexToDelete];

    try {
      if (param.id) await equipmentApi.softDeleteParameter(param.id);

      setParameters((prev) => prev.filter((_, i) => i !== paramIndexToDelete));
      toast.info("Parameter deleted");
      dispatch(fetchClinic(1));
    } catch (err) {
      toast.error("Failed to delete parameter");
      console.error(err);
    } finally {
      setParamIndexToDelete(null);
      setDeleteParamDialogOpen(false);
    }
  };

  const handleSaveEquipmentDetails = () => {
    if (!make.trim() || !model.trim()) {
      toast.error("Please enter both Make and Model!");
      return;
    }

    setEquipmentTable((prev) => {
      let updated = [...prev];
      let nextSr = nextSrNo;
      selected.forEach((num) => {
        const index = updated.findIndex((row) => row.equipmentNum === num);
        if (index >= 0) {
          updated[index] = { ...updated[index], make, model };
        } else {
          updated.push({ sr: nextSr, equipmentNum: num, make, model });
          nextSr++;
        }
      });
      setNextSrNo(nextSr);
      return updated;
    });

    toast.success("Equipment details updated!", {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });

    setMake("");
    setModel("");
    setSelected([]);
  };

  useEffect(() => {
    if (selected.length === 0) {
      setMake("");
      setModel("");
      return;
    }
    const selectedRows = equipmentTable.filter((row) =>
      selected.includes(row.equipmentNum),
    );
    if (selectedRows.length === 0) {
      setMake("");
      setModel("");
      return;
    }
    const firstMake = selectedRows[0]?.make || "";
    const firstModel = selectedRows[0]?.model || "";
    const sameMake = selectedRows.every(
      (row) => (row.make || "") === firstMake,
    );
    const sameModel = selectedRows.every(
      (row) => (row.model || "") === firstModel,
    );
    setMake(sameMake ? firstMake : "");
    setModel(sameModel ? firstModel : "");
  }, [selected, equipmentTable]);

  const handleClearAll = () => {
    setClearAllDialogOpen(true);
  };

  const confirmClearAll = () => {
    setSelected([]);
    setCount(1);
    setMake("");
    setModel("");
    setEquipmentTable([]);
    setParameters([]);
    setNextSrNo(1);
    localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
    setClearAllDialogOpen(false);
    toast.warn("All data cleared");
  };

  const handleAddParameter = (data: any) => {
    if (editingParamIndex !== null) {
      setParameters((prev) =>
        prev.map((p, i) => (i === editingParamIndex ? { ...p, ...data } : p)),
      );
      setEditingParamIndex(null);
      setParamToEdit(null);
      toast.success("Parameter updated!");
    } else {
      setParameters((prev) => [...prev, data]);
      toast.success("Parameter added!");
    }
    setOpenParamPopup(false);
  };
  // In AddParameterPage.tsx - Update the handleFinalSave function

  const handleFinalSave = async () => {
    if (isEnvironment && !equipmentName.trim()) {
      toast.error("Environment name is missing");
      return;
    }
    
    if (parameters.length === 0) {
      toast.error("Please add at least one parameter");
      return;
    }

    if (isEquipment && equipmentTable.length === 0) {
      toast.error("Please add equipment details (Make and Model)");
      return;
    }

    if (!departmentId) {
      toast.error("Department not found");
      return;
    }

    try {
      /* ---------------- EQUIPMENT ---------------- */
      if (isEquipment) {
        const equipmentPayload = {
          equipment_name: equipmentName,
          is_active: true,
          equipment_details: equipmentTable.map((row) => ({
            id: row.id ?? undefined,
            equipment_num: `${equipmentName}-${row.equipmentNum}`,
            make: row.make || "",
            model: row.model || "",
            is_active: true,
          })),
          parameters: parameters.map((p) => ({
            id: p.id ?? undefined,
            parameter_name: p.name || p.title || "",
            is_active: true,
            config: {
              data_type: p.data_type || p.field_type || "",
              default_value:
                p.data_type === "Integer"
                  ? p.default_value || p.integer_value || null
                  : p.data_type === "Decimal"
                    ? p.default_value || null
                    : p.data_type === "Text"
                      ? p.text || null
                      : null,
              min_value: p.min_value ?? null,
              max_value: p.max_value ?? null,
              integer_value: p.integer_value ?? null,
              unit: p.unit ?? null,
              percentage: p.percentage ?? null,
              text: p.text ?? null,
              text_type: p.text_type ?? null,
              boolean_type: p.boolean_type ?? null,
              dropdown: p.dropdown ?? [],
              selection_type: p.selection_type ?? null,
            },
          })),
        };

        if (isEditMode && originalEquipment?.id) {
          await equipmentApi.update(
            departmentId,
            originalEquipment.id,
            equipmentPayload,
          );
          toast.success("Equipment updated successfully!");
        } else {
          await equipmentApi.create(departmentId, equipmentPayload);
          toast.success("Equipment created successfully!");
        }
      }

      /* ---------------- ENVIRONMENT ---------------- */
      if (isEnvironment) {
        const environmentPayload = {
          environment_name: equipmentName.trim(), // reused variable
          is_active: true,
          parameters: parameters.map((p) => ({
            id: p.id ?? undefined,
            env_parameter_name: p.name || p.title || "",
            is_active: true,
            config: {
              data_type: p.data_type || p.field_type || "",
              min_value: p.min_value ?? null,
              max_value: p.max_value ?? null,
              unit: p.unit ?? null,
              percentage: p.percentage ?? null,
              text: p.text ?? null,
              text_type: p.text_type ?? null,
              boolean_type: p.boolean_type ?? null,
              dropdown: p.dropdown ?? [],
              selection_type: p.selection_type ?? null,
            },
          })),
        };

        await environmentApi.create(departmentId, environmentPayload);
        toast.success("Environment created successfully!");
      }

      /* ---------------- COMMON ---------------- */
      localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
      dispatch(fetchClinic(1));

      setTimeout(() => {
        navigate(
          isEnvironment
            ? "/configuration/environment"
            : "/configuration/equipment",
          { replace: true },
        );
      }, 1500);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed! Please check console.");
    }
  };

  // In AddParameterPage.tsx - Update the renderParameterContent function:

  const renderParameterContent = (p: any) => {
    let data_type = p.data_type || p.field_type;
    let config = p;

    if (p.history && Array.isArray(p.history) && p.history.length > 0) {
      config = p.history[p.history.length - 1];
      data_type = config.data_type;
    }

    switch (data_type) {
      case "Integer":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Min {config.min_value || "-"} {config.unit || ""} – Max{" "}
            {config.max_value || "-"} {config.unit || ""}
          </Typography>
        );
      case "Decimal":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Min {config.min_value || "-"} {config.unit || ""} – Max{" "}
            {config.max_value || "-"} {config.unit || ""}
          </Typography>
        );
      case "Min/Max":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Min {config.min_value || "-"} – Max {config.max_value || "-"}{" "}
            {config.unit ? config.unit : ""}
          </Typography>
        );
      case "Percentage":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.percentage}%
          </Typography>
        );
      case "Text":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.text}
          </Typography>
        );
      case "Boolean":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.boolean_type === "yesno" ? "Yes/No" : "True/False"}
          </Typography>
        );
      case "Dropdown":
      case "Select":
        let options = normalizeDropdownValue(config.dropdown);
        if (options.length === 0) return null;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 0.5,
            }}
          >
            {options.map((val: any, i: number) => (
              <Chip
                key={i}
                label={String(val)}
                size="small"
                sx={{ background: "transparent" }}
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <ToastContainer />

      <Box sx={{ background: "#FFFFFF", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => navigate("/configuration/equipment")}
            sx={{
              width: 24,
              height: 24,
              padding: "10px",
              opacity: 1,
              color: "#374151",
              borderRadius: 1,
              mr: 1,
              boxShadow: "3px 3px 6px rgba(0,0,0,0.2)",
              backgroundColor: "#fff",
            }}
          >
            <TurnLeftIcon sx={{ fontSize: 24, padding: "3px" }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
            {isEditMode
              ? isEnvironment
                ? "Edit Environment"
                : "Edit Equipment"
              : isEnvironment
                ? "Add Environment"
                : "Add Equipment"}
          </Typography>
        </Box>

        <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2, mb: 2 }}></Box>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {equipmentName}
          <Chip
            label={departmentName}
            variant="outlined"
            sx={{
              borderColor: "#47B35F",
              color: "#47B35F",
              fontWeight: 600,
              fontSize: "0.75rem",
              borderRadius: "12px",
              height: 22,
            }}
          />
        </Typography>

        {/* Parameters Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
            Parameters (e.g. Temperature)
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => {
              setParamToEdit(null);
              setEditingParamIndex(null);
              setOpenParamPopup(true);
            }}
          >
            <Typography sx={{ color: "#2563EB", fontSize: "14px" }}>
              +
            </Typography>
            <Typography
              sx={{ color: "#2563EB", fontSize: "14px", fontWeight: 500 }}
            >
              Add Parameters
            </Typography>
          </Box>
        </Box>

        {parameters.length > 0 && (
          <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {parameters.map((p, index) => (
              <Box
                key={index}
                sx={{
                  width: "260px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  p: 2,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
                    {p.name || p.title || p.parameter_name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, index)}
                    sx={{
                      p: "3px",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "transaparent",
                    }}
                  >
                    <MoreHoriz sx={{ fontSize: "18px", color: "#6B7280" }} />
                  </IconButton>
                </Box>
                <Typography
                  sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}
                >
                  Data Type : {p.data_type || p.field_type}
                </Typography>
                <Box
                  sx={{
                    height: "1px",
                    background: "#E5E7EB",
                    mt: 1.2,
                    mb: 1.2,
                    mx: -2,
                  }}
                />
                {renderParameterContent(p)}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2 }}></Box>

        {/* Quantity Controls */}
        {isEquipment && (
          <>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                  #No. of {equipmentName}s :
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#FAFAFA",
                    border: "1px solid #E2E3E5",
                    borderRadius: 1,
                    height: "30px",
                    width: "97px",
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => setCount((c) => (c > 1 ? c - 1 : c))}
                    sx={{
                      flex: 1,
                      fontWeight: 500,
                      color: "#565656",
                      fontSize: "20px",
                      p: 0,
                      minWidth: 0,
                    }}
                  >
                    –
                  </Button>

                  <Box
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#565656",
                      fontSize: "15px",
                    }}
                  >
                    {String(count).padStart(2, "0")}
                  </Box>

                  <Button
                    variant="text"
                    onClick={() => setCount((c) => c + 1)}
                    sx={{
                      flex: 1,
                      fontWeight: 500,
                      color: "#565656",
                      fontSize: "20px",
                      p: 0,
                      minWidth: 0,
                    }}
                  >
                    +
                  </Button>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {/* Selection Chips */}
        {isEquipment && (
          <>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, mt: 3 }}>
              Select {equipmentName}s
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              {equipmentQuantity.map((num) => (
                <Box
                  key={num}
                  onClick={() => toggleSelection(num)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    borderColor: "#E2E3E5",
                    background: "#FAFAFA",
                  }}
                >
                  {selected.includes(num) ? (
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        background: "#DEEFE1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        fill="#3D8B61"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.285 6.708l-11.285 11.292-5.285-5.292 1.414-1.414 3.871 3.879 9.871-9.878z" />
                      </svg>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: "1.8px solid #D1D5DB",
                      }}
                    />
                  )}
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 500, color: "#4B5563" }}
                  >
                    {equipmentName} {num}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        {/* Make & Model Inputs */}
        {isEquipment && selected.length > 0 && (
          <>
            <Typography
              sx={{ mt: 4, fontSize: "15px", fontWeight: 600, mb: 2 }}
            >
              Details of{" "}
              {selected.map((n) => `${equipmentName} ${n}`).join(", ")}
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <TextField
                placeholder="Enter Make"
                label="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiInputLabel-root": { color: "#5F646F !important" },
                }}
              />
              <TextField
                placeholder="Enter Model"
                label="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiInputLabel-root": { color: "#5F646F !important" },
                }}
              />
            </Box>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSaveEquipmentDetails}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#F3F3F3",
                  color: "#505050",
                  border: "1px solid #E5E7EB",
                  px: 4,
                  py: 1.2,
                  fontSize: "16px",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#EDEDED",
                    color: "#232323",
                    boxShadow: "none",
                  },
                }}
              >
                Save
              </Button>
            </Box>
          </>
        )}

        {/* Table Section */}
        {isEquipment && equipmentTable.length > 0 && (
          <Box
            sx={{
              mt: 4,
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", height: "42px" }}>
                  <th style={{ ...headerStyle }}>Sr. No.</th>
                  <th style={{ ...headerStyle }}>{equipmentName} Name</th>
                  <th style={{ ...headerStyle }}>Make</th>
                  <th style={{ ...headerStyle }}>Model</th>
                </tr>
              </thead>
              <tbody>
                {equipmentTable.map((row) => (
                  <tr
                    key={row.sr}
                    style={{ height: "42px", borderTop: "1px solid #E5E7EB" }}
                  >
                    <td style={cellStyle}>{row.sr}</td>
                    <td style={cellStyle}>
                      {equipmentName} {row.equipmentNum}
                    </td>
                    <td style={cellStyle}>{row.make}</td>
                    <td style={cellStyle}>{row.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        {/* Footer Buttons */}
        <Box
          sx={{ mt: 10, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={handleClearAll}
            sx={{
              borderRadius: "10px",
              borderColor: "#505050",
              color: "#232323",
              textTransform: "none",
              "&:hover": {
                borderColor: "#232323",
              },
            }}
          >
            Clear All
          </Button>

          <Button
            variant="contained"
            onClick={handleFinalSave}
            sx={{
              borderRadius: "10px",
              background: "#505050",
              color: "#FFFFFF",
              textTransform: "none",
              px: 4,
              py: 1.2,
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#232323",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* Dialogs & Menus */}
      <Dialog
        open={deleteParamDialogOpen}
        onClose={() => setDeleteParamDialogOpen(false)}
      >
        <DialogTitle>Delete Parameter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this parameter?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteParamDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteParameter} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
      >
        <DialogTitle>Clear All Data</DialogTitle>
        <DialogContent>
          <Typography>Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmClearAll} color="error">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: "96px" } }}
      >
        <MenuItem onClick={handleEditParameter}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteParameter}>Delete</MenuItem>
      </Menu>
      <AddParameterPopup
        open={openParamPopup}
        onClose={() => {
          setOpenParamPopup(false);
          setParamToEdit(null);
          setEditingParamIndex(null);
        }}
        onAdd={handleAddParameter}
        initialData={paramToEdit}
      />
    </Box>
  );
};

const headerStyle: CSSProperties = {
  padding: "10px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: 600,
  color: "#4B5563",
  borderBottom: "1px solid #E5E7EB",
};
const cellStyle = { padding: "10px", fontSize: "14px", color: "#4B5563" };

export default AddParameterPage;
