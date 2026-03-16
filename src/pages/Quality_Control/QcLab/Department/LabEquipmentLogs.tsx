import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { parameterValueApi } from "@/services/api";
import dayjs from "dayjs";
import { FileUpload, Search, FileDownload } from "@mui/icons-material";
import ImportCSVPopup from "./ImportCSVPopup";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

type Props = {
  equipment: {
    parameters: any[];
    equipment_num?: string;
    equipment_id?: number;
  };
};

export default function LabEquipmentLogs({ equipment }: Props) {
  const clinic = useSelector((s: RootState) => s.clinic.rawData);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  /* -------- Equipment Detail Map -------- */
  const equipmentDetailMap = useMemo(() => {
    const map = new Map<number, string>();
    clinic?.department.forEach((d) => {
      d.equipments.forEach((eq) => {
        eq.equipment_details.forEach((ed) => {
          map.set(ed.id!, ed.equipment_num);
        });
      });
    });
    return map;
  }, [clinic]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const all: any[] = [];
      const savedParameters = equipment.parameters.filter((p) => p.id);
      if (savedParameters.length === 0) {
        setLogs([]);
        return;
      }
      for (const p of savedParameters) {
        try {
          const { data = [] } = await parameterValueApi.listByParameter(p.id);
          all.push(...data);
        } catch (err) {
          console.error(`Failed to load logs for parameter ${p.id}:`, err);
        }
      }

      const filtered = equipment.equipment_id
        ? all.filter(
            (log) => log.equipment_details_id === equipment.equipment_id,
          )
        : all;

      setLogs(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [equipment.equipment_id, equipment.parameters]);

  /* -------- FIX: Full unit resolution — checks p.unit, config.unit, history, nested config -------- */
  const parameterMetaMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string }>();
    equipment.parameters.forEach((p) => {
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

      map.set(p.id, {
        name: p.parameter_name || p.name || "Unknown Parameter",
        unit: unit || "-",
      });
    });
    return map;
  }, [equipment.parameters]);

  /* -------- All Rows — include timestamp for correct sorting -------- */
  const allRows = useMemo(() => {
    return logs
      .map((log, index) => {
        const param = parameterMetaMap.get(log.parameter_id);
        const createdAt = dayjs(log.created_at);
        const timestamp = createdAt.isValid() ? createdAt.valueOf() : 0;
        return {
          id: log.id || index,
          timestamp,
          date: createdAt.isValid()
            ? createdAt.format("DD/MM/YYYY HH:mm")
            : "-",
          equipment:
            equipmentDetailMap.get(log.equipment_details_id) ?? "Unknown",
          parameter: param?.name ?? "-",
          unit: param?.unit ?? "-",
          value: log.content ?? "-",
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, parameterMetaMap, equipmentDetailMap]);

  /* -------- Filtered Rows -------- */
  const rows = useMemo(() => {
    if (!searchTerm) return allRows;
    return allRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [allRows, searchTerm]);

  /* -------- Export to Excel -------- */
  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const excelData = rows.map((row) => ({
      "Date & Time": row.date,
      Equipment: row.equipment,
      Parameter: row.parameter,
      Unit: row.unit,
      Value: row.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Logs");
    XLSX.writeFile(
      workbook,
      `Logs_${equipment.equipment_num || "Equipment"}_${dayjs().format("YYYY-MM-DD")}.xlsx`,
    );
    toast.success("Logs exported to Excel successfully");
  };

  const handleImportCSV = async (importedData: any[]) => {
    try {
      const requests = importedData
        .map((log) => {
          const param = equipment.parameters.find(
            (p) => p.parameter_name === log.parameter,
          );
          if (!param?.id || !equipment.equipment_id) return null;

          const logDateTime = dayjs(log.dateTime, [
            "DD/MM/YYYY HH:mm",
            "YYYY-MM-DD HH:mm",
          ]);
          if (!logDateTime.isValid()) return null;

          return parameterValueApi.create({
            parameter: param.id,
            equipment_details: equipment.equipment_id,
            content: log.value,
            log_time: logDateTime.toISOString(),
          });
        })
        .filter(Boolean);

      if (requests.length === 0) {
        toast.warn("No valid logs to import");
        return;
      }

      await Promise.all(requests);
      toast.success(`${requests.length} logs imported successfully`);
      await loadLogs();
    } catch (error) {
      toast.error("Failed to import logs");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* -------- Columns — date displays formatted string, sorts by timestamp -------- */
  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date & Time",
      width: 180,
      sortable: true,
      sortComparator: (_v1, _v2, param1, param2) => {
        const ts1 = (param1.api.getRow(param1.id) as any)?.timestamp ?? 0;
        const ts2 = (param2.api.getRow(param2.id) as any)?.timestamp ?? 0;
        return ts1 - ts2;
      },
    },
    { field: "equipment", headerName: "Equipment", width: 150, sortable: true },
    { field: "parameter", headerName: "Parameter", width: 150, sortable: true },
    { field: "unit", headerName: "Unit", width: 100, sortable: true },
    {
      field: "value",
      headerName: "Value",
      width: 120,
      sortable: true,
      type: "string",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search across all columns..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: "100%", md: 300 },
            bgcolor: "#fff",
            borderRadius: "8px",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            width: { xs: "100%", md: "auto" },
          }}
        >
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
              width: { xs: "100%", sm: "auto" },
              "&:hover": { borderColor: "#232323", backgroundColor: "#f5f5f5" },
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
              width: { xs: "100%", sm: "auto" },
              "&:hover": { backgroundColor: "#232323" },
            }}
          >
            Import CSV
          </Button>
        </Box>
      </Box>

      {/* DataGrid Table */}
      <Paper
        sx={{
          height: 500,
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          initialState={{
            sorting: { sortModel: [{ field: "date", sort: "desc" }] },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
              fontSize: "0.95rem",
            },
            "& .MuiDataGrid-columnHeader": {
              fontWeight: "bold",
              position: "sticky",
              top: 0,
              zIndex: 10,
            },
            "& .MuiDataGrid-columnHeaders": {
              position: "sticky",
              top: 0,
              zIndex: 10,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e5e7eb",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f9fafb",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #e5e7eb",
            },
          }}
          disableRowSelectionOnClick
          density="standard"
        />
      </Paper>

      <ImportCSVPopup
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        parameters={equipment.parameters}
        onImport={handleImportCSV}
      />
    </Box>
  );
}
