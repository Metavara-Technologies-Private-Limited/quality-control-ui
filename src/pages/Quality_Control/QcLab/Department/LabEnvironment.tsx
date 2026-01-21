// pages/Quality_Control/QcLab/Department/LabEnvironment.tsx

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabPlanPage from "./LabPlanPage";
import LabEnvironmentForm from "./LabEnvironmentForm";

/* ---------------- Utils ---------------- */

const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
const formatCount = (v: number) => String(v).padStart(2, "0");

/* ---------------- Card ---------------- */

const EnvironmentCard = ({
  name,
  parameters,
  selected,
  onClick,
}: {
  name: string;
  parameters: any[];
  selected: boolean;
  onClick: () => void;
}) => {
  const total = parameters.length || 0;
  const active = parameters.filter((p) => p.is_active).length;
  const percent = total ? Math.round((active / total) * 100) : 0;
  const percentColor = percent === 100 ? "#16a34a" : "#f97316";

  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: selected ? "#fef3f2" : "#fff",
        border: selected ? "2px solid #f97316" : "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700 }}>{name}</div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 700, color: percentColor }}>{percent}%</span>
        <span style={{ color: "#94a3b8" }}>
          {formatCount(active)}/{formatCount(total)} Params
        </span>
      </div>
    </div>
  );
};

/* ---------------- Main ---------------- */

export default function LabEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const [activeTab, setActiveTab] = useState<"To-Do" | "Plan">("To-Do");
  const [selectedEnv, setSelectedEnv] = useState<any>(null);

  const department = clinic?.department.find(
    (d) => normalize(d.name) === normalize(departmentName),
  );

  const environments = useMemo(() => {
    if (!department?.environments) return [];

    return department.environments.filter((env) =>
      env.environment_name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [department, searchText]);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* ---------- HEADER ---------- */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          Environment
        </h1>

        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#F2F2F2",
            padding: 4,
            borderRadius: 12,
            gap: 4,
          }}
        >
          {["To-Do", "Plan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                width: 166,
                height: 36,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                backgroundColor: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#E17E61" : "#94a3b8",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- BODY ---------- */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* LEFT */}
        <div
          style={{
            width: selectedEnv ? 520 : "100%",
            transition: "width 0.25s ease",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            height: "calc(100vh - 220px)",
            overflowY: "auto",
          }}
        >
          {activeTab === "To-Do" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: selectedEnv
                  ? "1fr"
                  : "repeat(auto-fill,minmax(320px,1fr))",
                gap: 12,
              }}
            >
              {environments.map((env) => (
                <EnvironmentCard
                  key={env.id}
                  name={env.environment_name}
                  parameters={env.parameters || []}
                  selected={selectedEnv?.id === env.id}
                  onClick={() => setSelectedEnv(env)}
                />
              ))}
            </div>
          ) : (
            <LabPlanPage />
          )}
        </div>

        {/* RIGHT */}
        {selectedEnv && (
          <div style={{ flex: 1 }}>
            <LabEnvironmentForm environment={selectedEnv} />
          </div>
        )}
      </div>
    </div>
  );
}
