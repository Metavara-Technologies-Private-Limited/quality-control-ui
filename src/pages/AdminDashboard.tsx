import React, { useState } from "react";
import {
  Container,
  Grid,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import MetricsCards from "@/components/AdminDashboard/MetricsCards";
import StatusDonutChart from "@/components/AdminDashboard/StatusDonutChart";
import DailyActivityChart from "@/components/AdminDashboard/DailyActivityChart";
import RecentActivityFeed from "@/components/AdminDashboard/RecentActivityFeed";

const AdminDashboard = () => {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const handleChartTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: "line" | "bar" | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
          Dashboard
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
          sx={{
            width: { xs: "100%", sm: "auto" },
            "& .MuiToggleButton-root": {
              flex: { xs: 1, sm: "0 0 auto" },
              textTransform: "none",
              fontSize: "0.875rem",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&.Mui-selected": {
                backgroundColor: "#14b8a6",
                color: "#ffffff",
                borderColor: "#14b8a6",
                "&:hover": {
                  backgroundColor: "#0d9488",
                },
              },
            },
          }}
        >
          <ToggleButton value="line">Line Chart</ToggleButton>
          <ToggleButton value="bar">Bar Chart</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MetricsCards />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatusDonutChart />
        </Grid>

        <Grid item xs={12} md={8}>
          <DailyActivityChart chartType={chartType} />
        </Grid>

        <Grid item xs={12}>
          <RecentActivityFeed />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
