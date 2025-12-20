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
import { MoreHoriz } from "@mui/icons-material";
import ViewIcon from "@/assets/icons/eye.jpg";

import { useNavigate } from "react-router-dom";
import AddEquipmentPopup from "./AddEquipmentPopup";
import { Department, Equipment, Parameter } from "@/types";

interface InternalParameter extends Parameter {
    content: any;
}

const EquipmentPage = () => {
    const navigate = useNavigate();

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

                let departmentList: Department[] = [];
                let equipmentList: Equipment[] = [];

                departmentList = data.department.map((d: any, depIndex: number) => ({
                    id: depIndex + 1,
                    name: d.name,
                    is_active: d.is_active,
                    clinic_id: 1,
                    created_at: new Date().toISOString(),
                }));

                let equipmentCounter = 1;
                let parameterCounter = 1;

                data.department.forEach((dep: any, depIndex: number) => {
                    dep.equipments.forEach((eq: any) => {
                        const newEquipment: Equipment = {
                            id: equipmentCounter,
                            equipment_name: eq.equipment_name,
                            dep_id: depIndex + 1,
                            created_at: new Date().toISOString(),
                            department: departmentList[depIndex],
                            parameters: [],
                            status: "active",
                        };

                        equipmentList.push(newEquipment);

                        eq.parameters.forEach((param: any) => {
                            const contentFromApi = param.content || {}; 
                            
                            const newParam: InternalParameter = {
                                id: parameterCounter,
                                parameter_name: param.parameter_name,
                                equipment_id: equipmentCounter,
                                is_active: param.is_active,
                                content: {                 
                                    ...contentFromApi, 
                                },
                                created_at: new Date().toISOString(),
                                equipment: newEquipment,
                            };

                            newEquipment.parameters.push(newParam as any);
                            parameterCounter++;
                        });

                        equipmentCounter++;
                    });
                });

                const finalList = loadStatus(equipmentList);
                setEquipmentData(finalList);
            } catch (error) {
                console.error("Error loading equipments:", error);
            }
        };

        fetchData();
    }, []);

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

    const confirmDelete = () => {
        const newData = equipmentData.filter((item) => item.id !== selectedEquipmentId);
        setEquipmentData(newData);
        saveStatus(newData);
        setShowDeleteDialog(false);
        setSelectedEquipmentId(null);
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

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
                    Equipment's
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        placeholder="Search Equipment's"
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
                        Add Equipment's
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
                                        borderRadius: "6px",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {isInactive ? "Inactive" : "Active"}
                                </Box>

                                <CardContent sx={{ pb: 1 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                                        <b>{item.equipment_name}</b>
                                    </Typography>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                                                Department:
                                            </Typography>
                                            <Typography sx={{ fontSize: 14 }}>
                                                <b>{item.department?.name}</b>
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                                                Parameters:
                                            </Typography>
                                            <Typography sx={{ fontSize: 14 }}>
                                                <b>{item.parameters.length}</b>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                <Box sx={{ height: 1, background: "#E5E7EB", mx: 2 }} />

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
                                  
                                    <Typography sx={{ fontSize: 14, color: "#4B5563",  gap: 1,mr : 1}}>
                                        <span style={{ color: "#9CA3AF" }}>Created:</span>{" "}
                                       <b> {getCreatedDate(item.created_at)}</b>
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            onClick={() =>
                                                navigate("/configuration/equipment/view", {
                                                    state: { equipment: item },
                                                })
                                            }
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <img src={ViewIcon} alt="view" style={{ width: 18, height: 18 }} />
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
                                                backgroundColor: isInactive ? "#141414ff" : "1px solid #070707ff",
                                                "&:hover": {
                                                    backgroundColor: isInactive ? "#000000ff" : "rgba(0, 0, 0, 0.04)",
                                                },
                                            }}
                                        >
                                            <MoreHoriz 
                                                fontSize="small" 
                                                sx={{ 
                                                    color: isInactive ? "#ff9800" : "inherit",
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
                    <Button onClick={confirmInactive} variant="contained" sx={{ background: "red", "&:hover": { background: "red" } }}>
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
                    <Button onClick={() => setShowActivateDialog(false)}>Cancel</Button>
                    <Button onClick={confirmActivate} variant="contained" sx={{ background: "#4caf50", "&:hover": { background: "#45a049" } }}>
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