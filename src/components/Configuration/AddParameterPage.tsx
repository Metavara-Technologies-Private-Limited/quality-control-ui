import React, { useEffect, useState } from "react";
import { Box, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Typography, Button, Chip, TextField, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useLocation } from "react-router-dom";
import AddParameterPopup from "./AddParameterPopup";
import { MoreHoriz } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

import { fetchClinic } from "@/store/clinicSlice";


// Define the key for storing parameter drafts
const PARAM_DRAFT_STORAGE_KEY = "equipment_parameters_draft";

/* =======================
    HELPER FUNCTION FOR DATA TRANSFORMATION (NEW LOGIC ADDED HERE)
======================= */
const normalizeDropdownValue = (data: any): string[] => {
    if (Array.isArray(data)) {
        // Case 1: Already an array
        return data.map(String).filter(Boolean);
    }
    if (typeof data === 'string' && data.trim()) {
        // Case 2: Comma-separated string - split, trim, and filter out any empty results
        return data.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};


const AddParameterPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
const dispatch = useDispatch<AppDispatch>();


    const [equipmentName, setEquipmentName] = useState("");
    const [department, setDepartment] = useState("");
    const [count, setCount] = useState(1);
    const [selected, setSelected] = useState<number[]>([]);
    const [openParamPopup, setOpenParamPopup] = useState(false);
    const [parameters, setParameters] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuParamIndex, setMenuParamIndex] = useState<number | null>(null);
    const [paramIndexToDelete, setParamIndexToDelete] = useState<number | null>(null);
    const open = Boolean(anchorEl);
    const equipmentQuantity = Array.from({ length: count }, (_, i) => i + 1);
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [equipmentTable, setEquipmentTable] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalEquipment, setOriginalEquipment] = useState<any>(null);
    const [nextSrNo, setNextSrNo] = useState(1); // Track next available Sr. No 

    const [paramToEdit, setParamToEdit] = useState<any>(null);
    const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);

    // Delete confirmation dialog states
    const [deleteParamDialogOpen, setDeleteParamDialogOpen] = useState(false);
    const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

    // Helper to save parameters to localStorage
    const saveParametersToLocalStorage = (params: any[]) => {
        try {
            localStorage.setItem(PARAM_DRAFT_STORAGE_KEY, JSON.stringify(params));
        } catch (error) {
            console.error("Error saving parameters to localStorage:", error);
        }
    };

    // Helper to load parameters from localStorage
    const loadParametersFromLocalStorage = (): any[] => {
        try {
            const storedParams = localStorage.getItem(PARAM_DRAFT_STORAGE_KEY);
            return storedParams ? JSON.parse(storedParams) : [];
        } catch (error) {
            console.error("Error loading parameters from localStorage:", error);
            return [];
        }
    };

    // Data Loading Logic for Add vs. Edit
    useEffect(() => {
        const passedEquipment = location.state?.equipment;

        if (passedEquipment) {
            setIsEditMode(true);
            setOriginalEquipment(passedEquipment);
            
            // 1. Set basic equipment details
            setEquipmentName(passedEquipment.equipment_name || passedEquipment.name || "");
            setDepartment(passedEquipment.department?.name || "");
            
            // 2. Set Make/Model table data - transform the data correctly
            const loadedEquipmentTable = (passedEquipment.equipment_details || []).map((detail: any, index: number) => {
                // Extract the Sr. No from equipment_num (e.g., "Ct Scan-1" -> 1)
                const numMatch = detail.equipment_num?.match(/-(\d+)$/);
                const srNo = numMatch ? parseInt(numMatch[1]) : index + 1;
                
                return {
                    sr: srNo, // Use the actual Sr. No from backend
                    equipmentNum: srNo, // equipmentNum is same as Sr. No now
                    make: detail.make || "",
                    model: detail.model || ""
                };
            });
            
            setEquipmentTable(loadedEquipmentTable);
            
            if (loadedEquipmentTable.length > 0) {
                // Set count to the maximum Sr. No
                const maxSrNo = Math.max(...loadedEquipmentTable.map((item: any) => item.sr));
                setCount(maxSrNo);
                setSelected([]);
                // Set next Sr. No based on loaded data
                setNextSrNo(maxSrNo + 1);
            }
            
            // 3. Transform and set Parameters (UPDATED MAPPING HERE)
            const loadedParams = passedEquipment.parameters.map((p: any) => {
            const content = p.content || p.parameter_values?.[0]?.content || {};
            
            return {
                name: p.parameter_name,
                dataType: content.data_type,
            
                minValue: content.min_value,
                maxValue: content.max_value,
                integerValue: content.integer_value,
                percentageValue: content.percentage,
                textValue: content.text,
            
                dropdownValue: normalizeDropdownValue(
                content.dropdown || content.selectedOptions
                ),
            };
            });              
            setParameters(loadedParams);

            localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
            
        } else {
  setIsEditMode(false);

  setEquipmentName(location.state?.equipmentName || "");
  setDepartment(location.state?.departmentName || "");

  setParameters(loadParametersFromLocalStorage());
}

    }, [location]);

    useEffect(() => {
        if (!isEditMode) {
            saveParametersToLocalStorage(parameters);
        }
    }, [parameters, isEditMode]);

    const toggleSelection = (num: number) => {
        setSelected((prev) =>
          prev.includes(num)
            ? prev.filter((i) => i !== num)
            : [...prev, num]
        );
    };      

    // Watch for count changes and auto-adjust equipment table
    useEffect(() => {
        if (isEditMode) return;
      
        if (equipmentTable.length === 0) return;
      
        const currentMaxNum = Math.max(
          ...equipmentTable.map(row => row.equipmentNum),
          0
        );
      
        if (count > currentMaxNum) {
          // add rows ONLY in add mode
          const newEntries = [];
          for (let i = currentMaxNum + 1; i <= count; i++) {
            newEntries.push({
              sr: nextSrNo + newEntries.length,
              equipmentNum: i,
              make: "",
              model: ""
            });
          }
      
          if (newEntries.length) {
            setEquipmentTable(prev => [...prev, ...newEntries]);
            setNextSrNo(prev => prev + newEntries.length);
          }
        }
      
        if (count < currentMaxNum) {
          setEquipmentTable(prev => prev.filter(r => r.equipmentNum <= count));
          setSelected(prev => prev.filter(n => n <= count));
        }
    }, [count, isEditMode]);      

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
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
            setParamToEdit(param);
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

    const confirmDeleteParameter = () => {
        if (paramIndexToDelete !== null) {
            setParameters((prev) => prev.filter((_, i) => i !== paramIndexToDelete));
            setParamIndexToDelete(null);
        }
        setDeleteParamDialogOpen(false);
    };

    const handleSaveEquipmentDetails = () => {
        if (!make.trim() || !model.trim()) {
          alert("Please enter both Make and Model");
          return;
        }
      
        setEquipmentTable((prev) => {
          let updated = [...prev];
          let nextSr = nextSrNo;
      
          selected.forEach((num) => {
            const index = updated.findIndex(
              (row) => row.equipmentNum === num
            );
      
            if (index >= 0) {
              // 🔁 UPDATE existing row
              updated[index] = {
                ...updated[index],
                make,
                model,
              };
            } else {
              // ➕ ADD new row
              updated.push({
                sr: nextSr,
                equipmentNum: num,
                make,
                model,
              });
              nextSr++;
            }
          });
      
          setNextSrNo(nextSr);
          return updated;
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
          selected.includes(row.equipmentNum)
        );
      
        // If nothing exists yet → blank (new rows)
        if (selectedRows.length === 0) {
          setMake("");
          setModel("");
          return;
        }
      
        const firstMake = selectedRows[0]?.make || "";
        const firstModel = selectedRows[0]?.model || "";
      
        const sameMake = selectedRows.every(
          (row) => (row.make || "") === firstMake
        );
        const sameModel = selectedRows.every(
          (row) => (row.model || "") === firstModel
        );
      
        setMake(sameMake ? firstMake : "");
        setModel(sameModel ? firstModel : "");
    }, [selected, equipmentTable]);            

    const headerStyle: React.CSSProperties = {
        padding: "10px",
        textAlign: "left",
        fontSize: "14px",
        fontWeight: 600,
        color: "#4B5563",
        borderBottom: "1px solid #E5E7EB"
    };

    const cellStyle: React.CSSProperties = {
        padding: "10px",
        fontSize: "14px",
        color: "#4B5563"
    };

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
    };

    const handleAddParameter = (data: any) => {
        if (editingParamIndex !== null) {
            // Update existing parameter
            setParameters((prev) => 
                prev.map((p, i) => i === editingParamIndex ? data : p)
            );
            setEditingParamIndex(null);
            setParamToEdit(null);
        } else {
            // Add new parameter
            setParameters((prev) => [...prev, data]);
        }
        setOpenParamPopup(false);
    };

    const handleFinalSave = async () => {
        console.log("Save button clicked...");

        // Validate parameters
        if (parameters.length === 0) {
            alert("Please add at least one parameter");
            return;
        }

        // Validate equipment table (make and model)
        if (equipmentTable.length === 0) {
            alert("Please add equipment details with Make and Model");
            return;
        }

        try {
            const clinicId = 1; // TODO: make dynamic later

            /* 1️⃣ Build equipment payload */
            const newEquipmentEntry = {
                equipment_name: equipmentName,
                is_active: true,
                equipment_details: equipmentTable.map((row) => ({
                    equipment_num: `${equipmentName}-${row.equipmentNum}`, // Use Sr. No instead of equipmentNum
                    make: row.make || "",
                    model: row.model || "",
                    is_active: true,
                })),
                parameters: parameters.map((p) => ({
                    parameter_name: p.name,
                    is_active: true,
                    parameter_values: [
                    {   
                        content: {
                        data_type: p.dataType,
                        min_value: p.minValue,
                        max_value: p.maxValue,
                        integer_value: p.integerValue,
                        percentage: p.percentageValue,
                        text: p.textValue,
                        dropdown: p.dropdownValue || [],
                    },
                    },
                    ],
                })),
            };

            console.log("Equipment table before save:", equipmentTable);
            console.log("New equipment entry:", newEquipmentEntry);

            /* 2️⃣ Fetch existing clinic */
            const getRes = await fetch(
                `http://127.0.0.1:8000/api/get_clinic/${clinicId}/`
            );
            if (!getRes.ok) throw new Error("Failed to fetch clinic");

            const clinicData = await getRes.json();

            /* 3️⃣ Merge / Create department */
            const targetDeptName = department.trim();
            let deptFound = false;

            const updatedDepartments = clinicData.department.map((dept: any) => {
                if (dept.name.trim().toLowerCase() === targetDeptName.toLowerCase()) {
                    deptFound = true;

                    const filteredEquipments = isEditMode
                        ? dept.equipments.filter(
                                (e: any) =>
                                    e.equipment_name !==
                                    originalEquipment?.equipment_name
                            )
                        : dept.equipments;

                    return {
                        ...dept,
                        equipments: [...filteredEquipments, newEquipmentEntry],
                    };
                }
                return dept;
            });

            /* 4️⃣ If department does NOT exist → create it */
            if (!deptFound) {
                updatedDepartments.push({
                    name: targetDeptName,
                    is_active: true,
                    equipments: [newEquipmentEntry],
                });
            }

            /* 5️⃣ Final payload */
            const finalPayload = {
                ...clinicData,
                department: updatedDepartments,
            };

            console.log("Final Payload:", finalPayload);

            /* 6️⃣ ALWAYS PUT (clinic already exists) */
            const response = await fetch(
                `http://127.0.0.1:8000/api/clinics/${clinicId}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(finalPayload),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                console.error("Backend error:", err);
                throw new Error("Failed to save clinic");
            }

            alert("Equipment saved successfully ✅");
            localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
// 🔥 REFRESH REDUX CLINIC DATA
dispatch(fetchClinic(1));

navigate("/configuration/equipment", { replace: true });


        } catch (error) {
            console.error("Save failed:", error);
            alert("Save failed. Check console for details.");
        }
    };

    // Render parameter details based on data type (UPDATED LOGIC HERE)
    const renderParameterContent = (p: any) => {
        const dataType = p.dataType || p.data_type;
        
        switch(dataType) {
            case "Min/Max":
            case "Decimal":
                return (
                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        Min {p.min_value || p.minValue} °C   –   Max {p.max_value || p.maxValue} °C
                    </Typography>
                );
            
            case "Integer":
                return (
                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        Integer Value: {p.integerValue || p.integer_value}
                    </Typography>
                );
            
            case "Percentage":
                return (
                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        Parameter Value: {p.percentageValue || p.percentage}
                    </Typography>
                );
            
            case "Text":
                return (
                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                        Text Value: {p.textValue || p.text}
                    </Typography>
                );
            
            case "Dropdown":
            case "Select":
                // Since the useEffect now correctly populates p.dropdownValue as an array, use it directly
                let options = normalizeDropdownValue(
                    p.dropdownValue ??
                    p.dropdown ??
                    p.content?.dropdown ??
                    p.parameter_values?.[0]?.content?.dropdown
                  );
                
                // Fallback for old data structure if p.dropdownValue is missing
                if (options.length === 0) {
                    options = normalizeDropdownValue(p.selectedOptions || p.dropdown);
                }
                
                // Only show Selection if there are options
                if (options.length === 0) {
                    return null;
                }
                
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}></Typography>
                        {options.map((val: any, i: number) => (
                            <Chip key={i} label={String(val)} size="small" sx={{ background: "transparent" }} />
                        ))}
                    </Box>
                );
            
            default:
                return null;
        }
    };

    return (
        <Box>
            <Box sx={{ p: 1, background: "#FFFFFF", minHeight: "100vh" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate("/configuration/equipment")} sx={{width: "32px", height: "32px", border: "1px solid #E5E7EB", borderRadius: "8px",}}>
                        <ArrowBackRoundedIcon sx={{ fontSize: "18px", color: "#4B5563" }} />
                    </IconButton>

                    <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
                        {isEditMode ? "Edit Equipment" : "Add Equipment"}
                    </Typography>
                </Box>

                <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2, mb: 2 }}></Box>

                <Typography sx={{fontWeight: 700, fontSize: "18px", display: "flex", alignItems: "center", gap: 1,}}>
                    {equipmentName}
                    <Chip label={department} sx={{background: "#E0F1E6", color: "#3D8B61", fontWeight: 600, height: "22px",}}/>
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>Parameters (e.g. Temperature)</Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => {
                        setParamToEdit(null);
                        setEditingParamIndex(null);
                        setOpenParamPopup(true);
                    }}>
                        <Typography sx={{ color: "#2563EB", fontSize: "14px" }}>+</Typography>
                        <Typography sx={{ color: "#2563EB", fontSize: "14px", fontWeight: 500 }}>Add Parameters</Typography>
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
                                {/* Header row */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
                                        {p.name || p.parameter_name}
                                    </Typography>

                                    {/* 3 dots menu button */}
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleMenuOpen(e, index)} 
                                        sx={{ padding: "4px", borderRadius: "6px", backgroundColor: "#F3F4F6" }}
                                    >
                                        <MoreHoriz sx={{ fontSize: "18px", color: "#6B7280" }} />
                                    </IconButton>
                                </Box>

                                {/* Data Type */}
                                <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
                                    Data Type : {p.dataType || p.data_type}
                                </Typography>

                                {/* Divider */}
                                <Box sx={{ height: "1px", background: "#E5E7EB", mt: 1.2, mb: 1.2, mx:-2 }} />

                                {/* Render content based on data type */}
                                {renderParameterContent(p)}
                            </Box>
                        ))}
                    </Box>
                )}

                <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2 }}></Box>

                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                            #No. of {equipmentName}s :
                        </Typography>

                        {/* Minus Button */}
                        <Button
                            variant="outlined"
                            onClick={() => setCount((c) => (c > 1 ? c - 1 : c))}
                            sx={{
                                minWidth: "38px",
                                height: "32px",
                                borderRadius: "8px",
                                color: "#565656",
                                borderColor: "#CFCFCF",
                                textTransform: "none",
                                fontSize: "20px",
                                fontWeight: 500,
                                px: 0,
                            }}
                        >
                            –
                        </Button>

                        {/* Value Box */}
                        <Box
                            sx={{
                                width: "48px",
                                height: "32px",
                                border: "1px solid #CFCFCF",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: 600,
                                color: "#565656",
                                background: "#FFFFFF",
                                fontSize: "14px",
                            }}
                        >
                            {String(count).padStart(2, "0")}
                        </Box>

                        {/* Plus Button */}
                        <Button
                            variant="outlined"
                            onClick={() => setCount((c) => c + 1)}
                            sx={{
                                minWidth: "38px",
                                height: "32px",
                                borderRadius: "8px",
                                color: "#565656",
                                borderColor: "#CFCFCF",
                                textTransform: "none",
                                fontSize: "20px",
                                fontWeight: 500,
                                px: 0,
                            }}
                        >
                            +
                        </Button>
                    </Box>
                </Box>

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
                                transition: "0.2s",
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
                                sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#4B5563",
                                }}
                            >
                                {equipmentName} {num}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Details Section Title */}
                {selected.length > 0 && (
                    <Typography
                        sx={{
                        mt: 4,
                        fontSize: "15px",
                        fontWeight: 600,
                        mb: 2
                        }}
                    >
                        Details of {selected.map((n) => `${equipmentName} ${n}`).join(", ")}
                    </Typography>
                )}

                {/* Make & Model Inputs */}
                {selected.length > 0 && (
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
                            sx={{"& .MuiInputLabel-root": { color: "#5F646F !important" }, "& .MuiInputLabel-root.Mui-focused": { color: "#5F646F !important" }, "& .MuiOutlinedInput-root": {"& fieldset": { borderColor: "#CFD1D4" }, "&:hover fieldset": { borderColor: "#CFD1D4" }, "&.Mui-focused fieldset": { borderColor: "#CFD1D4" }}, "& .MuiInputBase-input": { color: "#5F646F" }}}
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
                            sx={{"& .MuiInputLabel-root": { color: "#5F646F !important" }, "& .MuiInputLabel-root.Mui-focused": { color: "#5F646F !important" }, "& .MuiOutlinedInput-root": {"& fieldset": { borderColor: "#CFD1D4" }, "&:hover fieldset": { borderColor: "#CFD1D4" }, "&.Mui-focused fieldset": { borderColor: "#CFD1D4" }}, "& .MuiInputBase-input": { color: "#5F646F" }}}
                        />
                    </Box>
                )}
                {selected.length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                        variant="contained"
                        onClick={handleSaveEquipmentDetails}
                        sx={{
                            borderRadius: "8px", background: "#383838", textTransform: "none", "&:hover": { background: "#2f2f2f" } }}
                        >
                        Save
                        </Button>
                    </Box>
                )}
                {equipmentTable.length > 0 && (
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
                                    <th style={headerStyle}>Sr. No.</th>
                                    <th style={headerStyle}>{equipmentName} Name</th>
                                    <th style={headerStyle}>Make</th>
                                    <th style={headerStyle}>Model</th>
                                </tr>
                            </thead>

                            <tbody>
                                {equipmentTable.map((row, index) => (
                                <tr key={row.sr} style={{ height: "42px", borderTop: "1px solid #E5E7EB" }}>
                                    <td style={cellStyle}>{row.sr}</td>
                                    <td style={cellStyle}>{equipmentName} {row.equipmentNum}</td>
                                    <td style={cellStyle}>{row.make}</td>
                                    <td style={cellStyle}>{row.model}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
                <Box sx={{ mt: 10, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={handleClearAll} sx={{borderRadius: "10px", borderColor: "#505050", "&:hover": { borderColor: "#505050", backgroundColor: "white" }, color: "#505050", textTransform: "none" }}>Clear All</Button>
                    <Button variant="contained" onClick={handleFinalSave} sx={{ borderRadius: "10px", background: "#383838", textTransform: "none", "&:hover": { background: "#2f2f2f" } }}>Save</Button>
                </Box>
            </Box>

            {/* Parameter Delete Confirmation Dialog */}
            <Dialog 
                open={deleteParamDialogOpen} 
                onClose={() => setDeleteParamDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
                        width: "400px",
                        padding: "8px"
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: "18px", pb: 1 }}>
                    Delete Parameter
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#4B5563", fontSize: "14px" }}>
                        Are you sure you want to delete this parameter?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setDeleteParamDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: "8px",
                            borderColor: "#E5E7EB",
                            color: "#4B5563",
                            textTransform: "none",
                            "&:hover": {
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDeleteParameter}
                        variant="contained"
                        sx={{
                            borderRadius: "8px",
                            background: "#DC2626",
                            textTransform: "none",
                            "&:hover": {
                                background: "#B91C1C"
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Clear All Confirmation Dialog */}
            <Dialog 
                open={clearAllDialogOpen} 
                onClose={() => setClearAllDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
                        width: "400px",
                        padding: "8px"
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: "18px", pb: 1 }}>
                    Clear All Data
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#4B5563", fontSize: "14px" }}>
                        Are you sure you want to clear all equipment details and parameters? 
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setClearAllDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: "8px",
                            borderColor: "#E5E7EB",
                            color: "#4B5563",
                            textTransform: "none",
                            "&:hover": {
                                borderColor: "#D1D5DB",
                                backgroundColor: "#F9FAFB"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmClearAll}
                        variant="contained"
                        sx={{
                            borderRadius: "8px",
                            background: "#DC2626",
                            textTransform: "none",
                            "&:hover": {
                                background: "#B91C1C"
                            }
                        }}
                    >
                        Clear All
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu 
                anchorEl={anchorEl} 
                open={open} 
                onClose={handleClose} 
                PaperProps={{ sx:{ width:"96px", borderRadius:"8px", ml: "-60px", mt: "10px", boxShadow:"0px 1px 4px rgba(0,0,0,0.1)" }}}
            >
                <MenuItem onClick={handleEditParameter} sx={{ width:"96px", height:"33px", p:"8px", gap:"6px", borderBottom:"1px solid #E5E7EB" }}>Edit</MenuItem>
                <MenuItem onClick={handleDeleteParameter} sx={{ width:"96px", height:"33px", p:"8px", gap:"6px" }}>Delete</MenuItem>
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

export default AddParameterPage;