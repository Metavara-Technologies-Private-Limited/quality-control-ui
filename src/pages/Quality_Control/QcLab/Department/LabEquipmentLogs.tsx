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

  /* -------- Filtered Rows -------- */
  const rows = useMemo(() => {
    const allRows = [...logs]
      .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
      .map((log) => {
        const param = parameterMetaMap.get(log.parameter_id);
        return {
          id: log.id,
          date: dayjs(log.created_at).format("DD/MM/YYYY HH:mm"),
          equipment: equipmentDetailMap.get(log.equipment_details_id) ?? "Unknown",
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
  }, [logs, parameterMetaMap, equipmentDetailMap, searchTerm]);

  /* -------- Export to Excel Logic -------- */
  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.info("No data available to export");
      return;
    }

    // Map rows to match the table headers for the Excel sheet
    const excelData = rows.map((row) => ({
      "Date & Time": row.date,
      "Equipment": row.equipment,
      "Parameter": row.parameter,
      "Unit": row.unit,
      "Value": row.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Logs");

    // Generate filename based on equipment name and current date
    const fileName = `Logs_${equipment.equipment_num || "Equipment"}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Logs exported to Excel successfully");
  };

  const handleImportCSV = async (importedData: any[]) => {
    try {
      const requests = importedData.map((log) => {
        const param = equipment.parameters.find((p) => p.parameter_name === log.parameter);
        if (!param?.id) return null;

        const logDateTime = dayjs(log.dateTime, ["DD/MM/YYYY HH:mm", "YYYY-MM-DD HH:mm"]);
        if (!logDateTime.isValid()) return null;

        return parameterValueApi.create({
          parameter: param.id,
          equipment_details: equipment.equipment_id,
          content: log.value,
          log_time: logDateTime.toISOString(),
        });
      }).filter(Boolean);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <TextField
          placeholder="Filter logs..."
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
          {/* Export Button */}
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

          {/* Import Button */}
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

      {/* MUI Table with Fixed Height/Scroll */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: "12px", 
          border: "1px solid #e5e7eb", 
          boxShadow: "none",
          height: 480, 
          overflow: "auto" 
        }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {["Date & Time", "Equipment", "Parameter", "Unit", "Value"].map((head) => (
                <TableCell 
                  key={head} 
                  sx={{ 
                    fontWeight: 700, 
                    backgroundColor: "#fafafa", 
                    color: "#4B5563",
                    zIndex: 2 
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
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 },
                    height: 44 
                  }}
                >
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.equipment}</TableCell>
                  <TableCell>{row.parameter}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.value}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  {searchTerm ? `No matches for "${searchTerm}"` : "No logs found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ImportCSVPopup
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        parameters={equipment.parameters}
        onImport={handleImportCSV}
      />
    </Box>
  );
}