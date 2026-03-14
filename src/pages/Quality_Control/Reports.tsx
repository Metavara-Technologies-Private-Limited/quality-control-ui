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
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { fetchReports } from "@/store/reportsSlice";

import ImportCSVPopup from "./QcLab/Department/ImportCSVPopup";

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();

  const rawData = useSelector((s: RootState) => s.clinic.rawData);
  const clinicData = useSelector(
    (s: RootState) => (s.clinic as any).clinicData ?? (s.clinic as any).data,
  );

  // Safely merge all department sources, guard against undefined
  const departments = useMemo(() => {
    const rawDepts: any[] = rawData?.department ?? [];
    const clinicDepts: any[] = clinicData?.department ?? [];
    const seen = new Set<number>();
    const merged: any[] = [];
    [...rawDepts, ...clinicDepts].forEach((d) => {
      if (d?.id != null && !seen.has(d.id)) {
        seen.add(d.id);
        merged.push(d);
      }
    });
    return merged;
  }, [rawData, clinicData]);

  const logs = useSelector((s: RootState) => s.reports.logs);
  const loading = useSelector((s: RootState) => s.reports.loading);
  const progress = useSelector((s: RootState) => s.reports.progress);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<any>("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const normalizedSelectedDepartment =
    selectedDepartment === "all" ? "all" : Number(selectedDepartment);

  /* -------- Equipment Map keyed by equipment_details.id -------- */
  const equipmentMap = useMemo(() => {
    const map = new Map<number, any>();
    departments.forEach((d: any) => {
      d.equipments?.forEach((eq: any) => {
        eq.equipment_details?.forEach((ed: any) => {
          if (ed.id != null) {
            map.set(Number(ed.id), {
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

  /* -------- FIX: Full unit resolution — p.unit, config.unit, history, nested config -------- */
  const parameterMetaMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string }>();
    departments.forEach((d: any) => {
      d.equipments?.forEach((eq: any) => {
        eq.parameters?.forEach((p: any) => {
          if (!p.id) return;

          let unit = "-";
          const cfg = p.config ?? {};

          // 1. Check flattened param.unit first (set by useAddParameterLogic after history flatten)
          if (p.unit) {
            unit = p.unit;
          }
          // 2. Direct config.unit
          else if (cfg.unit) {
            unit = cfg.unit;
          }
          // 3. Last history entry
          else if (Array.isArray(cfg.history) && cfg.history.length > 0) {
            const lastHistory = cfg.history[cfg.history.length - 1];
            unit = lastHistory?.unit ?? "-";
          }
          // 4. Nested config.config.unit
          else if (cfg.config?.unit) {
            unit = cfg.config.unit;
          }

          map.set(Number(p.id), {
            name: p.parameter_name || "Unknown Parameter",
            unit: unit || "-",
          });
        });
      });
    });
    return map;
  }, [departments]);

  /* -------- Load ALL logs -------- */
  const allParamIds = useMemo(() => {
    const ids = departments.flatMap(
      (d: any) =>
        d.equipments?.flatMap(
          (eq: any) =>
            eq.parameters
              ?.map((p: any) => Number(p.id))
              .filter((id: number) => Number.isFinite(id) && id > 0) ?? [],
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

    const onFocus = () => dispatch(fetchReports(allParamIds));
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") dispatch(fetchReports(allParamIds));
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [allParamIds, dispatch]);

  /* -------- Equipment options for dropdown -------- */
  const equipmentOptions = useMemo(() => {
    return Array.from(equipmentMap.entries())
      .filter(([, e]: [any, any]) =>
        normalizedSelectedDepartment === "all"
          ? true
          : Number(e.department_id) === normalizedSelectedDepartment,
      )
      .map(([id, e]: [any, any]) => ({
        value: id,
        label: `${e.equipment_name} (${e.equipment_num})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [equipmentMap, normalizedSelectedDepartment]);

  /* -------- Build rows -------- */
  const rows = useMemo(() => {
    const mappedRows = logs
      .map((log: any, index: number) => {
        const detailId = Number(log.equipment_details ?? log.equipment_details_id);
        const eq = equipmentMap.get(detailId);
        const paramId = Number(log.parameter ?? log.parameter_id);
        const param = parameterMetaMap.get(paramId);

        if (!eq) return null;

        const createdAt = dayjs(log.created_at);
        const timestamp = createdAt.isValid() ? createdAt.valueOf() : 0;

        return {
          id: log.id ?? index,
          department: eq.department_id,
          equipmentDetailsId: detailId,
          equipment: eq.equipment_num,
          parameter: param?.name ?? "-",
          unit: param?.unit ?? "-",
          value: log.content ?? "-",
          timestamp,
          date: createdAt.isValid() ? createdAt.format("DD/MM/YYYY HH:mm") : "-",
        };
      })
      .filter(Boolean) as any[];

    // Sort newest first by raw timestamp
    mappedRows.sort((a: any, b: any) => {
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

      if (
        selectedEquipment !== "all" &&
        Number(row.equipmentDetailsId) !== Number(selectedEquipment)
      )
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
    normalizedSelectedDepartment,
    selectedEquipment,
    search,
  ]);

  // Reset equipment filter when department changes
  useEffect(() => {
    if (selectedEquipment === "all") return;
    const isAvailable = equipmentOptions.some(
      (o) => Number(o.value) === Number(selectedEquipment),
    );
    if (!isAvailable) setSelectedEquipment("all");
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
    XLSX.writeFile(workbook, `Reports_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    toast.success("Reports exported successfully");
  };

  /* -------- Columns — date displays formatted string, sorts by timestamp -------- */
  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date & Time",
      flex: 1.5,
      minWidth: 180,
      sortComparator: (_v1, _v2, param1, param2) => {
        const ts1 = (param1.api.getRow(param1.id) as any)?.timestamp ?? 0;
        const ts2 = (param2.api.getRow(param2.id) as any)?.timestamp ?? 0;
        return ts1 - ts2;
      },
    },
    { field: "equipment", headerName: "Equipment", flex: 1.3, minWidth: 150 },
    { field: "parameter", headerName: "Parameter", flex: 1.3, minWidth: 150 },
    { field: "unit",      headerName: "Unit",      flex: 0.8, minWidth: 100 },
    { field: "value",     headerName: "Value",     flex: 1,   minWidth: 120 },
  ];

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Reports
      </Typography>

      {/* ── Filters ── */}
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

          {/* Department */}
          <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedEquipment("all");
              }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Equipment — compact fixed width */}
          <FormControl size="small" sx={{ minWidth: 160, maxWidth: 200 }}>
            <InputLabel>Equipment</InputLabel>
            <Select
              value={selectedEquipment}
              label="Equipment"
              onChange={(e) => setSelectedEquipment(e.target.value)}
              renderValue={(value) => {
                if (value === "all") return "All Equipments";
                const opt = equipmentOptions.find(
                  (o) => Number(o.value) === Number(value),
                );
                return (
                  <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {opt?.label ?? "All Equipments"}
                  </Box>
                );
              }}
            >
              <MenuItem value="all">All Equipments</MenuItem>
              {equipmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} title={option.label}>
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

      {/* ── Loading bar ── */}
      {showInitialLoading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Loading all logs... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {/* ── Table ── */}
      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            sorting: { sortModel: [{ field: "date", sort: "desc" }] },
          }}
        />
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