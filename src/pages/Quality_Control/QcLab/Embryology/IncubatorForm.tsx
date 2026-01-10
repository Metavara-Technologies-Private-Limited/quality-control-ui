import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface IncubatorFormProps {
  selectedRadio: string;
  setSelectedRadio: (name: string) => void;
  // make and model are now handled internally via mapping logic
}

const IncubatorForm = ({ selectedRadio, setSelectedRadio }: IncubatorFormProps) => {
  
  // 1. DATA LOGIC: Mapping Sidebar Names to Specific Unit Specs
  // This matches the data you saved in your AddParameterPage table
  const equipmentSpecs: Record<string, { make: string; model: string }> = {
    "Incubator A": { make: "Thermo Fisher", model: "Heracell VIOS 160i" },
    "Incubator B": { make: "Panasonic", model: "MCO-170AICUV" },
    "Incubator C": { make: "Esco", model: "CCL-170B-8" },
    "Incubator D": { make: "Binder", model: "CB 170" },
    "Incubator E": { make: "Memmert", model: "ICO150" },
  };

  // 2. TRANSLATOR LOGIC: Map incoming sidebar name (e.g. "Incubator 01") to Form Radio (e.g. "Incubator A")
  const getMappedName = (input: string) => {
    const val = input ? input.toString().toUpperCase() : "";
    
    if (val.includes("INCUBATOR 1") || val.includes("INCUBATOR 01") || val.endsWith(" A")) return "Incubator A";
    if (val.includes("INCUBATOR 2") || val.includes("INCUBATOR 02") || val.endsWith(" B")) return "Incubator B";
    if (val.includes("INCUBATOR 3") || val.includes("INCUBATOR 03") || val.endsWith(" C")) return "Incubator C";
    if (val.includes("INCUBATOR 4") || val.includes("INCUBATOR 04") || val.endsWith(" D")) return "Incubator D";
    if (val.includes("INCUBATOR 5") || val.includes("INCUBATOR 05") || val.endsWith(" E")) return "Incubator E";
    
    return input; 
  };

  const currentSelection = getMappedName(selectedRadio);

  // 3. STATE LOGIC: State to hold the Make/Model for the current selection
  const [currentSpecs, setCurrentSpecs] = useState({ make: "N/A", model: "N/A" });

  useEffect(() => {
    // Whenever currentSelection changes, update the Make/Model display
    if (equipmentSpecs[currentSelection]) {
      setCurrentSpecs(equipmentSpecs[currentSelection]);
    } else {
      setCurrentSpecs({ make: "N/A", model: "N/A" });
    }
  }, [currentSelection]);

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
  const inputStyle = { width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" };
  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" };
  const rangeTextStyle = { fontSize: "11px", marginTop: "4px" };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECTION 1: Details Card */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        
        {/* Unit Selector Radios */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
          {["Incubator A", "Incubator B", "Incubator C", "Incubator D", "Incubator E"].map((name) => (
            <label key={name} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              fontSize: "13px", 
              fontWeight: currentSelection === name ? "700" : "500", 
              color: currentSelection === name ? "#f97316" : "#64748b", 
              cursor: "pointer" 
            }}>
              <input 
                type="radio" 
                name="incubator-unit-choice"
                checked={currentSelection === name} 
                onChange={() => setSelectedRadio(name)} 
                style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
              />
              {name}
            </label>
          ))}
        </div>

        {/* Form Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={inputContainerStyle}>
            <input style={inputStyle} defaultValue="38.5 °C" />
            <label style={labelStyle}>Temperature (°C)</label>
            <div style={rangeTextStyle}>
              <span style={{color: '#94a3b8'}}>Recommended : 36.5 °C - ... | </span>
              <span style={{color: '#ef4444'}}>Range : 36.5 °C - 37.5°C</span>
            </div>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>CO2 Concentration (%)</label>
            <div style={{...rangeTextStyle, color: '#94a3b8'}}>Range : 5% - 6%</div>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} defaultValue="20%" />
            <label style={labelStyle}>Humidity Levels (%)</label>
            <div style={{...rangeTextStyle, color: '#eab308'}}>Range : 30% - 60%</div>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
            <div style={{...rangeTextStyle, color: '#94a3b8'}}>Range : O2 - 20, CO2 - 5</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Functional">
              <option value="Functional">Functional</option>
              <option value="Maintenance Required">Maintenance Required</option>
            </select>
            <label style={labelStyle}>Alarm Status</label>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Alarm Response Time (Mins)</label>
            <div style={{...rangeTextStyle, color: '#94a3b8'}}>Range : &lt; 5</div>
          </div>
        </div>

        {/* MAKE AND MODEL SECTION - DYNAMIC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#94a3b8' }}>Make :</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{currentSpecs.make}</span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: '#e5e7eb' }}></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#94a3b8' }}>Model :</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{currentSpecs.model}</span>
          </div>
          
          <div style={{ marginLeft: 'auto', display: "flex", gap: "12px" }}>
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
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} 
                label={({ x, y, value, width }: any) => (<text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{Math.abs(value)}</text>)} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '12px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

export default IncubatorForm;