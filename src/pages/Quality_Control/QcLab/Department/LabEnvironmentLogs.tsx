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
import { environmentParameterValueApi } from "@/services/api";
import dayjs from "dayjs";
import { Search, FileDownload, FileUpload } from "@mui/icons-material";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ImportCSVPopup from "./ImportCSVPopup";

type Props = {
  environment: {
    id: number;
    parameters: any[];
  };
};

export default function LabEnvironmentLogs({ environment }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  /* -------- Load logs for ALL environment parameters -------- */
  const loadLogs = async () => {
    setLoading(true);
    try {
      const all: any[] = [];
      const savedParameters = environment.parameters.filter((p) => p.id);

      for (const p of savedParameters) {
        const { data = [] } =
          await environmentParameterValueApi.listByParameter(p.id);
        all.push(...data);
      }
      setLogs(all);
    } catch (err) {
      console.error("Failed to load environment logs:", err);
      toast.error("Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [environment]);

  /* -------- Build Parameter Meta Map -------- */
  const parameterMetaMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string }>();
    environment.parameters.forEach((p) => {
      map.set(p.id, {
        name: p.env_parameter_name,
        unit: p.config?.unit ?? "",
      });
    });
    return map;
  }, [environment.parameters]);

  /* -------- Transform & Filter Rows -------- */
  const rows = useMemo(() => {
    const allRows = logs.map((log, index) => {
      const param = parameterMetaMap.get(log.environment_parameter_id);
      const timestamp = dayjs(log.log_time ?? log.created_at).valueOf();

      return {
        id: log.id || index,
        timestamp,
        date: dayjs(log.log_time ?? log.created_at).format("DD/MM/YYYY HH:mm"),
        parameter: param?.name ?? "-",
        unit: param?.unit ?? "-",
        value: log.content ?? "-",
      };
    });

    allRows.sort((a, b) => {
      const byTime = b.timestamp - a.timestamp;
      if (byTime !== 0) return byTime;
      return Number(b.id) - Number(a.id);
    });

    if (!searchTerm) return allRows;

    return allRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [logs, parameterMetaMap, searchTerm]);

  /* -------- Handle Import Logic -------- */
  const handleImportCSV = async (importedData: any[]) => {
    try {
      const requests = importedData
        .map((log) => {
          const param = environment.parameters.find(
            (p) =>
              p.env_parameter_name.toLowerCase() ===
              log.parameter.toLowerCase(),
          );

          if (!param?.id) return null;

          const logDateTime = dayjs(log.dateTime, [
            "DD/MM/YYYY HH:mm",
            "YYYY-MM-DD HH:mm",
          ]);
          if (!logDateTime.isValid()) return null;

          const dataType = param.config?.data_type;
          const rawValue = String(log.value ?? "").trim();
          const normalizedValue =
            dataType === "Integer" || dataType === "Decimal"
              ? rawValue.replace(/[^0-9.-]/g, "")
              : rawValue;

          if (!normalizedValue) return null;

          return environmentParameterValueApi.create({
            environment_parameter: param.id,
            content: normalizedValue,
            log_time: logDateTime.toISOString(),
            environment: 0,
          });
        })
        .filter(Boolean);

      if (requests.length === 0) {
        toast.warn("No valid environment logs to import");
        return;
      }

      await Promise.all(requests);
      toast.success(`${requests.length} logs imported successfully`);
      await loadLogs();
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import environment logs");
    }
  };

  /* -------- Export Logic -------- */
  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const excelData = rows.map((row) => ({
      "Date & Time": row.date,
      Parameter: row.parameter,
      Unit: row.unit,
      Value: row.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Environment Logs");

    const fileName = `Env_Logs_${dayjs().format("YYYY-MM-DD")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Logs exported successfully");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date & Time",
      width: 180,
      sortable: true,
    },
    {
      field: "parameter",
      headerName: "Parameter",
      width: 150,
      sortable: true,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
      sortable: true,
    },
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
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          placeholder="Filter environment logs..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: "100%", sm: 300 },
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
            width: { xs: "100%", sm: "auto" },
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
            Export Excel
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
          height: { xs: 420, md: 500 },
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", height: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: 620, height: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
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
          </Box>
        </Box>
      </Paper>

      {/* Shared Import Popup */}
      <ImportCSVPopup
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        parameters={environment.parameters.map((p) => ({
          ...p,
          parameter_name: p.env_parameter_name,
        }))}
        onImport={handleImportCSV}
      />
    </Box>
  );
}
