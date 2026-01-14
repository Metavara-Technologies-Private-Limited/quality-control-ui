import { parameterValueApi } from "@/services/api";
import { useState, useMemo, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface CryopreservationFormProps {
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

const CryopreservationForm = ({ selectedRadio, setSelectedRadio, equipmentDetails }: CryopreservationFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    liquidNitrogenLevels: "",
    temperature: "",
    backSystemFunctionality: "Functional",
    alarmStatus: "Functional",
    status: "Pass",
    comments: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // ✅ TOAST NOTIFICATION FUNCTION
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto-hide after 4 seconds
  };

  // --- 1. AUTO-SELECT LOGIC (Same as Microscope) ---
  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  // --- 2. CONFIGURATION: Map Form Keys to DB Parameter Names ---
  const fieldMapping = useMemo(() => [
    { key: "liquidNitrogenLevels", dbName: "Liquid Nitrogen Levels (mm)" },
    { key: "temperature", dbName: "Temperature (°C)" },
    { key: "backSystemFunctionality", dbName: "Back System Functionality" },
    { key: "alarmStatus", dbName: "Alarm Status" },
    { key: "comments", dbName: "Comments" },
    { key: "status", dbName: "Status" },
  ], []);

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  // --- 3. MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) => p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  // ✅ GET PARAMETER CONFIG - Handle both formats (config object and config.history array)
  const getParameterConfig = (dbName: string) => {
    const param = getDbParam(dbName);
    
    if (!param || !param.config) return null;

    let config = param.config;

    // If config has history array, get the latest entry
    if (config.history && Array.isArray(config.history) && config.history.length > 0) {
      config = config.history[config.history.length - 1];
    }

    return config;
  };

  // ✅ RENDER PARAMETER RANGE/VALUE TEXT
  const renderParameterInfo = (dbName: string) => {
    const config = getParameterConfig(dbName);
    
    if (!config) return null;

    const dataType = config.data_type;

    switch (dataType) {
      case "Decimal":
      case "Min/Max":
        if (config.min_value != null && config.max_value != null) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Range: {config.min_value} - {config.max_value} mm
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
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveLogs = async () => {
    if (!currentEquipment) {
      showToast("Please select a tank first", "error");
      return;
    }

    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];

      fieldMapping.forEach((field) => {
        const dbParam = getDbParam(field.dbName);
        const value = formData[field.key];

        if (dbParam && value && value.trim() !== "") {
          requests.push(
            parameterValueApi.create({
              parameter: dbParam.id,
              equipment_details: currentEquipment.equipment_id,
              content: value,
            })
          );
        }
      });

      if (requests.length === 0) {
        showToast("No matching parameters found or no data entered", "error");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      showToast("✓ Cryopreservation logs saved successfully!", "success");
      handleClearForm();
    } catch (err) {
      console.error("Save Error:", err);
      showToast("Failed to save logs. Check console for details.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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

  // --- STYLING HELPERS ---
  const inputContainerStyle = (dbName: string) => ({
    position: "relative" as const,
    marginBottom: "20px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const inputStyle = (dbName: string) => ({
    width: "100%",
    height: "50px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    padding: "13px 16px",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f1f5f9",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    boxSizing: "border-box" as const
  });

  const labelOverlayStyle = {
    position: "absolute" as const,
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#64748b"
  };

  const rangeTextStyle = { fontSize: "11px", marginTop: "4px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        
        {/* Unit Selector Radios (Updated to iterate over equipmentDetails) */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
          {equipmentDetails.map((ed) => (
            <label key={ed.equipment_id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: selectedRadio === ed.equipment_num ? "700" : "500", color: selectedRadio === ed.equipment_num ? "#f97316" : "#0f172a", cursor: "pointer" }}>
              <input 
                type="radio" 
                checked={selectedRadio === ed.equipment_num} 
                onChange={() => setSelectedRadio(ed.equipment_num)} 
                style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
              />
              {ed.equipment_num}
            </label>
          ))}
        </div>

        {/* Form Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          
          <div style={inputContainerStyle("Liquid Nitrogen Levels (mm)")}>
            <input 
              type="text" 
              placeholder="Type Here" 
              disabled={!getDbParam("Liquid Nitrogen Levels (mm)")} 
              value={formData.liquidNitrogenLevels} 
              onChange={(e) => setValue("liquidNitrogenLevels", e.target.value)} 
              style={inputStyle("Liquid Nitrogen Levels (mm)")} 
            />
            <label style={labelOverlayStyle}>Liquid Nitrogen Levels (mm)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Liquid Nitrogen Levels (mm)")}
            </div>
          </div>

          <div style={inputContainerStyle("Temperature (°C)")}>
            <input 
              type="text" 
              placeholder="Type Here" 
              disabled={!getDbParam("Temperature (°C)")} 
              value={formData.temperature} 
              onChange={(e) => setValue("temperature", e.target.value)} 
              style={inputStyle("Temperature (°C)")} 
            />
            <label style={labelOverlayStyle}>Temperature (°C)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Temperature (°C)")}
            </div>
          </div>

          <div style={inputContainerStyle("Back System Functionality")}>
            <select 
              disabled={!getDbParam("Back System Functionality")} 
              value={formData.backSystemFunctionality} 
              onChange={(e) => setValue("backSystemFunctionality", e.target.value)} 
              style={{ ...inputStyle("Back System Functionality"), cursor: "pointer" }}
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelOverlayStyle}>Back System Functionality</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Back System Functionality")}
            </div>
          </div>

          <div style={inputContainerStyle("Alarm Status")}>
            <select 
              disabled={!getDbParam("Alarm Status")} 
              value={formData.alarmStatus} 
              onChange={(e) => setValue("alarmStatus", e.target.value)} 
              style={{ ...inputStyle("Alarm Status"), cursor: "pointer" }}
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelOverlayStyle}>Alarm Status</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Alarm Status")}
            </div>
          </div>

          <div style={inputContainerStyle("Comments")}>
            <input 
              type="text" 
              placeholder="Type Here" 
              disabled={!getDbParam("Comments")} 
              value={formData.comments} 
              onChange={(e) => setValue("comments", e.target.value)} 
              style={inputStyle("Comments")} 
            />
            <label style={labelOverlayStyle}>Comments</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Comments")}
            </div>
          </div>

          <div style={inputContainerStyle("Status")}>
            <select 
              disabled={!getDbParam("Status")} 
              value={formData.status} 
              onChange={(e) => setValue("status", e.target.value)} 
              style={{ ...inputStyle("Status"), cursor: "pointer" }}
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label style={labelOverlayStyle}>Status</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Status")}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "20px", fontSize: "14px" }}>
          <div><span style={{ color: "#94a3b8" }}>Make :</span> <b>{currentEquipment?.make || "N/A"}</b></div>
          <div style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}></div>
          <div><span style={{ color: "#94a3b8" }}>Model :</span> <b>{currentEquipment?.model || "N/A"}</b></div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button onClick={handleClearForm} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1 }}>Clear</button>
            <button onClick={handleSaveLogs} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Activity</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
              <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '4px' }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out",
            backgroundColor:
              toast.type === "success"
                ? "#04db16ff"
                : toast.type === "error"
                ? "#ef4444"
                : "#cf0404ff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {toast.type === "success" && "✓"}
          {toast.type === "error" && "✕"}
          {toast.type === "info" && "ⓘ"}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}; 

export default CryopreservationForm;