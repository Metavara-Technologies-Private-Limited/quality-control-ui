import { useEffect, useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabEnvironmentForm from "./LabEnvironmentForm";
import LabEnvironmentComplianceChart from "./LabEnvironmentComplianceChart";
import { slugify } from "@/utils/slugify";

// const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
export default function LabEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const department = clinic?.department.find(
    (d) => slugify(d.name) === departmentName,
  );

  const environments = useMemo(() => {
    if (!department?.environments) return [];

    return department.environments
      .filter((env) => env.is_active !== false)
      .filter((env) =>
        env.environment_name.toLowerCase().includes(searchText.toLowerCase()),
      );
  }, [department, searchText]);

  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const [selectedEnv, setSelectedEnv] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* -------- Auto-select first environment -------- */
  useEffect(() => {
    if (environments.length) {
      setSelectedEnv(environments[0]);
    }
  }, [environments]);

  if (!selectedEnv) {
    return (
      <div style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>
        No environment parameters found
      </div>
    );
  }

  return (
    <Box sx={{ fontFamily: "'Montserrat', sans-serif" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {selectedEnv.environment_name}
      </h1>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* -------- LEFT: FORM + LOGS -------- */}
        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
          <LabEnvironmentForm
            environment={selectedEnv}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        </Box>

        {/* -------- RIGHT: COMPLIANCE CHART -------- */}
        <Box
          sx={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            p: 2,
            minWidth: 0,
            maxHeight: isCompact ? "none" : "calc(100dvh - 220px)",
            overflowY: isCompact ? "visible" : "auto",
          }}
        >
          <LabEnvironmentComplianceChart
            key={refreshKey}
            environmentId={selectedEnv.id}
            parameters={selectedEnv.parameters}
          />
        </Box>
      </Box>
    </Box>
  );
}
