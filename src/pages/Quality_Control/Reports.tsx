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
import { fetchReports, markFetchedParams } from "@/store/reportsSlice";

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

  const fetchedParams = useSelector((s: RootState) => s.reports.fetchedParams);

  useEffect(() => {
    const paramIds = departments.flatMap(
      (d) =>
        d.equipments?.flatMap(
          (eq) => eq.parameters?.map((p) => p.id).filter(Boolean) ?? [],
        ) ?? [],
    );

    const newParamIds = paramIds.filter((id) => !fetchedParams.includes(id));

    if (newParamIds.length) {
      dispatch(fetchReports(newParamIds));
      dispatch(markFetchedParams(newParamIds));
    }
  }, [departments, fetchedParams, dispatch]);

  /* -------- Build rows -------- */

  const rows = useMemo(() => {
    return logs
      .map((log, index) => {
        const eq = equipmentMap.get(log.equipment_details_id);
        const param = parameterMetaMap.get(log.parameter_id);

        if (!eq) return null;

        return {
          id: log.id || index,
          department: eq.department_id,
          equipment: eq.equipment_num,
          parameter: param?.name ?? "-",
          unit: param?.unit ?? "-",
          value: log.content ?? "-",
          date: dayjs(log.created_at).format("DD/MM/YYYY HH:mm"),
        };
      })
      .filter(Boolean)
      .filter((row: any) => {
        if (
          selectedDepartment !== "all" &&
          row.department !== selectedDepartment
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
  ]);

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
    { field: "date", headerName: "Date & Time", width: 180 },
    { field: "equipment", headerName: "Equipment", width: 150 },
    { field: "parameter", headerName: "Parameter", width: 150 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "value", headerName: "Value", width: 120 },
  ];

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Reports
      </Typography>

      {/* Filters */}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Department</InputLabel>

          <Select
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

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Equipment</InputLabel>

          <Select
            value={selectedEquipment}
            label="Equipment"
            onChange={(e) => setSelectedEquipment(e.target.value)}
          >
            <MenuItem value="all">All Equipments</MenuItem>

            {Array.from(equipmentMap.values()).map((e: any) => (
              <MenuItem key={e.equipment_num} value={e.equipment_num}>
                {e.equipment_name} ({e.equipment_num})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search across all columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
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
            }}
          >
            Import CSV
          </Button>
        </Box>
      </Box>

      {/* Table */}
      {loading && (
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
