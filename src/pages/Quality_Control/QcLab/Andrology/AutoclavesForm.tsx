import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

// MUI Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';

// Custom MUI Theme to match your dashboard colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#f97316', // Orange matching your accentColor
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '50px',
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e5e7eb',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },
        },
      },
    },
  },
});

const AutoclavesForm = ({ selectedRadio, setSelectedRadio }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");

  const [formData, setFormData] = useState({
    date: dayjs('2025-12-31'), // Changed to Dayjs object
    time: "11:24",
    temperature: "",
    pressure: "",
    sterilizationCycle: "Valid",
    maintenanceLogs: "",
    status: "Pass",
    comments: "",
  });

  const [logsData, setLogsData] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Specific handler for MUI DatePicker
  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setFormData((prev) => ({ ...prev, date: newValue }));
    }
  };

  const handleSave = () => {
    if (!formData.temperature || !formData.pressure) {
      toast.error("Please fill in Temperature and Pressure!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      // Formatting Dayjs for the table
      dateTime: `${formData.date.format('YYYY-MM-DD')} ${formData.time}`,
      temp: `${formData.temperature}°C`,
      pressure: `${formData.pressure}kPa`,
      cycle: formData.sterilizationCycle,
      maintenance: formData.maintenanceLogs || "N/A",
      uploads: "Sample ID.Doc",
      status: formData.status,
      comments: formData.comments,
    };

    setLogsData([newEntry, ...logsData]);
    toast.success("Successfully Saved!", { theme: "colored" });
    setActiveSubTab("Logs");
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -23 },
    { day: "Tuesday", compliant: 28, nonCompliant: -22 },
    { day: "Wednesday", compliant: 22, nonCompliant: -36 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -28 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -25 },
  ];

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ maxWidth: "1200px", fontFamily: "'Montserrat', sans-serif" }}>
          <ToastContainer />
          
          <div style={sectionStyle}>
            {/* Radio Selection */}
            <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
              {["Autoclaves A", "Autoclaves B", "Autoclaves C", "Autoclaves D", "Autoclaves E"].map((name) => (
                <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
                  <input type="radio" checked={selectedRadio === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316", width: "16px", height: "16px" }} />
                  {name}
                </label>
              ))}
            </div>

            {/* Sub Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {["Details", "Logs"].map(tab => (
                <button key={tab} type="button" onClick={() => setActiveSubTab(tab)} style={{
                    padding: "6px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", cursor: "pointer",
                    backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                    color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                    fontWeight: activeSubTab === tab ? "600" : "400",
                  }}>{tab}</button>
              ))}
            </div>

            {activeSubTab === "Details" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                  
                  {/* MUI DatePicker Section */}
                  <div style={{ position: "relative" }}>
                    <DatePicker
                      value={formData.date}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                        },
                      }}
                    />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b", zIndex: 1 }}>Date</label>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Time</label>
                  </div>

                  {/* Rest of inputs stay as your custom styled components */}
                  <div style={{ position: "relative" }}>
                    <input type="text" name="temperature" placeholder="Type Here" value={formData.temperature} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Temperature (°C)</label>
                    <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Range: 121 °C - 134 °C</p>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input type="text" name="pressure" placeholder="Type Here" value={formData.pressure} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Pressure (kPa)</label>
                  </div>

                  <div style={{ position: "relative" }}>
                    <select name="sterilizationCycle" value={formData.sterilizationCycle} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                      <option value="Valid">Valid</option>
                      <option value="Invalid">Invalid</option>
                    </select>
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Sterilization Cycle Validation</label>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input type="text" name="maintenanceLogs" placeholder="Type Here" value={formData.maintenanceLogs} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Maintenance Logs</label>
                  </div>

                  <div style={{ position: "relative" }}>
                    <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Status</label>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input type="text" name="comments" placeholder="Type Here" value={formData.comments} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Comments</label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
                  <button type="button" onClick={() => setFormData({ date: dayjs(), time: "11:24", temperature: "", pressure: "", sterilizationCycle: "Valid", maintenanceLogs: "", status: "Pass", comments: "" })} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Clear</button>
                  <button type="button" onClick={handleSave} style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Save</button>
                </div>
              </>
            ) : (
              /* Logs Table remains same */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                      <th style={{ padding: "12px 8px", fontWeight: "500" }}>Date & Time</th>
                      <th style={{ padding: "12px 8px", fontWeight: "500" }}>Temp.</th>
                      <th style={{ padding: "12px 8px", fontWeight: "500" }}>Pressure</th>
                      <th style={{ padding: "12px 8px", fontWeight: "500" }}>Status</th>
                      <th style={{ padding: "12px 8px", fontWeight: "500" }}>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsData.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 8px", color: "#0f172a", fontWeight: "600" }}>{log.dateTime}</td>
                        <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.temp}</td>
                        <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.pressure}</td>
                        <td style={{ padding: "16px 8px" }}>
                          <span style={{ 
                            padding: "4px 12px", borderRadius: "16px", backgroundColor: log.status === "Pass" ? "#DCFCE7" : "#FEE2E2", 
                            color: log.status === "Pass" ? "#15803D" : "#B91C1C", fontSize: "11px", fontWeight: "600"
                          }}>{log.status}</span>
                        </td>
                        <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Chart Section */}
          <div style={sectionStyle}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
                  <ReferenceLine y={0} stroke="#E0E0E0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AutoclavesForm;