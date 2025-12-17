import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Configuration from './pages/Configuration';
import UserConfiguration from './pages/UserConfiguration';
import Reports from './pages/Reports';
import Clinical from './pages/Clinical';
import Lab from './pages/Lab';
import AuditTrail from './pages/AuditTrail';
import { useEffect } from 'react';
import { initializeMockData } from "@/utils/mockData";
import AddParameterPage from './components/Configuration/AddParameterPage';
import ViewEquipment from './components/Configuration/ViewEquipment';
import EquipmentPage from './components/Configuration/EquipmentPage';

function App() {
  

useEffect(() => {
  initializeMockData(1); // clinic_id = 1
}, []);


  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="configuration" element={<Configuration />} />
        <Route path="configuration/equipment" element={<EquipmentPage />} />
        <Route path="configuration/equipment/view" element={<ViewEquipment />} />
        <Route path="configuration/equipment/add-parameter" element={<AddParameterPage />} />
        <Route path="user-configuration" element={<UserConfiguration />} />
        <Route path="clinical" element={<Clinical />} />
        <Route path="lab" element={<Lab />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
       
      </Route>
    </Routes>
  );
}

export default App;

