export type EquipmentItem = {
  id: number;
  name: string;
  detailName: string;
  parameters: any[];
  make: string;
  model: string;
  paramsCount: string;
  assigneeNames?: string[];
  scheduleType?: number;
  days?: string[];
  months?: number[];
  oneTimeDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  eventNames?: string[];
};

export const avatarColors = [
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

export const getRecurrenceLabel = (item: EquipmentItem) => {
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

export const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

/* -------- Utils -------- */
export const normalize = (v: string) => v?.replace(/\s+/g, "").toLowerCase();
export const formatCount = (v: number) => String(v).padStart(2, "0");
export const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const formatDate = (date: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isEventActiveToday = (event: any): boolean => {
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
  if (schedule.start_date && schedule.end_date && schedule.type !== 4) {
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

export type EquipmentMetadata = {
  names: string[];
  scheduleType?: number;
  days?: string[];
  months?: number[];
  oneTimeDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  eventNames: string[];
};

export const buildEquipmentMetadata = (events: any[]) => {
  const map: Record<number, EquipmentMetadata> = {};

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
};

export const getTodayActiveEquipmentIds = (events: any[]) => {
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
};

export const buildRawEquipmentData = ({
  department,
  equipmentMetadata,
  selectedAssigneeIds,
  assigneeByName,
  activeTab,
  todayActiveEquipmentIds,
}: {
  department: any;
  equipmentMetadata: Record<number, any>;
  selectedAssigneeIds: number[];
  assigneeByName: Map<string, number>;
  activeTab: "All" | "To-Do" | "Plan";
  todayActiveEquipmentIds: Set<number>;
}) => {
  if (!department) return [];

  return department.equipments
    .filter((eq: any) => eq.is_active)
    .flatMap((eq: any) => {
      const total = eq.parameters?.length ?? 0;
      const active = eq.parameters?.filter((p: any) => p.is_active).length ?? 0;

      return eq.equipment_details
        .filter((detail: any) => {
          if (activeTab === "All") return true;

          if (activeTab === "To-Do") {
            if (!todayActiveEquipmentIds.has(detail.id)) return false;
          }

          if (selectedAssigneeIds.length === 0) return true;

          const metadata = equipmentMetadata[detail.id];
          const assigneeNames = metadata?.names ?? [];

          const assigneeIdsForEq = assigneeNames
            .map((name: string) => assigneeByName.get(name))
            .filter(Boolean) as number[];

          return assigneeIdsForEq.some((id) =>
            selectedAssigneeIds.includes(id!),
          );
        })
        .map((detail: any) => {
          const metadata = equipmentMetadata[detail.id] || {};

          return {
            id: detail.id,
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
};
