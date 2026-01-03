import { useState } from "react";


const OvensWaterBathForm = ({ selectedRadio, setSelectedRadio }) => {
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

  const maxValue = 40;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", maxWidth: "1200px" }}>
      <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
        {["Oven A", "Oven B", "Oven C", "Oven D", "Oven E"].map((name) => (
          <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
            <input type="radio" name="equipment" checked={selectedRadio === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316", width: "16px", height: "16px" }} />
            {name}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
        <button style={{ padding: "8px 16px", backgroundColor: "transparent", border: "none", borderBottom: "2px solid #f97316", fontSize: "13px", fontWeight: "500", color: "#f97316", cursor: "pointer" }}>Ovens</button>
        <button style={{ padding: "8px 16px", backgroundColor: "transparent", border: "none", fontSize: "13px", fontWeight: "500", color: "#94a3b8", cursor: "pointer" }}>Water Bath</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.temperatureConsistency} onChange={(e) => setFormData({ ...formData, temperatureConsistency: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Temperature Consistency (°C)</label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 37 °C For Embryo Culture</p>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.waterLevelMonitoring} onChange={(e) => setFormData({ ...formData, waterLevelMonitoring: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Sufficient</option>
            <option>Insufficient</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Water Level Monitoring</label>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.alarmFunctionality} onChange={(e) => setFormData({ ...formData, alarmFunctionality: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Functionality</label>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.cleanlinessLog} onChange={(e) => setFormData({ ...formData, cleanlinessLog: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Cleanliness & Decontamination Log</label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 0.45 - 0.75</p>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Comments</label>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Status</label>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>📊 Activity</h3>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#475569" }} />
              Compliant
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#f87171" }} />
              Non - Compliant
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "200px", padding: "16px", backgroundColor: "#fafafa", borderRadius: "8px", overflowX: "auto" }}>
          {activityData.map((item, i) => (
            <div key={i} style={{ flex: "1 0 60px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", height: "100%", justifyContent: "center" }}>
              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", position: "absolute", top: `${50 - (item.compliant / maxValue) * 50 - 10}%` }}>{item.compliant}</div>
              <div style={{ width: "100%", height: `${(item.compliant / maxValue) * 50}%`, backgroundColor: "#475569", borderRadius: "4px 4px 0 0" }} />
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", padding: "4px 0" }}>{item.day.slice(0, 3)}</div>
              <div style={{ width: "100%", height: `${(Math.abs(item.nonCompliant) / maxValue) * 50}%`, backgroundColor: "#f87171", borderRadius: "0 0 4px 4px" }} />
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", position: "absolute", bottom: `${(Math.abs(item.nonCompliant) / maxValue) * 50 - 5}%` }}>{item.nonCompliant}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a", transition: "all 0.2s" }}>Clear</button>
        <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}>Save</button>
      </div>
    </div>
  );
};

export default OvensWaterBathForm;