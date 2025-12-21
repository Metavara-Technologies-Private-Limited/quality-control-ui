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
// 🔢 AVERAGE CALCULATION (FIX)
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
  parameterName: string
) => {
  const param = parameterName
    .toLowerCase()
    .replace("₂", "2")
    .trim();

  const equipmentNames = [
    "Incubator A",
    "Incubator B",
    "Incubator C",
    "Incubator D",
  ];

  if (param === "temperature") {
    return {
      chartType: "line",
      unit: "°C",
      equipment_names: equipmentNames,
      data: [
        { date: "Mon", "Incubator A": 40.5, "Incubator B": 20.2, "Incubator C": 50.1, "Incubator D": 22.4 },
        { date: "Tue", "Incubator A": 37.6, "Incubator B": 30.4, "Incubator C": 37.2, "Incubator D": 28.5 },
        { date: "Wed", "Incubator A": 25.4, "Incubator B": 36.3, "Incubator C": 40.0, "Incubator D": 27.3 },
        { date: "Thu", "Incubator A": 27.5, "Incubator B": 32.3, "Incubator C": 22.1, "Incubator D": 40.4 },
        { date: "Fri", "Incubator A": 40.6, "Incubator B": 43.4, "Incubator C": 30.2, "Incubator D": 44.5 },
        { date: "Sat", "Incubator A": 20.5, "Incubator B": 25.3, "Incubator C": 36.1, "Incubator D": 42.4 },
        { date: "Sun", "Incubator A": 37.6, "Incubator B": 37.4, "Incubator C": 42.3, "Incubator D": 23.5 },
      ],
    };
  }

  if (param.includes("co2")) {
    return {
      chartType: "bar",
      unit: "%",
      equipment_names: equipmentNames,
      data: [
        { date: "Mon", "Incubator A": 2.35, "Incubator B": 5.42, "Incubator C": 5.38, "Incubator D": 7.40 },
        { date: "Tue", "Incubator A": 5.36, "Incubator B": 5.45, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Wed", "Incubator A": 10.34, "Incubator B": 5.43, "Incubator C": 5.37, "Incubator D": 5.39 },
        { date: "Thu", "Incubator A": 8.35, "Incubator B": 5.44, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Fri", "Incubator A": 5.36, "Incubator B": 7.46, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Sat", "Incubator A": 1.35, "Incubator B": 5.45, "Incubator C": 9.38, "Incubator D": 8.40 },
        { date: "Sun", "Incubator A": 3.37, "Incubator B": 5.47, "Incubator C": 5.40, "Incubator D": 5.42 },
      ],
    };
  }

  if (param === "humidity") {
    return {
      chartType: "line",
      unit: "%",
      equipment_names: equipmentNames,
      data: [
        { date: "Mon", "Incubator A": 15, "Incubator B": 82, "Incubator C": 86, "Incubator D": 85 },
        { date: "Tue", "Incubator A": 50, "Incubator B": 83, "Incubator C": 87, "Incubator D": 83 },
        { date: "Wed", "Incubator A": 50, "Incubator B": 81, "Incubator C": 50, "Incubator D": 84 },
        { date: "Thu", "Incubator A": 88, "Incubator B": 0, "Incubator C": 87, "Incubator D": 85 },
        { date: "Fri", "Incubator A": 20, "Incubator B": 82, "Incubator C": 85, "Incubator D": 86 },
        { date: "Sat", "Incubator A": 87, "Incubator B": 83, "Incubator C": 70, "Incubator D": 84 },
        { date: "Sun", "Incubator A": 10, "Incubator B": 81, "Incubator C": 87, "Incubator D": 85 },
      ],
    };
  }

  if (param.includes("airflow")) {
    return {
      chartType: "line",
      unit: "m/s",
      equipment_names: equipmentNames,
      data: [
        { date: "Jan", "Incubator A": 0.65, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Feb", "Incubator A": 0.66, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Mar", "Incubator A": 0.60, "Incubator B": 0.54, "Incubator C": 0.59, "Incubator D": 0.56 },
        { date: "Apr", "Incubator A": 0.62, "Incubator B": 0.55, "Incubator C": 0.45, "Incubator D": 0.47 },
      ],
    };
  }

  return { chartType: "line", unit: "", equipment_names: [], data: [] };
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