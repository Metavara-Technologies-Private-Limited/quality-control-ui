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

  mockDepartments = api.department.map((d: any, depIndex: number) => ({
    id: depIndex + 1,
    name: d.name,
    is_active: d.is_active,
    clinic_id: clinic_id,
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
        const exists = equipment!.parameters.find(
          (p) => p.parameter_name === param.parameter_name
        );
        if (exists) return;

        const normalizedName = param.parameter_name
          .toLowerCase()
          .replace("₂", "2");

        const isCO2 = normalizedName.includes("co2");
        const isHumidity = normalizedName.includes("humidity");

        const newParam: Parameter = {
          id: parameterCounter++,
          parameter_name: param.parameter_name,
          equipment_id: equipment!.id,
          is_active: param.is_active,
          Content: {
            ...param.content,
            unit: isCO2 ? "%" : isHumidity ? "%" : "°C",
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
// PARAMETER CHART DATA for AVERAGE HUMIDITY CARD
// ==============================
export const getMockChartData = (
  equipmentId: number,
  parameterName: string
) => {
  const param = parameterName.toLowerCase().replace("₂", "2").trim();

  // TEMPERATURE
  if (param === "temperature") {
    return {
      chartType: "line",
      unit: "°C",
      xAxisLabel: "Time (Months)",
      yAxisLabel: "Temperature (°C)",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Jan", "Incubator A": 37.5, "Incubator B": 37.2, "Incubator C": 37.1, "Incubator D": 37.4 },
        { date: "Feb", "Incubator A": 37.6, "Incubator B": 37.4, "Incubator C": 37.2, "Incubator D": 37.5 },
        { date: "Mar", "Incubator A": 37.4, "Incubator B": 37.3, "Incubator C": 37.0, "Incubator D": 37.3 },
        { date: "Apr", "Incubator A": 37.5, "Incubator B": 37.3, "Incubator C": 37.1, "Incubator D": 37.4 },
        { date: "May", "Incubator A": 37.6, "Incubator B": 37.4, "Incubator C": 37.2, "Incubator D": 37.5 },
        { date: "Jun", "Incubator A": 37.5, "Incubator B": 37.3, "Incubator C": 37.1, "Incubator D": 37.4 },
        { date: "Jul", "Incubator A": 37.6, "Incubator B": 37.4, "Incubator C": 37.3, "Incubator D": 37.5 },
      ],
    };
  }

  // CO2
  if (param.includes("co2")) {
    return {
      chartType: "bar",
      unit: "%",
      xAxisLabel: "Time (Months)",
      yAxisLabel: "CO₂ Concentration (%)",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Jan", "Incubator A": 5.35, "Incubator B": 5.42, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Feb", "Incubator A": 5.36, "Incubator B": 5.45, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Mar", "Incubator A": 5.34, "Incubator B": 5.43, "Incubator C": 5.37, "Incubator D": 5.39 },
        { date: "Apr", "Incubator A": 5.35, "Incubator B": 5.44, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "May", "Incubator A": 5.36, "Incubator B": 5.46, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Jun", "Incubator A": 5.35, "Incubator B": 5.45, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Jul", "Incubator A": 5.37, "Incubator B": 5.47, "Incubator C": 5.40, "Incubator D": 5.42 },
      ],
    };
  }

  // HUMIDITY
  if (param === "humidity") {
    return {
      chartType: "line",
      unit: "%",
      xAxisLabel: "Time (Months)",
      yAxisLabel: "Relative Humidity (%)",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Jan", "Incubator A": 88, "Incubator B": 82, "Incubator C": 86, "Incubator D": 85 },
        { date: "Feb", "Incubator A": 87, "Incubator B": 83, "Incubator C": 87, "Incubator D": 83 },
        { date: "Mar", "Incubator A": 89, "Incubator B": 81, "Incubator C": 86, "Incubator D": 84 },
        { date: "Apr", "Incubator A": 88, "Incubator B": 83, "Incubator C": 87, "Incubator D": 85 },
        { date: "May", "Incubator A": 89, "Incubator B": 82, "Incubator C": 85, "Incubator D": 86 },
        { date: "Jun", "Incubator A": 87, "Incubator B": 83, "Incubator C": 86, "Incubator D": 84 },
        { date: "Jul", "Incubator A": 89, "Incubator B": 81, "Incubator C": 87, "Incubator D": 85 },
      ],
    };
  }

  // AIRFLOW
  if (param.includes("airflow")) {
    return {
      chartType: "line",
      unit: "m/s",
      xAxisLabel: "Time (Months)",
      yAxisLabel: "Airflow Velocity (m/s)",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Jan", "Incubator A": 0.65, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Feb", "Incubator A": 0.66, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Mar", "Incubator A": 0.60, "Incubator B": 0.54, "Incubator C": 0.59, "Incubator D": 0.56 },
        { date: "Apr", "Incubator A": 0.62, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "May", "Incubator A": 0.63, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Jun", "Incubator A": 0.61, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Jul", "Incubator A": 0.64, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Aug", "Incubator A": 0.63, "Incubator B": 0.55, "Incubator C": 0.62, "Incubator D": 0.59 },
        { date: "Sep", "Incubator A": 0.62, "Incubator B": 0.54, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Oct", "Incubator A": 0.61, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Nov", "Incubator A": 0.63, "Incubator B": 0.55, "Incubator C": 0.62, "Incubator D": 0.57 },
        { date: "Dec", "Incubator A": 0.64, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
      ],
    };
  }

  return {
    chartType: "line",
    unit: "",
    xAxisLabel: "",
    yAxisLabel: "",
    equipment_names: [],
    data: [],
  };
};
// ==============================
// MOCK RECENT ACTIVITY DATA for pie chart (FINAL)
// ==============================
export const mockActivities: Activity[] = [
  // =========================
  // 🔴 HIGH = 12 logs
  // (temperature / co2)
  // =========================
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

  // =========================
  // 🟢 NORMAL = 10 logs
  // (humidity)
  // =========================
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: i + 23,
    equipment_id: 1,
    type: "humidity",
    message: `Humidity normal ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),

  // =========================
  // ⚪ LOW = 4 logs
  // (airflow / assignee)
  // =========================
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: i + 33,
    equipment_id: 1,
    type: "airflow",
    message: `Airflow low ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),

  ...Array.from({ length: 4 }).map((_, i) => ({
    id: i + 37,
    equipment_id: 1,
    type: "assignee",
    message: `Assignee change ${i + 1}`,
    timestamp: new Date().toISOString(),
  })),
];


// ==============================
// MOCK ASSIGNEES (UI SUPPORT)
// ==============================

export interface Assignee {
  id: number;
  name: string;
  avatar: string;
  equipment_id: number | null; // null = unassigned
}

export const mockAssignees: Assignee[] = [
  {
    id: 1,
    name: "Anil Kumar",
    avatar: "https://i.pravatar.cc/150?img=12",
    equipment_id: 1, // Incubator A
  },
  {
    id: 2,
    name: "Hari Krishna",
    avatar: "https://i.pravatar.cc/150?img=32",
    equipment_id: 3, // Incubator C
  },
  {
    id: 3,
    name: "Pallavi",
    avatar: "https://i.pravatar.cc/150?img=47",
    equipment_id: 2, // Incubator B
  },

  // Available users
  {
    id: 4,
    name: "Anil kumar",
    avatar: "https://i.pravatar.cc/150?img=56",
    equipment_id: null,
  },
  {
    id: 5,
    name: "Neeraj",
    avatar: "https://i.pravatar.cc/150?img=13",
    equipment_id: null,
  },
  {
    id: 6,
    name: "Shradha",
    avatar: "https://i.pravatar.cc/150?img=44",
    equipment_id: null,
  },
];
