import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Grid,
    CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";

/* =======================
    TYPES
======================= */

interface ParameterContent {
    data_type?: "Min/Max" | "Integer" | "Percentage" | "Text" | "Dropdown" | "Select" | "Decimal"; 
    min_value?: string;
    max_value?: string;
    integer_value?: string;
    percentage?: string;
    text?: string;
    dropdown?: string[] | string; 
    selectedOptions?: string[]; 
    value?: string;
    options?: string[];
}

interface Parameter {
    parameter_name: string;
    is_active: boolean;
    content?: ParameterContent;
}

interface EquipmentDetail {
    equipment_num: string;
    make: string;
    model: string;
    is_active?: boolean;
}

/* =======================
    PARAMETER RENDER LOGIC
======================= */

const renderParameterDetails = (p: any) => {
    const content = p.parameter_values?.[0]?.content;
    if (!content) return null;

    if (!content || !content.data_type) { 
        return (
            <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                Content configuration missing
            </Typography>
        );
    }

    switch (content.data_type) {
        case "Min/Max":
        case "Decimal": 
            return (
                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    Min {content.min_value ?? "-"} °C   –   Max {content.max_value ?? "-"} °C
                </Typography>
            );

        case "Integer":
            return (
                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    {content.integer_value ?? "-"}
                </Typography>
            );
            
        case "Percentage":
            return (
                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    {content.percentage || content.percentage || "-"}
                </Typography>
            );

        case "Text":
            return (
                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                     {content.text ?? "-"}
                </Typography>
            );

        case "Dropdown":
        case "Select": 
            let optionsSource: string[] = [];

            if (Array.isArray(content.dropdown) && content.dropdown.length > 0) {
                optionsSource = content.dropdown;
            } else if (Array.isArray(content.selectedOptions) && content.selectedOptions.length > 0) {
                optionsSource = content.selectedOptions;
            } else if (typeof content.dropdown === 'string' && content.dropdown) {
                optionsSource = content.dropdown.split(',').map(s => s.trim());
            }
            
            const finalOptions = optionsSource.filter(Boolean);

            // Only show Selection block if there are actual options
            if (finalOptions.length === 0) {
                return (
                    <Typography sx={{ fontSize: 12 }}>
                        No options available
                    </Typography>
                );
            }

            return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, }}>
                        
                    </Typography>
                    {finalOptions.map((val, i) => (
                        <Chip
                            key={i}
                            label={val}
                            size="small"
                            sx={{ background: "#F3F4F6", fontSize: "11px" }}
                        />
                    ))}
                </Box>
            );

        default:
            return (
                <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                    Unknown data type
                </Typography>
            );
    }
};

/* =======================
    MAIN COMPONENT
======================= */

const ViewEquipment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [equipment, setEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clinic, setClinic] = useState<any>(null);

    // Fetch equipment data from API
    const fetchEquipmentData = async (clinicId: number) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/${clinicId}/`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch equipment data");
            }
            
            const clinicData = await response.json();
            setClinic(clinicData); // ✅ STORE FULL CLINIC
            console.log("Fetched clinic data:", clinicData);
            
            // Find the equipment from the passed state
            if (location.state?.equipment) {
                const passedEquipment = location.state.equipment;
                const equipmentName = passedEquipment.equipment_name || passedEquipment.name;
                const departmentName = passedEquipment.department?.name;
                
                console.log("Looking for equipment:", equipmentName, "in department:", departmentName);
                
                // Search through departments to find matching equipment
                for (const dept of clinicData.department || []) {
                    if (dept.name === departmentName) {
                        const foundEquipment = dept.equipments?.find(
                            (eq: any) => eq.equipment_name === equipmentName
                        );
                        
                        if (foundEquipment) {
                            console.log("Found equipment with details:", foundEquipment);
                            // Attach department info
                            setEquipment({
                                ...foundEquipment,
                                department: { 
                                  name: dept.name,
                                  id: dept.id,          // 🔑 ADD THIS
                                }
                              });                              
                            setLoading(false);
                            return;
                        }
                    }
                }
            }
            
            console.log("Equipment not found in API, using passed data");
            // If not found, keep the passed equipment
            
        } catch (err: any) {
            console.error("Error fetching equipment:", err);
            setError(err.message || "Failed to load equipment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.equipment) {
            const passedEquipment = location.state.equipment;
            
            // Set initial equipment data
            // setEquipment(passedEquipment);
            
            // Always fetch fresh data from API to ensure make/model are loaded
            fetchEquipmentData(1);
        } else {
            setError("No equipment data provided");
        }
    }, [location]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => navigate("/configuration/equipment")} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    if (!equipment) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>No equipment data found</Typography>
                <Button onClick={() => navigate("/configuration/equipment")} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    const isInactive = equipment.status === "inactive";
    const equipmentDetails: EquipmentDetail[] = equipment.equipment_details || [];
    const parameters: Parameter[] = equipment.parameters || [];
    const equipmentName = equipment.equipment_name || equipment.name;

    return (
        <Box
            sx={{
                p: 3,
                opacity: isInactive ? 0.4 : 1,
                pointerEvents: isInactive ? "none" : "auto",
                background: "#FFFFFF",
                minHeight: "100vh"
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ArrowBackIcon
                    onClick={() => navigate("/configuration/equipment")}
                    sx={{
                        mr: 1,
                        cursor: "pointer",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        padding: "4px",
                    }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                    Equipment's
                </Typography>
            </Box>

            {/* Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                    {equipmentName}
                </Typography>
                <Chip
                    label={equipment.department?.name || "Unknown"}
                    size="small"
                    sx={{
                        background: "#E0F1E6",
                        color: "#3D8B61",
                        fontWeight: 600,
                        height: "22px",
                    }}
                />
            </Box>

            {/* Parameters Section */}
            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: 16 }}>
                Parameters ({parameters.length})
            </Typography>

            {parameters.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
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
                            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                                {p.parameter_name}
                            </Typography>

                            <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
                                Data Type: 
                                <Chip
                                    label={p.parameter_values?.[0]?.content?.data_type || "N/A"}
                                    size="small"
                                    sx={{
                                        ml: 0.5,
                                        background: "#F3F4F6",
                                        fontSize: "11px",
                                        height: "18px",
                                    }}
                                />
                            </Typography>

                            <Box sx={{ height: "1px", background: "#E5E7EB", mt: 1.2, mb: 1.2 }} />

                            {renderParameterDetails(p)}
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography sx={{ mb: 3, color: "#6B7280" }}>No parameters added</Typography>
            )}

            <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2, mb: 2 }} />

            {/* Equipment Units Section */}
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 16 }}>
                {equipmentName} Units ({equipmentDetails.length})
            </Typography>

            {equipmentDetails.length > 0 ? (
                <Box
                    sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "10px",
                        overflow: "hidden",
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ background: "#F9FAFB", height: "42px" }}>
                                <TableCell sx={{ fontWeight: 600, color: "#4B5563", fontSize: 14 }}>
                                    Sr. No.
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#4B5563", fontSize: 14 }}>
                                    {equipmentName} Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#4B5563", fontSize: 14 }}>
                                    Make
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "#4B5563", fontSize: 14 }}>
                                    Model
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {equipmentDetails.map((row: EquipmentDetail, idx: number) => {
                                const match = row.equipment_num?.match(/-(\d+)$/);
                                const equipmentNum = match ? Number(match[1]) : "-";

                                return (
                                    <TableRow key={row.equipment_num}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{equipmentName} {equipmentNum}</TableCell>
                                    <TableCell>{row.make || "-"}</TableCell>
                                    <TableCell>{row.model || "-"}</TableCell>
                                    </TableRow>
                                );
                                })}
                        </TableBody>
                    </Table>
                </Box>
            ) : (
                <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>
                    No units found
                </Typography>
            )}

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
                
                <Button
                    variant="contained"
                    onClick={() =>
                        navigate("/configuration/equipment/add-parameter", {
                          state: {
                            equipment,
                            clinic,
                            departmentId: equipment.department.id,
                          },
                        })
                    }
                    sx={{
                        borderRadius: "10px",
                        background: "#383838",
                        textTransform: "none",
                        "&:hover": {
                            background: "#2f2f2f"
                        }
                    }}
                >
                    Edit
                </Button>
            </Box>
        </Box>
    );
};

export default ViewEquipment;