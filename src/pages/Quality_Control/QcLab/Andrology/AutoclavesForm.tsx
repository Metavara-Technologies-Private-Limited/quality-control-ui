import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const AutoclavesForm = ({ selectedRadio, setSelectedRadio }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");

  const [formData, setFormData] = useState({
    date: "2025-12-31",
    time: "11:24",
    temperature: "",
    pressure: "",
    sterilizationCycle: "Valid",
    maintenanceLogs: "",
    status: "Pass",
    comments: "",
  });

  // Mock data for the Logs table matching your image columns
  const logsData = [
    { 
      id: 1, 
      dateTime: "31/12/2025 11:24:00 AM", 
      temp: "2°C", 
      pressure: "00kPa", 
      cycle: "Valid", 
      maintenance: "Text Goes Here", 
      uploads: "Sample ID.Doc",
      status: "Pass", 
      comments: "Calibration and QC completed successfully." 
    },
    { 
      id: 2, 
      dateTime: "31/12/2025 11:24:00 AM", 
      temp: "2°C", 
      pressure: "00kPa", 
      cycle: "Valid", 
      maintenance: "Text Goes Here", 
      uploads: "Sample ID.Doc",
      status: "Pass", 
      comments: "Routine daily quality check performed." 
    },
    { 
      id: 3, 
      dateTime: "31/12/2025 11:24:00 AM", 
      temp: "2°C", 
      pressure: "00kPa", 
      cycle: "Valid", 
      maintenance: "Text Goes Here", 
      uploads: "Sample ID.Doc",
      status: "Pass", 
      comments: "Minor calibration adjustment applied b..." 
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div style={{ maxWidth: "1200px" }}>
      {/* SECTION 1: Details and Input Logic */}
      <div style={sectionStyle}>
        {/* Radio Selection for Autoclaves */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Autoclaves A", "Autoclaves B", "Autoclaves C", "Autoclaves D", "Autoclaves E"].map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
              <input 
                type="radio" 
                checked={selectedRadio === name} 
                onChange={() => setSelectedRadio(name)} 
                style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
              />
              {name}
            </label>
          ))}
        </div>

        {/* Details/Logs Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: "6px 24px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
                cursor: "pointer",
                backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "600" : "400",
                boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >{tab}</button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              {/* Row 1: Date, Time, Temp */}
              <div style={{ position: "relative" }}>
                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Date</label>
              </div>

              <div style={{ position: "relative" }}>
                <input type="time" name="time" value={formData.time} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Time</label>
              </div>

              <div style={{ position: "relative" }}>
                <input type="text" name="temperature" placeholder="Type Here" value={formData.temperature} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Temperature (°C)</label>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Range: 121 °C - 134 °C</p>
              </div>

              {/* Row 2: Pressure, Validation, Logs */}
              <div style={{ position: "relative" }}>
                <input type="text" name="pressure" placeholder="Type Here" value={formData.pressure} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Pressure (kPa)</label>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Range: 121 °C - 134 °C</p>
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

              {/* Row 3: Upload, Status, Comments */}
              <div style={{ position: "relative", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Sample ID.doc</span>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px' }}>×</button>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                </div>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Uploads</label>
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
              <button type="button" onClick={() => setFormData({ date: "2025-12-31", time: "11:24", temperature: "", pressure: "", sterilizationCycle: "Valid", maintenanceLogs: "", status: "Pass", comments: "" })} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Clear</button>
              <button type="button" style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Save</button>
            </div>
          </>
        ) : (
          /* LOGS TABLE VIEW */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Temp.</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Pressure</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Sterilization Cycle Validation</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Maintenance Logs</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Uploads</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Status</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {logsData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 8px", color: "#0f172a", fontWeight: "600", whiteSpace: "nowrap" }}>{log.dateTime}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.temp}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.pressure}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.cycle}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.maintenance}</td>
                    <td style={{ padding: "16px 8px", color: "#3b82f6", cursor: 'pointer', textDecoration: 'underline' }}>{log.uploads}</td>
                    <td style={{ padding: "16px 8px" }}>
                      <span style={{ 
                        padding: "4px 12px", borderRadius: "16px", backgroundColor: "#DCFCE7", color: "#15803D", 
                        fontSize: "11px", fontWeight: "600", border: "1px solid #BBF7D0", display: "inline-block"
                      }}>{log.status}</span>
                    </td>
                    <td style={{ padding: "16px 8px", color: "#64748b", minWidth: "200px" }}>{log.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Activity Card */}
       <div style={sectionStyle}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ 
                   width: '24px', height: '24px', borderRadius: '6px', 
                   border: '1px solid #E0E0E0', display: 'flex', 
                   alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <span style={{ fontSize: '14px' }}>📈</span>
                 </div>
                 <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
               </div>
               
               <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <div style={{ width: '8px', height: '8px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
                   <span style={{ color: '#9e9e9e' }}>Compliant</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <div style={{ width: '8px', height: '8px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
                   <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
                 </div>
               </div>
             </div>
     
          {/* Graphs and charts*/}
             <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={activityData} 
                   stackOffset="sign" 
                   margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                 >
                   {/* Faint horizontal grid lines */}
                   <ReferenceLine y={0} stroke="#E0E0E0" />
                   <ReferenceLine y={20} stroke="#F1F1F1" />
                   <ReferenceLine y={40} stroke="#F1F1F1" />
                   <ReferenceLine y={-20} stroke="#F1F1F1" />
                   <ReferenceLine y={-40} stroke="#F1F1F1" />
     
                   <XAxis 
                     dataKey="day" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fill: '#9e9e9e' }}
                     dy={10}
                   />
                   <YAxis 
                     axisLine={false}
                     tickLine={false}
                     tick={{ fontSize: 12, fill: '#9e9e9e' }}
                     domain={[-40, 40]}
                     ticks={[-40, -20, 0, 20, 40]}
                     label={{ 
                       value: 'No of Parameters', 
                       angle: -90, 
                       position: 'insideLeft', 
                       style: { fill: '#9e9e9e', fontSize: 12 } 
                     }}
                   />
                   <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                   />
     
                   {/* Compliant (Grey) */}
                   <Bar 
                     dataKey="compliant" 
                     fill="#6c6c6c" 
                     radius={[4, 4, 0, 0]} 
                     barSize={12}
                     label={{ position: 'top', fill: '#6c6c6c', fontSize: 10, dy: -5 }}
                   />
     
                   {/* Non-Compliant (Coral) */}
                   <Bar 
                     dataKey="nonCompliant" 
                     fill="#EF9685" 
                     radius={[0, 0, 4, 4]} 
                     barSize={12}
                     label={{ position: 'bottom', fill: '#EF9685', fontSize: 10, dy: 5 }}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <p style={{ textAlign: 'center', marginTop: '16px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
           </div>
    </div>
  );
};

export default AutoclavesForm;