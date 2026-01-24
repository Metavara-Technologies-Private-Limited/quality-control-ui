import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { environmentParameterValueApi } from "@/services/api";
import dayjs from "dayjs";
import { Search, FileDownload, FileUpload } from "@mui/icons-material";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ImportCSVPopup from "./ImportCSVPopup"; // Import the shared popup component

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

  /* -------- Load logs for ALL environment parameters -------- */
  const loadLogs = async () => {
    setLoading(true);
    try {
      const all: any[] = [];
      // Filter for parameters that have IDs
      const savedParameters = environment.parameters.filter((p) => p.id);
      
      for (const p of savedParameters) {
        const { data = [] } = await environmentParameterValueApi.listByParameter(p.id);
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
        unit: p.config?.unit ?? "-",
      });
    });
    return map;
  }, [environment.parameters]);

  /* -------- Transform & Filter Rows -------- */
  const rows = useMemo(() => {
    const allRows = [...logs]
      .sort((a, b) => 
        dayjs(b.log_time ?? b.created_at).valueOf() - dayjs(a.log_time ?? a.created_at).valueOf()
      )
      .map((log) => {
        const param = parameterMetaMap.get(log.environment_parameter_id);
        return {
          id: log.id,
          date: dayjs(log.log_time ?? log.created_at).format("DD/MM/YYYY HH:mm"),
          parameter: param?.name ?? "-",
          unit: param?.unit ?? "-",
          value: log.content ?? "-",
        };
      });

    if (!searchTerm) return allRows;

    return allRows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [logs, parameterMetaMap, searchTerm]);

  /* -------- Handle Import Logic -------- */
  const handleImportCSV = async (importedData: any[]) => {
    try {
      const requests = importedData.map((log) => {
        // Find environment parameter by name
        const param = environment.parameters.find(
          (p) => p.env_parameter_name.toLowerCase() === log.parameter.toLowerCase()
        );
        
        if (!param?.id) return null;

        const logDateTime = dayjs(log.dateTime, ["DD/MM/YYYY HH:mm", "YYYY-MM-DD HH:mm"]);
        if (!logDateTime.isValid()) return null;

        return environmentParameterValueApi.create({
          environment_parameter: param.id,
          content: log.value,
          log_time: logDateTime.toISOString(),
        });
      }).filter(Boolean);

      if (requests.length === 0) {
        toast.warn("No valid environment logs to import");
        return;
      }

      await Promise.all(requests);
      toast.success(`${requests.length} logs imported successfully`);
      await loadLogs(); // Refresh table
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
      "Parameter": row.parameter,
      "Unit": row.unit,
      "Value": row.value,
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <TextField
          placeholder="Filter environment logs..."
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
            startIcon={<FileDownload />}
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
            Export Excel
          </Button>

          <Button
            variant="contained"
            startIcon={<FileUpload />}
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

      {/* MUI Table Container (Fixed Height for ~10 rows) */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          height: 480, 
          overflow: "auto",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              {["Date & Time", "Parameter", "Unit", "Value"].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "#fafafa",
                    color: "#4B5563",
                    zIndex: 2,
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 }, height: 44 }}
                >
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.parameter}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.value}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  {searchTerm ? `No matches for "${searchTerm}"` : "No logs found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Shared Import Popup */}
      <ImportCSVPopup
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        // Map env_parameter_name to parameter_name so the shared popup can recognize labels
        parameters={environment.parameters.map(p => ({ ...p, parameter_name: p.env_parameter_name }))}
        onImport={handleImportCSV}
      />
    </Box>
  );
}