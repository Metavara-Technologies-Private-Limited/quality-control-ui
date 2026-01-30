import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { fetchClinic } from "./store/clinicSlice";

import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserConfiguration from "./pages/UserConfiguration";
import AuditTrail from "./pages/AuditTrail";
import Clinical from "./pages/Quality_Control/Clinical";
import Reports from "./pages/Quality_Control/Reports";
import ConfigurationLayout from "./pages/Quality_Control/Configuration/ConfigurationLayout";
import Events from "./pages/Quality_Control/Configuration/Events";
import CreateEvent from "./components/Configuration/Events/CreateEvent";
import LabLayout from "./pages/Quality_Control/QcLab/LabLayout";
import Task from "./pages/Quality_Control/QcLab/Embryology/Task";
import EquipmentPage from "./components/Configuration/Equipment/EquipmentPage";
import ViewEquipment from "./components/Configuration/Equipment/ViewEquipment";
import AddParameterPage from "./components/Configuration/Equipment/AddParameterPage";
import ComplianceClinical from "./pages/Compliance/Clinical";
import ComplianceLab from "./pages/Compliance/Lab";
import DocConfiguration from "./pages/Document_Control/Configuration";
import Documents from "./pages/Document_Control/Documents";
import RecycleBin from "./pages/Document_Control/RecycleBin";
import DocReports from "./pages/Document_Control/Reports";
import WorkFlows from "./pages/Document_Control/WorkFlows";
import RiskA from "./pages/Risk_Management/Risk_A";
import { fetchAssigneesByClinic } from "./store/assigneeSlice";
import DepartmentLayout from "./pages/Quality_Control/QcLab/Department/DepartmentLayout";
import LabEquipments from "./pages/Quality_Control/QcLab/Department/LabEquipment";
import LabEnvironment from "./pages/Quality_Control/QcLab/Department/LabEnvironment";
import { fetchEventsByClinic } from "./store/eventSlice";

function AppRoute() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchClinic(1));
    dispatch(fetchAssigneesByClinic(1));
    dispatch(fetchEventsByClinic(1));
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* ================= DASHBOARD ================= */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin-dashboard" element={<AdminDashboard />} />

        {/* ================= QUALITY CONTROL ================= */}
        <Route path="clinical" element={<Clinical />} />
        <Route path="reports" element={<Reports />} />

        {/* ================= QC LAB ================= */}
        <Route path="qc-lab" element={<LabLayout />}>
          <Route index element={<Navigate to="embryology" replace />} />

          <Route path=":department" element={<DepartmentLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<LabEquipments />} />
            <Route path="environment" element={<LabEnvironment />} />
            <Route path="task" element={<Task />} />
          </Route>
        </Route>

        {/* ================= QUALITY CONTROL CONFIGURATION ================= */}
        <Route path="configuration" element={<ConfigurationLayout />}>
          <Route index element={<Navigate to="events" replace />} />

          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="equipment/view" element={<ViewEquipment />} />
          <Route
            path="equipment/add-parameter"
            element={<AddParameterPage />}
          />
          <Route path="environment" element={<EquipmentPage />} />
          <Route
            path="environment/add-parameter"
            element={<AddParameterPage />}
          />

          {/* ================= EVENTS ================= */}
          <Route path="events" element={<Events />} />
          <Route path="events/create" element={<CreateEvent />} />
        </Route>

        {/* ================= USER CONFIGURATION ================= */}
        <Route path="user-configuration" element={<UserConfiguration />} />

        {/* ================= COMPLIANCE ================= */}
        <Route path="compliance/clinical" element={<ComplianceClinical />} />
        <Route path="compliance/lab" element={<ComplianceLab />} />

        {/* ================= DOCUMENT CONTROL ================= */}
        <Route
          path="document-control/configuration"
          element={<DocConfiguration />}
        />
        <Route path="document-control/documents" element={<Documents />} />
        <Route path="document-control/recycle-bin" element={<RecycleBin />} />
        <Route path="document-control/reports" element={<DocReports />} />
        <Route path="document-control/workflows" element={<WorkFlows />} />

        {/* ================= RISK MANAGEMENT ================= */}
        <Route path="risk-management" element={<RiskA />} />

        {/* ================= OTHERS ================= */}
        <Route path="audit-trail" element={<AuditTrail />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoute;
