import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

/* ===== ORIGINAL ICONS ===== */
import ShieldTickIcon from "../../assets/icons/shield-tick.svg";
import BriefcaseIcon from "../../assets/icons/brifecase-tick.svg";
import SecuritySafe from "../../assets/icons/security-safe.svg";
import ReceiptSearch from "../../assets/icons/receipt-search.svg";

/* ===== SELECTED ICONS (TOP ROW) ===== */
import Quality_control from "../../assets/icons/Quality_control.svg";
import Documentation_control from "../../assets/icons/Documentation_control.svg";
import Riskmanagement from "../../assets/icons/Riskmanagement.svg";
import Compliance from "../../assets/icons/Compliance.svg";

/* ===== CARD HEADING ICONS ===== */
import safe_home from "../../assets/icons/safe-home.svg";
import clipboard_tick from "../../assets/icons/clipboard-tick.svg";
import briefcase_tick_2 from "../../assets/icons/brifecase-tick_2.svg";
import shield_tick_2 from "../../assets/icons/shield-tick_2.svg";

/* ===== BACKGROUNDS ===== */
import SubtractBg_1 from "../../assets/icons/Subtract_1.svg";
import SubtractBg_2 from "../../assets/icons/Subtract_2.svg";
import SubtractBg_3 from "../../assets/icons/Subtract_3.svg";
import SubtractBg_4 from "../../assets/icons/Subtract_4.svg";

/* ===== LOGOS ===== */
import ClinicLogo from "../../assets/icons/Clinic-Logo.svg";
import VidaiLogo from "../../assets/icons/Vidai-logo.svg";
import DashboardCardBg from "../../assets/icons/dashboard_card_bg.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { slugify } from "@/utils/slugify";
import { useTab } from "@/utils/tabContext";

/* ================= ICON CONFIG ================= */

const ICON_CONFIG = [
  {
    title: "Quality Control",
    bg: SubtractBg_1,
    activeIcon: Quality_control,
    inactiveIcon: ShieldTickIcon,
  },
  {
    title: "Document Control",
    bg: SubtractBg_2,
    activeIcon: Documentation_control,
    inactiveIcon: BriefcaseIcon,
  },
  {
    title: "Risk Management",
    bg: SubtractBg_3,
    activeIcon: Riskmanagement,
    inactiveIcon: SecuritySafe,
  },
  {
    title: "Compliance",
    bg: SubtractBg_4,
    activeIcon: Compliance,
    inactiveIcon: ReceiptSearch,
  },
];

const CARD_HEADING_ICON_MAP = [
  shield_tick_2,
  briefcase_tick_2,
  safe_home,
  clipboard_tick,
];

const SELECTED_ICON_STYLE = [
  { mt: 1, ml: 0.8, btnSize: 50, iconSize: 35 },
  { mt: 1, ml: 0, btnSize: 50, iconSize: 35 },
  { mt: 1, ml: -0.8, btnSize: 50, iconSize: 35 },
  { mt: 1, ml: -1.5, btnSize: 50, iconSize: 65 },
];

/* ================= MENU MAP ================= */
type MenuItem = {
  key: string;
  text: string;
  path: string;
  children?: MenuItem[];
};

type IconMenuMap = {
  quality: MenuItem[];
  documentation: MenuItem[];
  risk: MenuItem[];
  compliance: MenuItem[];
};

export const buildIconMenuMap = (
  labDepartments: any[],
  clinicalDepartments: any[],
): IconMenuMap => ({
  quality: [
    {
      key: "dashboard",
      text: "Dashboard",
      path: "/dashboard",
    },

    // ── Clinical section ──────────────────────────────────────────
    {
      key: "clinical",
      text: "Clinical",
      path: "/clinic-lab/consultation",
      children: clinicalDepartments.map((d) => ({
        text: d.name,
        key: slugify(d.name),
        path: `/clinic-lab/${slugify(d.name)}`,
      })),
    },

    // ── Lab section ───────────────────────────────────────────────
    {
      key: "lab",
      text: "Lab",
      path: "/qc-lab",
      children: labDepartments.map((d) => ({
        text: d.name,
        key: slugify(d.name),
        path: `/qc-lab/${slugify(d.name)}`,
      })),
    },

    {
      key: "reports",
      text: "Reports",
      path: "/reports",
    },

    {
      key: "configuration",
      text: "Configuration",
      path: "/configuration",
      children: [
        {
          key: "events",
          text: "Events",
          path: "/configuration/events",
        },
        {
          key: "equipment",
          text: "Equipment",
          path: "/configuration/equipment",
        },
      ],
    },
  ],

  documentation: [
    {
      key: "documents",
      text: "Documents",
      path: "/document-control/documents",
    },
    {
      key: "workflows",
      text: "Workflows",
      path: "/document-control/workflows",
    },
    { key: "reports", text: "Reports", path: "/document-control/reports" },
    {
      key: "configuration",
      text: "Configuration",
      path: "/document-control/configuration",
    },
    {
      key: "recycle",
      text: "Recycle Bin",
      path: "/document-control/recycle-bin",
    },
  ],

  risk: [{ key: "risk_a", text: "Risk_A", path: "/risk-management" }],

  compliance: [
    { key: "clinical", text: "Clinical", path: "/compliance/clinical" },
    { key: "lab", text: "Lab", path: "/compliance/lab" },
  ],
});

const ICON_INDEX_MAP = [
  "quality",
  "documentation",
  "risk",
  "compliance",
] as const;

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isMobile, isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("xl"));
  const { activeTabIndex, setActiveTabIndex } = useTab();

  // Lab departments (type === "lab")
  const { data: labClinic, clinicData } = useSelector(
    (state: RootState) => state.clinic,
  );
  const labDepartments = labClinic?.department ?? [];
  const clinicalDepartments = clinicData?.department ?? [];

  const ICON_MENU_MAP = buildIconMenuMap(labDepartments, clinicalDepartments);

  const [selectedIcon, setSelectedIcon] = useState(activeTabIndex);

  useEffect(() => {
    if (location.pathname.startsWith("/document-control")) {
      setSelectedIcon(1);
      setActiveTabIndex(1);
      return;
    }

    if (location.pathname.startsWith("/risk-management")) {
      setSelectedIcon(2);
      setActiveTabIndex(2);
      return;
    }

    if (location.pathname.startsWith("/compliance")) {
      setSelectedIcon(3);
      setActiveTabIndex(3);
      return;
    }

    setSelectedIcon(0);
    setActiveTabIndex(0);
  }, [location.pathname, setActiveTabIndex]);

  if (!isMobile && !isOpen) {
    return null;
  }

  const sectionKey = ICON_INDEX_MAP[selectedIcon];
  const menuItems = ICON_MENU_MAP[sectionKey] || [];

  const handleIconSelect = (index: number) => {
    setSelectedIcon(index);
    setActiveTabIndex(index);

    const firstMenuItem = (buildIconMenuMap(
      labDepartments,
      clinicalDepartments,
    )[ICON_INDEX_MAP[index]] || [])[0];
    const defaultPath =
      firstMenuItem?.children?.[0]?.path || firstMenuItem?.path || "/dashboard";
    navigate(defaultPath);

    if (isMobile) {
      onClose();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isOpen : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: { xs: 312, sm: 324, xl: isTablet ? 254 : 272 },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 312, sm: 324, xl: isTablet ? 254 : 272 },
          backgroundColor: "#FAFAFA",
          borderRight: "none",
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <img
            src={ClinicLogo}
            width={isTablet ? 118 : 134}
            alt="Clinic Logo"
          />
          <IconButton size="small" onClick={onClose} sx={{ opacity: 0.42 }}>
            <MenuIcon sx={{ color: "#E17E61" }} />
          </IconButton>
        </Box>
      </Box>

      {/* ICON ROW */}
      <Box sx={{ position: "relative", height: 56, mx: 1 }}>
        <Box
          component="img"
          src={ICON_CONFIG[selectedIcon].bg}
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <Box sx={{ display: "flex", alignItems: "center", pl: 1.5, gap: 1.5 }}>
          {ICON_CONFIG.map((item, index) => {
            const isActive = selectedIcon === index;
            const style = SELECTED_ICON_STYLE[index];
            return (
              <Box
                key={item.title}
                sx={{
                  mt: isActive ? style.mt : 0,
                  ml: isActive ? style.ml : 0,
                }}
              >
                <IconButton
                  onClick={() => handleIconSelect(index)}
                  sx={{
                    width: isActive ? style.btnSize : 40,
                    height: isActive ? style.btnSize : 40,
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.inactiveIcon}
                    alt={item.title}
                    style={{
                      width: isActive ? style.iconSize : 22,
                      height: isActive ? style.iconSize : 22,
                    }}
                  />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* MAIN CARD */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 1.5, sm: 2 },
          mt: 2,
          position: "relative",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0px 0px 14px #0000000F",
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <img
              src={CARD_HEADING_ICON_MAP[selectedIcon]}
              width={28}
              alt="icon"
            />
            <Typography sx={{ fontWeight: 700, color: "#E17E61" }}>
              {ICON_CONFIG[selectedIcon].title}
            </Typography>
          </Box>

          {/* MENU LIST */}
          <List
            sx={{
              mb: "auto",
              display: "flex",
              flexDirection: "column",
              zIndex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {menuItems.map((item: any) => {
              const isItemActive =
                location.pathname === item.path ||
                (item.children &&
                  location.pathname.startsWith(
                    item.key === "clinical" ? "/clinic-lab" : item.path,
                  ));

              const isLab = item.key === "lab";
              const isLabOpen = location.pathname.startsWith("/qc-lab");

              const isClinical = item.key === "clinical";
              const isClinicalOpen =
                location.pathname.startsWith("/clinic-lab");

              const isConfiguration = item.key === "configuration";
              const isConfigurationOpen =
                location.pathname.startsWith("/configuration");

              return (
                <Box key={item.key}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        handleNavigate(item.children?.[0]?.path || item.path)
                      }
                    >
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: isItemActive ? 600 : 500,
                            color: isItemActive ? "#232323" : "#9e9e9e",
                            transition: "color 0.2s ease",
                            whiteSpace: "normal",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>

                  {/* SUB MENU for Clinical */}
                  {isClinical && isClinicalOpen && item.children && (
                    <Box
                      sx={{
                        mt: 0.5,
                        backgroundColor: "#F3F3F3",
                        borderRadius: "12px 0 0 12px",
                        mx: -2,
                        py: 0.5,
                      }}
                    >
                      {item.children.map((sub: any) => {
                        const isSubActive = location.pathname.startsWith(
                          sub.path,
                        );
                        return (
                          <ListItemButton
                            key={sub.key}
                            onClick={() => handleNavigate(sub.path)}
                            sx={{
                              pl: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: isSubActive
                                    ? "#E17E61"
                                    : "#CFD1D4",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: isSubActive ? "#E17E61" : "#232323",
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                lineHeight: 1.25,
                              }}
                            >
                              {sub.text?.replace(/_/g, " ")}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  )}

                  {/* SUB MENU for Lab */}
                  {isLab && isLabOpen && item.children && (
                    <Box
                      sx={{
                        mt: 0.5,
                        backgroundColor: "#F3F3F3",
                        borderRadius: "12px 0 0 12px",
                        mx: -2,
                        py: 0.5,
                      }}
                    >
                      {item.children.map((sub: any) => {
                        const isSubActive = location.pathname.startsWith(
                          sub.path,
                        );
                        return (
                          <ListItemButton
                            key={sub.key}
                            onClick={() => handleNavigate(sub.path)}
                            sx={{
                              pl: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: isSubActive
                                    ? "#E17E61"
                                    : "#CFD1D4",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: isSubActive ? "#E17E61" : "#232323",
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                lineHeight: 1.25,
                              }}
                            >
                              {sub.text?.replace(/_/g, " ")}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  )}

                  {/* SUB MENU for Configuration */}
                  {isConfiguration && isConfigurationOpen && item.children && (
                    <Box
                      sx={{
                        mt: 0.5,
                        backgroundColor: "#F3F3F3",
                        borderRadius: "12px 0 0 12px",
                        mx: -2,
                        py: 0.5,
                      }}
                    >
                      {item.children.map((sub: any) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <ListItemButton
                            key={sub.key}
                            onClick={() => handleNavigate(sub.path)}
                            sx={{
                              pl: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: isSubActive
                                    ? "#E17E61"
                                    : "#CFD1D4",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: isSubActive ? "#E17E61" : "#232323",
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                lineHeight: 1.25,
                              }}
                            >
                              {sub.text?.replace(/_/g, " ")}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })}
          </List>

          {/* DECORATIVE BACKGROUND */}
          <Box
            component="img"
            src={DashboardCardBg}
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: { xs: 180, xl: 200 },
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <Box sx={{ textAlign: "center", mt: "auto", pb: 1, zIndex: 1 }}>
            <img src={VidaiLogo} width="70%" alt="Vidai Logo" />
            <Typography sx={{ fontSize: 10, color: "#CFD1D4" }}>
              Updated Version 2.0
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
