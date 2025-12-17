import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';

import DepartmentTabs from '@/components/Dashboard/DepartmentTabs';
import EquipmentCards from '@/components/Dashboard/EquipmentCards';
import ParameterTabs from '@/components/Dashboard/ParameterTabs';
import ParameterChart from '@/components/Dashboard/ParameterChart';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import IncidentsChart from '@/components/Dashboard/IncidentsChart';
import AverageParameterCards from '@/components/Dashboard/AverageParameterCards';
import AssigneePanel from '@/components/Dashboard/AssigneePanel';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

import type { Equipment, Parameter } from '@/types';
import { mockEquipments, mockParameters } from '@/utils/mockData';

const Dashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('Embryology');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading] = useState(false);

<<<<<<< Updated upstream
  /* ---------- FILTER EQUIPMENTS ---------- */
=======
  // ===============================
  // FILTER EQUIPMENT BY DEPARTMENT
  // ===============================
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  /* ---------- LOAD PARAMETERS ---------- */
=======
  // ===============================
  // LOAD PARAMETERS ON EQUIPMENT CHANGE
  // ===============================
>>>>>>> Stashed changes
  useEffect(() => {
    if (!selectedEquipment) return;

    const equipmentParams = mockParameters.filter(
      (p) => p.equipment_id === selectedEquipment.id
    );

    setParameters(equipmentParams);
    setSelectedParameter(equipmentParams[0] || null);
  }, [selectedEquipment]);

<<<<<<< Updated upstream
=======
  // ===============================
  // HANDLERS
  // ===============================
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedEquipment(null);
    setSelectedParameter(null);
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setSelectedParameter(null);
  };

  const handleParameterSelect = (parameter: Parameter) => {
    setSelectedParameter(parameter);
  };

  // ===============================
  // MAP PARAMETER → ACTIVITY TYPE
  // ===============================
  /**
   * IMPORTANT:
   * Activity.type supports ONLY:
   * "temperature" | "humidity" | "co2" | "assignee" | "other"
   *
   * Laminar Flow parameters MUST use "other"
   */
  const getParameterType = (parameterName: string) => {
    const name = parameterName.toLowerCase().replace('₂', '2');

    if (name.includes('co2')) return 'co2';
    if (name.includes('humid')) return 'humidity';

    // Laminar Flow parameters
    if (
      name.includes('airflow') ||
      name.includes('hepa') ||
      name.includes('uv')
    ) {
      return 'other';
    }

    // Default (Incubator temperature, etc.)
    return 'temperature';
  };

  // ===============================
  // RENDER
  // ===============================
>>>>>>> Stashed changes
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <DashboardHeader />

      <DepartmentTabs
        selected={selectedDepartment}
        onChange={setSelectedDepartment}
      />

<<<<<<< Updated upstream
      {/* ---------- EQUIPMENT CARDS ---------- */}
=======
      {/* EQUIPMENT CARDS */}
>>>>>>> Stashed changes
      <Box
        sx={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: 10,
          },
        }}
      >
        <Box sx={{ display: 'inline-flex', gap: 2 }}>
          {equipments.map((eq) => (
            <EquipmentCards
              key={eq.id}
              equipments={[eq]}
              selected={selectedEquipment}
              onSelect={setSelectedEquipment}
              loading={loading}
            />
          ))}
        </Box>
      </Box>

      {/* PARAMETERS */}
      {selectedEquipment && (
        <>
          <ParameterTabs
            parameters={parameters}
            selected={selectedParameter}
            onSelect={setSelectedParameter}
            loading={loading}
          />

          {selectedParameter && (
            <Box sx={{ mt: 3 }}>
<<<<<<< Updated upstream
              {/* ---------- TOP ROW ---------- */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '2fr 1fr',
                  },
=======
              {/* TOP ROW */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
>>>>>>> Stashed changes
                  gap: 3,
                  mb: 3,
                }}
              >
                <ParameterChart
                  equipmentId={selectedEquipment.id}
                  parameterId={selectedParameter.id}
                  parameterName={selectedParameter.parameter_name}
                  unit={selectedParameter.Content.unit}
                />

                <RecentActivity
                  equipmentId={selectedEquipment.id}
                  parameterType={getParameterType(
                    selectedParameter.parameter_name
                  )}
                />
              </Box>

<<<<<<< Updated upstream
              {/* ---------- 🔥 FINAL 3 CARD GRID (FIXED) ---------- */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 3,
                  alignItems: 'stretch',
=======
              {/* BOTTOM ROW */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: 3,
>>>>>>> Stashed changes
                }}
              >
                <IncidentsChart equipmentId={selectedEquipment.id} />

                <AverageParameterCards
                  equipmentId={selectedEquipment.id}
                  parameterId={selectedParameter.id}
                  parameterName={selectedParameter.parameter_name}
                />

                <AssigneePanel equipmentId={selectedEquipment.id} />
              </Box>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
