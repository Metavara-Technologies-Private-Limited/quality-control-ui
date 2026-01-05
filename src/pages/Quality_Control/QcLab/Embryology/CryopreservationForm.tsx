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

const CryopreservationForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = useState({
    liquidNitrogenLevels: "",
    temperature: "",
    backSystemFunctionality: "Functional",
    alarmStatus: "Functional",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      liquidNitrogenLevels: "",
      temperature: "",
      backSystemFunctionality: "Functional",
      alarmStatus: "Functional",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 22, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -33 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -33 },
  ];

  // Updated form field style based on your requirements
  const inputStyle = {
    width: "304.6666564941406px",
    height: "50px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    paddingTop: "13px",
    paddingRight: "16px",
    paddingBottom: "13px",
    paddingLeft: "16px",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-between", // As per your styles
    opacity: 1, // As per your styles
    boxSizing: "border-box"
  };

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  const labelOverlayStyle = {
    position: "absolute",
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#64748b"
  };

  return (
    <div style={{ maxWidth: "1566px" }}>
      
      {/* SECTION 1: Radio Selection and Form Fields */}
      <div style={sectionStyle}>
        {/* Radio Buttons Row */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Cryo Tank A", "Cryo Tank B", "Cryo Tank C", "Cryo Tank D", "Cryo Tank E"].map((name) => (
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
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, 304.66px)", // Matches exact input width
          gap: "24px", 
          marginBottom: "32px",
          justifyContent: "start" 
        }}>
          {/* Liquid Nitrogen Levels */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <input
              type="text"
              placeholder="Type Here"
              value={formData.liquidNitrogenLevels}
              onChange={(e) => setFormData({ ...formData, liquidNitrogenLevels: e.target.value })}
              style={inputStyle}
            />
            <label style={labelOverlayStyle}>Liquid Nitrogen Levels (mm)</label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: &gt;100</p>
          </div>

          {/* Temperature */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <input
              type="text"
              placeholder="Type Here"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              style={inputStyle}
            />
            <label style={labelOverlayStyle}>Temperature (°C)</label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: -196 [-243]</p>
          </div>

          {/* Back System Functionality */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <select
              value={formData.backSystemFunctionality}
              onChange={(e) => setFormData({ ...formData, backSystemFunctionality: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label style={labelOverlayStyle}>Back System Functionality</label>
          </div>

          {/* Alarm Status */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <select
              value={formData.alarmStatus}
              onChange={(e) => setFormData({ ...formData, alarmStatus: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label style={labelOverlayStyle}>Alarm Status</label>
          </div>

          {/* Comments */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <input
              type="text"
              placeholder="Type Here"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              style={inputStyle}
            />
            <label style={labelOverlayStyle}>Comments</label>
          </div>

          {/* Status */}
          <div style={{ position: "relative", width: "304.66px" }}>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option>Pass</option>
              <option>Fail</option>
            </select>
            <label style={labelOverlayStyle}>Status</label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>Clear</button>
          <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Save</button>
        </div>
      </div>

      {/* SECTION 2: Activity Chart Card */}
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

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
              <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={false} tickLine={false} 
                label={{ value: 'No of parameters', angle: -90, position: 'insideLeft', offset: -35, style: { fill: '#9e9e9e', fontSize: 12, fontWeight: 500 } }} 
              />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '4px' }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
}; 

export default CryopreservationForm;