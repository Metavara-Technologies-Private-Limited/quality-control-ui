import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parameterValueApi } from "@/services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface GasAnalyzersFormProps {
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

const GasAnalyzersForm = ({ selectedRadio, setSelectedRadio, equipmentDetails }: GasAnalyzersFormProps) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [isSaving, setIsSaving] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);

  const availableEquipments = equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    gasMixture: "",
    calibrationChecks: "Accurate",
    sensorCondition: "Good",
    status: "Pass",
    comments: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fieldMapping = useMemo(() => [
    { key: "date", dbName: "Date" },
    { key: "time", dbName: "Time" },
    { key: "gasMixture", dbName: "Gas Mixture" },
    { key: "calibrationChecks", dbName: "Calibration Checks" },
    { key: "sensorCondition", dbName: "Sensor Condition" },
    { key: "status", dbName: "Status" },
    { key: "comments", dbName: "Comments" },
  ], []);

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  const getDbParam = (dbName: string) => {
    if (!currentEquipment?.parameters) return null;
    
    return currentEquipment.parameters.find((p: any) => {
      const paramName = p.parameter_name || p.name || "";
      return paramName.toLowerCase().trim() === dbName.toLowerCase().trim();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        const value = formData[field.key];

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
      toast.success("Successfully Saved!", { theme: "colored" });
      setFormData(initialFormState);
      setActiveSubTab("Details");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save logs.");
    } finally {
      setIsSaving(false);
    }
  };

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

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const inputContainerStyle = (dbName: string): React.CSSProperties => ({
    position: "relative",
    marginBottom: "20px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const inputStyle = (dbName: string): React.CSSProperties => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f8fafc",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    color: getDbParam(dbName) ? "inherit" : "#94a3b8"
  });

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    color: "#64748b",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
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

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />
      
      <div style={sectionStyle}>
        {availableEquipments.length > 0 && (
          <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
            {availableEquipments.map((equipment: string) => (
              <label key={equipment} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                fontSize: "13px", 
                fontWeight: selectedRadio === equipment ? 700 : 500,
                cursor: "pointer", 
                color: selectedRadio === equipment ? "#f97316" : "#0f172a"
              }}>
                <input 
                  type="radio" 
                  checked={selectedRadio === equipment} 
                  onChange={() => {
                    setSelectedRadio(equipment);
                    setFormData(initialFormState);
                  }}
                  style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button 
              key={tab} 
              type="button" 
              onClick={() => setActiveSubTab(tab)} 
              style={{
                padding: "6px 24px", 
                borderRadius: "8px", 
                border: "1px solid #e5e7eb", 
                fontSize: "13px", 
                cursor: "pointer",
                backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? 600 : 400,
                boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            {/* Top Row: Date, Time, Gas Mixture */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={inputContainerStyle("Date")}>
                <label style={labelStyle}>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleChange}
                  disabled={!getDbParam("Date")}
                  style={inputStyle("Date")}
                />
              </div>

              <div style={inputContainerStyle("Time")}>
                <label style={labelStyle}>Timedsddsds</label>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!getDbParam("Time")}
                  style={inputStyle("Time")}
                />
              </div>

              <div style={inputContainerStyle("Gas Mixture")}>
                <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
                <input 
                  type="text" 
                  name="gasMixture" 
                  placeholder="Type Here" 
                  value={formData.gasMixture}
                  onChange={handleChange}
                  disabled={!getDbParam("Gas Mixture")}
                  style={inputStyle("Gas Mixture")}
                />
                <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>Range : O2 - 21, CO2 - 5</span>
              </div>
            </div>

            {/* Second Row: Calibration Checks, Sensor Condition, Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={inputContainerStyle("Calibration Checks")}>
                <label style={labelStyle}>Calibration Checks</label>
                <select 
                  name="calibrationChecks" 
                  value={formData.calibrationChecks}
                  onChange={handleChange}
                  disabled={!getDbParam("Calibration Checks")}
                  style={inputStyle("Calibration Checks")}
                >
                  <option value="Accurate">Accurate</option>
                  <option value="Needs Adjustment">Needs Adjustment</option>
                </select>
              </div>

              <div style={inputContainerStyle("Sensor Condition")}>
                <label style={labelStyle}>Sensor Condition</label>
                <select 
                  name="sensorCondition" 
                  value={formData.sensorCondition}
                  onChange={handleChange}
                  disabled={!getDbParam("Sensor Condition")}
                  style={inputStyle("Sensor Condition")}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Cleaning">Needs Cleaning</option>
                </select>
              </div>

              <div style={inputContainerStyle("Status")}>
                <label style={labelStyle}>Status</label>
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!getDbParam("Status")}
                  style={inputStyle("Status")}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>
            </div>

            {/* Third Row: Comments (Full Width) */}
            <div style={{ marginBottom: "32px" }}>
              <div style={inputContainerStyle("Comments")}>
                <label style={labelStyle}>Comments</label>
                <input 
                  type="text" 
                  name="comments" 
                  placeholder="Type Here" 
                  value={formData.comments}
                  onChange={handleChange}
                  disabled={!getDbParam("Comments")}
                  style={inputStyle("Comments")}
                />
              </div>
            </div>

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

              <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
                <button 
                  type="button" 
                  onClick={handleClear}
                  style={{ 
                    padding: "10px 24px", 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "8px", 
                    cursor: "pointer", 
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
                <button 
                  type="button" 
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ 
                    padding: "10px 24px", 
                    backgroundColor: "#1e293b", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "8px", 
                    cursor: isSaving ? "not-allowed" : "pointer", 
                    fontSize: "14px",
                    fontWeight: 600,
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Parameter</th>
                  <th style={{ padding: "12px 8px", fontWeight: "500" }}>Value</th>
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
                  <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No records yet.</td></tr>
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
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GasAnalyzersForm;