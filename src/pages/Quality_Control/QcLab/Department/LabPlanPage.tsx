import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { RootState } from "@/store";
import LabEquipmentForm from "./LabEquipmentForm";
import { slugify } from "@/utils/slugify";
import { Box, useMediaQuery, useTheme } from "@mui/material";

type PlanItem = {
  key: string;
  eventId: number;
  eventName: string;
  assignment: string;
  scheduleLabel: string;
  equipmentName: string;
  equipmentUnit: string;
  equipmentDetailId: number;
  scheduleType?: number;
  startDate?: string | null;
  endDate?: string | null;
  days?: string[] | null;
  months?: number[] | null;
  oneTimeDate?: string | null;
};

const formatScheduleInfo = (item: PlanItem) => {
  switch (item.scheduleType) {
    case 1:
      return item.oneTimeDate
        ? `On ${new Date(item.oneTimeDate).toDateString()}`
        : "Daily";

    case 3:
      return item.days?.length ? `Weekly: ${item.days.join(", ")}` : "Weekly";

    case 4:
      return item.months?.length
        ? `Monthly on ${item.months.join(", ")}`
        : item.startDate
          ? `Monthly on ${new Date(item.startDate).getDate()}`
          : "Monthly";

    default:
      return "";
  }
};

/* ---------------- Schedule Map ---------------- */
const avatarColors = [
  "#091E42",
  "#172B4D",
  "#0052CC",
  "#0747A6",
  "#0065FF",
  "#004F3D",
  "#006644",
  "#00875A",
  "#7A1FA2",
  "#403294",
  "#5E4DB2",
  "#BF2600",
  "#DE350B",
  "#FF5630",
  "#FF8B00",
];

const getAvatarColor = (name?: string) => {
  if (!name) return avatarColors[0];

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

// const normalize = (v: string) => v.replace(/\s+/g, "").toLowerCase();

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

const getInitials = (name?: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/* ---------------- Component ---------------- */

type ScheduleTab = "One Time" | "Daily" | "Weekly" | "Monthly";

export default function LabPlanPage() {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const { departmentName, selectedAssigneeIds, searchText } = useOutletContext<{
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
      if (slugify(event.department) !== departmentName) return [];

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
        assignment: event.assignee_name,

        scheduleLabel: getScheduleLabel(event.schedule?.type),
        scheduleType: event.schedule?.type,

        startDate: event.schedule?.start_date ?? null,
        endDate: event.schedule?.end_date ?? null,
        days: event.schedule?.days ?? null,
        months: event.schedule?.months ?? null,
        oneTimeDate: event.schedule?.one_time_date ?? null,

        equipmentName: eq.equipment_details__equipment__equipment_name,
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
        item.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.equipmentUnit.toLowerCase().includes(searchText.toLowerCase());

      if (!matchesSearch) return;

      grouped[item.scheduleLabel] ??= [];
      grouped[item.scheduleLabel].push(item);
    });

    return grouped;
  }, [planItems, searchText]);

  const scheduleCounts = useMemo(() => {
    const counts: Record<ScheduleTab, number> = {
      "One Time": 0,
      Daily: 0,
      Weekly: 0,
      Monthly: 0,
    };

    (Object.keys(counts) as ScheduleTab[]).forEach((tab) => {
      counts[tab] = groupedBySchedule[tab]?.length ?? 0;
    });

    return counts;
  }, [groupedBySchedule]);

  /* -------- Active Tab Items -------- */

  const activeTabItems = useMemo(() => {
    return groupedBySchedule[activeTab] ?? [];
  }, [groupedBySchedule, activeTab]);

  /* -------- Right Panel Data -------- */

  const equipmentDetails = useMemo(() => {
    if (!selectedItem || !clinic) return [];

    const department = clinic.department.find(
      (d) => slugify(d.name) === departmentName,
    );
    if (!department) return [];

    const equipment = department.equipments.find((e) =>
      e.equipment_details.some((d) => d.id === selectedItem.equipmentDetailId),
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
    <Box
      sx={{
        display: "flex",
        gap: 2.5,
        flexDirection: { xs: "column", lg: "row" },
        minWidth: 0,
      }}
    >
      {/* LEFT */}
      <Box
        sx={{
          width: selectedItem && !isCompact ? 520 : "100%",
          transition: "width 0.25s ease",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          p: 2,
          minHeight: 0,
          maxHeight: { xs: "none", lg: "calc(100dvh - 220px)" },
          overflowY: "auto",
        }}
      >
        {/* TABS */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
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
                  backgroundColor: activeTab === tab ? "#fff7ed" : "#fff",
                  color: activeTab === tab ? "#ea580c" : "#374151",
                }}
              >
                {tab}{" "}
                <span style={{ opacity: 0.6, fontWeight: 600 }}>
                  ({scheduleCounts[tab]})
                </span>
              </button>
            ),
          )}
        </Box>

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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                selectedItem || isCompact
                  ? "1fr"
                  : "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 1.5,
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
                    selectedRadio === item.equipmentUnit ? "#fef3f2" : "#fff",
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
                  {/* Schedule info */}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: "#6b7280",
                      lineHeight: 1.4,
                    }}
                  >
                    <div>
                      <strong>Schedule:</strong> {item.scheduleLabel}
                    </div>

                    {item.startDate && item.endDate && (
                      <div>
                        {new Date(item.startDate).toDateString()} →{" "}
                        {new Date(item.endDate).toDateString()}
                      </div>
                    )}

                    <div>{formatScheduleInfo(item)}</div>
                  </div>
                </div>

                <div
                  title={item.assignment || "Unassigned"}
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
          </Box>
        )}
      </Box>

      {/* RIGHT */}
      {selectedItem && (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LabEquipmentForm
            equipmentDetails={equipmentDetails}
            selectedRadio={selectedRadio}
            setSelectedRadio={setSelectedRadio}
          />
        </Box>
      )}
    </Box>
  );
}
