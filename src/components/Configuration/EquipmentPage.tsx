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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { MoreHoriz } from "@mui/icons-material";
import ViewIcon from "@/assets/icons/eye.jpg";

import { useNavigate } from "react-router-dom";
import AddEquipmentPopup from "./AddEquipmentPopup";

import { Department, Equipment, Parameter } from "@/types";

const EquipmentPage = () => {
  const navigate = useNavigate();

  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null
  );
  const open = Boolean(anchorEl);
  const [openAddEquipmentPopup, setOpenAddEquipmentPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/get_clinic/1/`
        );
        const data = await response.json();

        let departmentList: Department[] = [];
        let equipmentList: Equipment[] = [];
        let parametersList: Parameter[] = [];

        // ---------- Departments ----------
        departmentList = data.department.map(
          (d: any, depIndex: number) => ({
            id: depIndex + 1,
            name: d.name,
            is_active: d.is_active,
            clinic_id: 1,
            created_at: new Date().toISOString(),
          })
        );

        // ---------- Equipments + Parameters ----------
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
            };

            equipmentList.push(newEquipment);

            // parameters
            eq.parameters.forEach((param: any) => {
              const newParam: Parameter = {
                id: parameterCounter,
                parameter_name: param.parameter_name,
                equipment_id: equipmentCounter,
                is_active: param.is_active,
                Content: {
                  ...param.content,
                  unit: "N/A",
                  min_value: 0,
                  max_value: 0,
                  control_limits: {
                    warning_min: 0,
                    warning_max: 0,
                    critical_min: 0,
                    critical_max: 0,
                  },
                },
                created_at: new Date().toISOString(),
                equipment: newEquipment,
              };

              parametersList.push(newParam);
              newEquipment.parameters.push(newParam);

              parameterCounter++;
            });

            equipmentCounter++;
          });
        });

        setEquipmentData(equipmentList);
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

  // ---------- DELETE WITHOUT POPUP ----------
  const handleDeleteEquipment = (equipmentId: number) => {
    setEquipmentData((prev) =>
      prev.filter((item) => item.id !== equipmentId)
    );
    setAnchorEl(null);
  };

  // Inactive
  const handleInactiveEquipment = (equipmentId: number) => {
    setEquipmentData((prev) =>
      prev.map((item) =>
        item.id === equipmentId ? { ...item, status: "inactive" } : item
      )
    );
    setAnchorEl(null);
  };

  // Activate
  const handleActiveEquipment = (equipmentId: number) => {
    setEquipmentData((prev) =>
      prev.map((item) =>
        item.id === equipmentId ? { ...item, status: "active" } : item
      )
    );
    setAnchorEl(null);
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
            sx={{
              width: 260,
              background: "#fff",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#CFD1D4" },
                "&:hover fieldset": { borderColor: "#CFD1D4" },
                "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
              },
            }}
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
                  borderRadius: "16px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "none",
                  opacity: isInactive ? 0.5 : 1,
                  backgroundColor: isInactive ? "#F5F5F5" : "#fff",
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                      {item.equipment_name}
                    </Typography>
                    {isInactive && (
                      <Typography
                        sx={{
                          fontSize: "10px",
                          fontWeight: 600,
                          background: "#E0E0E0",
                          color: "#666",
                          px: 1,
                          py: 0.5,
                          borderRadius: "4px",
                        }}
                      >
                        INACTIVE
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                        Department:
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        {item.department?.name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                        Parameters:
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        {item.parameters.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ height: 1, background: "#E5E7EB", mx: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    pt: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "#4B5563" }}>
                    <span style={{ color: "#9CA3AF" }}>Created:</span>{" "}
                    {getCreatedDate(item.created_at)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* View */}
                    <IconButton
                      disabled={isInactive}
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        opacity: isInactive ? 0.5 : 1,
                      }}
                    >
                      <img
                        src={ViewIcon}
                        alt="view"
                        style={{
                          width: 18,
                          height: 18,
                          opacity: isInactive ? 0.5 : 1,
                        }}
                      />
                    </IconButton>

                    {/* Menu Icon */}
                    <IconButton
                      onClick={(e) => {
                        if (!isInactive) {
                          setSelectedEquipmentId(item.id);
                          setAnchorEl(e.currentTarget);
                        }
                      }}
                      disabled={isInactive}
                      sx={{
                        p: 0.5,
                        opacity: isInactive ? 0.5 : 1,
                      }}
                    >
                      <MoreHoriz fontSize="small" />
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
        equipmentData.find((e) => e.id === selectedEquipmentId)?.status ===
          "inactive" ? (
          <MenuItem
            onClick={() => handleActiveEquipment(selectedEquipmentId)}
          >
            Activate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() =>
              handleInactiveEquipment(selectedEquipmentId || 0)
            }
          >
            Inactive
          </MenuItem>
        )}

        {/* DELETE WITHOUT POPUP */}
        <MenuItem
          onClick={() => handleDeleteEquipment(selectedEquipmentId || 0)}
          sx={{ color: "#d32f2f" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Add Equipment Popup */}
      <AddEquipmentPopup
        open={openAddEquipmentPopup}
        onClose={() => setOpenAddEquipmentPopup(false)}
      />
    </Box>
  );
};

export default EquipmentPage;
