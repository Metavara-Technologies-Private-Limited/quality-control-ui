// Core Types
export interface Clinic {
  id: number;
  name: string;
  department: Department[];
}

export interface Environment {
  id: number;
  environment_name: string;
  is_active: boolean;
  created_at: string;
  parameters: Parameter[];
}

export interface Department {
  id: number;
  name: string;
  is_active: boolean;
  clinic_id: number;
  created_at: string;
  equipments: Equipment[];
  environments?: Environment[];
}

export interface Equipment {
  status: string;
  equipment_type: any;
  id: number;
  equipment_name: string;
  is_active: boolean;
  dep_id: number;
  created_at: string;
  equipment_details: EquipmentDetail[];
  parameters: Parameter[];
  hasAlert?: boolean;
}

export interface EquipmentDetail {
  id?: number;
  equipment_num: string;
  make: string;
  model: string;
  is_active: boolean;
  created_at?: string;
  equipment_id?: number;
  equipment?: Equipment;
}

export interface EquipmentCreatePayload {
  equipment_name: string;
  is_active: boolean;
  equipment_details: {
    id?: number;
    equipment_num: string;
    make: string;
    model: string;
    is_active: boolean;
  }[];
  parameters: {
    id?: number;
    parameter_name: string;
    is_active: boolean;
    config: {
      data_type: string;
      min_value?: number | string | null;
      max_value?: number | string | null;
      integer_value?: number | string | null;
      percentage?: number | string | null;
      text?: string | null;
      dropdown?: string[];
    };
  }[];
}

export type CreateEquipmentDetailPayload = {
  equipment: number;
  equipment_num: string;
  make: string;
  model: string;
};

export interface Reading {
  value: number | string;
  recorded_at: string;
  equipment_detail_id: number;
}

// ✅ This is what we store in frontend state (matches backend snake_case)
export interface ParameterContent {
  id?: number;
  name?: string;
  title?: string;
  mandatory?: boolean;
  parameter_name?: string;
  is_deleted?: boolean;
  data_type?: string;
  field_type?: string;
  is_active?: boolean;
  integer_value?: number | string;
  default_value?: number | string;
  text_type?: string;
  boolean_type?: string;
  selection_type?: string;
  min_value?: number | string;
  max_value?: number | string;
  unit?: string;
  text?: string;
  percentage?: number | string;
  dropdown?: string[];
  readings?: Reading[];
  history?: Array<{
    data_type?: string;
    integer_value?: number | string;
    min_value?: number | string;
    max_value?: number | string;
    text?: string;
    percentage?: number | string;
    dropdown?: string[];
    updated_at?: string;
  }>;
  control_limits?: {
    warning_min?: number;
    warning_max?: number;
    critical_min?: number;
    critical_max?: number;
  };
}

export interface ParameterValue {
  id: number;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

export type CreateParameterPayload = {
  equipment: number;
  parameter_name: string;
  is_active: boolean;
  parameter_values: {
    content: {
      data_type: string;
      min_value?: string;
      max_value?: string;
      integer_value?: string;
      percentage?: string;
      text?: string;
      dropdown?: string[] | string;
    };
  }[];
};

export interface Parameter {
  id: number;
  parameter_name: string;
  env_parameter_name?: string;
  is_active: boolean;
  config?: ParameterContent | null;
  is_deleted: boolean;
  Content: ParameterContent;
}

export interface TestType {
  id: number;
  test_type_name: string;
  description: string;
  parameters: number[];
  created_at: string;
}

// Dashboard Types
export interface DashboardData {
  equipment: Equipment[];
  parameters: Parameter[];
  departments: Department[];
  recent_activities: Activity[];
  incidents: Incident[];
  averages: AverageData[];
  assignees: Assignee[];
}

export interface Activity {
  id: number;
  type: "temperature" | "humidity" | "co2" | "airflow" | "assignee" | "other";
  message: string;
  timestamp: string;
  equipment_id: number;
  equipment_name?: string;
  severity?: "high" | "normal" | "low";
}

export interface Incident {
  id: number;
  equipment_id: number;
  parameter_id: number;
  severity: "high" | "normal" | "low";
  value: number;
  timestamp: string;
  equipment_name?: string;
  parameter_name?: string;
}

export interface AverageData {
  equipment_id: number;
  equipment_name: string;
  parameter_name: string;
  average_value: number;
  unit: string;
  change_percentage: number;
  trend: "up" | "down";
}

export interface Assignee {
  id: number;
  email: string;
  emp_name: string;
  emp_type: string;
  department_name: string | null;

  name: string;
  equipment_id: number | null;
  equipment_name?: string;
  profile_picture?: string;
}

// Filter Types
export interface DashboardFilters {
  department_id?: number;
  equipment_id?: number;
  parameter_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface ParameterChartData {
  parameter_name: string;
  unit: string;
  data: ChartDataPoint[];
  equipment_names: string[];
  chartType: string;
}

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}
export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  due_date: string;

  timer_status?: "IDLE" | "RUNNING" | "PAUSED" | "STOPPED";
  total_tracked_sec?: number;
  timer_started_at?: string | null;

  task_event: number; // ✅ FIX (replace event)
  assignment?: number | null;

  sub_tasks: SubTask[];
  documents?: Document[];
}

export interface SubTask {
  id?: number; // optional on create
  name: string;
  status: TaskStatus; // ✅ numeric enum
  due_date: string; // ISO
  assignment?: number | null; // optional
}

export interface Attachment {
  id: number;
  file: string;
  file_name: string;
}

export const TASK_STATUS_MAP: Record<
  number,
  "To - Do" | "In Progress" | "Completed"
> = {
  0: "To - Do",
  1: "In Progress",
  2: "Completed",
};

export type UITask = Task & {
  name: string;
  status_label: "To - Do" | "In Progress" | "Completed";
  due?: string;
};

// api-types.ts (or near taskApi)

export interface SubTaskUpdatePayload {
  id?: number;
  name: string;
  status: TaskStatus;
  due_date: string;
  assignment: number | null;
}

export interface TaskUpdatePayload {
  task_event: number;
  assignment: number | null;
  name: string;
  description: string;
  due_date: string;
  status: TaskStatus;
  sub_tasks: SubTaskUpdatePayload[];

  documents?: {
    document_name: string;
    data: string; // or handled via multipart
  }[];
}
export interface Document {
  id: number;
  document_name: string;
  created_at: string;
}
