import dayjs from "dayjs";
import type {
  Clinic,
  Department,
  Equipment,
  Parameter,
  Activity,
} from "@/types";

// ==============================
// API FETCH
// ==============================

const API_BASE = "http://127.0.0.1:8000/api/get_clinic";

export const loadClinicData = async (clinic_id: number) => {
  const response = await fetch(`${API_BASE}/${clinic_id}/`);
  return await response.json();
};

// ==============================
// STORAGE
// ==============================

export let mockClinic: Clinic | null = null;
export let mockDepartments: Department[] = [];
export let mockEquipments: Equipment[] = [];
export let mockParameters: Parameter[] = [];

// ==============================
// INITIALIZE DATA
// ==============================

export const initializeMockData = async (clinic_id: number) => {
  mockClinic = null;
  mockDepartments = [];
  mockEquipments = [];
  mockParameters = [];

  const api = await loadClinicData(clinic_id);

  mockClinic = {
    id: clinic_id,
    name: api.name,
  };

  localStorage.setItem("clinic", JSON.stringify(api));
  mockDepartments = api.department.map((d: any, _index: number) => ({
    // id: index + 1,
    id: d.id,
    name: d.name,
    is_active: d.is_active,
    clinic_id,
    created_at: new Date().toISOString(),
  }));

  // let equipmentCounter = 1;
  // let parameterCounter = 1;

  api.department.forEach((dep: any, depIndex: number) => {
    dep.equipments.forEach((eq: any) => {
      let equipment = mockEquipments.find(
        (e) =>
          e.equipment_name === eq.equipment_name &&
          e.dep_id === depIndex + 1
      );

      if (!equipment) {
        equipment = {
          // id: equipmentCounter++,
          id: eq.id,
          equipment_name: eq.equipment_name,
          dep_id: depIndex + 1,
          created_at: new Date().toISOString(),
          department: mockDepartments[depIndex],
          parameters: [],
        };
        mockEquipments.push(equipment);
      }

      eq.parameters.forEach((param: any) => {
        if (
          equipment!.parameters.find(
            (p) => p.parameter_name === param.parameter_name
          )
        )
          return;

        const normalized = param.parameter_name
          .toLowerCase()
          .replace("₂", "2");

        const unit =
          normalized.includes("co2")
            ? "%"
            : normalized.includes("humidity")
            ? "%"
            : normalized.includes("airflow")
            ? "m/s"
            : "°C";
            const pv = param.parameter_values?.[0]; // take latest for now
            const content = pv?.content || {};
            
        const newParam: Parameter = {
          // id: parameterCounter++,
          id: param.id,
          parameter_name: param.parameter_name,
          equipment_id: equipment!.id,
          is_active: param.is_active,
          Content: {
            ...content,                 // <-- readings come from here
            unit: param?.content?.unit || unit,
            control_limits: {
              warning_min: 0,
              warning_max: 0,
              critical_min: 0,
              critical_max: 0,
            },
          },          
          created_at: new Date().toISOString(),
          equipment: equipment!,
        };

        mockParameters.push(newParam);
        equipment!.parameters.push(newParam);
      });
    });
  });
};

// ==============================
// 🔢 AVERAGE CALCULATION
// ==============================

export const calculateAverageForEquipment = (
  chartData: any[],
  equipmentName: string
): number => {
  if (!chartData?.length) return 0;

  const values = chartData
    .map((row) => row[equipmentName])
    .filter((v) => typeof v === "number");

  if (!values.length) return 0;

  const avg =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  return Number(avg.toFixed(2));
};

// ==============================
// PARAMETER CHART DATA
// ==============================

export const getMockChartData = (
  equipmentId: number,
  parameterId: number
) => {
  const rawClinic = localStorage.getItem("clinic");
  if (!rawClinic) return emptyChart();

  const clinic = JSON.parse(rawClinic);

  // 1. Find equipment
  const equipment = clinic.department
    ?.flatMap((d: any) => d.equipments || [])
    .find((e: any) => e.id === equipmentId);

  if (!equipment) return emptyChart();

  // 2. Map equipment_detail_id → equipment_num
  const detailMap: Record<number, string> = {};
  equipment.equipment_details?.forEach((ed: any) => {
    detailMap[ed.id] = ed.equipment_num;
  });

  // 3. Find parameter
  const parameter = equipment.parameters?.find(
    (p: any) => p.id === parameterId
  );  

  const content = parameter?.parameter_values?.[0]?.content;
  if (!content) return emptyChart();

  // 4. Skip non-numeric data types
  if (["Select", "Dropdown"].includes(content.data_type)) {
    return emptyChart();
  }

  // 5. No readings
  if (!content.readings?.length) {
    return {
      ...emptyChart(),
      unit: content.unit || "",
    };
  }

  // 6. Shape chart data
  const dataMap: Record<string, any> = {};
  const equipmentNames = new Set<string>();

  content.readings.forEach((r: any) => {
    const time = dayjs(r.recorded_at).format("HH:mm");
    const eqName = detailMap[r.equipment_detail_id];
    if (!eqName) return;

    equipmentNames.add(eqName);
    if (!dataMap[time]) dataMap[time] = { date: time };
    dataMap[time][eqName] = Number(r.value);
  });

  return {
    chartType: "line",
    unit: content.unit || "",
    equipment_names: Array.from(equipmentNames),
    data: Object.values(dataMap),
  };
};

// Helper
const emptyChart = () => ({
  chartType: "line",
  unit: "",
  equipment_names: [],
  data: [],
});

// ==============================
// MOCK RECENT ACTIVITY DATA
// ==============================

export const mockActivities: Activity[] = [
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    equipment_id: 1,
    type: "temperature",
    message: `Temperature incident ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: i + 13,
    equipment_id: 1,
    type: "co2",
    message: `CO2 incident ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: i + 23,
    equipment_id: 1,
    type: "humidity",
    message: `Humidity normal ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: i + 33,
    equipment_id: 1,
    type: "airflow",
    message: `Airflow low ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),
];

// ==============================
// MOCK ASSIGNEES
// ==============================

export interface Assignee {
  id: number;
  name: string;
  avatar: string;
  equipment_id: number | null;
}

export const mockAssignees: Assignee[] = [
  { id: 1, name: "Anil Kumar", avatar: "https://i.pravatar.cc/150?img=12", equipment_id: 1 },
  { id: 2, name: "Hari Krishna", avatar: "https://i.pravatar.cc/150?img=32", equipment_id: 3 },
  { id: 3, name: "Pallavi", avatar: "https://i.pravatar.cc/150?img=47", equipment_id: 2 },
  { id: 4, name: "Anil kumar", avatar: "https://i.pravatar.cc/150?img=56", equipment_id: null },
  { id: 5, name: "Neeraj", avatar: "https://i.pravatar.cc/150?img=13", equipment_id: null },
  { id: 6, name: "Shradha", avatar: "https://i.pravatar.cc/150?img=44", equipment_id: null },
];
