import React, { useEffect, useState } from "react";
// 1. IMPORT TOAST
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Box, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Typography, Button, Chip, TextField, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useLocation } from "react-router-dom";
import AddParameterPopup from "./AddParameterPopup";
import { MoreHoriz } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

import { fetchClinic } from "@/store/clinicSlice";

const PARAM_DRAFT_STORAGE_KEY = "equipment_parameters_draft";

const normalizeDropdownValue = (data: any): string[] => {
    if (Array.isArray(data)) {
        return data.map(String).filter(Boolean);
    }
    if (typeof data === 'string' && data.trim()) {
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
    const [nextSrNo, setNextSrNo] = useState(1); 

    const [paramToEdit, setParamToEdit] = useState<any>(null);
    const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);

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
        if (passedEquipment) {
            setIsEditMode(true);
            setOriginalEquipment(passedEquipment);
            setEquipmentName(passedEquipment.equipment_name || passedEquipment.name || "");
            setDepartment(passedEquipment.department?.name || "");
            
            const loadedEquipmentTable = (passedEquipment.equipment_details || []).map((detail: any, index: number) => {
                const numMatch = detail.equipment_num?.match(/-(\d+)$/);
                const srNo = numMatch ? parseInt(numMatch[1]) : index + 1;
                return {
                    id: detail.id,
                    sr: srNo,
                    equipmentNum: srNo,
                    make: detail.make || "",
                    model: detail.model || ""
                };
            });
            
            setEquipmentTable(loadedEquipmentTable);
            
            if (loadedEquipmentTable.length > 0) {
                const maxSrNo = Math.max(...loadedEquipmentTable.map((item: any) => item.sr));
                setCount(maxSrNo);
                setSelected([]);
                setNextSrNo(maxSrNo + 1);
            }
            
            // const loadedParams = passedEquipment.parameters.map((p: any) => {
            //     const content = p.content || p.parameter_values?.[0]?.content || {};
            //     return {
            //         name: p.parameter_name,
            //         dataType: content.data_type,
            //         minValue: content.min_value,
            //         maxValue: content.max_value,
            //         integerValue: content.integer_value,
            //         percentageValue: content.percentage,
            //         textValue: content.text,
            //         dropdownValue: normalizeDropdownValue(content.dropdown || content.selectedOptions),
            //     };
            // });                    
            const loadedParams = passedEquipment.parameters.map((p: any) => {
                const cfg = p.config || {};
                return {
                id: p.id,
                  name: p.parameter_name,
                  dataType: cfg.data_type,
                  minValue: cfg.min_value,
                  maxValue: cfg.max_value,
                  integerValue: cfg.integer_value,
                  percentageValue: cfg.percentage,
                  textValue: cfg.text,
                  dropdownValue: normalizeDropdownValue(cfg.dropdown),
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
          prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num]
        );
    };      

    useEffect(() => {
        if (isEditMode) return;
        if (equipmentTable.length === 0) return;
        const currentMaxNum = Math.max(...equipmentTable.map(row => row.equipmentNum), 0);
      
        if (count > currentMaxNum) {
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
            setParamToEdit({ ...param });
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
            // Optional Toast for deletion
            toast.info("Parameter removed");
        }
        setDeleteParamDialogOpen(false);
    };

    const handleSaveEquipmentDetails = () => {
        if (!make.trim() || !model.trim()) {
          // 2. ERROR TOAST
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
      
        // 3. SUCCESS TOAST
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
        const selectedRows = equipmentTable.filter((row) => selected.includes(row.equipmentNum));
        if (selectedRows.length === 0) {
          setMake("");
          setModel("");
          return;
        }
        const firstMake = selectedRows[0]?.make || "";
        const firstModel = selectedRows[0]?.model || "";
        const sameMake = selectedRows.every((row) => (row.make || "") === firstMake);
        const sameModel = selectedRows.every((row) => (row.model || "") === firstModel);
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
                prev.map((p, i) =>
                  i === editingParamIndex ? { ...p, ...data } : p
                )
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

    const handleFinalSave = async () => {
        if (parameters.length === 0) {
            toast.error("Please add at least one parameter");
            return;
        }

        if (equipmentTable.length === 0) {
            toast.error("Please add equipment details (Make and Model)");
            return;
        }

        try {
            const clinicId = 1; 

            const newEquipmentEntry = {
                id: isEditMode ? originalEquipment.id : undefined,
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
                    parameter_name: p.name,
                    is_active: true,
                    config: {
                      data_type: p.dataType,
                      min_value: p.minValue ?? null,
                      max_value: p.maxValue ?? null,
                      integer_value: p.integerValue ?? null,
                      percentage: p.percentageValue ?? null,
                      text: p.textValue ?? null,
                      dropdown: p.dropdownValue ?? [],
                    },
                  })),                  
            };

            const getRes = await fetch(`http://127.0.0.1:8000/api/get_clinic/${clinicId}/`);
            if (!getRes.ok) throw new Error("Failed to fetch clinic");
            const clinicData = await getRes.json();

            const targetDeptName = department.trim();
            let deptFound = false;

            const updatedDepartments = clinicData.department.map((dept: any) => {
                if (dept.name.trim().toLowerCase() === targetDeptName.toLowerCase()) {
                    deptFound = true;
                    const filteredEquipments = isEditMode
                        ? dept.equipments.filter((e: any) => e.equipment_name !== originalEquipment?.equipment_name)
                        : dept.equipments;

                    return { ...dept, equipments: [...filteredEquipments, newEquipmentEntry] };
                }
                return dept;
            });

            if (!deptFound) {
                updatedDepartments.push({
                    name: targetDeptName,
                    is_active: true,
                    equipments: [newEquipmentEntry],
                });
            }

            const finalPayload = { ...clinicData, department: updatedDepartments };

            const response = await fetch(`http://127.0.0.1:8000/api/clinics/${clinicId}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            });

            if (!response.ok) throw new Error("Failed to save clinic");

            // 4. FINAL SUCCESS TOAST
            toast.success("Successfully Saved!", {
                position: "top-right",
                autoClose: 2000,
                theme: "colored",
            });

            localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
            dispatch(fetchClinic(1));
            
            // Delay navigation slightly so user can see the toast
            setTimeout(() => {
                navigate("/configuration/equipment", { replace: true });
            }, 2000);

        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Save failed! Please check console.");
        }
    };

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
                return <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{p.integerValue || p.integer_value}</Typography>;
            case "Percentage":
                return <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{p.percentageValue || p.percentage}</Typography>;
            case "Text":
                return <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{p.textValue || p.text}</Typography>;
            case "Dropdown":
            case "Select":
                let options = normalizeDropdownValue(p.dropdownValue ?? p.dropdown ?? p.content?.dropdown ?? p.parameter_values?.[0]?.content?.dropdown);
                if (options.length === 0) options = normalizeDropdownValue(p.selectedOptions || p.dropdown);
                if (options.length === 0) return null;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                        {options.map((val: any, i: number) => (
                            <Chip key={i} label={String(val)} size="small" sx={{ background: "transparent" }} />
                        ))}
                    </Box>
                );
            default: return null;
        }
    };

    return (
        <Box>
            {/* 5. ADD TOAST CONTAINER */}
            <ToastContainer />
            
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

                {/* Parameters Section */}
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
                            <Box key={index} sx={{ width: "260px", border: "1px solid #E5E7EB", borderRadius: "12px", background: "#FFFFFF", p: 2, boxShadow: "0px 1px 2px rgba(0,0,0,0.04)" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>{p.name || p.parameter_name}</Typography>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, index)} sx={{ padding: "4px", borderRadius: "6px", backgroundColor: "#F3F4F6" }}>
                                        <MoreHoriz sx={{ fontSize: "18px", color: "#6B7280" }} />
                                    </IconButton>
                                </Box>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>Data Type : {p.dataType || p.data_type}</Typography>
                                <Box sx={{ height: "1px", background: "#E5E7EB", mt: 1.2, mb: 1.2, mx:-2 }} />
                                {renderParameterContent(p)}
                            </Box>
                        ))}
                    </Box>
                )}

                <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2 }}></Box>

                {/* Quantity Controls */}
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>#No. of {equipmentName}s :</Typography>
                        <Button variant="outlined" onClick={() => setCount((c) => (c > 1 ? c - 1 : c))} sx={{ minWidth: "38px", height: "32px", borderRadius: "8px", color: "#565656", borderColor: "#CFCFCF", textTransform: "none", fontSize: "20px", fontWeight: 500, px: 0 }}>–</Button>
                        <Box sx={{ width: "48px", height: "32px", border: "1px solid #CFCFCF", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 600, color: "#565656", background: "#FFFFFF", fontSize: "14px" }}>{String(count).padStart(2, "0")}</Box>
                        <Button variant="outlined" onClick={() => setCount((c) => c + 1)} sx={{ minWidth: "38px", height: "32px", borderRadius: "8px", color: "#565656", borderColor: "#CFCFCF", textTransform: "none", fontSize: "20px", fontWeight: 500, px: 0 }}>+</Button>
                    </Box>
                </Box>

                {/* Selection Chips */}
                <Typography sx={{ fontSize: "14px", fontWeight: 600, mt: 3 }}>Select {equipmentName}s</Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                    {equipmentQuantity.map((num) => (
                        <Box key={num} onClick={() => toggleSelection(num)} sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, height: "36px", borderRadius: "8px", cursor: "pointer", borderColor: "#E2E3E5", background: "#FAFAFA" }}>
                            {selected.includes(num) ? (
                                <Box sx={{ width: "20px", height: "20px", borderRadius: "6px", background: "#DEEFE1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="13" height="13" fill="#3D8B61" viewBox="0 0 24 24"><path d="M20.285 6.708l-11.285 11.292-5.285-5.292 1.414-1.414 3.871 3.879 9.871-9.878z" /></svg>
                                </Box>
                            ) : (
                                <Box sx={{ width: "20px", height: "20px", borderRadius: "6px", border: "1.8px solid #D1D5DB" }} />
                            )}
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#4B5563" }}>{equipmentName} {num}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Make & Model Inputs */}
                {selected.length > 0 && (
                    <>
                        <Typography sx={{ mt: 4, fontSize: "15px", fontWeight: 600, mb: 2 }}>Details of {selected.map((n) => `${equipmentName} ${n}`).join(", ")}</Typography>
                        <Box sx={{ display: "flex", gap: 3 }}>
                            <TextField placeholder="Enter Make" label="Make" value={make} onChange={(e) => setMake(e.target.value)} fullWidth size="small" required InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputLabel-root": { color: "#5F646F !important" } }} />
                            <TextField placeholder="Enter Model" label="Model" value={model} onChange={(e) => setModel(e.target.value)} fullWidth size="small" required InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputLabel-root": { color: "#5F646F !important" } }} />
                        </Box>
                        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                            <Button variant="contained" onClick={handleSaveEquipmentDetails} sx={{ borderRadius: "8px", background: "#383838", textTransform: "none" }}>Save</Button>
                        </Box>
                    </>
                )}

                {/* Table Section */}
                {equipmentTable.length > 0 && (
                    <Box sx={{ mt: 4, border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#F9FAFB", height: "42px" }}>
                                    <th style={{...headerStyle}}>Sr. No.</th>
                                    <th style={{...headerStyle}}>{equipmentName} Name</th>
                                    <th style={{...headerStyle}}>Make</th>
                                    <th style={{...headerStyle}}>Model</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipmentTable.map((row) => (
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

                {/* Footer Buttons */}
                <Box sx={{ mt: 10, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={handleClearAll} sx={{borderRadius: "10px", borderColor: "#505050", color: "#505050", textTransform: "none" }}>Clear All</Button>
                    <Button variant="contained" onClick={handleFinalSave} sx={{ borderRadius: "10px", background: "#383838", textTransform: "none" }}>Save</Button>
                </Box>
            </Box>

            {/* Dialogs & Menus */}
            <Dialog open={deleteParamDialogOpen} onClose={() => setDeleteParamDialogOpen(false)}><DialogTitle>Delete Parameter</DialogTitle><DialogContent><Typography>Are you sure?</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteParamDialogOpen(false)}>Cancel</Button><Button onClick={confirmDeleteParameter} color="error">Delete</Button></DialogActions></Dialog>
            <Dialog open={clearAllDialogOpen} onClose={() => setClearAllDialogOpen(false)}><DialogTitle>Clear All Data</DialogTitle><DialogContent><Typography>Are you sure?</Typography></DialogContent><DialogActions><Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button><Button onClick={confirmClearAll} color="error">Clear All</Button></DialogActions></Dialog>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx:{ width:"96px" }}}><MenuItem onClick={handleEditParameter}>Edit</MenuItem><MenuItem onClick={handleDeleteParameter}>Delete</MenuItem></Menu>
            <AddParameterPopup open={openParamPopup} onClose={() => {setOpenParamPopup(false); setParamToEdit(null); setEditingParamIndex(null); }} onAdd={handleAddParameter} initialData={paramToEdit} />
        </Box>
    );
};

const headerStyle = { padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB" };
const cellStyle = { padding: "10px", fontSize: "14px", color: "#4B5563" };

export default AddParameterPage;