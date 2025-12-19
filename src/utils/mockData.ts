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

  // ---------- Clinic ----------
  mockClinic = {
    id: clinic_id,
    name: api.name,
  };

  // ---------- Departments ----------
  mockDepartments = api.department.map((d: any, depIndex: number) => ({
    id: depIndex + 1,
    name: d.name,
    is_active: d.is_active,
    clinic_id: clinic_id,
    created_at: new Date().toISOString(),
  }));

  let equipmentCounter = 1;
  let parameterCounter = 1;

  // ---------- Equipments + Parameters ----------
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

  // TEMPERATURE (LINE)
  if (param === "temperature") {
    return {
      chartType: "line",
      unit: "°C",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Mon", "Incubator A": 40.5, "Incubator B": 20.2, "Incubator C": 50.1, "Incubator D": 22.4 },
        { date: "Tue", "Incubator A": 37.6, "Incubator B": 30.4, "Incubator C": 37.2, "Incubator D": 28.5 },
        { date: "Wed", "Incubator A": 25.4, "Incubator B": 36.3, "Incubator C": 40.0, "Incubator D": 27.3 },
        { date: "Thru", "Incubator A": 27.5, "Incubator B":32.3, "Incubator C": 22.1, "Incubator D": 40.4 },
        { date: "Fri", "Incubator A": 40.6, "Incubator B": 43.4, "Incubator C": 30.2, "Incubator D": 44.5 },
        { date: "Sat", "Incubator A": 20.5, "Incubator B": 25.3, "Incubator C": 36.1, "Incubator D": 42.4 },
        { date: "Sun", "Incubator A": 37.6, "Incubator B": 37.4, "Incubator C": 42.3, "Incubator D": 23.5 },
      ],
    };
  }

  // CO2 (BAR)
  if (param.includes("co2")) {
    return {
      chartType: "bar",
      unit: "%",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Mon", "Incubator A": 5.35, "Incubator B": 5.42, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Tue", "Incubator A": 5.36, "Incubator B": 5.45, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Wed", "Incubator A": 5.34, "Incubator B": 5.43, "Incubator C": 5.37, "Incubator D": 5.39 },
        { date: "Thru", "Incubator A": 5.35, "Incubator B": 5.44, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Fri", "Incubator A": 5.36, "Incubator B": 5.46, "Incubator C": 5.39, "Incubator D": 5.41 },
        { date: "Sat", "Incubator A": 5.35, "Incubator B": 5.45, "Incubator C": 5.38, "Incubator D": 5.40 },
        { date: "Sun", "Incubator A": 5.37, "Incubator B": 5.47, "Incubator C": 5.40, "Incubator D": 5.42 },
      ],
    };
  }

  // HUMIDITY (LINE)
  if (param === "humidity") {
    return {
      chartType: "line",
      unit: "%",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Mon", "Incubator A": 88, "Incubator B": 82, "Incubator C": 86, "Incubator D": 85 },
        { date: "Tue", "Incubator A": 50, "Incubator B": 83, "Incubator C": 87, "Incubator D": 83 },
        { date: "Wed", "Incubator A": 79, "Incubator B": 81, "Incubator C": 86, "Incubator D": 84 },
        { date: "Thru", "Incubator A": 88, "Incubator B": 100, "Incubator C": 87, "Incubator D": 85 },
        { date: "Fri", "Incubator A": 89, "Incubator B": 82, "Incubator C": 85, "Incubator D": 86 },
        { date: "Sat", "Incubator A": 87, "Incubator B": 83, "Incubator C": 86, "Incubator D": 84 },
        { date: "Sun", "Incubator A": 89, "Incubator B": 81, "Incubator C": 87, "Incubator D": 85 },
      ],
    };
  }

  // AIRFLOW (LINE)
  if (param.includes("airflow")) {
    return {
      chartType: "line",
      unit: "m/s",
      equipment_names: ["Incubator A", "Incubator B", "Incubator C", "Incubator D"],
      data: [
        { date: "Jan", "Incubator A": 0.65, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Feb", "Incubator A": 0.66, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Mar", "Incubator A": 0.60, "Incubator B": 0.54, "Incubator C": 0.59, "Incubator D": 0.56 },
        { date: "Apr", "Incubator A": 0.62, "Incubator B": 0.55, "Incubator C": 0.45, "Incubator D": 0.47 },
        { date: "May", "Incubator A": 0.70, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Jun", "Incubator A": 0.61, "Incubator B": 0.55, "Incubator C": 0.60, "Incubator D": 0.57 },
        { date: "Jul", "Incubator A": 0.64, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Aug", "Incubator A": 0.63, "Incubator B": 0.67, "Incubator C": 0.62, "Incubator D": 0.59 },
        { date: "Sep", "Incubator A": 0.62, "Incubator B": 0.54, "Incubator C": 0.70, "Incubator D": 0.57 },
        { date: "Oct", "Incubator A": 0.61, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
        { date: "Nov", "Incubator A": 0.63, "Incubator B": 0.55, "Incubator C": 0.62, "Incubator D": 0.57 },
        { date: "Dec", "Incubator A": 0.64, "Incubator B": 0.56, "Incubator C": 0.61, "Incubator D": 0.58 },
      ],
    };
  }

  // DEFAULT
  return {
    chartType: "line",
    unit: "",
    equipment_names: [],
    data: [],
  };
};

// ==============================
// MOCK RECENT ACTIVITY DATA
// ==============================
export const mockActivities: Activity[] = [
  // =======================
  // TEMPERATURE
  // =======================
  {
    id: 1,
    equipment_id: 1,
    type: "temperature",
    message: "Temperature increased to 37.6°C",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    equipment_id: 2,
    type: "temperature",
    message: "Temperature dropped to 36.8°C",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    equipment_id: 3,
    type: "temperature",
    message: "Temperature stabilized at 37.2°C",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },

  // =======================
  // CO2
  // =======================
  {
    id: 2,
    equipment_id: 1,
    type: "co2",
    message: "CO₂ adjusted to 5.4%",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    equipment_id: 2,
    type: "co2",
    message: "CO₂ increased to 5.6%",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },

  // =======================
  // HUMIDITY
  // =======================
  {
    id: 3,
    equipment_id: 1,
    type: "humidity",
    message: "Humidity stabilized at 85%",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    equipment_id: 2,
    type: "humidity",
    message: "Humidity dropped to 80%",
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },

  // =======================
  // AIRFLOW (other)
  // =======================
  {
    id: 4,
    equipment_id: 1,
    type: "other",
    message: "Airflow velocity in Feb: 0.56 m/s",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    equipment_id: 3,
    type: "other",
    message: "Airflow velocity in Feb: 0.60 m/s",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
];
