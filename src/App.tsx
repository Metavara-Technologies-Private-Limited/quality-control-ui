import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { fetchClinic } from "./store/clinicSlice";

import MainLayout from "./components/Layout/MainLayout";

/* ================= GLOBAL PAGES ================= */
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Configuration from "./pages/Configuration";
import UserConfiguration from "./pages/UserConfiguration";
import AuditTrail from "./pages/AuditTrail";

/* ================= QUALITY CONTROL ================= */
import Clinical from "./pages/Quality_Control/Clinical";
import Reports from "./pages/Quality_Control/Reports";

/* ================= QC CONFIGURATION ================= */
import ConfigurationLayout from "./pages/Quality_Control/Configuration/ConfigurationLayout";
import Events from "./pages/Quality_Control/Configuration/Events";
import CreateEvent from "./pages/Quality_Control/Configuration/CreateEvent";

/* ================= QC LAB ================= */
import LabLayout from "./pages/Quality_Control/QcLab/LabLayout";

import EmbryologyLayout from "./pages/Quality_Control/QcLab/Embryology/EmbryologyLayout";
import Task from "./pages/Quality_Control/QcLab/Embryology/Task";
import Equipment from "./pages/Quality_Control/QcLab/Embryology/Equipments";
import Environment from "./pages/Quality_Control/QcLab/Embryology/Environment";

import AndrologyLayout from "./pages/Quality_Control/QcLab/Andrology/AndrologyLayout";
import CryopreservationLayout from "./pages/Quality_Control/QcLab/Cryopreservation/CryopreservationLayout";

/* ================= CONFIGURATION COMPONENTS ================= */
import EquipmentPage from "./components/Configuration/EquipmentPage";
import ViewEquipment from "./components/Configuration/ViewEquipment";
import AddParameterPage from "./components/Configuration/AddParameterPage";

/* ================= COMPLIANCE ================= */
import ComplianceClinical from "./pages/Compliance/Clinical";
import ComplianceLab from "./pages/Compliance/Lab";

/* ================= DOCUMENT CONTROL ================= */
import DocConfiguration from "./pages/Document_Control/Configuration";
import Documents from "./pages/Document_Control/Documents";
import RecycleBin from "./pages/Document_Control/RecycleBin";
import DocReports from "./pages/Document_Control/Reports";
import WorkFlows from "./pages/Document_Control/WorkFlows";

/* ================= RISK MANAGEMENT ================= */
import RiskA from "./pages/Risk_Management/Risk_A";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchClinic(1));
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
            <Route index element={<Navigate to="task" replace />} />
            <Route path="task" element={<Task />} />
            <Route path="equipments" element={<Equipment />} />
            <Route path="environment" element={<Environment />} />
          </Route>

          <Route path="andrology" element={<AndrologyLayout />} />
          <Route
            path="cryopreservation"
            element={<CryopreservationLayout />}
          />
        </Route>

        {/* ================= QUALITY CONTROL CONFIGURATION ================= */}
        <Route path="configuration" element={<ConfigurationLayout />}>
          <Route index element={<Navigate to="equipment" replace />} />

          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="equipment/view" element={<ViewEquipment />} />
          <Route path="equipment/add-parameter" element={<AddParameterPage />} />

          {/* EVENTS */}
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