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
  mockDepartments = api.department.map((d: any, index: number) => ({
    id: index + 1,
    name: d.name,
    is_active: d.is_active,
    clinic_id,
    created_at: new Date().toISOString(),
  }));

  let equipmentCounter = 1;
  let parameterCounter = 1;

  api.department.forEach((dep: any, depIndex: number) => {
    dep.equipments.forEach((eq: any) => {
      let equipment = mockEquipments.find(
        (e) =>
          e.equipment_name === eq.equipment_name &&
          e.dep_id === depIndex + 1
      );

      if (!equipment) {
        equipment = {
          id: equipmentCounter++,
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

        const newParam: Parameter = {
          id: parameterCounter++,
          parameter_name: param.parameter_name,
          equipment_id: equipment!.id,
          is_active: param.is_active,
          Content: {
            ...param.content,
            unit,
            min_value: 0,
            max_value: 0,
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

const generateMockSeries = (
  baseValue: number,
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
) => {
  return days.map((day) => ({
    date: day,
    value: Number(
      (baseValue + (Math.random() * 2 - 1)).toFixed(2)
    ),
  }));
};


export const getMockChartData = (
  equipmentId: number,
  parameterName: string
) => {
  const param = mockParameters.find(
    (p) =>
      p.equipment_id === equipmentId &&
      p.parameter_name.toLowerCase() === parameterName.toLowerCase()
  );

  if (!param) {
    return { chartType: "line", unit: "", equipment_names: [], data: [] };
  }

  const content = param.Content;
  const equipment = mockEquipments.find(
    (e) => e.id === equipmentId
  );

  if (!equipment) {
    return { chartType: "line", unit: "", equipment_names: [], data: [] };
  }

  // Decide base value from DB config
  let baseValue = 0;

  if (content.data_type === "Decimal") {
    baseValue =
      (Number(content.min_value) + Number(content.max_value)) / 2;
  }

  if (content.data_type === "Integer") {
    baseValue = Number(content.integer_value || 0);
  }

  if (content.data_type === "Percentage") {
    baseValue = Number(content.percentage || 0);
  }

  // Dropdown / Select → NO chart
  if (
    content.data_type === "Dropdown" ||
    content.data_type === "Select"
  ) {
    return {
      chartType: "line",
      unit: "",
      equipment_names: [],
      data: [],
    };
  }

  const series = generateMockSeries(baseValue);

  return {
    chartType: "line",
    unit: content.unit,
    equipment_names: [equipment.equipment_name],
    data: series.map((s) => ({
      date: s.date,
      [equipment.equipment_name]: s.value,
    })),
  };
};


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
