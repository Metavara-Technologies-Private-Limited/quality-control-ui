 

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';


const IncubatorForm = ({ selectedRadio, setSelectedRadio, formData, setFormData, handleClearForm }) => {
  const activityData = [
    { month: "02", compliant: 34, nonCompliant: -23 },
    { month: "34", compliant: 28, nonCompliant: -22 },
    { month: "06", compliant: 22, nonCompliant: 0 },
    { month: "34", compliant: 34, nonCompliant: -12 },
    { month: "29", compliant: 29, nonCompliant: -28 },
    { month: "15", compliant: 15, nonCompliant: -32 },
    { month: "28", compliant: 28, nonCompliant: -25 },
  ];

  // Common card style to separate form from graph
  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      
      {/* SECTION 1: Radio Selection, Form Inputs, and Action Buttons */}
      <div style={sectionStyle}>
        {/* Radio Buttons Row */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Incubator A", "Incubator B", "Incubator C", "Incubator D", "Incubator E"].map((name) => (
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
            <input type="text" placeholder=" " value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", borderRadius: "8px", fontSize: "14px", color: "#dc2626", outline: "none" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fef2f2", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Temperature (°C)</label>
            <p style={{ fontSize: "11px", color: "#dc2626", margin: "4px 0 0 0" }}>Recommended: 36.5°C - ... | <span style={{ color: "#f97316" }}>Range: 36.5 °C - 37.3 °C</span></p>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder=" " value={formData.co2Concentration} onChange={(e) => setFormData({ ...formData, co2Concentration: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>CO2 Concentration (%)</label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 5% - 6%</p>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder=" " value={formData.humidity} onChange={(e) => setFormData({ ...formData, humidity: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #fef3c7", backgroundColor: "#fffbeb", borderRadius: "8px", fontSize: "14px", color: "#d97706", outline: "none" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fffbeb", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Humidity Levels (%)</label>
            <p style={{ fontSize: "11px", color: "#d97706", margin: "4px 0 0 0" }}>Range: 30% - 60%</p>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder=" " value={formData.alarmResponseTime} onChange={(e) => setFormData({ ...formData, alarmResponseTime: e.target.value })} style={{width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Response Time (Mins)</label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: &lt; 5</p>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder=" " value={formData.gasMixture} onChange={(e) => setFormData({ ...formData, gasMixture: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Gas Mixture (% O2, CO2)</label>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: O2 &gt; 20; CO2: 5</p>
          </div>

          <div style={{ position: "relative" }}>
            <select value={formData.alarmStatus} onChange={(e) => setFormData({ ...formData, alarmStatus: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Status</label>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder=" " value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} style={{ width:"100%", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
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

        <div style={{ display: "flex", alignItems: "center", gap: "32px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", marginBottom: "32px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Make : <strong style={{ color: "#0f172a" }}>Lorem Ipsum</strong></span>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Model : <strong style={{ color: "#0f172a" }}>Lorem Ipsum</strong></span>
        </div>

        {/* Action Buttons Section */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a", transition: "all 0.2s" }}>Clear</button>
          <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}>Save</button>
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

        <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={activityData} 
              stackOffset="sign" 
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9e9e9e' }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <YAxis
                domain={[-40, 40]}
                ticks={[-40, -20, 0, 20, 40]}
                tick={{ fontSize: 12, fill: '#9e9e9e' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} 
              />
              
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <ReferenceLine y={20} stroke="#F1F1F1" />
              <ReferenceLine y={40} stroke="#F1F1F1" />
              <ReferenceLine y={-20} stroke="#F1F1F1" />
              <ReferenceLine y={-40} stroke="#F1F1F1" />

              <Bar 
                dataKey="compliant" 
                fill="#6c6c6c" 
                radius={[4, 4, 0, 0]} 
                barSize={15} 
                label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} 
              />
              <Bar 
                dataKey="nonCompliant" 
                fill="#EF9685" 
                radius={[0, 0, 4, 4]} 
                barSize={15} 
                label={({ x, y, value, width }) => (
                  <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">
                    {value}
                  </text>
                )} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

export default IncubatorForm;