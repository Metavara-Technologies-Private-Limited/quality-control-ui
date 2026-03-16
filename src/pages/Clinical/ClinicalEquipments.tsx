import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  formatDate,
  getInitials,
  getAvatarColor,
  getRecurrenceLabel,
  EquipmentItem,
  buildEquipmentMetadata,
  getTodayActiveEquipmentIds,
  buildRawEquipmentData,
} from "../Quality_Control/QcLab/Department/LabEquipment.helpers";
import EquipmentTabs from "../Quality_Control/QcLab/Department/EquipmentTabs";
import { RootState } from "@/store";
import LabEquipmentForm from "../Quality_Control/QcLab/Department/LabEquipmentForm";
import ClinicalPlanPage from "./ClinicalPlanPage";
import { slugify } from "@/utils/slugify";

/* -------- Equipment Card (identical to Lab) -------- */
const EquipmentCard = ({
  item,
  selected,
  onClick,
  showDates = false,
}: {
  item: EquipmentItem;
  selected: boolean;
  onClick: () => void;
  showDates?: boolean;
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
        border: selected ? "2px solid #F97316" : "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header: Equipment + Assignees */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4B5563" }}>
          {item.detailName} :{" "}
          <span style={{ fontWeight: 500, color: "#6B7280" }}>
            Parameters : {item.paramsCount}
          </span>
        </div>

        {selected && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "12px", fontWeight: 700, color: "#4B5563" }}
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
                    marginLeft: index === 0 ? 0 : -8,
                    border: "2px solid #fff",
                  }}
                >
                  {getInitials(name)}
                </div>
              ))}
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
        )}
      </div>

      {/* Dates + Recurrence (To-Do tab) */}
      {showDates && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 8px",
            backgroundColor: "#F8F8F8",
            borderRadius: 6,
          }}
        >
          {item.eventNames && item.eventNames.length > 0 && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 2,
              }}
            >
              {item.eventNames[0]}
            </div>
          )}
          {item.scheduleType && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#2563eb",
                marginBottom: 2,
              }}
            >
              {getRecurrenceLabel(item)}
            </div>
          )}
          {item.startDate && item.endDate && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {formatDate(item.startDate)} → {formatDate(item.endDate)}
            </div>
          )}
          {item.days && item.days.length > 0 && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              Days: {item.days.join(", ")}
            </div>
          )}
          {item.months && item.months.length > 0 && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              Date: {item.months.join(", ")}
            </div>
          )}
          {item.oneTimeDate && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              On: {formatDate(item.oneTimeDate)}
            </div>
          )}
        </div>
      )}

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

/* -------- Main Component -------- */
export default function ClinicalEquipments() {
  const { departmentName, searchText, selectedAssigneeIds } = useOutletContext<{
    departmentName: string;
    searchText: string;
    selectedAssigneeIds: number[];
  }>();

  const assignees = useSelector((state: RootState) => state.assignees.data);

  const { clinicData, rawData } = useSelector((s: RootState) => s.clinic);
  const events = useSelector((s: RootState) => s.events.data);

  const [activeTab, setActiveTab] = useState<"All" | "To-Do" | "Plan">("All");
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentItem | null>(null);
  const [selectedRadio, setSelectedRadio] = useState("");

  // Try clinicData first, fall back to rawData
  const department = useMemo(() => {
    return (
      clinicData?.department.find((d) => slugify(d.name) === departmentName) ??
      rawData?.department.find(
        (d) => d.is_active && slugify(d.name) === departmentName,
      )
    );
  }, [clinicData, rawData, departmentName]);

  // ✅ raw department for parameter_count lookup (same pattern as LabEquipments)
  const rawDepartment = useMemo(() => {
    return rawData?.department.find(
      (d: any) => slugify(d.name) === departmentName,
    );
  }, [rawData, departmentName]);

  const assigneeByName = useMemo(() => {
    const map = new Map<string, number>();
    assignees.forEach((a) => map.set(a.emp_name, a.id));
    return map;
  }, [assignees]);

  const equipmentMetadata = useMemo(
    () => buildEquipmentMetadata(events),
    [events],
  );
  const todayActiveEquipmentIds = useMemo(
    () => getTodayActiveEquipmentIds(events),
    [events],
  );

  const rawEquipmentData = useMemo<EquipmentItem[]>(
    () =>
      buildRawEquipmentData({
        department,
        equipmentMetadata,
        selectedAssigneeIds,
        assigneeByName,
        activeTab,
        todayActiveEquipmentIds,
      }),
    [
      department,
      equipmentMetadata,
      selectedAssigneeIds,
      assigneeByName,
      activeTab,
      todayActiveEquipmentIds,
    ],
  );

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
      .map((e) => {
        // ✅ FIX: look up parameter_count for this specific equipment detail
        // from rawData so form only shows parameters selected during configuration
        const rawEq = rawDepartment?.equipments?.find(
          (eq: any) => eq.equipment_name === e.name,
        );
        const rawDetail = rawEq?.equipment_details?.find(
          (d: any) => d.id === e.id,
        );
        const paramCount: number | null = rawDetail?.parameter_count ?? null;

        // Slice parameters to only show the ones selected during configuration.
        // If parameter_count is null (legacy data), fall back to all parameters.
        const visibleParams =
          paramCount != null && paramCount > 0
            ? e.parameters.slice(0, paramCount)
            : e.parameters;

        return {
          equipment_id: e.id,
          equipment_num: e.detailName,
          parameters: visibleParams,
          make: e.make,
          model: e.model,
        };
      });
  }, [selectedEquipment, rawEquipmentData, rawDepartment]);

  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio]);

  const handleTabChange = (tab: "All" | "To-Do" | "Plan") => {
    setActiveTab(tab);
    setSelectedEquipment(null);
    setSelectedRadio("");
  };

  /* ---- Reusable Equipment Grid ---- */
  const EquipmentGrid = ({ showDates }: { showDates: boolean }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      <div
        style={{
          width: selectedEquipment ? "min(470px, 100%)" : "100%",
          maxWidth: selectedEquipment ? 470 : "100%",
          transition: "width 0.25s ease",
          background: "#fff",
          borderRadius: 14,
          overflowY: "auto",
          padding: 16,
          flexShrink: 0,
        }}
      >
        {Object.keys(groupedEquipments).length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#94a3b8", paddingTop: 40 }}
          >
            {activeTab === "To-Do"
              ? "No equipment scheduled for today"
              : "No equipment found"}
          </div>
        ) : (
          Object.keys(groupedEquipments).map((eqName) => (
            <div
              key={eqName}
              style={{
                marginBottom: 20,
                backgroundColor: "#F8F8F8",
                padding: "12px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
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
                    showDates={showDates}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEquipment && (
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <LabEquipmentForm
            equipmentDetails={equipmentDetails}
            selectedRadio={selectedRadio}
            setSelectedRadio={setSelectedRadio}
          />
        </div>
      )}
    </div>
  );

  /* ============ PLAN VIEW ============ */
  if (activeTab === "Plan") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Equipments
          </h1>
          <EquipmentTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        <ClinicalPlanPage />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Equipments</h1>
        <EquipmentTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <EquipmentGrid showDates={activeTab === "To-Do"} />
    </div>
  );
}
