import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabEnvironmentForm from "./LabEnvironmentForm";
import LabEnvironmentComplianceChart from "./LabEnvironmentComplianceChart";

/* ---------------- Utils ---------------- */

const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();

/* ---------------- Main ---------------- */

export default function LabEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const department = clinic?.department.find(
    (d) => normalize(d.name) === normalize(departmentName)
  );

  const environments = useMemo(() => {
    if (!department?.environments) return [];

    return department.environments.filter((env) =>
      env.environment_name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [department, searchText]);

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
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* ---------- HEADER ---------- */}
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {selectedEnv.environment_name}
      </h1>

      {/* ---------- BODY ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 20,
          height: "calc(100vh - 220px)",
        }}
      >
        {/* -------- LEFT: FORM + LOGS -------- */}
        <div style={{ overflowY: "auto" }}>
          <LabEnvironmentForm
            environment={selectedEnv}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        {/* -------- RIGHT: COMPLIANCE CHART -------- */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            overflowY: "auto",
          }}
        >
          <LabEnvironmentComplianceChart
            key={refreshKey}
            environmentId={selectedEnv.id}
            parameters={selectedEnv.parameters}
          />
        </div>
      </div>
    </div>
  );
}
