import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { MoreHoriz } from "@mui/icons-material";
import ViewIcon from "@/assets/icons/eye.jpg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchClinic } from "@/store/clinicSlice";
import { equipmentApi, environmentApi } from "@/services/api";
import { toast } from "react-toastify";

import { Department, Parameter, EquipmentDetail } from "@/types";

type BaseUIItem = {
  id: number;
  is_active: boolean;
  parameters: Parameter[];
  department: Department;
  created_at?: string;
};

type EquipmentUIItem =
  | (BaseUIItem & {
      entityType: "equipment";
      equipment_name: string;
      equipment_details: EquipmentDetail[];
    })
  | (BaseUIItem & {
      entityType: "environment";
      environment_name: string;
    });

type EquipmentPageProps = {
  readOnly?: boolean;
};

const EquipmentPage: React.FC<EquipmentPageProps> = ({}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { searchQuery = "" } = useOutletContext<{ searchQuery: string }>();
  const { rawData: clinic } = useSelector((state: RootState) => state.clinic);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const entityType: "equipment" | "environment" = location.pathname.includes(
    "/environment",
  )
    ? "environment"
    : "equipment";

  const isEnvironment = entityType === "environment";

  const [dialogs, setDialogs] = useState({
    delete: false,
    inactive: false,
    active: false,
  });

  const darkButtonSx = {
    backgroundColor: "#505050",
    "&:hover": {
      backgroundColor: "#232323",
    },
  };

  const items = useMemo<EquipmentUIItem[]>(() => {
    if (!clinic?.department) return [];

    return clinic.department.flatMap<EquipmentUIItem>((dep) => {
      if (isEnvironment) {
        return (dep.environments || []).map((env) => ({
          ...env,
          parameters: env.parameters || [],
          department: dep,
          entityType: "environment",
          created_at: env.created_at ?? dep.created_at,
        }));
      }

      return (dep.equipments || []).map((eq) => ({
        ...eq,
        parameters: eq.parameters || [],
        department: dep,
        entityType: "equipment",
      }));
    });
  }, [clinic, isEnvironment]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const name =
          item.entityType === "environment"
            ? item.environment_name
            : item.equipment_name;

        return (name || "").toLowerCase().includes(searchQuery.toLowerCase());
      }),
    [items, searchQuery],
  );

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId],
  );

  const getCreatedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.entityType === "environment") {
        await environmentApi.delete(selectedItem.id);
        toast.success("Environment deleted successfully!");
      } else {
        await equipmentApi.delete(selectedItem.department.id, selectedItem.id);
        toast.success("Equipment deleted successfully!");
      }

      dispatch(fetchClinic(1));
      setDialogs({ delete: false, inactive: false, active: false });
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleActive = async (active: boolean) => {
    if (!selectedItem) return;

    try {
      if (selectedItem.entityType === "environment") {
        active
          ? await environmentApi.activate(selectedItem.id)
          : await environmentApi.inactive(selectedItem.id);
      } else {
        active
          ? await equipmentApi.activate(selectedItem.id)
          : await equipmentApi.inactive(
              selectedItem.department.id,
              selectedItem.id,
            );
      }

      dispatch(fetchClinic(1));
      setDialogs({ delete: false, inactive: false, active: false });
    } catch (error) {
      toast.error(`Failed to ${active ? "activate" : "inactivate"}`);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        {filteredItems.map((item) => {
          const isInactive = item.is_active === false;

          return (
<Grid
  item
  xs={12}
  sm={6}
  md={4}
  lg={3}
  key={`${item.entityType}-${item.id}`}
  sx={{ display: "flex" }}
>
<Card
  sx={{
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    position: "relative",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "none",
    opacity: isInactive ? 0.6 : 1,
    backgroundColor: isInactive ? "#F5F5F5" : "#fff",
    transition: "all 0.3s ease",
  }}
>
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: isInactive ? "#ffcccc" : "#d4f8d4",
                    color: isInactive ? "#b30000" : "#47B35F",
                    fontSize: 10,
                    fontWeight: 700,
                    px: 1.3,
                    py: 0.5,
                    borderRadius: 20,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {isInactive ? "Inactive" : "Active"}
                </Box>

<CardContent sx={{ pb: 1 }}>
  <Typography
    sx={{
      fontWeight: 700,
      fontSize: 16,
      pr: "70px", // reserve space for ACTIVE pill
      wordBreak: "break-word",
      lineHeight: 1.3,
    }}
  >
    {item.entityType === "environment"
      ? item.environment_name
      : item.equipment_name}
  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography fontSize={14} color="#9CA3AF">
                        Department:
                      </Typography>
                      <Typography fontSize={16} fontWeight={500}>
                        {item.department.name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography fontSize={14} color="#9CA3AF">
                        Parameters:
                      </Typography>
                      <Typography fontSize={16} fontWeight={500}>
                        {String(item.parameters.length).padStart(2, "0")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    pt: 1,
                  }}
                >
                  <Typography fontSize={14} color="#4B5563">
                    <span style={{ color: "#9CA3AF" }}>Created Date:</span>{" "}
                    {getCreatedDate(
                      item.created_at ?? item.department.created_at,
                    )}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      disabled={isInactive}
                      onClick={() => {
                        if (item.entityType === "environment") {
                          navigate("/configuration/environment/add-parameter", {
                            state: {
                              environmentId: item.id,
                              departmentId: item.department.id,
                              departmentName: item.department.name,
                            },
                          });
                        } else {
                          navigate("/configuration/equipment/view", {
                            state: { equipmentId: item.id },
                          });
                        }
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        opacity: isInactive ? 0.2 : 1,
                      }}
                    >
                      <img src={ViewIcon} alt="view" width={18} height={18} />
                    </IconButton>

                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedItemId(item.id);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        border: isInactive
                          ? "1px solid #505050"
                          : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        backgroundColor: isInactive ? "#141313" : "transparent",
                        "&:hover": {
                          backgroundColor: isInactive ? "#f0f0f0" : "#F3F4F6",
                          color: isInactive ? "#0c0404" : "inherit",
                        },
                        color: isInactive ? "#ffffff" : "inherit",
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedItem?.is_active ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setDialogs({ ...dialogs, inactive: true });
            }}
          >
            Inactivate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setDialogs({ ...dialogs, active: true });
            }}
          >
            Activate
          </MenuItem>
        )}
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            setAnchorEl(null);
            setDialogs({ ...dialogs, delete: true });
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={dialogs.delete}
        onClose={() => setDialogs({ ...dialogs, delete: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs({ ...dialogs, delete: false })}>
            Cancel
          </Button>
          <Button sx={darkButtonSx} variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogs.inactive}
        onClose={() => setDialogs({ ...dialogs, inactive: false })}
      >
        <DialogTitle>Confirm Inactivate</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to inactivate?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs({ ...dialogs, inactive: false })}>
            Cancel
          </Button>
          <Button
            sx={darkButtonSx}
            onClick={() => toggleActive(false)}
            variant="contained"
          >
            Inactivate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogs.active}
        onClose={() => setDialogs({ ...dialogs, active: false })}
      >
        <DialogTitle>Confirm Activate</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to activate?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs({ ...dialogs, active: false })}>
            Cancel
          </Button>
          <Button
            sx={darkButtonSx}
            onClick={() => toggleActive(true)}
            variant="contained"
          >
            Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentPage;
