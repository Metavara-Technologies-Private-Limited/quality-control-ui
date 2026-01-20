import { useMemo, useState } from "react";
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
import { useOutletContext } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { MoreHoriz } from "@mui/icons-material";
import ViewIcon from "@/assets/icons/eye.jpg";
import { useNavigate } from "react-router-dom";
import AddEquipmentPopup from "./AddEquipmentPopup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchClinic } from "@/store/clinicSlice";
import { equipmentApi } from "@/services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EquipmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const { data: clinic } = useSelector((state: RootState) => state.clinic);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null,
  );

  const [dialogs, setDialogs] = useState({
    delete: false,
    inactive: false,
    active: false,
  });

  /* ------------------ Derived Data ------------------ */

  const equipments = useMemo(() => {
    if (!clinic?.department) return [];

    return clinic.department.flatMap((dep) =>
      dep.equipments.map((eq) => ({ ...eq, department: dep })),
    );
  }, [clinic]);

  const filteredEquipments = useMemo(
    () =>
      equipments.filter((eq) =>
        eq.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [equipments, searchQuery],
  );

  const selectedEquipment = useMemo(
    () => equipments.find((e) => e.id === selectedEquipmentId),
    [equipments, selectedEquipmentId],
  );

  /* ------------------ Helpers ------------------ */

  const getCreatedDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB");

  /* ------------------ API Actions ------------------ */

  const confirmDelete = async () => {
    if (!selectedEquipment) return;

    const { id, department } = selectedEquipment;

    try {
      await equipmentApi.delete(department.id, id);
      dispatch(fetchClinic(1));
      setDialogs({ delete: false, inactive: false, active: false });
      toast.success("Equipment deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete equipment.");
    }
  };

  const toggleEquipment = async (active: boolean) => {
    if (!selectedEquipment) return;

    const { id, department } = selectedEquipment;

    try {
      if (active) {
        await equipmentApi.activate(id);
        toast.success("Equipment activated successfully!");
      } else {
        await equipmentApi.inactive(department.id, id);
        toast.success("Equipment inactivated successfully!");
      }

      dispatch(fetchClinic(1));
      setDialogs({ delete: false, inactive: false, active: false });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${active ? "activate" : "inactivate"} equipment.`);
    }
  };

  return (
    <Box>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />


      {/* Cards */}
      <Grid container spacing={2}>
        {filteredEquipments.map((item) => {
          const isInactive = item.is_active === false;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  position: "relative",
                  borderRadius: "12px",
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
                    sx={{ fontWeight: 700, fontSize: "16px", color: "#232323" }}
                  >
                    <b>{item.equipment_name}</b>
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
                        {item.department?.name}
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
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#4B5563",
                      gap: 1,
                      mr: 1,
                    }}
                  >
                    <span style={{ color: "#9CA3AF", fontSize: 14 }}>
                      Created Date:
                    </span>{" "}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {getCreatedDate(item.created_at)}
                    </span>
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      disabled={isInactive}
                      onClick={() =>
                        navigate("/configuration/equipment/view", {
                          state: { equipmentId: item.id },
                        })
                      }
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
                        border: isInactive
                          ? "2px solid #ffffff"
                          : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        backgroundColor: isInactive
                          ? "#505050"
                          : "2px solid #232323",
                        "&:hover": {
                          backgroundColor: isInactive
                            ? "#000000ff"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <MoreHoriz
                        fontSize="small"
                        sx={{
                          color: isInactive ? "#ffffff" : "inherit",
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedEquipment?.is_active ? (
          <MenuItem
            onClick={() => {
              setDialogs({ ...dialogs, inactive: true });
              setAnchorEl(null);
            }}
          >
            Inactivate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setDialogs({ ...dialogs, active: true });
              setAnchorEl(null);
            }}
          >
            Activate
          </MenuItem>
        )}
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            setDialogs({ ...dialogs, delete: true });
            setAnchorEl(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={dialogs.delete}
        onClose={() => setDialogs({ ...dialogs, delete: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs({ ...dialogs, delete: false })}
            sx={{
              color: "#232323",
              border: "1px solid #505050",
              "&:hover": {
                border: "1px solid #232323",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ background: "#505050", "&:hover": { background: "#232323" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inactive Dialog */}
      <Dialog
        open={dialogs.inactive}
        onClose={() => setDialogs({ ...dialogs, inactive: false })}
      >
        <DialogTitle>Confirm Inactivate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to Inactivate this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs({ ...dialogs, inactive: false })}
            sx={{
              color: "#232323",
              border: "1px solid #505050",
              "&:hover": {
                border: "1px solid #232323",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => toggleEquipment(false)}
            variant="contained"
            sx={{ background: "#505050", "&:hover": { background: "#232323" } }}
          >
            Inactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog
        open={dialogs.active}
        onClose={() => setDialogs({ ...dialogs, active: false })}
      >
        <DialogTitle>Confirm Activate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to activate this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogs({ ...dialogs, active: false })}
            variant="outlined"
            sx={{
              color: "#232323",
              border: "1px solid #505050",
              "&:hover": {
                border: "1px solid #232323",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => toggleEquipment(true)}
            variant="contained"
            sx={{ background: "#505050", "&:hover": { background: "#232323" } }}
          >
            Activate
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default EquipmentPage;
