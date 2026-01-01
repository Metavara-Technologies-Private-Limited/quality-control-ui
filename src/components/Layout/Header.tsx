import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useLocation, Link as RouterLink } from "react-router-dom";
import CalendarIcon from "@/assets/icons/calendar.svg";
import NotificationIcon from "@/assets/icons/notification.svg";
import MessageQuestionIcon from "@/assets/icons/message-question.svg";
import UserAvatarIcon from "@/assets/icons/ellipse_12.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { SIDEBAR_TABS } from "@/config/sidebar.config";
import { useTab } from "@/utils/tabContext";

const Header = () => {
  const location = useLocation();
  const { activeTabIndex } = useTab();

  const activeTab = SIDEBAR_TABS.find(
    (tab) => tab.iconIndex === activeTabIndex
  );

  const clinicName = useSelector((state: RootState) => state.clinic.data?.name);

  /* ================= ICON MENU STATE ================= */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<
    "calendar" | "notification" | "help" | null
  >(null);

  const handleIconClick = (
    event: React.MouseEvent<HTMLElement>,
    type: "calendar" | "notification" | "help"
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  /* ================= BREADCRUMBS ================= */
  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    "admin-dashboard": "Admin Dashboard",
    configuration: "Configuration",
    "user-configuration": "User Configuration",
    "user-management": "User Management",
    "audit-trail": "Audit Trail",
    "quality-control": "Quality Control",
    "qc-lab": "QC-Lab",
    embryology: "Embryology",
    andrology: "Andrology",
    "cryo-preservation": "Cryo Preservation",
    compliance: "Compliance",
    "document-control": "Document Control",
    equipment: "Equipment",
    task: "Task",
    environment: "Environment",
    equipments: "Equipments",
    "risk-management": "Risk Management",
    risk_a: "Risk A",
    clinical: "Clinical",
    "recycle-bin": "Recycle Bin",
    lab: "Lab",
    reports: "Reports",
    events: "Events", documents: "Documents", workflows: "Workflows",
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#FAFAFA",
        borderRadius: 2,
        color: "#111827",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3, py: 1.5 }}>
        {/* LEFT: Breadcrumbs */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2, md: 3 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Breadcrumbs
            separator={
              <Typography sx={{ color: "#232323", fontSize: "0.875rem" }}>
                ›
              </Typography>
            }
            aria-label="breadcrumb"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <Link
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "#666666",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              {activeTab?.label}
            </Link>

            {pathnames.map((name, index) => {
              const isLast = index === pathnames.length - 1;
              const displayText = breadcrumbMap[name] || name;

              return isLast ? (
                <Typography
                  key={name}
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#232323",
                  }}
                >
                  {displayText}
                </Typography>
              ) : (
                <Link
                  key={name}
                  component={RouterLink}
                  to={`/${pathnames.slice(0, index + 1).join("/")}`}
                  sx={{
                    textDecoration: "none",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  {displayText}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* RIGHT: Clinic + Icons + User */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#232323",
              fontWeight: 500,
              display: { xs: "none", md: "block" },
            }}
          >
            Clinic: {clinicName || "—"}
          </Typography>

          {/* Calendar */}
          <IconButton
            size="small"
            onClick={(e) => handleIconClick(e, "calendar")}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
            }}
          >
            <Box component="img" src={CalendarIcon} width={24} height={24} />
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="small"
            onClick={(e) => handleIconClick(e, "notification")}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
            }}
          >
            <Box
              component="img"
              src={NotificationIcon}
              width={24}
              height={24}
            />
          </IconButton>

          {/* Help / Messages */}
          <IconButton
            size="small"
            onClick={(e) => handleIconClick(e, "help")}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
            }}
          >
            <Box
              component="img"
              src={MessageQuestionIcon}
              width={24}
              height={24}
            />
          </IconButton>

          {/* User */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={UserAvatarIcon}
              sx={{ width: 36, height: 36, borderRadius: "50%" }}
            />
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography fontSize="0.875rem" color="#232323" fontWeight={600}>
                Kate Russell
              </Typography>
              <Typography fontSize="0.75rem" color="#6b7280">
                Receptionist
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleUserMenuOpen}>
              <ArrowDropDownIcon sx={{ color: "#232323" }} />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* ================= ICON DROPDOWN MENU ================= */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {activeMenu === "calendar" && (
          <MenuItem disabled>No events for today</MenuItem>
        )}
        {activeMenu === "notification" && (
          <MenuItem disabled>No notifications</MenuItem>
        )}
        {activeMenu === "help" && <MenuItem disabled>No messages</MenuItem>}
      </Menu>
      <Menu
        anchorEl={userAnchorEl}
        open={Boolean(userAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleUserMenuClose}>My Account</MenuItem>
        <MenuItem onClick={handleUserMenuClose}>Change Password</MenuItem>
        <MenuItem onClick={handleUserMenuClose}>Preferance</MenuItem>
        <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
        <MenuItem
          onClick={handleUserMenuClose}
          sx={{ color: "red", fontWeight: 600 }}
        >
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
