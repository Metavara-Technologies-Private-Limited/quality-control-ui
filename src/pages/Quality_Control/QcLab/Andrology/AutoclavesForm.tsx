import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Eye, X, ArrowLeft, Link as LinkIcon, FileText, Download, Calendar, Clock } from "lucide-react";

const AutoclavesForm = ({ selectedRadio = "", setSelectedRadio }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [viewingFile, setViewingFile] = useState<{name: string, data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    date: "2025-12-31",
    time: "11:24 AM",
    temperature: "",
    pressure: "",
    sterilizationCycle: "Valid",
    maintenanceLogs: "",
    status: "Pass",
    comments: "",
    fileName: "Sample ID.doc", 
    fileData: "", 
    fileType: "", 
  });

  const [logsData, setLogsData] = useState<any[]>([]);

  const getMappedName = (input: string) => {
    if (!input) return "Autoclaves B";
    const val = input.toString().toUpperCase();
    if (val.includes("01") || val.includes(" 1") || val.endsWith(" A")) return "Autoclaves A";
    if (val.includes("02") || val.includes(" 2") || val.endsWith(" B")) return "Autoclaves B";
    if (val.includes("03") || val.includes(" 3") || val.endsWith(" C")) return "Autoclaves C";
    if (val.includes("04") || val.includes(" 4") || val.endsWith(" D")) return "Autoclaves D";
    if (val.includes("05") || val.includes(" 5") || val.endsWith(" E")) return "Autoclaves E";
    return input;
  };

  const currentSelection = getMappedName(selectedRadio);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          fileName: file.name,
          fileData: reader.result as string,
          fileType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.temperature || !formData.pressure) {
      toast.error("Please fill in Temperature and Pressure!");
      return;
    }
    const newEntry = {
      ...formData,
      id: Date.now(),
      dateTime: `${formData.date} ${formData.time}`,
    };
    setLogsData([newEntry, ...logsData]);
    toast.success("Successfully Saved!");
    setActiveSubTab("Logs");
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

  if (viewingFile) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", minHeight: '600px' }}>
        <button onClick={() => setViewingFile(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#E17E61', fontWeight: '700', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          <div style={{ padding: '12px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
            <span style={{ fontWeight: '600' }}>Viewing: {viewingFile.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#fff', minHeight: '400px' }}>
            {viewingFile.type.startsWith("image/") ? (
              <img src={viewingFile.data} alt="preview" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
            ) : viewingFile.type === "application/pdf" ? (
              <iframe src={viewingFile.data} width="100%" height="500px" title="pdf-preview" />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FileText size={64} color="#cbd5e1" />
                <p>Preview not available. <a href={viewingFile.data} download={viewingFile.name} style={{color: '#E17E61'}}>Download</a> to view.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "16px" }}>
        {/* Unit Selector */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px" }}>
          {["Autoclaves A", "Autoclaves B", "Autoclaves C", "Autoclaves D", "Autoclaves E"].map((name) => (
            <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: currentSelection === name ? "700" : "500", color: currentSelection === name ? "#000" : "#64748b", cursor: "pointer" }}>
              <input type="radio" checked={currentSelection === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316" }} />
              {name}
            </label>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button key={tab} onClick={() => setActiveSubTab(tab)} style={{ padding: "8px 32px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent", color: activeSubTab === tab ? "#E17E61" : "#94a3b8", fontWeight: "600", boxShadow: activeSubTab === tab ? "0px 2px 4px rgba(0,0,0,0.05)" : "none" }}>{tab}</button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
              {/* Date */}
              <div style={{ position: "relative" }}>
                <div style={{ display: 'flex', alignItems: 'center', width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <span style={{flex: 1, fontSize: '14px'}}>{formData.date}</span>
                  <Calendar size={18} color="#64748b" />
                </div>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Date</label>
              </div>

              {/* Time */}
              <div style={{ position: "relative" }}>
                <div style={{ display: 'flex', alignItems: 'center', width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <span style={{flex: 1, fontSize: '14px'}}>{formData.time}</span>
                  <Clock size={18} color="#64748b" />
                </div>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Time</label>
              </div>

              {/* Temperature */}
              <div style={{ position: "relative" }}>
                <input type="text" name="temperature" placeholder="Type Here" value={formData.temperature} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none' }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Temperature (°C)</label>
                <span style={{fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block'}}>Range : 121 °C - 134 °C</span>
              </div>

              {/* Pressure */}
              <div style={{ position: "relative" }}>
                <input type="text" name="pressure" placeholder="Type Here" value={formData.pressure} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none' }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Pressure (kPa)</label>
                <span style={{fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block'}}>Range : 121 °C - 134 °C</span>
              </div>

              {/* Sterilization */}
              <div style={{ position: "relative" }}>
                <select name="sterilizationCycle" value={formData.sterilizationCycle} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none', appearance: 'none', background: 'white' }}>
                  <option value="Valid">Valid</option>
                  <option value="Invalid">Invalid</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Sterilization Cycle Validation</label>
              </div>

              {/* Maintenance */}
              <div style={{ position: "relative" }}>
                <input type="text" name="maintenanceLogs" placeholder="Type Here" value={formData.maintenanceLogs} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none' }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Maintenance Logs</label>
              </div>

              {/* UPLOAD FIELD WITH EYE ICON IN RED CIRCLE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: '#F0F4FF' }}>
                  <LinkIcon size={18} color="#3b82f6" cursor="pointer" onClick={() => fileInputRef.current?.click()} style={{marginRight: '12px'}} />
                  <div style={{ flex: 1, backgroundColor: '#E0E7FF', padding: '4px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b' }}>{formData.fileName}</span>
                    <X size={14} color="#ef4444" cursor="pointer" onClick={() => setFormData({...formData, fileName: "No File", fileData: ""})} />
                  </div>
                  <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Uploads</label>
                </div>
                
                {/* THE RED/GREEN INDICATOR CIRCLE WITH EYE ICON */}
                <div 
                  onClick={() => formData.fileData && setViewingFile({name: formData.fileName, data: formData.fileData, type: formData.fileType})}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    border: formData.fileData ? '2px solid #DEEFE1' : '2px solid #FEF2F2', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: formData.fileData ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%', 
                    backgroundColor: formData.fileData ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Eye size={16} color="white" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ position: "relative" }}>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none', appearance: 'none', background: 'white' }}>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Status</label>
              </div>

              {/* Comments */}
              <div style={{ position: "relative" }}>
                <input type="text" name="comments" placeholder="Type Here" value={formData.comments} onChange={handleChange} style={{ width: "100%", height: "50px", padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: "8px", outline: 'none' }} />
                <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" }}>Comments</label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setFormData({...formData, temperature: "", pressure: "", maintenanceLogs: "", comments: ""})} style={{ padding: "10px 40px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#000" }}>Clear</button>
              <button onClick={handleSave} style={{ padding: "10px 40px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Save</button>
            </div>
          </>
        ) : (
          /* Logs View logic remains same as provided previously */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: "12px" }}>Date & Time</th>
                  <th style={{ padding: "12px" }}>Temp.</th>
                  <th style={{ padding: "12px" }}>Uploads</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {logsData.length > 0 ? logsData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: '600' }}>{log.dateTime}</td>
                    <td style={{ padding: "12px" }}>{log.temp}</td>
                    <td style={{ padding: "12px", color: '#3b82f6' }}>{log.fileName}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "16px", backgroundColor: log.status === "Pass" ? "#DCFCE7" : "#FEE2E2", color: log.status === "Pass" ? "#15803D" : "#B91C1C", fontSize: "11px", fontWeight: "600" }}>{log.status}</span>
                    </td>
                    <td style={{ padding: "12px" }}>
                       {log.fileData && <Eye size={18} color="#64748b" cursor="pointer" onClick={() => setViewingFile({name: log.fileName, data: log.fileData, type: log.fileType})} />}
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No logs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Chart Card */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '14px' }}>📈</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <ReferenceLine y={20} stroke="#F1F1F1" />
              <ReferenceLine y={40} stroke="#F1F1F1" />
              <ReferenceLine y={-20} stroke="#F1F1F1" />
              <ReferenceLine y={-40} stroke="#F1F1F1" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} label={{ value: 'No of Parameters', angle: -90, position: 'insideLeft', offset: -30, style: { fill: '#9e9e9e', fontSize: 12 } }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} label={{ position: 'top', fill: '#6c6c6c', fontSize: 10, dy: -5 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} label={{ position: 'bottom', fill: '#EF9685', fontSize: 10, dy: 5 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AutoclavesForm;