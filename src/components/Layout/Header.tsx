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
    (tab) => tab.iconIndex === activeTabIndex,
  );

  const clinicName = useSelector((state: RootState) => state.clinic.data?.name);

  /* ================= ICON MENU STATE ================= */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<
    "calendar" | "notification" | "help" | null
  >(null);

  const handleIconClick = (
    event: React.MouseEvent<HTMLElement>,
    type: "calendar" | "notification" | "help",
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
    "add-parameter": "Add Parameter",
    "qc-lab": "QC-Lab",
    embryology: "Embryology",
    andrology: "Andrology",
    "cryo-preservation": "Cryo Preservation",
    "labequipment": "Lab Equipment",
    "environmental": "Environmental",
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
    events: "Events",
    documents: "Documents",
    workflows: "Workflows",
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.9993 8.01098C10.9998 8.24415 10.9184 8.47013 10.7693 8.64967L6.7693 13.6395C6.59956 13.8433 6.35565 13.9714 6.09122 13.9958C5.8268 14.0201 5.56352 13.9386 5.3593 13.7692C5.15508 13.5998 5.02666 13.3564 5.00228 13.0925C4.9779 12.8286 5.05956 12.5659 5.2293 12.3621L8.7093 8.01098L5.3893 3.65986C5.30623 3.55778 5.2442 3.44033 5.20677 3.31424C5.16934 3.18816 5.15724 3.05594 5.17118 2.92518C5.18512 2.79442 5.22482 2.6677 5.28799 2.55229C5.35117 2.43689 5.43657 2.33509 5.5393 2.25273C5.64212 2.16134 5.76275 2.09212 5.89362 2.04942C6.02449 2.00671 6.16279 1.99144 6.29986 2.00456C6.43692 2.01767 6.56979 2.0589 6.69015 2.12564C6.81051 2.19239 6.91575 2.28322 6.9993 2.39245L10.8293 7.38226C10.9548 7.56697 11.0147 7.78833 10.9993 8.01098Z"
                  fill="#1B1918"
                />
              </svg>
            }
            aria-label="breadcrumb"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <Link
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: "Montserrat, sans-serif",
                textDecoration: "none",
                color: "#666666",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              {activeTab?.label}
            </Link>

            {pathnames.map((name, index) => {
              const isLast = index === pathnames.length - 1;
              const displayText =
                breadcrumbMap[name] ||
                name
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

              return isLast ? (
                <Typography
                  key={name}
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#232323",
                    fontWeight: 700,
                    fontSize: "18px",
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
                    fontFamily: "Montserrat, sans-serif",
                    textDecoration: "none",
                    color: "#666666",
                    fontWeight: 500,
                    fontSize: "16px",
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
