import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

const OvensWaterBathForm = ({ selectedRadio, setSelectedRadio }) => {
  const [activeSubTab, setActiveSubTab] = useState("Ovens");

  const radioLabels = activeSubTab === "Ovens" 
    ? ["Oven A", "Oven B", "Oven C", "Oven D", "Oven E"]
    : ["Water Bath A", "Water Bath B", "Water Bath C", "Water Bath D", "Water Bath E"];

  const handleTabSwitch = (tab) => {
    setActiveSubTab(tab);
    setSelectedRadio(tab === "Ovens" ? "Oven A" : "Water Bath A");
  };

  const [formData, setFormData] = useState({
    temperatureConsistency: "",
    waterLevelMonitoring: "Sufficient",
    alarmFunctionality: "Functional",
    cleanlinessLog: "",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      temperatureConsistency: "",
      waterLevelMonitoring: "Sufficient",
      alarmFunctionality: "Functional",
      cleanlinessLog: "",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 26, nonCompliant: -12 },
    { day: "Thursday", compliant: 34, nonCompliant: -0 },
    { day: "Friday", compliant: 30, nonCompliant: -28 },
    { day: "Saturday", compliant: 16, nonCompliant: -33 },
    { day: "Sunday", compliant: 23, nonCompliant: -33 },
  ];

  // Reusable card style for separate borders
  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      
      {/* SECTION 1: Tabs, Radio Selection, and Form Fields */}
      <div style={sectionStyle}>
        {/* Sub-Tabs Header */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
          <button 
            onClick={() => handleTabSwitch("Ovens")}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "transparent", 
              border: "none", 
              borderBottom: activeSubTab === "Ovens" ? "2px solid #f97316" : "2px solid transparent", 
              fontSize: "13px", 
              fontWeight: "500", 
              color: activeSubTab === "Ovens" ? "#f97316" : "#94a3b8", 
              cursor: "pointer" 
            }}
          >
            Ovens
          </button>
          <button 
            onClick={() => handleTabSwitch("Water Bath")}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "transparent", 
              border: "none", 
              borderBottom: activeSubTab === "Water Bath" ? "2px solid #f97316" : "2px solid transparent", 
              fontSize: "13px", 
              fontWeight: "500", 
              color: activeSubTab === "Water Bath" ? "#f97316" : "#94a3b8", 
              cursor: "pointer" 
            }}
          >
            Water Bath
          </button>
        </div>

        {/* Dynamic Radio Selection */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {radioLabels.map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
              <input 
                type="radio" 
                name="equipment" 
                checked={selectedRadio === name} 
                onChange={() => setSelectedRadio(name)} 
                style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
              />
              {name}
            </label>
          ))}
        </div>

        {/* Form Fields Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <input type="text" placeholder="Type Here" value={formData.temperatureConsistency} onChange={(e) => setFormData({ ...formData, temperatureConsistency: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              {activeSubTab === "Ovens" ? "Temperature Consistency (°C)" : "Temperature Consistency (°C)"}
            </label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 37 °C For Embryo Culture</p>
          </div>

          <div style={{ position: "relative" }}>
            <select value={formData.waterLevelMonitoring} onChange={(e) => setFormData({ ...formData, waterLevelMonitoring: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Sufficient</option>
              <option>Insufficient</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Water Level Monitoring</label>
          </div>

          <div style={{ position: "relative" }}>
            <select value={formData.alarmFunctionality} onChange={(e) => setFormData({ ...formData, alarmFunctionality: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Functionality</label>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder="Type Here" value={formData.cleanlinessLog} onChange={(e) => setFormData({ ...formData, cleanlinessLog: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Cleanliness & Decontamination Log</label>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder="Type Here" value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Comments</label>
          </div>

          <div style={{ position: "relative" }}>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Pass</option>
              <option>Fail</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Status</label>
          </div>
        </div>

        {/* Action Buttons within Section 1 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>Clear</button>
          <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Save</button>
        </div>
      </div>

      {/* SECTION 2: Activity Graph */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
              <span style={{ color: '#9e9e9e' }}>Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
              <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
              <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <ReferenceLine y={20} stroke="#F1F1F1" />
              <ReferenceLine y={40} stroke="#F1F1F1" />
              <ReferenceLine y={-20} stroke="#F1F1F1" />
              <ReferenceLine y={-40} stroke="#F1F1F1" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} label={({ x, y, value, width }) => (
                <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{value}</text>
              )} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>

    </div>
  );
};
export default OvensWaterBathForm;