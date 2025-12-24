import React, { useState, useEffect, useMemo } from "react";
import { Box, Container, Grid } from "@mui/material";
import DepartmentTabs from "@/components/Dashboard/DepartmentTabs";
import EquipmentCards from "@/components/Dashboard/EquipmentCards";
import ParameterTabs from "@/components/Dashboard/ParameterTabs";
import ParameterChart from "@/components/Dashboard/ParameterChart";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import IncidentsChart from "@/components/Dashboard/IncidentsChart";
import AverageParameterCards from "@/components/Dashboard/AverageParameterCards";
import AssigneePanel from "@/components/Dashboard/AssigneePanel";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import type { Equipment, Parameter } from "@/types";
import {
  initializeMockData,
  mockEquipments,
  mockParameters,
} from "@/utils/mockData";

const Dashboard = () => {
  const [selectedDepartment, setSelectedDepartment] =
    useState("Embryology");

  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);

  const [selectedParameter, setSelectedParameter] =
    useState<Parameter | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      await initializeMockData(1); // re-fetch latest backend state
      
      const filtered = mockEquipments.filter(
        (eq) =>
          eq.department?.name?.trim().toLowerCase() ===
          selectedDepartment.trim().toLowerCase()
      );
  
      setEquipments(filtered);
  
      if (filtered.length > 0) {
        setSelectedEquipment(filtered[0]);
  
        const params = mockParameters.filter(
          (p) => p.equipment_id === filtered[0].id
        );
        setParameters(params);
        setSelectedParameter(params[0] || null);
      }
    };
  
    load();
  }, [selectedDepartment]);

  const clinic = JSON.parse(localStorage.getItem("clinic") || "{}");

  const equipmentDetails = useMemo(() => {
    const clinic = JSON.parse(localStorage.getItem("clinic") || "{}");
  
    const dept = clinic.department?.find(
      (d: any) =>
        d.name?.toLowerCase() === selectedDepartment.toLowerCase()
    );
  
    const equipment = dept?.equipments?.find(
      (e: any) =>
        e.equipment_name?.toLowerCase() ===
        selectedEquipment?.equipment_name?.toLowerCase()
    );
  
    return equipment?.equipment_details || [];
  }, [selectedDepartment, selectedEquipment]);
  
  // ===============================
  // DEPARTMENT CHANGE
  // ===============================
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };

  // ===============================
  // EQUIPMENT SELECT
  // ===============================
  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  // ===============================
  // PARAMETER SELECT
  // ===============================
  const handleParameterSelect = (parameter: Parameter) => {
    setSelectedParameter(parameter);
  };

  // ===============================
  // FILTER EQUIPMENT BY DEPARTMENT
  // ===============================
  useEffect(() => {
    const filtered = mockEquipments.filter(
      (eq) =>
        eq.department?.name?.trim().toLowerCase() ===
        selectedDepartment.trim().toLowerCase()
    );
    setEquipments(filtered);
    if (filtered.length > 0) {
      const firstEquipment = filtered[0];
      setSelectedEquipment(firstEquipment);
      const equipmentParams = mockParameters.filter(
        (p) => p.equipment_id === firstEquipment.id
      );
      setParameters(equipmentParams);
      setSelectedParameter(equipmentParams[0] || null);
    } else {
      setSelectedEquipment(null);
      setParameters([]);
      setSelectedParameter(null);
    }
  }, [selectedDepartment]);
  // ===============================
  // LOAD PARAMETERS ON EQUIPMENT CHANGE
  // ===============================
  useEffect(() => {
    if (!selectedEquipment) return;
    const equipmentParams = mockParameters.filter(
      (p) => p.equipment_id === selectedEquipment.id
    );
    setParameters(equipmentParams);
    setSelectedParameter(equipmentParams[0] || null);
  }, [selectedEquipment]);
  // ===============================
  // MAP PARAMETER → ACTIVITY TYPE
  // ===============================
  const getParameterType = (parameterName: string) => {
    const name = parameterName.toLowerCase().replace("₂", "2");

    if (name.includes("co2")) return "co2";
    if (name.includes("humid")) return "humidity";
    if (name.includes("air")) return "airflow";

    return "temperature";
  };
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <DashboardHeader />
      <DepartmentTabs
        selected={selectedDepartment}
        onChange={handleDepartmentChange}
      />

      {/* ===================== */}
      {/* EQUIPMENT CARDS */}
      {/* ===================== */}
      <Box sx={{ overflowX: "auto", pb: 1 }}>
        <Box sx={{ display: "inline-flex", gap: 2 }}>
          {equipments.map((eq) => (
            <EquipmentCards
              key={eq.id}
              equipments={[eq]}
              selected={selectedEquipment}
              onSelect={handleEquipmentSelect}
              loading={loading}
            />
          ))}
        </Box>
      </Box>
      {selectedEquipment && (
        <>
          <ParameterTabs
            parameters={parameters}
            selected={selectedParameter}
            onSelect={handleParameterSelect}
            loading={loading}
          />
          {selectedParameter && (
            <Box sx={{ mt: 3 }}>
              {/* ===================== */}
              {/* TOP ROW */}
              {/* ===================== */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <ParameterChart
                    equipmentId={selectedEquipment.id}
                    parameterId={selectedParameter.id}
                    parameterName={selectedParameter.parameter_name}
                    unit={selectedParameter.Content.unit || ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  {/* 🔥 NO equipmentId → SHOW ALL ACTIVITIES */}
                  <RecentActivity
                    parameterType={getParameterType(
                      selectedParameter.parameter_name
                    )}
                  />
                </Grid>
              </Grid>
              {/* ===================== */}
              {/* BOTTOM ROW */}
              {/* ===================== */}
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <IncidentsChart
                    equipmentId={selectedEquipment.id}
                    equipmentDetails={equipmentDetails}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <AverageParameterCards
                    equipmentId={selectedEquipment.id}
                    // parameterId={selectedParameter.id}
                    // parameterName={selectedParameter.parameter_name}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <AssigneePanel
                    equipmentId={selectedEquipment.id}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
export default Dashboard;