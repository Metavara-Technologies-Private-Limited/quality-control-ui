import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const SpermAnalyzersForm = ({ selectedRadio, setSelectedRadio }) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");

  const [formData, setFormData] = useState({
    date: "2025-12-31",
    time: "11:24",
    softwareVersion: "",
    calibrationChecks: "Accurate",
    qualityControl: "Passed",
    status: "Pass",
    comments: "",
  });

  // Mock data for the Logs table
  const logsData = [
    { id: 1, dateTime: "31/12/2025 11:24:00 AM", version: "V3.2.1", calibration: "Accurate", qc: "Passed", status: "Pass", comments: "Calibration and QC completed successfully." },
    { id: 2, dateTime: "31/12/2025 11:24:00 AM", version: "V3.2.1", calibration: "Accurate", qc: "Passed", status: "Pass", comments: "Routine daily quality check performed." },
    { id: 3, dateTime: "31/12/2025 11:24:00 AM", version: "V3.2.1", calibration: "Accurate", qc: "Passed", status: "Pass", comments: "Minor calibration adjustment applied before testing." },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <div style={sectionStyle}>
        {/* Radio Selection */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Sperm Analyzer A", "Sperm Analyzer B", "Sperm Analyzer C", "Sperm Analyzer D", "Sperm Analyzer E"].map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
              <input type="radio" checked={selectedRadio === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316" }} />
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

        {/* Tab Content Logic */}
        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              <div style={{ position: "relative" }}>
                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Date</label>
              </div>

              <div style={{ position: "relative" }}>
                <input type="time" name="time" value={formData.time} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Time</label>
              </div>

              <div style={{ position: "relative" }}>
                <input type="text" name="softwareVersion" placeholder="Type Here" value={formData.softwareVersion} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Software Version</label>
              </div>

              <div style={{ position: "relative" }}>
                <select name="calibrationChecks" value={formData.calibrationChecks} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Accurate">Accurate</option>
                  <option value="Requires Adjustment">Requires Adjustment</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Calibration Checks</label>
              </div>

              <div style={{ position: "relative" }}>
                <select name="qualityControl" value={formData.qualityControl} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Quality Control Sample Testing</label>
              </div>

              <div style={{ position: "relative" }}>
                <input type="text" name="comments" placeholder="Type Here" value={formData.comments} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Comments</label>
              </div>

              <div style={{ position: "relative" }}>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Status</label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <button type="button" onClick={() => setFormData({ date: "", time: "", softwareVersion: "", calibrationChecks: "Accurate", qualityControl: "Passed", status: "Pass", comments: "" })} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>Clear</button>
              <button type="button" style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Save</button>
            </div>
          </>
        ) : (
          /* LOGS TABLE VIEW */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Software Version</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Calibration Checks</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>QC Sample Testing</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Status</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {logsData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 8px", color: "#0f172a", fontWeight: "500" }}>{log.dateTime}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.version}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.calibration}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.qc}</td>
                    <td style={{ padding: "16px 8px" }}>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: "16px", 
                        backgroundColor: "#DCFCE7", 
                        color: "#15803D", 
                        fontSize: "11px", 
                        fontWeight: "600",
                        border: "1px solid #BBF7D0"
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Card (Always Visible) */}
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

export default SpermAnalyzersForm;