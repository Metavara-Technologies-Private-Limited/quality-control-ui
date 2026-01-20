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
import CreateEvent from "./pages/Quality_Control/Configuration/CreateEvent";

import LabLayout from "./pages/Quality_Control/QcLab/LabLayout";

import EmbryologyLayout from "./pages/Quality_Control/QcLab/Embryology/EmbryologyLayout";
import Equipment from "./pages/Quality_Control/QcLab/Embryology/Equipments";
import Environment from "./pages/Quality_Control/QcLab/Embryology/Environment";
import Task from "./pages/Quality_Control/QcLab/Embryology/Task";

import AndrologyLayout from "./pages/Quality_Control/QcLab/Andrology/AndrologyLayout";
import AndrologyEquipment from "./pages/Quality_Control/QcLab/Andrology/Equipments";
import AndrologyEnvironment from "./pages/Quality_Control/QcLab/Andrology/Environment";

import CryopreservationLayout from "./pages/Quality_Control/QcLab/Cryopreservation/CryopreservationLayout";
import CryoEquipment from "./pages/Quality_Control/QcLab/Cryopreservation/Equipments";
import CryoEnvironment from "./pages/Quality_Control/QcLab/Cryopreservation/Environment";

import EnvironmentalLayout from "./pages/Quality_Control/QcLab/Environmental/EnvironmentalLayout";
import EnvEquipment from "./pages/Quality_Control/QcLab/Environmental/Equipment";
import EnvEnvironment from "./pages/Quality_Control/QcLab/Environmental/Environment";

import LabEquipmentLayout from "./pages/Quality_Control/QcLab/LabEquipment/LabEquipmentLayout";
import LabEquipEquipment from "./pages/Quality_Control/QcLab/LabEquipment/Equipment";
import LabEquipEnvironment from "./pages/Quality_Control/QcLab/LabEquipment/Environment";

import EquipmentPage from "./components/Configuration/EquipmentPage";
import ViewEquipment from "./components/Configuration/ViewEquipment";
import AddParameterPage from "./components/Configuration/AddParameterPage";

import ComplianceClinical from "./pages/Compliance/Clinical";
import ComplianceLab from "./pages/Compliance/Lab";

import DocConfiguration from "./pages/Document_Control/Configuration";
import Documents from "./pages/Document_Control/Documents";
import RecycleBin from "./pages/Document_Control/RecycleBin";
import DocReports from "./pages/Document_Control/Reports";
import WorkFlows from "./pages/Document_Control/WorkFlows";

import RiskA from "./pages/Risk_Management/Risk_A";
import { fetchAssigneesByClinic } from "./store/assigneeSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchClinic(1));
    dispatch(fetchAssigneesByClinic(1));
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

          <Route path="embryology" element={<EmbryologyLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<Equipment />} />
            <Route path="environment" element={<Environment />} />
            <Route path="task" element={<Task />} />
          </Route>

          <Route path="andrology" element={<AndrologyLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<AndrologyEquipment />} />
            <Route path="environment" element={<AndrologyEnvironment />} />
            <Route path="task" element={<Task />} />
          </Route>

          <Route path="cryopreservation" element={<CryopreservationLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<CryoEquipment />} />
            <Route path="environment" element={<CryoEnvironment />} />
            <Route path="task" element={<Task />} />
          </Route>

          <Route path="environmental" element={<EnvironmentalLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<EnvEquipment />} />
            <Route path="environment" element={<EnvEnvironment />} />
            <Route path="task" element={<Task />} />
          </Route>

          <Route path="labequipment" element={<LabEquipmentLayout />}>
            <Route index element={<Navigate to="equipments" replace />} />
            <Route path="equipments" element={<LabEquipEquipment />} />
            <Route path="environment" element={<LabEquipEnvironment />} />
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

export default App;
