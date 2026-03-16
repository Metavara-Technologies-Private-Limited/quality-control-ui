import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabEnvironmentForm from "../Quality_Control/QcLab/Department/LabEnvironmentForm";
import LabEnvironmentComplianceChart from "../Quality_Control/QcLab/Department/LabEnvironmentComplianceChart";
import { slugify } from "@/utils/slugify";
import { Box } from "@mui/material";

export default function ClinicalEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  // ── FIX: use rawData so clinical departments (type="clinical") are found.
  // clinicData only has type="clinical" depts but rawData has ALL depts —
  // either works for environment lookup since rawData includes active envs.
  // Using rawData is safest: it won't break if type field is missing/wrong.
  const { rawData } = useSelector((s: RootState) => s.clinic);

  const department = rawData?.department.find(
    (d) => d.is_active && slugify(d.name) === departmentName,
  );

  const environments = useMemo(() => {
    if (!department?.environments) return [];
    return department.environments
      .filter((env) => env.is_active !== false)
      .filter((env) =>
        env.environment_name.toLowerCase().includes(searchText.toLowerCase()),
      );
  }, [department, searchText]);

  // ── FIX: store the selected env by ID, not as an object.
  // Storing the full object caused stale refs — after Redux re-render
  // the component had the old snapshot, so new parameters added wouldn't show.
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-select first env on mount / when environments change
  useEffect(() => {
    if (environments.length > 0 && selectedEnvId === null) {
      setSelectedEnvId(environments[0].id);
    }
  }, [environments, selectedEnvId]);

  // Always derive a fresh selectedEnv from current Redux state — never stale
  const selectedEnv = useMemo(
    () =>
      environments.find((e) => e.id === selectedEnvId) ??
      environments[0] ??
      null,
    [environments, selectedEnvId],
  );

  if (!selectedEnv) {
    return (
      <div style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>
        No environment parameters found
      </div>
    );
  }

  return (
    <Box sx={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* ── Environment selector tabs (shown when multiple environments exist) ── */}
      {environments.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => setSelectedEnvId(env.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border:
                  selectedEnv.id === env.id
                    ? "2px solid #E17E61"
                    : "1px solid #e5e7eb",
                backgroundColor: selectedEnv.id === env.id ? "#fff7ed" : "#fff",
                color: selectedEnv.id === env.id ? "#E17E61" : "#374151",
              }}
            >
              {env.environment_name}
            </button>
          ))}
        </Box>
      )}

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
        {/* LEFT: Form + Logs */}
        <Box sx={{ minWidth: 0, overflowY: "visible" }}>
          {/* key={selectedEnv.id} resets form state when user switches environment */}
          <LabEnvironmentForm
            key={selectedEnv.id}
            environment={selectedEnv}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        </Box>

        {/* RIGHT: Compliance Chart */}
        <Box
          sx={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 1.75,
            p: 2,
            overflowY: "visible",
            minWidth: 0,
          }}
        >
          {/* key forces chart to re-fetch after save OR when env changes */}
          <LabEnvironmentComplianceChart
            key={`${selectedEnv.id}-${refreshKey}`}
            environmentId={selectedEnv.id}
            parameters={selectedEnv.parameters}
          />
        </Box>
      </Box>
    </Box>
  );
}
