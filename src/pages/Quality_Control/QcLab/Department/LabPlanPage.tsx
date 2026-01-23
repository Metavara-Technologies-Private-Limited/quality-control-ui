import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { RootState } from "@/store";
import LabEquipmentForm from "./LabEquipmentForm";

/* ---------------- Types ---------------- */

type PlanItem = {
  key: string;
  eventId: number;
  eventName: string;
  assignment: string;
  scheduleLabel: string;
  equipmentName: string;
  equipmentUnit: string;
  equipmentDetailId: number;
};

/* ---------------- Schedule Map ---------------- */
const avatarColors = [
  "#FF5630", "#FF7452", "#FF8B00", "#FFC400",
  "#36B37E", "#00B8D9", "#2684FF", "#6554C0",
  "#8777D9", "#998DD9", "#0052CC", "#172B4D",
  "#42526E", "#6B778C", "#091E42",
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const SCHEDULE_LABEL: Record<number, string> = {
  1: "One Time",
  2: "Daily",
  3: "Weekly",
  4: "Monthly",
};

/* ---------------- Utils ---------------- */

const normalize = (v: string) => v.replace(/\s+/g, "").toLowerCase();

const getScheduleLabel = (type: any) => {
  const t =
    typeof type === "number"
      ? type
      : typeof type === "string"
      ? Number(type)
      : typeof type === "object"
      ? Number(type?.id)
      : NaN;

  return SCHEDULE_LABEL[t] ?? "Others";
};

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------------- Component ---------------- */

type ScheduleTab = "One Time" | "Daily" | "Weekly" | "Monthly";

export default function LabPlanPage() {
  const { departmentName, selectedAssigneeIds, searchText } =
    useOutletContext<{
      departmentName: string;
      selectedAssigneeIds: number[];
      searchText: string;
    }>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);
  const events = useSelector((s: RootState) => s.events.data);
  const assignees = useSelector((s: RootState) => s.assignees.data);

  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const [selectedRadio, setSelectedRadio] = useState("");
  const [activeTab, setActiveTab] = useState<ScheduleTab>("One Time");

  /* -------- Assignee Name → ID Map -------- */

  const assigneeIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    assignees.forEach((a) => (map[a.emp_name] = a.id));
    return map;
  }, [assignees]);

  /* -------- Build Plan Items -------- */

  const planItems = useMemo(() => {
    return events.flatMap((event) => {
      if (normalize(event.department) !== normalize(departmentName)) return [];

      const assigneeId = assigneeIdMap[event.assignment];

      if (
        selectedAssigneeIds.length > 0 &&
        assigneeId != null &&
        !selectedAssigneeIds.includes(assigneeId)
      ) {
        return [];
      }

      console.log(event.event_name, event.schedule.type, event.assignment);

      return event.equipments.map((eq: any) => ({
        key: `${event.id}-${eq.equipment_details__id}`,
        eventId: event.id,
        eventName: event.event_name,
        assignment: event.assignment,
        scheduleLabel: getScheduleLabel(event.schedule?.type),
        equipmentName:
          eq.equipment_details__equipment__equipment_name,
        equipmentUnit: eq.equipment_details__equipment_num,
        equipmentDetailId: eq.equipment_details__id,
      }));
    });
  }, [events, departmentName, selectedAssigneeIds, assigneeIdMap]);

  /* -------- Group By Schedule -------- */

  const groupedBySchedule = useMemo(() => {
    const grouped: Record<string, PlanItem[]> = {};

    planItems.forEach((item) => {
      const matchesSearch =
        item.equipmentName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.equipmentUnit
          .toLowerCase()
          .includes(searchText.toLowerCase());

      if (!matchesSearch) return;

      grouped[item.scheduleLabel] ??= [];
      grouped[item.scheduleLabel].push(item);
    });

    return grouped;
  }, [planItems, searchText]);

  /* -------- Active Tab Items -------- */

  const activeTabItems = useMemo(() => {
    return groupedBySchedule[activeTab] ?? [];
  }, [groupedBySchedule, activeTab]);

  /* -------- Right Panel Data -------- */

  const equipmentDetails = useMemo(() => {
    if (!selectedItem || !clinic) return [];

    const department = clinic.department.find(
      (d) => normalize(d.name) === normalize(departmentName),
    );
    if (!department) return [];

    const equipment = department.equipments.find((e) =>
      e.equipment_details.some(
        (d) => d.id === selectedItem.equipmentDetailId,
      ),
    );
    if (!equipment) return [];

    const detail = equipment.equipment_details.find(
      (d) => d.id === selectedItem.equipmentDetailId,
    );
    if (!detail || detail.id == null) return [];

    return [
      {
        equipment_id: detail.id!,
        equipment_num: detail.equipment_num,
        make: detail.make,
        model: detail.model,
        parameters: equipment.parameters ?? [],
      },
    ];
  }, [selectedItem, clinic, departmentName]);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT */}
      <div
        style={{
          width: selectedItem ? "520px" : "100%",
          transition: "width 0.25s ease",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: 16,
          height: "calc(100vh - 220px)",
          overflowY: "auto",
        }}
      >
        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["One Time", "Daily", "Weekly", "Monthly"] as ScheduleTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedItem(null);
                  setSelectedRadio("");
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    activeTab === tab
                      ? "2px solid #f97316"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    activeTab === tab ? "#fff7ed" : "#fff",
                  color:
                    activeTab === tab ? "#ea580c" : "#374151",
                }}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {activeTabItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              marginTop: 100,
              color: "#94a3b8",
            }}
          >
            No plans found
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selectedItem
                ? "1fr"
                : "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 12,
            }}
          >
            {activeTabItems.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  setSelectedItem(item);
                  setSelectedRadio(item.equipmentUnit);
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  cursor: "pointer",
                  backgroundColor:
                    selectedRadio === item.equipmentUnit
                      ? "#fef3f2"
                      : "#fff",
                  border:
                    selectedRadio === item.equipmentUnit
                      ? "2px solid #f97316"
                      : "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {item.equipmentUnit}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    {item.equipmentName}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                    }}
                  >
                    <strong>Event:</strong> {item.eventName}
                  </div>
                </div>

                <div
                  title={item.assignment}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: getAvatarColor(item.assignment),
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(item.assignment)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      {selectedItem && (
        <div style={{ flex: 1 }}>
          <LabEquipmentForm
            equipmentDetails={equipmentDetails}
            selectedRadio={selectedRadio}
            setSelectedRadio={setSelectedRadio}
          />
        </div>
      )}
    </div>
  );
}
