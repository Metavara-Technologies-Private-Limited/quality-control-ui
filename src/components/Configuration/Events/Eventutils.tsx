export const formatTime = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("en-GB");
};

export const mapEventToRow = (e: any, clinic: any) => {
  // Build equipment->parameter mapping from clinic data
  const equipmentParameterMap: Record<number, Set<number>> = {};

  clinic?.department?.forEach((dept: any) => {
    dept.equipments?.forEach((eq: any) => {
      equipmentParameterMap[eq.id] = new Set<number>(
        (eq.parameters || []).map((p: any) => Number(p.id)),
      );
    });
  });

  // Get event's selected parameter IDs
  const eventParameterIds = new Set<number>(
    (e.parameters || []).map((p: any) => Number(p.parameter__id)),
  );

  // Group equipment_details by parent equipment
  const equipmentMap = new Map<
    number,
    {
      equipment_id: number;
      equipment_name: string;
      units: string[];
      parameterIds: Set<number>;
    }
  >();

  (e.equipments || []).forEach((ed: any) => {
    const eqId: number | undefined = ed.equipment_details__equipment__id;
    if (!eqId) return;

    if (!equipmentMap.has(eqId)) {
      equipmentMap.set(eqId, {
        equipment_id: eqId,
        equipment_name:
          ed.equipment_details__equipment__equipment_name || "-",
        units: [],
        parameterIds: new Set<number>(),
      });
    }

    const group = equipmentMap.get(eqId)!;
    if (ed.equipment_details__equipment_num) {
      group.units.push(ed.equipment_details__equipment_num);
    }
  });

  // For each equipment, filter parameters that belong to it AND are selected in event
  const equipmentsDetails = Array.from(equipmentMap.values()).map((group) => {
    const equipmentParamIds =
      equipmentParameterMap[group.equipment_id] ?? new Set<number>();

    // Find parameters that are both: in this equipment AND selected for this event
    const validParameterIds = Array.from(eventParameterIds).filter((paramId) =>
      equipmentParamIds.has(paramId),
    );

    // Map parameter IDs to names
    const parameters = validParameterIds.map((paramId) => {
      const param = e.parameters?.find(
        (p: any) => Number(p.parameter__id) === paramId,
      );
      return {
        id: paramId,
        name: param?.parameter__parameter_name || "-",
      };
    });

    return {
      equipment_name: group.equipment_name,
      units: group.units,
      parameters,
    };
  });

  // Count unique equipment (by parent equipment ID, not units)
  const uniqueEquipmentCount = equipmentMap.size;

  return {
    id: e.id,
    name: e.event_name,
    description: e.description,
    createdBy: e.assignee_name ?? "-",
    createdDate: formatDate(e.created_at),

    scheduleType:
      e.schedule?.type === 1
        ? "One Time"
        : e.schedule?.type === 2
        ? "Daily"
        : e.schedule?.type === 3
        ? "Weekly"
        : "Monthly",

    fromTime: formatTime(e.schedule?.from_time),
    toTime: formatTime(e.schedule?.to_time),
    startDate: formatDate(
      e.schedule?.start_date || e.schedule?.one_time_date,
    ),
    endDate: formatDate(
      e.schedule?.end_date || e.schedule?.one_time_date,
    ),
    days:
      e.schedule?.days && e.schedule.days.length > 0
        ? e.schedule.days.join(", ")
        : "-",

    recurDuration: e.schedule?.recurring_duration,

    // Fixed counts
    equipmentCount: uniqueEquipmentCount,
    parameterCount: eventParameterIds.size,

    equipmentsDetails,
  };
};
