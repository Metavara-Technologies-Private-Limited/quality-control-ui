import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarOpen = isMobile ? mobileSidebarOpen : desktopSidebarOpen;

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setDesktopSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
      return;
    }

    setDesktopSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "#f9fafb",
      }}
    >
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header onMenuClick={handleSidebarToggle} sidebarOpen={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            overflowX: "hidden",
            backgroundColor: "#FFFFFF",
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 1.5, lg: 2 },
            p: { xs: 1.5, sm: 2, lg: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
