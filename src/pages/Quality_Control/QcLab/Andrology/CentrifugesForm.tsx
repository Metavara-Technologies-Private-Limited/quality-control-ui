import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parameterValueApi } from "@/services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const CentrifugesForm = ({ selectedRadio, setSelectedRadio, equipmentDetails }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [logValues, setLogValues] = useState<Record<string, string>>({});
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
    { key: "rpmCalibration", dbName: "RPM Calibration" },
    { key: "timeAccuracy", dbName: "Time Accuracy" },
    { key: "rotorCondition", dbName: "Rotor Condition" },
    { key: "status", dbName: "Status" },
    { key: "comments", dbName: "Comments" },
  ], []);

  // --- MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) => p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  // ✅ GET PARAMETER CONFIG - Handles history array logic
  const getParameterConfig = (parameterName: string) => {
    const param = getDbParam(parameterName);
    if (!param || !param.config) return null;

    let config = param.config;
    if (config.history && Array.isArray(config.history) && config.history.length > 0) {
      config = config.history[config.history.length - 1];
    }
    return config;
  };

  // ✅ RENDER PARAMETER RANGE/VALUE TEXT (Matched with Autoclaves logic)
  const renderParameterInfo = (parameterName: string) => {
    const config = getParameterConfig(parameterName);
    if (!config) return null;

    const dataType = config.data_type;

    switch (dataType) {
      case "Decimal":
      case "Min/Max":
        if (config.min_value != null && config.max_value != null) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Range: {config.min_value} - {config.max_value}
            </span>
          );
        }
        break;
      case "Percentage":
        if (config.percentage != null) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Range: 0% - {config.percentage}%
            </span>
          );
        }
        break;
      case "Select":
      case "Dropdown":
        if (config.dropdown && Array.isArray(config.dropdown) && config.dropdown.length > 0) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Options: {config.dropdown.join(", ")}
            </span>
          );
        }
        break;
      case "Text":
        if (config.text) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Value: {config.text}
            </span>
          );
        }
        break;
      case "Integer":
        if (config.integer_value != null) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Value: {config.integer_value}
            </span>
          );
        }
        break;
      default:
        return null;
    }
  };

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveLogs = async () => {
    if (!currentEquipment) {
      toast.error("Please select an equipment first");
      return;
    }

    const hasData = Object.values(logValues).some(val => val && val.trim() !== '');
    if (!hasData) {
      toast.error("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];

      fieldMapping.forEach((item) => {
        const dbParam = getDbParam(item.dbName);
        const val = logValues[item.key];

        if (dbParam && val && val.trim() !== "") {
          requests.push(parameterValueApi.create({
            parameter: dbParam.id,
            equipment_details: currentEquipment.equipment_id,
            content: val,
          }));
        }
      });

      if (requests.length === 0) {
        toast.warn("No matching parameters found to save.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.success("Parameter logs saved successfully!");
      setLogValues({});
      setActiveSubTab("Details");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save parameter logs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({});
  };

  // Fetch logs data from parameter values API
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

  // Styles
  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  const inputContainerStyle = (dbName: string) => ({
    position: "relative" as const,
    marginBottom: "24px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const getInputStyle = (dbName: string) => ({
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

  const labelStyle = {
    position: "absolute" as const,
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    color: "#64748b",
  };

  const rangeTextStyle = { fontSize: "11px", marginTop: "4px", color: "#94a3b8", display: "block" };

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />
      
      <div style={sectionStyle}>
        {/* Unit Selector Radios */}
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
                  onChange={() => {
                    setSelectedRadio(equipment);
                    setLogValues({});
                  }}
                  style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        {/* Sub-Tabs Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button key={tab} type="button" onClick={() => setActiveSubTab(tab)} style={{
                padding: "6px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", cursor: "pointer",
                backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "600" : "400",
                boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}>{tab}</button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              
              {/* Date */}
              <div style={inputContainerStyle("Date")}>
                <input 
                  type="date" 
                  name="date"
                  value={logValues['date'] || ''}
                  onChange={(e) => setValue("date", e.target.value)}
                  disabled={!getDbParam("Date")}
                  style={getInputStyle("Date")}
                />
                <label style={labelStyle}>Date</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Date")}</span>
              </div>

              {/* Time */}
              <div style={inputContainerStyle("Time")}>
                <input 
                  type="time" 
                  name="time"
                  value={logValues['time'] || ''}
                  onChange={(e) => setValue("time", e.target.value)}
                  disabled={!getDbParam("Time")}
                  style={getInputStyle("Time")}
                />
                <label style={labelStyle}>Time</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Time")}</span>
              </div>

              {/* RPM Calibration */}
              <div style={inputContainerStyle("RPM Calibration")}>
                <input 
                  type="text" 
                  name="rpmCalibration" 
                  placeholder="Type Here" 
                  value={logValues['rpmCalibration'] || ''} 
                  onChange={(e) => setValue("rpmCalibration", e.target.value)}
                  disabled={!getDbParam("RPM Calibration")}
                  style={getInputStyle("RPM Calibration")}
                />
                <label style={labelStyle}>RPM Calibration (RPM)</label>
                <span style={rangeTextStyle}>{renderParameterInfo("RPM Calibration")}</span>
              </div>

              {/* Time Accuracy */}
              <div style={inputContainerStyle("Time Accuracy")}>
                <select 
                  name="timeAccuracy" 
                  value={logValues['timeAccuracy'] || 'Accurate'} 
                  onChange={(e) => setValue("timeAccuracy", e.target.value)}
                  disabled={!getDbParam("Time Accuracy")}
                  style={getInputStyle("Time Accuracy")}
                >
                  <option value="Accurate">Accurate</option>
                  <option value="Inaccurate">Inaccurate</option>
                </select>
                <label style={labelStyle}>Time Accuracy</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Time Accuracy")}</span>
              </div>

              {/* Rotor Condition */}
              <div style={inputContainerStyle("Rotor Condition")}>
                <select 
                  name="rotorCondition" 
                  value={logValues['rotorCondition'] || 'Good'} 
                  onChange={(e) => setValue("rotorCondition", e.target.value)}
                  disabled={!getDbParam("Rotor Condition")}
                  style={getInputStyle("Rotor Condition")}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Maintenance">Needs Maintenance</option>
                </select>
                <label style={labelStyle}>Rotor Condition</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Rotor Condition")}</span>
              </div>

              {/* Status */}
              <div style={inputContainerStyle("Status")}>
                <select 
                  name="status" 
                  value={logValues['status'] || 'Pass'} 
                  onChange={(e) => setValue("status", e.target.value)}
                  disabled={!getDbParam("Status")}
                  style={getInputStyle("Status")}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={labelStyle}>Status</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Status")}</span>
              </div>

              {/* Comments */}
              <div style={inputContainerStyle("Comments")}>
                <input 
                  type="text" 
                  name="comments" 
                  placeholder="Type Here" 
                  value={logValues['comments'] || ''} 
                  onChange={(e) => setValue("comments", e.target.value)}
                  disabled={!getDbParam("Comments")}
                  style={getInputStyle("Comments")}
                />
                <label style={labelStyle}>Comments</label>
                <span style={rangeTextStyle}>{renderParameterInfo("Comments")}</span>
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
                onClick={handleSaveLogs}
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
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No logs recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Graph Section */}
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
            <BarChart data={[
              { day: "Mon", compliant: 34, nonCompliant: -23 },
              { day: "Tue", compliant: 28, nonCompliant: -22 },
              { day: "Wed", compliant: 22, nonCompliant: -36 },
              { day: "Thu", compliant: 34, nonCompliant: -12 },
              { day: "Fri", compliant: 29, nonCompliant: -28 },
              { day: "Sat", compliant: 15, nonCompliant: -33 },
              { day: "Sun", compliant: 25, nonCompliant: -25 },
            ]} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
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

export default CentrifugesForm;