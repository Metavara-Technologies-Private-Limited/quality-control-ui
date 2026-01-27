import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import { RootState } from "@/store";
import LabEquipmentForm from "./LabEquipmentForm";
import LabPlanPage from "./LabPlanPage";

const avatarColors = [
  "#FF5630",
  "#FF7452",
  "#FF8B00",
  "#FFC400",
  "#36B37E",
  "#00B8D9",
  "#2684FF",
  "#6554C0",
  "#8777D9",
  "#998DD9",
  "#0052CC",
  "#172B4D",
  "#42526E",
  "#6B778C",
  "#091E42",
];

const getRecurrenceLabel = (item: EquipmentItem) => {
  switch (item.scheduleType) {
    case 1:
      return "One-time";
    case 2:
      return "Daily";
    case 3:
      return "Weekly";
    case 4:
      return "Monthly";
    default:
      return "";
  }
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

/* -------- Utils -------- */
const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
const formatCount = (v: number) => String(v).padStart(2, "0");
const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (date: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* -------- Check if event is active TODAY -------- */
const isEventActiveToday = (event: any): boolean => {
  const schedule = event?.schedule;
  if (!schedule) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ---------- One-time event ---------- */
  if (schedule.one_time_date) {
    const oneTime = new Date(schedule.one_time_date);
    oneTime.setHours(0, 0, 0, 0);
    return today.getTime() === oneTime.getTime();
  }

  /* ---------- Date range validation (NOT for monthly) ---------- */
  if (
    schedule.start_date &&
    schedule.end_date &&
    schedule.type !== 4 // ⚠️ critical fix
  ) {
    const start = new Date(schedule.start_date);
    const end = new Date(schedule.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start || today > end) return false;
  }

  /* ---------- Recurring logic ---------- */
  switch (schedule.type) {
    case 1: {
      // ONE-TIME
      if (!schedule.one_time_date) return false;
      const d = new Date(schedule.one_time_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }
  
    case 2: {
      // DAILY (date range based)
      if (schedule.start_date && schedule.end_date) {
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
      }
      return true;
    }
  
    case 3: {
      // WEEKLY
      if (!schedule.days || schedule.days.length === 0) return true;
      const todayDay = today.toLocaleDateString("en-US", { weekday: "short" });
      return schedule.days.some((d: string) =>
        normalize(d).startsWith(normalize(todayDay)),
      );
    }
  
    case 4: {
      // MONTHLY
      if (schedule.months?.length) {
        return schedule.months.includes(today.getDate());
      }
      if (!schedule.start_date) return false;
      return new Date(schedule.start_date).getDate() === today.getDate();
    }
  
    default:
      return false;
  }  
};

/* -------- Types -------- */
type EquipmentItem = {
  id: number;
  name: string;
  detailName: string;
  parameters: any[];
  make: string;
  model: string;
  paramsCount: string;
  assigneeNames?: string[];

  // 🔽 ADD THESE
  scheduleType?: number;
  days?: string[];
  months?: number[];
  oneTimeDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  eventNames?: string[];
};
/* -------- Equipment Card -------- */
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
      {/* Top-right: Assignees */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#4B5563",
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

      {/* Equipment info */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4B5563" }}>
        {item.detailName} :{" "}
        <span style={{ fontWeight: 500, color: "#6B7280" }}>
          Parameters : {item.paramsCount}
        </span>
      </div>

      {/* Dates */}
      {/* Dates + Recurrence */}
      {showDates && (
        <div
          style={{
            marginTop: 8,
            padding: "6px 8px",
            backgroundColor: "#F8F8F8",
            borderRadius: 6,
          }}
        >
          {/* Event Name */}
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

          {/* Recurrence Type */}
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

          {/* Date Range */}
          {item.startDate && item.endDate && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {formatDate(item.startDate)} → {formatDate(item.endDate)}
            </div>
          )}

          {/* Weekly days */}
          {item.days && item.days.length > 0 && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              Days: {item.days.join(", ")}
            </div>
          )}

          {/* Monthly dates */}
          {item.months && item.months.length > 0 && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              Date: {item.months.join(", ")}
            </div>
          )}

          {/* One-time */}
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
export default function LabEquipments() {
  const { departmentName, searchText, selectedAssigneeIds } = useOutletContext<{
    departmentName: string;
    searchText: string;
    selectedAssigneeIds: number[];
  }>();
  const assignees = useSelector((state: RootState) => state.assignees.data);
  const { data: clinic } = useSelector((s: RootState) => s.clinic);
  const events = useSelector((s: RootState) => s.events.data);

  const [activeTab, setActiveTab] = useState<"All" | "To-Do" | "Plan">("All");
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

  /* -------- Build equipment → assignees + dates + event names map -------- */
  const equipmentMetadata = useMemo(() => {
    const map: Record<
      number,
      {
        names: string[];
        scheduleType?: number;
        days?: string[];
        months?: number[];
        oneTimeDate?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        eventNames: string[];
      }
    > = {};

    events?.forEach((event: any) => {
      event.equipments?.forEach((eq: any) => {
        const id = eq.equipment_details__id;
        if (!id) return;

        if (!map[id]) {
          map[id] = {
            names: [],
            eventNames: [],
          };
        }

        // map[id].scheduleType = event.schedule?.type;
        if (!map[id].scheduleType) {
          map[id].scheduleType = event.schedule?.type;
        }        
        map[id].days = event.schedule?.days ?? [];
        map[id].months = event.schedule?.months ?? [];
        map[id].oneTimeDate = event.schedule?.one_time_date ?? null;
        map[id].startDate = event.schedule?.start_date ?? null;
        map[id].endDate = event.schedule?.end_date ?? null;

        if (event.assignment && !map[id].names.includes(event.assignment)) {
          map[id].names.push(event.assignment);
        }

        if (!map[id].eventNames.includes(event.event_name)) {
          map[id].eventNames.push(event.event_name);
        }
      });
    });

    return map;
  }, [events]);

  /* -------- Get equipment IDs active TODAY -------- */
  const todayActiveEquipmentIds = useMemo(() => {
    const ids = new Set<number>();

    events?.forEach((event: any) => {
      if (isEventActiveToday(event)) {
        event.equipments?.forEach((eq: any) => {
          if (eq.equipment_details__id) {
            ids.add(eq.equipment_details__id);
          }
        });
      }
    });

    return ids;
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
            // ALL TAB: Show all equipment
            if (activeTab === "All") {
              return true;
            }

            // TO-DO TAB: Only show today's equipment
            if (activeTab === "To-Do") {
              if (!todayActiveEquipmentIds.has(detail.id!)) {
                return false;
              }
            }

            // Apply assignee filter
            if (selectedAssigneeIds.length === 0) return true;

            const metadata = equipmentMetadata[detail.id!];
            const assigneeNames = metadata?.names ?? [];

            const assigneeIdsForEq = assigneeNames
              .map((name) => assigneeByName.get(name))
              .filter(Boolean) as number[];

            return assigneeIdsForEq.some((id) =>
              selectedAssigneeIds.includes(id!),
            );
          })
          .map((detail) => {
            const metadata = equipmentMetadata[detail.id!] || {};

            return {
              id: detail.id!,
              name: eq.equipment_name,
              detailName: detail.equipment_num,
              parameters: eq.parameters || [],
              make: detail.make,
              model: detail.model,
              paramsCount: `${formatCount(active)}/${formatCount(total)}`,

              assigneeNames: metadata.names || [],
              scheduleType: metadata.scheduleType,
              days: metadata.days,
              months: metadata.months,
              oneTimeDate: metadata.oneTimeDate,
              startDate: metadata.startDate,
              endDate: metadata.endDate,
              eventNames: metadata.eventNames || [],
            };
          });
      });
  }, [
    department,
    equipmentMetadata,
    selectedAssigneeIds,
    assigneeByName,
    activeTab,
    todayActiveEquipmentIds,
  ]);

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

  const handleTabChange = (tab: "All" | "To-Do" | "Plan") => {
    setActiveTab(tab);
    setSelectedEquipment(null);
    setSelectedRadio("");
  };

  /* ============ PLAN VIEW ============ */
  if (activeTab === "Plan") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
            {["All", "To-Do", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                style={{
                  width: 100,
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
  if (activeTab === "To-Do") {
    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
            {["All", "To-Do", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                style={{
                  width: 100,
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

        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              width: selectedEquipment ? 470 : "100%",
              maxWidth: selectedEquipment ? 470 : "100%",
              transition: "width 0.25s ease",
              background: "#fff",
              borderRadius: 14,
              overflowY: "auto",
              padding: 16,
            }}
          >
            {Object.keys(groupedEquipments).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  paddingTop: 40,
                }}
              >
                No equipment scheduled for today
              </div>
            ) : (
              Object.keys(groupedEquipments).map((eqName, groupIndex) => {
                const borderColors: string[] = [];
                const borderColor =
                  borderColors[groupIndex % borderColors.length] || "#e5e7eb";

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
                          showDates={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

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

  /* ============ ALL VIEW (default) ============ */
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
          {["All", "To-Do", "Plan"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              style={{
                width: 100,
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

      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            width: selectedEquipment ? 470 : "100%",
            maxWidth: selectedEquipment ? 470 : "100%",
            transition: "width 0.25s ease",
            background: "#fff",
            borderRadius: 14,
            overflowY: "auto",
            padding: 16,
          }}
        >
          {Object.keys(groupedEquipments).length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                paddingTop: 40,
              }}
            >
              No equipment found
            </div>
          ) : (
            Object.keys(groupedEquipments).map((eqName, groupIndex) => {
              const borderColors: string[] = [];
              const borderColor =
                borderColors[groupIndex % borderColors.length] || "#e5e7eb";

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
                        showDates={false}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

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
