import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper,
  Button,
  LinearProgress,
} from "@mui/material";
import { Search, FileUpload, FileDownload } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
// import { parameterValueApi } from "@/services/api";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { fetchReports } from "@/store/reportsSlice";

import ImportCSVPopup from "./QcLab/Department/ImportCSVPopup";

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();
  // combine lab and clinical departments so reports include both types
  const labDepts = useSelector(
    (s: RootState) => s.clinic.labData?.department ?? [],
  );
  const clinicalDepts = useSelector(
    (s: RootState) => s.clinic.clinicData?.department ?? [],
  );

  // const [logs, setLogs] = useState<any[]>([]);
  const logs = useSelector((s: RootState) => s.reports.logs);
  const loading = useSelector((s: RootState) => s.reports.loading);
  const progress = useSelector((s: RootState) => s.reports.progress);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<any>("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const departments = useMemo(
    () => [...labDepts, ...clinicalDepts],
    [labDepts, clinicalDepts],
  );

  const normalizedSelectedDepartment =
    selectedDepartment === "all" ? "all" : Number(selectedDepartment);

  /* -------- Equipment Map -------- */

  const equipmentMap = useMemo(() => {
    const map = new Map<number, any>();

    departments.forEach((d) => {
      d.equipments?.forEach((eq) => {
        eq.equipment_details?.forEach((ed) => {
          if (ed.id != null) {
            map.set(ed.id, {
              equipment_name: eq.equipment_name,
              equipment_num: ed.equipment_num,
              department_id: d.id,
            });
          }
        });
      });
    });

    return map;
  }, [departments]);

  /* -------- Parameter Metadata Map -------- */

  const parameterMetaMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string }>();

    departments.forEach((d) => {
      d.equipments?.forEach((eq) => {
        eq.parameters?.forEach((p) => {
          if (!p.id) return;

          map.set(p.id, {
            name: p.parameter_name || "Unknown Parameter",
            unit: p.config?.unit ?? "-",
          });
        });
      });
    });

    return map;
  }, [departments]);

  /* -------- Load ALL logs -------- */

  const allParamIds = useMemo(() => {
    const ids = departments.flatMap(
      (d) =>
        d.equipments?.flatMap(
          (eq) =>
            eq.parameters
              ?.map((p) => Number(p.id))
              .filter((id) => Number.isFinite(id) && id > 0) ?? [],
        ) ?? [],
    );

    return Array.from(new Set(ids));
  }, [departments]);

  useEffect(() => {
    if (!allParamIds.length) return;

    dispatch(fetchReports(allParamIds));

    const intervalId = window.setInterval(() => {
      dispatch(fetchReports(allParamIds));
    }, 5000);

    const onFocus = () => {
      dispatch(fetchReports(allParamIds));
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchReports(allParamIds));
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [allParamIds, dispatch]);

  /* -------- Build rows -------- */

  const rows = useMemo(() => {
    const mappedRows = logs
      .map((log, index) => {
        const eq = equipmentMap.get(Number(log.equipment_details_id));
        const param = parameterMetaMap.get(Number(log.parameter_id));

        if (!eq) return null;

        const createdAt = dayjs(log.created_at);

        return {
          id: log.id || index,
          department: eq.department_id,
          equipment: eq.equipment_num,
          parameter: param?.name ?? "-",
          unit: param?.unit ?? "-",
          value: log.content ?? "-",
          timestamp: createdAt.valueOf(),
          date: createdAt.isValid()
            ? createdAt.format("DD/MM/YYYY HH:mm")
            : "-",
        };
      })
      .filter(Boolean) as any[];

    mappedRows.sort((a, b) => {
      const byTime = b.timestamp - a.timestamp;
      if (byTime !== 0) return byTime;
      return Number(b.id) - Number(a.id);
    });

    return mappedRows.filter((row: any) => {
      if (
        normalizedSelectedDepartment !== "all" &&
        Number(row.department) !== normalizedSelectedDepartment
      )
        return false;

      if (selectedEquipment !== "all" && row.equipment !== selectedEquipment)
        return false;

      if (search) {
        return Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      }

      return true;
    });
  }, [
    logs,
    equipmentMap,
    parameterMetaMap,
    selectedDepartment,
    selectedEquipment,
    search,
    normalizedSelectedDepartment,
  ]);

  const equipmentOptions = useMemo(() => {
    const seen = new Set<string>();

    const items = Array.from(equipmentMap.values())
      .filter((e: any) =>
        normalizedSelectedDepartment === "all"
          ? true
          : Number(e.department_id) === normalizedSelectedDepartment,
      )
      .filter((e: any) => {
        const key = String(e.equipment_num);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((e: any) => ({
        value: e.equipment_num,
        label: `${e.equipment_name} (${e.equipment_num})`,
      }));

    return items.sort((a, b) => a.label.localeCompare(b.label));
  }, [equipmentMap, normalizedSelectedDepartment]);

  const selectedDepartmentLabel = useMemo(() => {
    if (selectedDepartment === "all") return "All Departments";

    const selected = departments.find(
      (d) => Number(d.id) === Number(selectedDepartment),
    );
    return selected?.name ?? "All Departments";
  }, [departments, selectedDepartment]);

  const selectedEquipmentLabel = useMemo(() => {
    if (selectedEquipment === "all") return "All Equipments";

    const selected = equipmentOptions.find(
      (option) => option.value === selectedEquipment,
    );
    return selected?.label ?? "All Equipments";
  }, [equipmentOptions, selectedEquipment]);

  const departmentSelectWidth = useMemo(() => {
    const widthInCh = Math.min(
      30,
      Math.max(14, selectedDepartmentLabel.length + 4),
    );
    return `${widthInCh}ch`;
  }, [selectedDepartmentLabel]);

  const equipmentSelectWidth = useMemo(() => {
    const widthInCh = Math.min(
      38,
      Math.max(14, selectedEquipmentLabel.length + 4),
    );
    return `${widthInCh}ch`;
  }, [selectedEquipmentLabel]);

  useEffect(() => {
    if (selectedEquipment === "all") return;

    const isAvailable = equipmentOptions.some(
      (option) => option.value === selectedEquipment,
    );

    if (!isAvailable) {
      setSelectedEquipment("all");
    }
  }, [equipmentOptions, selectedEquipment]);

  const showInitialLoading = loading && logs.length === 0;

  /* -------- Export Excel -------- */

  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const excelData = rows.map((row: any) => ({
      "Date & Time": row.date,
      Equipment: row.equipment,
      Parameter: row.parameter,
      Unit: row.unit,
      Value: row.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const fileName = `Reports_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Reports exported successfully");
  };

  /* -------- Columns -------- */

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date & Time", flex: 1.5, minWidth: 180 },
    { field: "equipment", headerName: "Equipment", flex: 1.3, minWidth: 150 },
    { field: "parameter", headerName: "Parameter", flex: 1.3, minWidth: 150 },
    { field: "unit", headerName: "Unit", flex: 0.8, minWidth: 100 },
    { field: "value", headerName: "Value", flex: 1, minWidth: 120 },
  ];

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Reports
      </Typography>

      {/* Filters */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ width: departmentSelectWidth }}>
            <InputLabel>Department</InputLabel>

            <Select
              autoWidth
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>

              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: equipmentSelectWidth }}>
            <InputLabel>Equipment</InputLabel>

            <Select
              autoWidth
              value={selectedEquipment}
              label="Equipment"
              onChange={(e) => setSelectedEquipment(e.target.value)}
            >
              <MenuItem value="all">All Equipments</MenuItem>

              {equipmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", ml: "auto" }}>
          <TextField
            size="small"
            placeholder="Search across all columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              onClick={handleExportExcel}
              sx={{
                borderRadius: "8px",
                borderColor: "#505050",
                color: "#505050",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={() => setImportDialogOpen(true)}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#505050",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#232323" },
              }}
            >
              Import CSV
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      {showInitialLoading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Loading all logs... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
      <Paper sx={{ height: 520 }}>
        <DataGrid rows={rows} columns={columns} />
      </Paper>
      <ImportCSVPopup
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        parameters={[]}
        onImport={() => {}}
      />
    </Container>
  );
};

export default Reports;
