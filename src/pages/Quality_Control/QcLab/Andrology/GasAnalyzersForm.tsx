import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const GasAnalyzersForm = ({ selectedRadio, setSelectedRadio }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");

  const initialFormState = {
    date: "2025-12-31",
    time: "11:24",
    gasMixture: "",
    calibrationChecks: "Accurate",
    sensorCondition: "Good",
    status: "Pass",
    comments: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // LOGIC: logsData is now a state starting as an empty array
  const [logsData, setLogsData] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // LOGIC: Function to capture form fields and add to log table
  const handleSave = () => {
    if (!formData.gasMixture) {
      toast.error("Please enter the Gas Mixture values.");
      return;
    }

    const newLogEntry = {
      id: Date.now(),
      dateTime: `${formData.date} ${formData.time}:00 AM`,
      mixture: formData.gasMixture,
      calibration: formData.calibrationChecks,
      sensor: formData.sensorCondition,
      status: formData.status,
      comments: formData.comments || "N/A",
    };

    // Update state and trigger notification
    setLogsData([newLogEntry, ...logsData]);
    
    toast.success("Successfully Saved!", {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
    });

    setFormData(initialFormState);
    setActiveSubTab("Logs"); // Navigate to logs tab
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
      <ToastContainer />
      <div style={sectionStyle}>
        {/* Unit Selection Row */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Gas Analyzers A", "Gas Analyzers B", "Gas Analyzers C", "Gas Analyzers D", "Gas Analyzers E"].map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
              <input type="radio" checked={selectedRadio === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316", width: "16px", height: "16px" }} />
              {name}
            </label>
          ))}
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button key={tab} type="button" onClick={() => setActiveSubTab(tab)} style={{
                padding: "6px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", cursor: "pointer",
                backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "600" : "400",
                boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}>{tab}</button>
          ))}
        </div>

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
                <input type="text" name="gasMixture" placeholder="Type Here" value={formData.gasMixture} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Gas Mixture (% O2, CO2)</label>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Range : O2 - 21, CO2 - 5</p>
              </div>
              <div style={{ position: "relative" }}>
                <select name="calibrationChecks" value={formData.calibrationChecks} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Accurate">Accurate</option>
                  <option value="Needs Adjustment">Needs Adjustment</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Calibration Checks</label>
              </div>
              <div style={{ position: "relative" }}>
                <select name="sensorCondition" value={formData.sensorCondition} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Good">Good</option>
                  <option value="Needs Cleaning">Needs Cleaning</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Sensor Condition</label>
              </div>
              <div style={{ position: "relative" }}>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Status</label>
              </div>
            </div>
            <div style={{ position: "relative", marginBottom: "32px" }}>
              <input type="text" name="comments" placeholder="Type Here" value={formData.comments} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Comments</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <button type="button" onClick={() => setFormData(initialFormState)} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Clear</button>
              <button type="button" onClick={handleSave} style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Save</button>
            </div>
          </>
        ) : (
          /* LOGS VIEW - Displays all 7 fields */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px" }}>Mixture</th>
                  <th style={{ padding: "12px 8px" }}>Calibration</th>
                  <th style={{ padding: "12px 8px" }}>Sensor</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                  <th style={{ padding: "12px 8px" }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {logsData.length > 0 ? logsData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 8px", color: "#0f172a", fontWeight: "600", whiteSpace: "nowrap" }}>{log.dateTime}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.mixture}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.calibration}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.sensor}</td>
                    <td style={{ padding: "16px 8px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "16px", backgroundColor: log.status === "Pass" ? "#DCFCE7" : "#FEE2E2", color: log.status === "Pass" ? "#15803D" : "#B91C1C", fontSize: "11px", fontWeight: "600", display: "inline-block" }}>{log.status}</span>
                    </td>
                    <td style={{ padding: "16px 8px", color: "#64748b", minWidth: "200px" }}>{log.comments}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '14px' }}>📈</span></div><h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3></div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} /><span style={{ color: '#9e9e9e' }}>Compliant</span></div><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#EF9685', borderRadius: '50%' }} /><span style={{ color: '#9e9e9e' }}>Non - Compliant</span></div></div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} label={{ value: 'No of Parameters', angle: -90, position: 'insideLeft', offset: -30, style: { fill: '#9e9e9e', fontSize: 12 } }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} label={{ position: 'top', fill: '#6c6c6c', fontSize: 10, dy: -5 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} label={{ position: 'bottom', fill: '#EF9685', fontSize: 10, dy: 5 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

export default GasAnalyzersForm;