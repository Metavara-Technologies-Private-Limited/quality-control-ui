import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { RootState } from "@/store";
import LabEquipmentForm from "./LabEquipmentForm";
import LabPlanPage from "./LabPlanPage";

const avatarColors = [
  "#091E42", "#172B4D", "#0052CC", "#0747A6", "#0065FF",
  "#004F3D", "#006644", "#00875A", "#7A1FA2", "#403294",
  "#5E4DB2", "#BF2600", "#DE350B", "#FF5630", "#FF8B00",
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

/* ---------------- Utils ---------------- */
const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
const formatCount = (v: number) => String(v).padStart(2, "0");
const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------------- Types ---------------- */
type EquipmentItem = {
  id: number;
  name: string;
  detailName: string;
  parameters: any[];
  make: string;
  model: string;
  paramsCount: string;
  assigneeNames?: string[];
};
/* ---------------- Equipment Card ---------------- */
const EquipmentCard = ({
  item,
  selected,
  onClick,
}: {
  item: EquipmentItem;
  selected: boolean;
  onClick: () => void;
}) => {
  const total = item.parameters.length || 0;
  const active = item.parameters.filter((p) => p.is_active).length;
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
        backgroundColor: "#ffffff",
        // Logic for selected state colors
        border: selected ? "2px solid #F97316" : "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      {/* -------- Top-right Section: Label + Assignees -------- */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          alignItems: "center", // Ensures text and avatars align vertically
          gap: "8px",
        }}
      >
        {/* Added Assignees Label */}
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#4B5563", // Match the grey title theme
            display: selected ? "inline" : "none",
          }}
        >
          Assignees :
        </span>

        <div style={{ display: "flex" }}>
          {item.assigneeNames?.slice(0, 3).map((name, index) => (
            <div
              key={index}
              title={name}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: getAvatarColor(name),
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: index === 0 ? 0 : -8, // Overlap effect
                border: "2px solid #fff",
              }}
            >
              {getInitials(name)}
            </div>
          ))}
          {/* Show count if more than 3 assignees */}
          {item.assigneeNames && item.assigneeNames.length > 3 && (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#6B7280",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -8,
                border: "2px solid #fff",
              }}
            >
              +{item.assigneeNames.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Equipment number */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4B5563" }}>
        {item.detailName} :{" "}
        <span style={{ fontWeight: 500, color: "#6B7280" }}>
          Parameters : {item.paramsCount}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 700, color: percentColor }}>{percent}%</span>
        <span style={{ color: "#94a3b8", fontWeight: 500 }}>
          {item.make} · {item.model}
        </span>
      </div>
    </div>
  );
};
/* ---------------- Main Component ---------------- */
export default function LabEquipments() {
  const { departmentName, searchText, selectedAssigneeIds } = useOutletContext<{
    departmentName: string;
    searchText: string;
    selectedAssigneeIds: number[];
  }>();
  const assignees = useSelector((state: RootState) => state.assignees.data);

  const { data: clinic } = useSelector((s: RootState) => s.clinic);
  const events = useSelector((s: RootState) => s.events.data);

  const [activeTab, setActiveTab] = useState<"To-Do" | "Plan">("To-Do");
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentItem | null>(null);
  const [selectedRadio, setSelectedRadio] = useState("");

  const department = clinic?.department.find(
    (d) => normalize(d.name) === normalize(departmentName),
  );

  const assigneeByName = useMemo(() => {
    const map = new Map<string, number>();
    assignees.forEach((a) => {
      map.set(a.emp_name, a.id);
    });
    return map;
  }, [assignees]);

  /* -------- Build equipment → assignees map (MULTIPLE) -------- */
  const assigneeByEquipmentId = useMemo(() => {
    const map: Record<number, string[]> = {};

    events?.forEach((event: any) => {
      event.equipments?.forEach((eq: any) => {
        const id = eq.equipment_details__id;
        if (!id || !event.assignment) return;

        if (!map[id]) map[id] = [];
        if (!map[id].includes(event.assignment)) {
          map[id].push(event.assignment);
        }
      });
    });

    return map;
  }, [events]);

  /* -------- Build raw equipment data -------- */
  const rawEquipmentData = useMemo(() => {
    if (!department) return [];

    return department.equipments
      .filter((eq) => eq.is_active)
      .flatMap((eq) => {
        const total = eq.parameters?.length ?? 0;
        const active = eq.parameters?.filter((p) => p.is_active).length ?? 0;

        return eq.equipment_details
          .filter((detail) => {
            // no assignee filter selected → show all
            if (selectedAssigneeIds.length === 0) return true;

            const assigneeNames = assigneeByEquipmentId[detail.id!] ?? [];

            // map assignee names → ids
            const assigneeIdsForEq = assigneeNames
              .map((name) => assigneeByName.get(name))
              .filter(Boolean) as number[];
            // show equipment if ANY assignee matches
            return assigneeIdsForEq.some((id) =>
              selectedAssigneeIds.includes(id!),
            );
          })
          .map((detail) => ({
            id: detail.id!,
            name: eq.equipment_name,
            detailName: detail.equipment_num,
            parameters: eq.parameters || [],
            make: detail.make,
            model: detail.model,
            paramsCount: `${formatCount(active)}/${formatCount(total)}`,
            assigneeNames:
              detail.id !== undefined
                ? (assigneeByEquipmentId[detail.id] ?? [])
                : [],
          }));
      });
  }, [department, assigneeByEquipmentId, selectedAssigneeIds, assigneeByName]);

  /* -------- Group by equipment name -------- */
  const groupedEquipments = useMemo(() => {
    const grouped: Record<string, EquipmentItem[]> = {};

    rawEquipmentData.forEach((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.detailName.toLowerCase().includes(searchText.toLowerCase());

      if (!matchesSearch) return;

      if (!grouped[item.name]) grouped[item.name] = [];
      grouped[item.name].push(item);
    });

    return grouped;
  }, [rawEquipmentData, searchText]);

  /* -------- Right panel data -------- */
  const equipmentDetails = useMemo(() => {
    if (!selectedEquipment) return [];

    return rawEquipmentData
      .filter((e) => e.name === selectedEquipment.name)
      .map((e) => ({
        equipment_id: e.id,
        equipment_num: e.detailName,
        parameters: e.parameters,
        make: e.make,
        model: e.model,
      }));
  }, [selectedEquipment, rawEquipmentData]);

  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio]);

  /* Handle tab change */
  const handleTabChange = (tab: "To-Do" | "Plan") => {
    setActiveTab(tab);
    setSelectedEquipment(null);
    setSelectedRadio("");
  };

  /* ============ PLAN VIEW - FULL SCREEN ============ */
  if (activeTab === "Plan") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
            gap: 24,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Equipments
          </h1>

          <div
            style={{
              display: "inline-flex",
              backgroundColor: "#F8F8F8",
              padding: 4,
              borderRadius: 12,
              gap: 4,
            }}
          >
            {["To-Do", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                style={{
                  width: 166,
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor:
                    activeTab === tab ? "#FFFFFF" : "transparent",
                  color: activeTab === tab ? "#E17E61" : "#94a3b8",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <LabPlanPage />
        </div>
      </div>
    );
  }

  /* ============ TO-DO VIEW ============ */
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 24,
          gap: 24,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Equipments</h1>

        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#F8F8F8",
            padding: 4,
            borderRadius: 12,
            gap: 4,
          }}
        >
          {["To-Do", "Plan"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              style={{
                width: 166,
                height: 36,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
                color: activeTab === tab ? "#E17E61" : "#94a3b8",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* LEFT */}
        <div
          style={{
            width: selectedEquipment ? 470 : "100%",
            maxWidth: selectedEquipment ? 470 : "100%",
            transition: "width 0.25s ease",
            background: "#fff",
            borderRadius: 14,
            overflowY: "auto",
            padding: 16,
            // height: "calc(100vh - 220px)",
          }}
        >
          {Object.keys(groupedEquipments).map((eqName, groupIndex) => {
            const borderColors: string | any[] = [];
            const borderColor = borderColors[groupIndex % borderColors.length];

            return (
              <div
                key={eqName}
                style={{
                  marginBottom: 20,
                  backgroundColor: "#F8F8F8",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `2px solid ${borderColor}`,
                }}
              >
                <h3
                  style={{
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {eqName}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: selectedEquipment
                      ? "1fr"
                      : "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 12,
                    transition: "all 0.25s ease",
                  }}
                >
                  {groupedEquipments[eqName].map((item) => (
                    <EquipmentCard
                      key={item.id}
                      item={item}
                      selected={selectedRadio === item.detailName}
                      onClick={() => {
                        setSelectedEquipment(item);
                        setSelectedRadio(item.detailName);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT */}
        {selectedEquipment && (
          <div style={{ flex: 1 }}>
            <LabEquipmentForm
              equipmentDetails={equipmentDetails}
              selectedRadio={selectedRadio}
              setSelectedRadio={setSelectedRadio}
            />
          </div>
        )}
      </div>
    </div>
  );
}
