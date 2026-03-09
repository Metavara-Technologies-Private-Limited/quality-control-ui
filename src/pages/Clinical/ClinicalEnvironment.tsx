import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabEnvironmentForm from "../Quality_Control/QcLab/Department/LabEnvironmentForm";
import LabEnvironmentComplianceChart from "../Quality_Control/QcLab/Department/LabEnvironmentComplianceChart";
import { slugify } from "@/utils/slugify";

export default function ClinicalEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  const { clinicData } = useSelector((s: RootState) => s.clinic);

  const department = clinicData?.department.find(
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

  const [selectedEnv, setSelectedEnv] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {selectedEnv.environment_name}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 20,
          height: "calc(100vh - 220px)",
        }}
      >
        <div style={{ overflowY: "auto" }}>
          <LabEnvironmentForm
            environment={selectedEnv}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        </div>

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