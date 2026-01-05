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




const PHMetersForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = useState({
    calibrationChecks: "Accurate",
    electrodeCondition: "Clean",
    temperatureCompensation: "Functional",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      calibrationChecks: "Accurate",
      electrodeCondition: "Clean",
      temperatureCompensation: "Functional",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 24, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -23 },
    { day: "Wednesday", compliant: 22, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 28, nonCompliant: -33 },
    { day: "Saturday", compliant: 15, nonCompliant: -10 },
    { day: "Sunday", compliant: 25, nonCompliant: -33 },
  ];

  // Card style for consistent separate sections
  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px", // Gap between form and chart boxes
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      
      {/* SECTION 1: Radio Buttons, Form Fields, and Submission */}
      <div style={sectionStyle}>
        {/* Radio Buttons */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            paddingBottom: "24px",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {["pH Meters A", "pH Meters B", "pH Meters C", "pH Meters D", "pH Meters E"].map((name) => (
            <label
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                color: "#0f172a",
              }}
            >
              <input
                type="radio"
                name="equipment"
                checked={selectedRadio === name}
                onChange={() => setSelectedRadio(name)}
                style={{
                  accentColor: "#f97316",
                  width: "16px",
                  height: "16px",
                }}
              />
              {name}
            </label>
          ))}
        </div>

        {/* Form Fields Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Calibration Checks */}
          <div style={{ position: "relative" }}>
            <select
              value={formData.calibrationChecks}
              onChange={(e) => setFormData({ ...formData, calibrationChecks: e.target.value })}
              style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}
            >
              <option>Accurate</option>
              <option>Needs Calibration</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              Calibration Checks
            </label>
          </div>

          {/* Electrode Condition */}
          <div style={{ position: "relative" }}>
            <select
              value={formData.electrodeCondition}
              onChange={(e) => setFormData({ ...formData, electrodeCondition: e.target.value })}
              style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}
            >
              <option>Clean</option>
              <option>Dirty</option>
              <option>Needs Replacement</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              Electrode Condition
            </label>
          </div>

          {/* Temperature Compensation Verification */}
          <div style={{ position: "relative" }}>
            <select
              value={formData.temperatureCompensation}
              onChange={(e) => setFormData({ ...formData, temperatureCompensation: e.target.value })}
              style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              Temperature Compensation Verification
            </label>
          </div>

          {/* Comments */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Type Here"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
            />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              Comments
            </label>
          </div>

          {/* Status */}
          <div style={{ position: "relative" }}>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}
            >
              <option>Pass</option>
              <option>Fail</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
              Status
            </label>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <button
            onClick={handleClearForm}
            style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}
          >
            Clear
          </button>
          <button
            style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
          >
            Save
          </button>
        </div>
      </div>

      {/* SECTION 2: Activity Chart */}
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
                     <ReferenceLine y={20} stroke="#F1F1F1" />
                     <ReferenceLine y={40} stroke="#F1F1F1" />
                     <ReferenceLine y={-20} stroke="#F1F1F1" />
                     <ReferenceLine y={-40} stroke="#F1F1F1" />
                     <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} />
                     <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} 
                       label={({ x, y, value, width }: any) => (<text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{Math.abs(value)}</text>)} 
                     />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};
export default PHMetersForm;