import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

import AddEquipmentPopup from "@/components/Configuration/AddEquipmentPopup";
import AddEnvironmentPopup from "@/pages/Quality_Control/Configuration/AddEnvironmentPopup";

const ConfigurationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ SEPARATE STATES (VERY IMPORTANT)
  const [openAddEquipmentPopup, setOpenAddEquipmentPopup] = useState(false);
  const [openAddEnvironmentPopup, setOpenAddEnvironmentPopup] = useState(false);

  const isEquipment = location.pathname.startsWith("/configuration/equipment");
  const isEnvironment = location.pathname.startsWith(
    "/configuration/environment",
  );

  const isEquipment = location.pathname.includes("/configuration/equipment");
  const isEnvironment = location.pathname.includes("/configuration/environment");

  return (
    <Box>
      {/* HEADER */}
      {showHeader && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          {/* LEFT TABS */}
          <Box
            sx={{
              display: "inline-flex",
              backgroundColor: "#F2F2F2",
              padding: "4px",
              borderRadius: "12px",
              gap: "4px",
            }}
          >
            {["Equipments", "Environment"].map((tab) => {
              const isActive =
                (tab === "Equipments" && isEquipment) ||
                (tab === "Environment" && isEnvironment);

              return (
                <button
                  key={tab}
                  onClick={() =>
                    navigate(
                      tab === "Equipments"
                        ? "/configuration/equipment"
                        : "/configuration/environment"
                    )
                  }
                  style={{
                    width: "166px",
                    height: "36px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "700",
                    backgroundColor: isActive ? "#FFFFFF" : "transparent",
                    color: isActive ? "#E17E61" : "#94a3b8",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </Box>

          {/* RIGHT ACTIONS */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder={
                isEquipment ? "Search Equipments" : "Search Environment"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 260,
                background: "#fff",
                "& .MuiOutlinedInput-root fieldset": {
                  borderColor: "#505050",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#232323",
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (isEquipment) setOpenAddEquipmentPopup(true);
                if (isEnvironment) setOpenAddEnvironmentPopup(true);
              }}
              sx={{
                background: "#505050",
                textTransform: "none",
                "&:hover": { background: "#232323" },
              }}
            >
              {isEquipment ? "Add Equipment" : "Add Environment"}
            </Button>
          </Box>
        </Box>
      )}

      {/* CHILD ROUTES */}
      <Outlet context={{ searchQuery }} />

      {/* ADD EQUIPMENT POPUP */}
      {isEquipment && (
        <AddEquipmentPopup
          open={openAddEquipmentPopup}
          onClose={() => setOpenAddEquipmentPopup(false)}
        />
      )}

      {/* ADD ENVIRONMENT POPUP */}
      {isEnvironment && (
        <AddEnvironmentPopup
          open={openAddEnvironmentPopup}
          onClose={() => setOpenAddEnvironmentPopup(false)}
        />
      )}
    </Box>
  );
};

export default ConfigurationLayout;
