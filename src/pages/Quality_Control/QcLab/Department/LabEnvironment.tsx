import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState } from "@/store";
import LabEnvironmentForm from "./LabEnvironmentForm";

/* ---------------- Utils ---------------- */
const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
const formatCount = (v: number) => String(v).padStart(2, "0");

/* ---------------- Card Component ---------------- */
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
        position: "relative",
        padding: 16,
        borderRadius: 12,
        cursor: "pointer",
        backgroundColor: "#FFFFFF",
        border: selected ? "1px solid #F97316" : "1.5px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
        width: "400px", // Standardized width
        height: "86px", // Standardized height
        boxSizing: "border-box"
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#4B5563" }}>
        {name} :{" "}
        <span style={{ fontWeight: 500, color: "#232323", fontSize: "14px" }}>
          Parameters : {formatCount(active)}/{formatCount(total)}
        </span>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 700, color: percentColor }}>{percent}%</span>
        <span style={{ color: "#94a3b8", fontWeight: 500 }}>
          {total} parameters
        </span>
      </div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
export default function LabEnvironment() {
  const { departmentName, searchText } = useOutletContext<{
    departmentName: string;
    searchText: string;
  }>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);
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
    <div style={{ fontFamily: "'Montserrat', sans-serif", padding: "12px", backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
      
      {/* HEADER: Only To-Do remains */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 24,
          gap: 24,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#232323" }}>
          Environment
        </h1>

        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#F2F2F2",
            padding: 4,
            borderRadius: 12,
          }}
        >
          <button
            style={{
              width: 166,
              height: 36,
              borderRadius: 10,
              border: "none",
              cursor: "default",
              fontSize: 14,
              fontWeight: 700,
              backgroundColor: "#FFFFFF",
              color: "#E17E61",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            To-Do
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", gap: 20 }}>
        
        {/* LEFT PANEL */}
        <div
          style={{
            flex: selectedEnv ? "0 0 470px" : "1",
            maxWidth: selectedEnv ? 470 : "100%",
            transition: "all 0.25s ease",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #E5E7EB",
            overflowY: "auto",
            padding: 16,
            height: "calc(100vh - 200px)",
               fontWeight:"700",
                fontSize:"20px"
          }}
        >
          <div
            style={{
              marginBottom: 20,
              backgroundColor: "#F8F8F8",
              padding: "16px",
              borderRadius: "12px",
            }}
          >
            <h3
              style={{
                marginBottom: 16,
                fontSize: 16,
                fontWeight: 700,
                color: "#4B5563",
              }}
            >
              Environment
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: selectedEnv
                  ? "1fr"
                  : "repeat(auto-fill, minmax(400px, 1fr))",
                gap: 16,
             
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
          </div>
        </div>

        {/* RIGHT PANEL: Form Details */}
        {selectedEnv && (
          <div style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "20px", height: "fit-content" }}>
            <LabEnvironmentForm environment={selectedEnv} />
          </div>
        )}
      </div>
    </div>
  );
}