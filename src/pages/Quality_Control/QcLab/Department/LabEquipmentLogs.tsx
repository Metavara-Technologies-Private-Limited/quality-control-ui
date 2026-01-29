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
  const clinic = useSelector((s: RootState) => s.clinic.data);
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
      setLogs(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [equipment.parameters]);

  const parameterMetaMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string }>();
    equipment.parameters.forEach((p) => {
      if (!p.id) return;
      map.set(p.id, {
        name: p.parameter_name || "Unknown Parameter",
        unit: p.config?.unit ?? "-",
      });
    });
    return map;
  }, [equipment.parameters]);

  /* -------- All Rows (before filtering) -------- */
  const allRows = useMemo(() => {
    return logs.map((log, index) => {
      const param = parameterMetaMap.get(log.parameter_id);
      return {
        id: log.id || index,
        date: dayjs(log.created_at).format("DD/MM/YYYY HH:mm"),
        equipment:
          equipmentDetailMap.get(log.equipment_details_id) ?? "Unknown",
        parameter: param?.name ?? "-",
        unit: param?.unit ?? "-",
        value: log.content ?? "-",
      };
    });
  }, [logs, parameterMetaMap, equipmentDetailMap]);

  /* -------- Filtered Rows with search -------- */
  const rows = useMemo(() => {
    let filtered = allRows;

    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [allRows, searchTerm]);

  /* -------- Export to Excel Logic -------- */
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

    const fileName = `Logs_${equipment.equipment_num || "Equipment"}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
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

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date & Time",
      width: 180,
      sortable: true,
    },
    {
      field: "equipment",
      headerName: "Equipment",
      width: 150,
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
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search across all columns..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300, bgcolor: "#fff", borderRadius: "8px" }}
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
