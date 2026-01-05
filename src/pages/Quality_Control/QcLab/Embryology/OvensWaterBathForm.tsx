import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const OvensWaterBathForm = ({ selectedRadio, setSelectedRadio }: any) => {
  // Main tabs to switch between Oven and Water Bath
  const [activeCategory, setActiveCategory] = useState("Ovens");

  const [formData, setFormData] = useState({
    tempConsistency: "",
    waterLevel: "Sufficient",
    alarmFunctionality: "Functional",
    decontaminationLog: "",
    status: "Pass",
    comments: "",
  });

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -23 },
    { day: "Tuesday", compliant: 28, nonCompliant: -22 },
    { day: "Wednesday", compliant: 22, nonCompliant: -36 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -28 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -25 },
  ];

  const inputContainerStyle = { position: "relative" as const, marginBottom: "20px" };
  const inputStyle = { width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: 'none' };
  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" };
  const rangeTextStyle = { fontSize: "11px", marginTop: "4px", color: '#94a3b8' };

  // Define radio button labels based on active category
  const radioOptions = activeCategory === "Ovens" 
    ? ["Oven A", "Oven B", "Oven C", "Oven D", "Oven E"] 
    : ["Water Bath A", "Water Bath B", "Water Bath C", "Water Bath D", "Water Bath E"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECTION 1: Technical Details Card */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        
        {/* Category Tabs: Ovens / Water Bath */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {["Ovens", "Water Bath"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 24px",
                borderRadius: "10px",
                border: activeCategory === cat ? "1px solid #E17E61" : "1px solid #e5e7eb",
                backgroundColor: activeCategory === cat ? "#FFF5F2" : "#fff",
                color: activeCategory === cat ? "#E17E61" : "#94a3b8",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Dynamic Unit Selector Radios */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
          {radioOptions.map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
              <input 
                type="radio" 
                name="unit-selection"
                checked={selectedRadio === name} 
                onChange={() => setSelectedRadio(name)} 
                style={{ accentColor: "#f97316", width: '16px', height: '16px' }} 
              />
              {name}
            </label>
          ))}
        </div>

        {/* Parameter Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Temperature Consistency (°C)</label>
            <div style={rangeTextStyle}>Range : 37 °C For Embryo Culture</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Sufficient">
              <option value="Sufficient">Sufficient</option>
              <option value="Low">Low</option>
              <option value="Empty">Empty</option>
            </select>
            <label style={labelStyle}>Water Level Monitoring</label>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Functional">
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelStyle}>Alarm Functionality</label>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Cleanliness & Decontamination Log</label>
            <div style={rangeTextStyle}>Range : 0.45 - 0.75</div>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Comments</label>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Pass">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label style={labelStyle}>Status</label>
          </div>
        </div>

        {/* Actions and Make/Model info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '24px', marginTop: '10px' }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Clear</button>
            <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Save</button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Activity Graph */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
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

        <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}></div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
              <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={false} tickLine={false} 
                label={{ value: 'No of parameters', angle: -90, position: 'insideLeft', offset: -35, style: { fill: '#9e9e9e', fontSize: 12, fontWeight: 500 } }} 
              />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '4px' }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <ReferenceLine y={20} stroke="#F1F1F1" />
              <ReferenceLine y={40} stroke="#F1F1F1" />
              <ReferenceLine y={-20} stroke="#F1F1F1" />
              <ReferenceLine y={-40} stroke="#F1F1F1" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} 
                label={({ x, y, value, width }: any) => (<text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{value}</text>)} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '12px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

export default OvensWaterBathForm;