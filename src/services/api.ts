import { http } from './http';
import type {
  Clinic,
  Department,
  // Equipment,
  EquipmentDetail,
  Parameter,
  DashboardData,
  DashboardFilters,
  ParameterChartData,
  Activity,
  Incident,
  AverageData,
  Assignee,
  // CreateEquipmentPayload,
  CreateEquipmentDetailPayload,
  CreateParameterPayload,
  EquipmentCreatePayload,
} from '@/types';

// APIs related to clinic level operations
export const clinicApi = {
  getAll: () => http.get<Clinic[]>('/clinics/'),
  getById: (id: number) => http.get<Clinic>(`/get_clinic/${id}/`),
  create: (data: Omit<Clinic, 'id'>) => http.post('/clinics/', data),
  update: (id: number, data: Partial<Clinic>) =>
    http.put(`/clinics/${id}/`, data),
  delete: (id: number) => http.delete(`/clinics/${id}/`),
};

// APIs related to departments
export const departmentApi = {
  getAll: (clinicId?: number) =>
    http.get('/departments/', {
      params: clinicId ? { clinic_id: clinicId } : undefined,
    }),
  getById: (id: number) => http.get(`/departments/${id}/`),
  create: (data: Omit<Department, 'id' | 'created_at'>) =>
    http.post('/departments/', data),
  update: (id: number, data: Partial<Department>) =>
    http.put(`/departments/${id}/`, data),
  delete: (id: number) => http.delete(`/departments/${id}/`),
};

// APIs related to equipments
export const equipmentApi = {
  getAll: (departmentId: number) =>
    http.get(`/departments/${departmentId}/equipments/`),
  getById: (departmentId: number, equipmentId: number) =>
    http.get(`/departments/${departmentId}/equipments/${equipmentId}/`),
  create: (departmentId: number, data: EquipmentCreatePayload) =>
    http.post(`/departments/${departmentId}/equipments/`, data),
  update: (
    departmentId: number,
    equipmentId: number,
    data: EquipmentCreatePayload
  ) =>
    http.put(`/departments/${departmentId}/equipments/${equipmentId}/`, data),
  delete: (departmentId: number, equipmentId: number) =>
    http.delete(
      `/departments/${departmentId}/equipments/${equipmentId}/delete/`
    ),
  inactive: (departmentId: number, equipmentId: number) =>
    http.patch(
      `/departments/${departmentId}/equipments/${equipmentId}/inactive/`
    ),
  activate: (departmentId: number, equipmentId: number) =>
    http.patch(
      `/departments/${departmentId}/equipments/${equipmentId}/activate/`
    ),
};

// APIs related to equipment details
export const equipmentDetailApi = {
  getAll: (equipmentId?: number) =>
    http.get('/equipment-details/', {
      params: equipmentId ? { equipment_id: equipmentId } : undefined,
    }),
  getById: (id: number) => http.get(`/equipment-details/${id}/`),
  create: (data: CreateEquipmentDetailPayload) =>
    http.post('/equipment-details/', data),
  update: (id: number, data: Partial<EquipmentDetail>) =>
    http.put(`/equipment-details/${id}/`, data),
  delete: (id: number) => http.delete(`/equipment-details/${id}/`),
};

// APIs related to parameters
export const parameterApi = {
  getAll: (equipmentId?: number) =>
    http.get('/parameters/', {
      params: equipmentId ? { equipment_id: equipmentId } : undefined,
    }),
  getById: (id: number) => http.get(`/parameters/${id}/`),
  create: (data: CreateParameterPayload) => http.post('/parameters/', data),
  update: (id: number, data: Partial<Parameter>) =>
    http.put(`/parameters/${id}/`, data),
  delete: (id: number) => http.delete(`/parameters/${id}/`),
};

// APIs used by dashboard screens
export const dashboardApi = {
  getData: (filters?: DashboardFilters) =>
    http.get<DashboardData>('/dashboard/data/', { params: filters }),
  getParameterChart: (
    equipmentIds: number[],
    parameterId: number,
    dateRange?: { start: string; end: string }
  ) =>
    http.get<ParameterChartData>('/dashboard/parameter-chart/', {
      params: {
        equipment_ids: equipmentIds.join(','), // backend expects csv
        parameter_id: parameterId,
        ...dateRange,
      },
    }),
  getRecentActivities: (limit = 10) =>
    http.get<Activity[]>('/dashboard/recent-activities/', {
      params: { limit },
    }),
  getIncidents: (filters?: DashboardFilters) =>
    http.get<Incident[]>('/dashboard/incidents/', { params: filters }),
  getAverages: (equipmentIds: number[], parameterId: number) =>
    http.get<AverageData[]>('/dashboard/averages/', {
      params: {
        equipment_ids: equipmentIds.join(','),
        parameter_id: parameterId,
      },
    }),
  getAssignees: (equipmentId?: number) =>
    http.get<Assignee[]>('/dashboard/assignees/', {
      params: equipmentId ? { equipment_id: equipmentId } : undefined,
    }),
  assignPersonnel: (equipmentId: number, assigneeId: number) =>
    http.post('/dashboard/assignees/', {
      equipment_id: equipmentId,
      assignee_id: assigneeId,
    }),
  removeAssignee: (equipmentId: number, assigneeId: number) =>
    http.delete('/dashboard/assignees/', {
      params: { equipment_id: equipmentId, assignee_id: assigneeId },
    }),
};
