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
// import DashboardHeader from "@/components/Dashboard/DashboardHeader";

import type { Equipment, Parameter } from "@/types";
import { parameterValueApi } from "@/services/api";

const Dashboard = () => {
  // Pull clinic data + loading state from Redux
  const { data: clinic, loading } = useSelector(
    (state: RootState) => state.clinic,
  ) as RootState["clinic"];
  console.info("data:", clinic);

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [parameterId, setParameterId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [parameterValues, setParameterValues] = useState<any[]>([]);
  const [valuesLoading, setValuesLoading] = useState(false);

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
    [departments, departmentId],
  );

  // Get All Equipments
  const equipments = useMemo(() => {
    if (!department) return [];

    if (!search.trim()) return department.equipments ?? [];

    return (department.equipments ?? []).filter((eq) =>
      eq.equipment_name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [department, search]);

  const equipment: Equipment | null = useMemo(
    () => equipments.find((e) => e.id === equipmentId) ?? null,
    [equipments, equipmentId],
  );

  useEffect(() => {
    if (!equipments.length) {
      setEquipmentId(null);
      setParameterId(null);
      return;
    }

    // if currently selected equipment is NOT in filtered list
    const exists = equipments.some((eq) => eq.id === equipmentId);

    if (!exists) {
      setEquipmentId(equipments[0].id);
      setParameterId(equipments[0].parameters?.[0]?.id ?? null);
    }
  }, [equipments, equipmentId]);

  // Get All parameters
  const parameters = equipment?.parameters ?? [];

  useEffect(() => {
    if (!parameters.length) {
      setParameterId(null);
      return;
    }

    const exists = parameters.some((p) => p.id === parameterId);
    if (!exists) {
      setParameterId(parameters[0].id);
    }
  }, [parameters]);

  const parameter: Parameter | null = useMemo(
    () => parameters.find((p) => p.id === parameterId) ?? null,
    [parameters, parameterId],
  );

  useEffect(() => {
    if (!parameterId) {
      setParameterValues([]);
      return;
    }

    const loadValues = async () => {
      setValuesLoading(true);
      try {
        const { data = [] } =
          await parameterValueApi.listByParameter(parameterId);
        setParameterValues(data);
      } finally {
        setValuesLoading(false);
      }
    };

    loadValues();
  }, [parameterId]);

  const equipmentDetails = equipment?.equipment_details ?? [];
  const activeValue = parameter?.config;

  return (
    <Container maxWidth={false} disableGutters>
      {/* <DashboardHeader /> */}

      <DepartmentTabs
        departments={departments}
        selected={departmentId}
        onChange={setDepartmentId}
        onSearch={(val) => setSearch(val)}
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
                  equipmentDetails={equipmentDetails}
                  parameterId={parameter.id}
                  parameterName={parameter.parameter_name}
                  unit={activeValue?.unit || ""}
                  values={parameterValues}
                  loading={valuesLoading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RecentActivity
                  parameterId={parameter.id}
                  parameterName={parameter.parameter_name}
                  unit={activeValue?.unit || ""}
                  equipmentDetails={equipmentDetails}
                  values={parameterValues}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <IncidentsChart
                  equipmentDetails={equipmentDetails}
                  values={parameterValues}
                  parameterConfig={parameter?.config || {}}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <AverageParameterCards
                  equipmentId={equipment.id}
                  equipmentDetails={equipment.equipment_details}
                  parameter={parameter}
                  values={parameterValues}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <AssigneePanel
                  departmentName={department?.name ?? ""}
                  equipmentId={equipment?.id ?? null}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
