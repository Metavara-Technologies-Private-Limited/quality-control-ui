import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f9fafb",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            backgroundColor: "#FFFFFF",
            borderRadius: 2,
            m: 2,
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
