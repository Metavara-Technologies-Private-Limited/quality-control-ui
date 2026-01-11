import React, { useState, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const LFHForm = ({ selectedRadio, setSelectedRadio }: any) => {
  // NEW LOGIC: State and Ref for file handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getMappedName = (input: string) => {
    const val = input ? input.toString().toUpperCase() : "";
    if (val.includes("01") || val.endsWith(" A")) return "Laminar Air Flow A";
    if (val.includes("02") || val.endsWith(" B")) return "Laminar Air Flow B";
    if (val.includes("03") || val.endsWith(" C")) return "Laminar Air Flow C";
    if (val.includes("04") || val.endsWith(" D")) return "Laminar Air Flow D";
    if (val.includes("05") || val.endsWith(" E")) return "Laminar Air Flow E";
    return input;
  };

  const currentSelection = getMappedName(selectedRadio);

  // NEW LOGIC: Trigger file explorer
  const handleLinkClick = () => {
    fileInputRef.current?.click();
  };

  // NEW LOGIC: Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // NEW LOGIC: Open file in new tab
  const handleViewFile = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, "_blank");
    }
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

  const inputContainerStyle = { position: "relative" as const, marginBottom: "20px" };
  const inputStyle = { width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: 'none' };
  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" };
  const rangeTextStyle = { fontSize: "11px", marginTop: "4px", color: '#94a3b8' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        
        {/* NEW LOGIC: Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
          {["Laminar Air Flow A", "Laminar Air Flow B", "Laminar Air Flow C", "Laminar Air Flow D", "Laminar Air Flow E"].map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: currentSelection === name ? "700" : "500", color: currentSelection === name ? "#f97316" : "#0f172a", cursor: "pointer" }}>
              <input type="radio" checked={currentSelection === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316", width: '16px', height: '16px' }} />
              {name}
            </label>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Airflow Velocity (m/s)</label>
            <div style={rangeTextStyle}>Range : 0.45 - 0.75</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Intact">
              <option value="Intact">Intact</option>
              <option value="Damaged">Damaged</option>
              <option value="Needs Replacement">Needs Replacement</option>
            </select>
            <label style={labelStyle}>HEPA Filter Integrity</label>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} defaultValue="Functional">
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelStyle}>UV Light Functionality</label>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type Here" />
            <label style={labelStyle}>Cleanliness & Decontamination Log</label>
            <div style={rangeTextStyle}>Range : 0.45 - 0.75</div>
          </div>

          {/* UPDATED LOGIC: File Upload Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '50px' }}>
            <div style={{ 
              backgroundColor: '#F1F5F9', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', 
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', flex: 1, overflow: 'hidden'
            }}>
              <span style={{ color: '#3B82F6', cursor: 'pointer' }} onClick={handleLinkClick}>🔗</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {uploadedFile ? uploadedFile.name : "Sample ID.doc"}
              </span>
              {uploadedFile && (
                <span style={{ color: '#EF4444', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setUploadedFile(null)}>✕</span>
              )}
            </div>
            
            {/* View Icon (Red dot changes to View when file exists) */}
            <div 
              onClick={handleViewFile}
              style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: uploadedFile ? '#f97316' : '#FEF2F2', 
                border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploadedFile ? 'pointer' : 'default'
              }}
            >
              <div style={{ 
                width: uploadedFile ? 'auto' : '8px', 
                height: uploadedFile ? 'auto' : '8px', 
                backgroundColor: uploadedFile ? 'transparent' : '#EF4444', 
                borderRadius: '50%',
                color: 'white',
                fontSize: '12px'
              }}>
                {uploadedFile ? '👁️' : ''}
              </div>
            </div>
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: '10px' }}>
          <button onClick={() => setUploadedFile(null)} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Clear</button>
          <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Save</button>
        </div>
      </div>

      {/* Activity Graph Section */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
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
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} 
                label={({ x, y, value, width }: any) => (<text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{Math.abs(value)}</text>)} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LFHForm;