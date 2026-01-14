import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parameterValueApi } from "@/services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface RefrigeratorFreezerFormProps {
  selectedRadio: string;
  setSelectedRadio: (name: string) => void;
  equipmentDetails: {
    equipment_num: string;
    equipment_id: number;
    parameters: any[];
    make: string;
    model: string;
  }[];
}

const RefrigeratorFreezerForm = ({ selectedRadio, setSelectedRadio, equipmentDetails }: RefrigeratorFreezerFormProps) => {
  const [activeCategory, setActiveCategory] = useState("Refrigerators");
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [isSaving, setIsSaving] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);

  // Get unique equipment numbers from equipmentDetails
  const availableEquipments = equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const currentEquipment = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  // --- CONFIGURATION: Map Form Keys to DB Parameter Names ---
  const fieldMapping = useMemo(() => [
    { key: "date", dbName: "Date" },
    { key: "time", dbName: "Time" },
    { key: "temperature", dbName: "Temperature" },
    { key: "alarmSystem", dbName: "Alarm System Checks" },
    { key: "defrostCycle", dbName: "Defrost Cycle Verification" },
    { key: "status", dbName: "Status" },
    { key: "comments", dbName: "Comments" },
  ], []);

  // --- MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) => p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  const isFieldEnabled = (dbName: string) => {
    return !!getDbParam(dbName);
  };

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: "",
    alarmSystem: "Functional",
    defrostCycle: "Valid",
    status: "Pass",
    comments: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Determine category based on selectedRadio
  useEffect(() => {
    if (selectedRadio) {
      const val = selectedRadio.toUpperCase();
      if (val.includes("FREEZER")) {
        setActiveCategory("Freezers");
      } else if (val.includes("REFRIGERATOR") || val.includes("FRIDGE")) {
        setActiveCategory("Refrigerators");
      }
    }
  }, [selectedRadio]);

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  // Fetch logs from database
  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentEquipment?.equipment_id) return;

      try {
        const response = await parameterValueApi.list({
          equipment_details: currentEquipment.equipment_id,
        });

        if (response && response.results) {
          const logsByParam: Record<string, any> = {};
          
          response.results.forEach((log: any) => {
            const paramId = log.parameter;
            if (!logsByParam[paramId] || new Date(log.created_at) > new Date(logsByParam[paramId].created_at)) {
              logsByParam[paramId] = log;
            }
          });

          const formattedLogs = Object.values(logsByParam).map((log: any) => {
            const param = currentEquipment.parameters.find((p: any) => p.id === log.parameter);
            return {
              id: log.id,
              dateTime: new Date(log.created_at).toLocaleString(),
              paramName: param?.parameter_name || "N/A",
              content: log.content || "N/A",
            };
          });
          
          setLogsData(formattedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogs();
  }, [currentEquipment?.equipment_id, currentEquipment?.parameters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentEquipment) {
      toast.error("Please select an equipment first");
      return;
    }

    const hasData = Object.entries(formData).some(([key, val]) => {
      if (key === 'date' || key === 'time') return true;
      return val && val.trim() !== "";
    });

    if (!hasData) {
      toast.error("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];
      
      fieldMapping.forEach((field) => {
        const dbParam = getDbParam(field.dbName);
        const value = formData[field.key as keyof typeof formData];

        if (dbParam && value && value.trim() !== "") {
          requests.push(parameterValueApi.create({
            parameter: dbParam.id,
            equipment_details: currentEquipment.equipment_id,
            content: value,
          }));
        }
      });

      if (requests.length === 0) {
        toast.warn("No matching parameters found to save.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.success("Successfully Saved!");
      setFormData(initialFormState);
      setActiveSubTab("Logs");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save logs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const getInputStyle = (dbName: string) => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: isFieldEnabled(dbName) ? "#fff" : "#f8fafc",
    cursor: isFieldEnabled(dbName) ? "text" : "not-allowed",
    color: isFieldEnabled(dbName) ? "inherit" : "#94a3b8"
  });

  const labelStyle = {
    position: "absolute" as const,
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    color: "#64748b"
  };

  const inputContainerStyle = (dbName: string) => ({
    position: "relative" as const,
    marginBottom: "24px",
    opacity: isFieldEnabled(dbName) ? 1 : 0.4,
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
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {["Refrigerators", "Freezers"].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ 
                padding: "8px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer",
                border: activeCategory === cat ? "1px solid #E17E61" : "1px solid #e5e7eb", 
                backgroundColor: activeCategory === cat ? "#FFF5F2" : "#fff", 
                color: activeCategory === cat ? "#E17E61" : "#94a3b8", 
              }}>{cat}</button>
          ))}
        </div>

        {/* Unit Radios - Dynamic based on available equipments */}
        {availableEquipments.length > 0 && (
          <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
            {availableEquipments.map((equipment: string) => (
              <label key={equipment} style={{ 
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", 
                fontWeight: selectedRadio === equipment ? "700" : "500", 
                color: selectedRadio === equipment ? "#f97316" : "#0f172a", 
                cursor: "pointer" 
              }}>
                <input 
                  type="radio" 
                  checked={selectedRadio === equipment} 
                  onChange={() => setSelectedRadio(equipment)}
                  style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        {/* Sub-Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button key={tab} onClick={() => setActiveSubTab(tab)} style={{ padding: "6px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", cursor: "pointer", backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent", color: activeSubTab === tab ? "#E17E61" : "#94a3b8", fontWeight: "600", boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>{tab}</button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
              
              {/* Date */}
              <div style={inputContainerStyle("Date")}>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Date")}
                  style={getInputStyle("Date") as any}
                />
                <label style={labelStyle}>Date</label>
              </div>

              {/* Time */}
              <div style={inputContainerStyle("Time")}>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Time")}
                  style={getInputStyle("Time") as any}
                />
                <label style={labelStyle}>Time</label>
              </div>

              {/* Temperature */}
              <div style={inputContainerStyle("Temperature")}>
                <input 
                  type="text" 
                  name="temperature" 
                  placeholder="Type Here" 
                  value={formData.temperature} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Temperature")}
                  style={getInputStyle("Temperature") as any}
                />
                <label style={labelStyle}>Temperature (°C)</label>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Range : {activeCategory === "Refrigerators" ? "2°C to 8°C" : "-15°C to -25°C"}</p>
              </div>

              {/* Alarm System Checks */}
              <div style={inputContainerStyle("Alarm System Checks")}>
                <select 
                  name="alarmSystem" 
                  value={formData.alarmSystem} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Alarm System Checks")}
                  style={getInputStyle("Alarm System Checks") as any}
                >
                  <option value="Functional">Functional</option>
                  <option value="Maintenance Required">Maintenance Required</option>
                </select>
                <label style={labelStyle}>Alarm System Checks</label>
              </div>

              {/* Defrost Cycle Verification */}
              <div style={inputContainerStyle("Defrost Cycle Verification")}>
                <select 
                  name="defrostCycle" 
                  value={formData.defrostCycle} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Defrost Cycle Verification")}
                  style={getInputStyle("Defrost Cycle Verification") as any}
                >
                  <option value="Valid">Valid</option>
                  <option value="Invalid">Invalid</option>
                </select>
                <label style={labelStyle}>Defrost Cycle Verification</label>
              </div>

              {/* Status */}
              <div style={inputContainerStyle("Status")}>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Status")}
                  style={getInputStyle("Status") as any}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={labelStyle}>Status</label>
              </div>

              {/* Comments */}
              <div style={{...inputContainerStyle("Comments"), gridColumn: 'span 2'}}>
                <input 
                  type="text" 
                  name="comments" 
                  placeholder="Type Here" 
                  value={formData.comments} 
                  onChange={handleChange}
                  disabled={!isFieldEnabled("Comments")}
                  style={getInputStyle("Comments") as any}
                />
                <label style={labelStyle}>Comments</label>
              </div>
            </div>

            {/* Make and Model Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", fontSize: "14px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#94a3b8" }}>Make :</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {currentEquipment?.make || "N/A"}
                </span>
              </div>
              <div style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}></div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#94a3b8" }}>Model :</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {currentEquipment?.model || "N/A"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <button 
                type="button" 
                onClick={handleClear}
                disabled={isSaving}
                style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px" }}>
                Clear
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
                style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", opacity: isSaving ? 0.6 : 1 }}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px" }}>Parameter</th>
                  <th style={{ padding: "12px 8px" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {logsData.length > 0 ? logsData.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 8px", color: "#0f172a", fontWeight: "600" }}>{log.dateTime}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.paramName}</td>
                    <td style={{ padding: "16px 8px", color: "#64748b" }}>{log.content}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No logs recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
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
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} label={{ value: 'No of Parameters', angle: -90, position: 'insideLeft', offset: -30, style: { fill: '#9e9e9e', fontSize: 12 } }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

export default RefrigeratorFreezerForm;