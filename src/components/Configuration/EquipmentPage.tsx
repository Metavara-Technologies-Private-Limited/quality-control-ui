import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    Button,
    TextField,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useLocation } from "react-router-dom";
import { MoreHoriz } from "@mui/icons-material";
import ViewIcon from "@/assets/icons/eye.jpg";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import AddEquipmentPopup from "./AddEquipmentPopup";
import { Department, Equipment, Parameter } from "@/types";

interface InternalParameter extends Parameter {
    content: any;
    parameter_values?: Array<{ content: any }>;
}

const EquipmentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const refresh = searchParams.get("refresh");

    const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const open = Boolean(anchorEl);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showInactiveDialog, setShowInactiveDialog] = useState(false);
    const [showActivateDialog, setShowActivateDialog] = useState(false);
    const [openAddEquipmentPopup, setOpenAddEquipmentPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Load inactive status from localStorage
    const loadStatus = (equipmentList: Equipment[]) => {
        const savedStatus = JSON.parse(localStorage.getItem("equipmentStatus") || "{}");
        return equipmentList.map((item) => ({
            ...item,
            status: savedStatus[item.id] || "active",
        }));
    };

    // Save inactive status
    const saveStatus = (equipmentList: Equipment[]) => {
        const statusObj: Record<number, string> = {};
        equipmentList.forEach((item) => {
            statusObj[item.id] = item.status || "active";
        });
        localStorage.setItem("equipmentStatus", JSON.stringify(statusObj));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/1/`);
                const data = await response.json();

                console.log("=== API Response ===", data);

                let departmentList: Department[] = [];
                let equipmentList: Equipment[] = [];

                // First, create the department list with their actual IDs from backend
                departmentList = data.department.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    is_active: d.is_active,
                    clinic_id: 1,
                    created_at: new Date().toISOString(),
                }));

                let parameterCounter = 1;

                // Now map equipments and link them to departments by ID
                data.department.forEach((dep: any) => {
                    const matchingDepartment = departmentList.find(d => d.id === dep.id);
                    
                    if (!matchingDepartment) {
                        console.error(`Department not found for ID: ${dep.id}`);
                        return;
                    }

                    dep.equipments.forEach((eq: any) => {
                        console.log("=== Processing Equipment ===", eq.equipment_name);
                        console.log("Parameters from API:", eq.parameters);

                        const newEquipment: Equipment = {
                            id: eq.id,
                            equipment_name: eq.equipment_name,
                            dep_id: dep.id,
                            created_at: new Date().toISOString(),
                            department: matchingDepartment,
                            parameters: [],
                            status: "active",
                            is_active: false,
                            equipment_details: eq.equipment_details || []
                        };

                        equipmentList.push(newEquipment);

                        // FIXED: Properly map parameter content
                        eq.parameters.forEach((param: any) => {
                            console.log("=== Processing Parameter ===", param.parameter_name);
                            console.log("Raw parameter data:", param);
                            
                            // Get content from the API response
                            const apiContent = param.content || {};
                            
                            console.log("Parameter content:", apiContent);
                            
                            const newParam: InternalParameter = {
                                id: parameterCounter,
                                parameter_name: param.parameter_name,
                                equipment_id: eq.id,
                                is_active: param.is_active,
                                // Store content in both places for compatibility
                                content: apiContent,
                                parameter_values: [{
                                    content: apiContent
                                }],
                                created_at: new Date().toISOString(),
                                equipment: newEquipment,
                            };

                            console.log("Created parameter object:", newParam);
                            newEquipment.parameters.push(newParam as any);
                            parameterCounter++;
                        });

                        console.log("Final equipment with parameters:", newEquipment);
                    });
                });

                console.log("=== Final Equipment List ===", equipmentList);

                const finalList = loadStatus(equipmentList);
                setEquipmentData(finalList);
            } catch (error) {
                console.error("Error loading equipments:", error);
            }
        };

        fetchData();
    }, [refresh]);

    const filteredEquipments = equipmentData.filter((item) =>
        item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCreatedDate = (dateString: string) => {
        let date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleDeleteEquipment = (equipmentId: number) => {
        setSelectedEquipmentId(equipmentId);
        setShowDeleteDialog(true);
        setAnchorEl(null);
    };

    const confirmDelete = async () => {
        if (!selectedEquipmentId) return;
      
        try {
            const equipment = equipmentData.find(e => e.id === selectedEquipmentId);
            if (!equipment) return;
      
            await fetch(
                `http://127.0.0.1:8000/api/departments/${equipment.dep_id}/equipments/${equipment.id}/delete/`,
                { method: "DELETE" }
            );
      
            // Update UI after success
            const newData = equipmentData.filter(item => item.id !== selectedEquipmentId);
            setEquipmentData(newData);
            saveStatus(newData);
      
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setShowDeleteDialog(false);
            setSelectedEquipmentId(null);
        }
    };

    const handleInactiveEquipment = (equipmentId: number) => {
        setSelectedEquipmentId(equipmentId);
        setShowInactiveDialog(true);
        setAnchorEl(null);
    };

    const confirmInactive = () => {
        const newData = equipmentData.map((item) =>
            item.id === selectedEquipmentId ? { ...item, status: "inactive" } : item
        );
        setEquipmentData(newData);
        saveStatus(newData);
        setShowInactiveDialog(false);
        setSelectedEquipmentId(null);
    };

    const handleActiveEquipment = (equipmentId: number) => {
        setSelectedEquipmentId(equipmentId);
        setShowActivateDialog(true);
        setAnchorEl(null);
    };

    const confirmActivate = () => {
        const newData = equipmentData.map((item) =>
            item.id === selectedEquipmentId ? { ...item, status: "active" } : item
        );
        setEquipmentData(newData);
        saveStatus(newData);
        setShowActivateDialog(false);
        setSelectedEquipmentId(null);
    };

    const handleViewEquipment = (equipment: Equipment) => {
        console.log("=== Navigating to View ===");
        console.log("Equipment being passed:", equipment);
        console.log("Parameters:", equipment.parameters);
        
        navigate("/configuration/equipment/view", {
            state: { equipment },
        });
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
                    Equipments
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        placeholder="Search Equipments"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: 260, background: "#fff" }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddEquipmentPopup(true)}
                        sx={{
                            background: "#505050",
                            "&:hover": { background: "#505050" },
                        }}
                    >
                        Add Equipments
                    </Button>
                </Box>
            </Box>

            {/* Cards */}
            <Grid container spacing={2}>
                {filteredEquipments.map((item) => {
                    const isInactive = item.status === "inactive";

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                            <Card
                                sx={{
                                    position: "relative",
                                    borderRadius: "16px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "none",
                                    opacity: isInactive ? 0.5 : 1,
                                    backgroundColor: isInactive ? "#F5F5F5" : "#fff",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {/* Status Badge Top-Right */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        background: isInactive ? "#ffcccc" : "#d4f8d4",
                                        color: isInactive ? "#b30000" : "#008000",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        px: 1.3,
                                        py: 0.5,
                                        borderRadius: "20px",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {isInactive ? "Inactive" : "Active"}
                                </Box>

                                <CardContent sx={{ pb: 1 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#232323" }}>
                                        <b>{item.equipment_name}</b>
                                    </Typography>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 14, color: "#9CA3AF" }}>
                                                Department:
                                            </Typography>
                                            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                                                {item.department?.name}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                                                Parameters:
                                            </Typography>
                                            <Typography sx={{ fontSize: 16 }}>
                                                {item.parameters.length}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                <Divider />

                                {/* Bottom Icons */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                        pt: 1,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 16, fontWeight:500, color: "#4B5563",  gap: 1,mr : 1}}>
                                        <span style={{ color: "#9CA3AF", fontSize: 14 }}>Created Date:</span>{" "}
                                        {getCreatedDate(item.created_at)}
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            disabled={isInactive}
                                            onClick={() => !isInactive && handleViewEquipment(item)}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "8px",
                                                cursor: isInactive ? "not-allowed" : "pointer",
                                                pointerEvents: isInactive ? "none" : "auto",
                                                opacity: isInactive ? 0.4 : 1,
                                            }}
                                        >
                                            <img
                                                src={ViewIcon}
                                                alt="view"
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    filter: isInactive ? "grayscale(100%)" : "none",
                                                }}
                                            />
                                        </IconButton>

                                        <IconButton
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setSelectedEquipmentId(item.id);
                                            }}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                border: isInactive ? "2px solid #ffffffff" : "1px solid #E5E7EB",
                                                borderRadius: "8px",
                                                backgroundColor: isInactive ? "#505050" : "2px solid #000000ff",
                                                "&:hover": {
                                                    backgroundColor: isInactive ? "#000000ff" : "rgba(0, 0, 0, 0.04)",
                                                },
                                            }}
                                        >
                                            <MoreHoriz 
                                                fontSize="small" 
                                                sx={{ 
                                                    color: isInactive ? "#ffffffff" : "inherit",
                                                    fontWeight: isInactive ? 700 : 400,
                                                }} 
                                            />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Menu */}
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                {selectedEquipmentId &&
                    equipmentData.find((e) => e.id === selectedEquipmentId)?.status === "inactive" ? (
                    <MenuItem onClick={() => handleActiveEquipment(selectedEquipmentId)}>Activate</MenuItem>
                ) : (
                    <MenuItem onClick={() => handleInactiveEquipment(selectedEquipmentId || 0)}>
                        Inactive
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => handleDeleteEquipment(selectedEquipmentId || 0)}
                    sx={{ color: "#d32f2f" }}
                >
                    Delete
                </MenuItem>
            </Menu>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this equipment?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Inactive Dialog */}
            <Dialog open={showInactiveDialog} onClose={() => setShowInactiveDialog(false)}>
                <DialogTitle>Confirm Inactivate</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to inactivate this equipment?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowInactiveDialog(false)}>Cancel</Button>
                    <Button onClick={confirmInactive} variant="contained" sx={{ background: "red", "&:hover": { background: "#c42323ff" } }}>
                        Inactivate
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Activate Dialog */}
            <Dialog open={showActivateDialog} onClose={() => setShowActivateDialog(false)}>
                <DialogTitle>Confirm Activate</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to activate this equipment?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowActivateDialog(false)} variant="outlined"sx={{color:"black", border:"1px solid #000"}} >Cancel</Button>
                    <Button onClick={confirmActivate} variant="contained" sx={{ background: "#505050", "&:hover": { background: "#505050" } }}>
                        Activate
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Equipment Popup */}
            <AddEquipmentPopup
                open={openAddEquipmentPopup}
                onClose={() => setOpenAddEquipmentPopup(false)}
            />
        </Box>
    );
};

export default EquipmentPage;