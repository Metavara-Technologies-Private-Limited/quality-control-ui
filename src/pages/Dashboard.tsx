import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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

const Dashboard = () => {
  // Pull clinic data + loading state from Redux
  const { data: clinic, loading } = useSelector(
    (state: RootState) => state.clinic
  ) as RootState["clinic"];
  console.info("data:", clinic)

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [parameterId, setParameterId] = useState<number | null>(null);

  // Get All Departments
  const departments = clinic?.department ?? [];
  // Set first department as selected initially
  useEffect(() => {
    if (!departments.length) {
      setDepartmentId(null);
      return;
    }
    setDepartmentId(departments[0].id);
  }, [departments]);

  const department = useMemo(
    () => departments.find((d) => d.id === departmentId) ?? null,
    [departments, departmentId]
  );

  // When department changes, auto select first ones for equipment, parameter
  useEffect(() => {
    if (!department) {
      setEquipmentId(null);
      setParameterId(null);
      return;
    }

    const firstEquipment = department.equipments?.[0] ?? null;

    setEquipmentId(firstEquipment?.id ?? null);
    setParameterId(firstEquipment?.parameters?.[0]?.id ?? null);
  }, [department]);

  // Get All Equipments
  const equipments = department?.equipments ?? [];

  const equipment: Equipment | null = useMemo(
    () => equipments.find((e) => e.id === equipmentId) ?? null,
    [equipments, equipmentId]
  );

  // Get All parameters
  const parameters = equipment?.parameters ?? [];

  const parameter: Parameter | null = useMemo(
    () => parameters.find((p) => p.id === parameterId) ?? null,
    [parameters, parameterId]
  );

  const equipmentDetails = equipment?.equipment_details ?? [];
  const activeValue = parameter?.parameter_values?.[0];

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <DashboardHeader />

      <DepartmentTabs
        departments={departments}
        selected={departmentId}
        onChange={setDepartmentId}
      />

      <Box sx={{ overflowX: "auto", pb: 1 }}>
        <Box sx={{ display: "inline-flex", gap: 2 }}>
          {equipments.map((eq) => (
            <EquipmentCards
              key={eq.id}
              equipments={[eq]}
              selected={equipment}
              onSelect={(e) => {
                setEquipmentId(e.id);
                setParameterId(null);
              }}
              loading={loading}
            />
          ))}
        </Box>
      </Box>

      {equipment && parameter && (
        <>
          <ParameterTabs
            parameters={parameters}
            selected={parameterId}
            onSelect={setParameterId}
            loading={loading}
          />

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <ParameterChart
                  equipmentId={equipment.id}
                  parameterId={parameter.id}
                  parameterName={parameter.parameter_name}
                  unit={activeValue?.content.unit || ""}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RecentActivity parameterName={parameter.parameter_name} />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <IncidentsChart
                  equipmentId={equipment.id}
                  equipmentDetails={equipmentDetails}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <AverageParameterCards equipmentId={equipment.id} />
              </Grid>

              <Grid item xs={12} md={4}>
                <AssigneePanel equipmentId={equipment.id} />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
