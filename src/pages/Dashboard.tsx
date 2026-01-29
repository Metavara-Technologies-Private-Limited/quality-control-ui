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

import type { Equipment, Parameter } from "@/types";
import { parameterValueApi } from "@/services/api";

const Dashboard = () => {
  /** ------------------ REDUX STATE ------------------ **/
  const { data: clinic, loading } = useSelector(
    (state: RootState) => state.clinic,
  ) as RootState["clinic"];

  /** ------------------ LOCAL UI STATE ------------------ **/
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [parameterId, setParameterId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [parameterValues, setParameterValues] = useState<any[]>([]);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [sort, setSort] = useState<"asc" | "desc" | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  /** ------------------ DEPARTMENTS ------------------ **/
  const departments = clinic?.department ?? [];

  useEffect(() => {
    if (departments.length) setDepartmentId(departments[0].id);
    else setDepartmentId(null);
  }, [departments]);

  const department = useMemo(
    () => departments.find((d) => d.id === departmentId) ?? null,
    [departments, departmentId],
  );

  /** ------------------ EQUIPMENTS ------------------ **/
  const equipments = useMemo(() => {
    if (!department) return [];

    let list = department.equipments ?? [];

    if (search.trim()) {
      list = list.filter((eq) =>
        eq.equipment_name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (sort) {
      list = [...list].sort((a, b) =>
        sort === "asc"
          ? a.equipment_name.localeCompare(b.equipment_name)
          : b.equipment_name.localeCompare(a.equipment_name),
      );
    }

    return list;
  }, [department, search, sort, filter]);

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

    if (!equipments.some((eq) => eq.id === equipmentId)) {
      setEquipmentId(equipments[0].id);
      setParameterId(equipments[0].parameters?.[0]?.id ?? null);
    }
  }, [equipments, equipmentId]);

  /** ------------------ PARAMETERS ------------------ **/
  const parameters = equipment?.parameters ?? [];

  useEffect(() => {
    if (!parameters.length) {
      setParameterId(null);
      return;
    }
    if (!parameters.some((p) => p.id === parameterId)) {
      setParameterId(parameters[0].id);
    }
  }, [parameters, parameterId]);

  const parameter: Parameter | null = useMemo(
    () => parameters.find((p) => p.id === parameterId) ?? null,
    [parameters, parameterId],
  );

  /** ------------------ PARAMETER VALUES ------------------ **/
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

  /** ------------------ RENDER ------------------ **/
  return (
    <Container maxWidth={false} disableGutters>
      {/* Department Tabs */}
      <DepartmentTabs
        departments={departments}
        selected={departmentId}
        onChange={setDepartmentId}
        onSearch={(value) => {
          setSearch(value);
          setFilter(value.trim() ? "search" : null);
        }}
        onSort={() =>
          setSort((s) => (s === null ? "asc" : s === "asc" ? "desc" : null))
        }
        onFilter={() => setFilter((f) => (f ? null : "active"))}
        sortActive={!!sort}
        filterActive={!!filter}
      />

      {/* Equipment Cards */}
      <Box sx={{ overflowX: "auto"}}>
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

      {/* Parameter Tabs + Charts */}
      {equipment && parameter && (
        <>
          <ParameterTabs
            parameters={parameters}
            selected={parameterId}
            onSelect={setParameterId}
            loading={loading}
          />

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <ParameterChart
                  equipmentDetails={equipmentDetails}
                  parameterName={parameter.parameter_name}
                  unit={activeValue?.unit || ""}
                  values={parameterValues}
                  loading={valuesLoading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RecentActivity
                  parameterName={parameter.parameter_name}
                  unit={activeValue?.unit || ""}
                  equipmentDetails={equipmentDetails}
                  values={parameterValues}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
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
