// components/ImportCSVPopup.tsx

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, CircularProgress, Alert, AlertTitle
} from '@mui/material';
import { Close, CloudUpload, WarningAmber } from '@mui/icons-material';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Props = {
  open: boolean;
  onClose: () => void;
  parameters: any[];
  onImport: (data: any[]) => void;
};

export default function ImportCSVPopup({ open, onClose, parameters, onImport }: Props) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [missingParams, setMissingParams] = useState<string[]>([]);

  // Get labels from the system form
  const parameterLabels = parameters.map(p => p.parameter_name);
  const parameterUnitMap = new Map(parameters.map(p => [p.parameter_name, p.config?.unit || '-']));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];

    // 1. STRICT FILE TYPE CHECK
    if (!allowedExtensions.includes(fileExtension || '')) {
      setErrors(['Unsupported file format. Please upload only CSV or Excel (.xlsx, .xls) files.']);
      setFileName('');
      event.target.value = ''; 
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setErrors([]);
    setMissingParams([]);

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndProcessCSV(results.data);
          setIsProcessing(false);
        },
        error: (error) => {
          setErrors([`Error parsing CSV: ${error.message}`]);
          setIsProcessing(false);
        },
      });
    } else {
      // Logic for Excel (.xlsx, .xls)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          validateAndProcessCSV(parsedData);
        } catch (err) {
          setErrors(['Failed to read Excel file. Please ensure it is not password protected.']);
        }
        setIsProcessing(false);
      };
      reader.readAsBinaryString(file);
    }
  };

  const validateAndProcessCSV = (data: any[]) => {
    const validationErrors: string[] = [];
    const foundParamsInCSV = new Set<string>();
    const validRows: any[] = [];

    if (data.length === 0) {
      setErrors(['File is empty']);
      return;
    }

    // 2. HEADER VALIDATION
    const headers = Object.keys(data[0]);
    if (!headers.includes('Parameter')) validationErrors.push("Missing 'Parameter' column");
    if (!headers.includes('Value')) validationErrors.push("Missing 'Value' column");
    if (!headers.includes('Equipment')) validationErrors.push("Missing 'Equipment' column");
    if (!headers.includes('Date & Time')) validationErrors.push("Missing 'Date & Time' column");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 3. ROW-BY-ROW VALIDATION
    data.forEach((row, index) => {
      const rowNum = index + 2;
      const rowParamValue = row['Parameter']?.toString().trim();
      const rowEquipment = row['Equipment']?.toString().trim();

      // Check Equipment Availability
      if (!rowEquipment) {
        validationErrors.push(`Row ${rowNum}: no Equipment added please check?`);
      }

      // Match Parameters
      const matchedLabel = parameterLabels.find(
        label => label.toLowerCase() === rowParamValue?.toLowerCase()
      );

      if (matchedLabel) {
        foundParamsInCSV.add(matchedLabel);
        // Only collect rows that match system labels and have equipment
        if (rowEquipment && row['Date & Time'] && row['Value'] !== undefined) {
          validRows.push({
            ...row,
            Parameter: matchedLabel // Normalize casing
          });
        }
      } else if (rowParamValue) {
        validationErrors.push(`Row ${rowNum}: "${rowParamValue}" is not a recognized parameter.`);
      }

      if (!row['Date & Time']) validationErrors.push(`Row ${rowNum}: Missing Date & Time`);
    });

    // 4. MISSING PARAMETER CHECK
    const missing = parameterLabels.filter(label => !foundParamsInCSV.has(label));
    missing.forEach(m => {
      validationErrors.push(`${m} parameter values is missing in csv?`);
    });

    setMissingParams(missing);
    setErrors(validationErrors);
    setCsvData(validRows);
  };

  const handleAdd = () => {
    const finalLogs = csvData.map(row => ({
      dateTime: row['Date & Time'],
      equipment: row['Equipment'],
      parameter: row['Parameter'],
      unit: row['Unit'] || parameterUnitMap.get(row['Parameter']) || '-',
      value: row['Value']
    }));

    onImport(finalLogs);
    handleClose();
  };

  const handleClose = () => {
    setCsvData([]);
    setFileName('');
    setErrors([]);
    setMissingParams([]);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>Import Data File</Typography>
          <IconButton onClick={handleClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!csvData.length && !isProcessing && (
          <Box sx={{ border: '2px dashed #E5E7EB', borderRadius: '12px', p: 4, textAlign: 'center', backgroundColor: '#F9FAFB' }}>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              id="csv-upload" 
            />
            <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <CloudUpload sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
              <Typography sx={{ fontWeight: 600 }}>{fileName || 'Upload CSV or Excel'}</Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 1 }}>
                Allowed formats: .csv, .xlsx, .xls
              </Typography>
            </label>
          </Box>
        )}

        {isProcessing && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

        {errors.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
            <Typography variant="caption" color="error" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Issues detected:</Typography>
            <Box sx={{ maxHeight: '120px', overflowY: 'auto' }}>
              {errors.map((err, i) => (
                <Typography key={i} sx={{ fontSize: '12px', color: '#B91C1C', display: 'block' }}>• {err}</Typography>
              ))}
            </Box>
          </Box>
        )}

        {missingParams.length > 0 && csvData.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningAmber />}>
            <AlertTitle sx={{ fontSize: '14px', fontWeight: 700 }}>Missing Parameters</AlertTitle>
            <Typography variant="caption">
              Some parameters (<strong>{missingParams.join(', ')}</strong>) are missing from the file. Matched data will still be imported.
            </Typography>
          </Alert>
        )}

        {csvData.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Data Preview</Typography>
            <Box sx={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F9FAFB', position: 'sticky', top: 0 }}>
                  <tr>
                    {["Date & Time", "Equipment", "Parameter", "Value"].map((h) => (
                      <th key={h} style={tableHeaderStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tableCellStyle}>{row['Date & Time']}</td>
                      <td style={tableCellStyle}>{row['Equipment']}</td>
                      <td style={tableCellStyle}>{row['Parameter']}</td>
                      <td style={tableCellStyle}>{row['Value']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>Cancel</Button>
        <Button 
          onClick={handleAdd} 
          disabled={csvData.length === 0} 
          variant="contained" 
          sx={{ 
            borderRadius: '8px', textTransform: 'none',
            bgcolor: missingParams.length > 0 ? '#E17E61' : '#505050',
            '&:hover': { bgcolor: missingParams.length > 0 ? '#d16d51' : '#232323' }
          }}
        >
          {missingParams.length > 0 ? "Yes, Import Matched Data" : "Add to Logs"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px', fontSize: '11px', fontWeight: 600, color: '#4B5563', borderBottom: '1px solid #E5E7EB'
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px', fontSize: '11px', color: '#374151'
};