import { parameterValueApi } from "@/services/api";
import { useEffect, useState } from "react";
import Chart_activity from "@/assets/icons/Chart_activity.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  LabelList,
} from "recharts";

interface MicroscopesFormProps {
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

const activityData = [
  { day: "Monday", compliant: 34, nonCompliant: -23 },
  { day: "Tuesday", compliant: 28, nonCompliant: -22 },
  { day: "Wednesday", compliant: 22, nonCompliant: -36 },
  { day: "Thursday", compliant: 34, nonCompliant: -12 },
  { day: "Friday", compliant: 29, nonCompliant: -28 },
  { day: "Saturday", compliant: 15, nonCompliant: -33 },
  { day: "Sunday", compliant: 25, nonCompliant: -25 },
];

const MicroscopesForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: MicroscopesFormProps) => {
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const currentEquipmentDetail = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  const getParameterConfig = (parameterName: string) => {
    const param = currentEquipment?.parameters?.find(
      (p: any) => p.parameter_name?.toLowerCase() === parameterName.toLowerCase()
    );
    if (!param || !param.config) return null;
    let config = param.config;
    if (config.history && Array.isArray(config.history) && config.history.length > 0) {
      config = config.history[config.history.length - 1];
    }
    return config;
  };

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

  const handleSaveLogs = async () => {
    if (!currentEquipment || !currentEquipmentDetail) {
      toast.error("Please select an equipment first");
      return;
    }

    if (!currentEquipmentDetail.equipment_id) {
      toast.error("Equipment ID is missing.");
      return;
    }

    const hasData = Object.values(logValues).some(
      (val) => val && val.trim() !== ""
    );

    if (!hasData) {
      toast.warning("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    const id = toast.loading("Saving parameter logs...");

    try {
      const requests: Promise<any>[] = [];

      if (!currentEquipment.parameters || currentEquipment.parameters.length === 0) {
        toast.update(id, { render: "No parameters found for this equipment", type: "error", isLoading: false, autoClose: 3000 });
        setIsSaving(false);
        return;
      }

      const formValuesList = [
        { key: "lensCleanliness", value: logValues["lensCleanliness"] },
        { key: "lightSource", value: logValues["lightSource"] },
        { key: "calibration", value: logValues["calibration"] },
        { key: "comments", value: logValues["comments"] },
        { key: "status", value: logValues["status"] },
      ].filter((item) => item.value && item.value.trim() !== "");

      formValuesList.forEach((formItem, index) => {
        if (index < currentEquipment.parameters.length) {
          const param = currentEquipment.parameters[index];
          requests.push(parameterValueApi.create({
            parameter: param.id,
            equipment_details: currentEquipmentDetail.equipment_id,
            content: formItem.value,
          }));
        }
      });

      await Promise.all(requests);
      // ✅ Success Notification
      toast.update(id, { render: "Parameter logs saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setLogValues({});
    } catch (err) {
      // ✅ Error Notification
      toast.update(id, { render: "Failed to save logs. Please check console.", type: "error", isLoading: false, autoClose: 3000 });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({});
    toast.info("Form cleared");
  };

  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const inputContainerStyle = { position: "relative" as const, marginBottom: "20px" };
  const inputStyle = { width: "100%", height: "50px", padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "16px", color:"#9E9E9E", fontWeight: "500", outline: "none" };

  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "14px",  color: "#232323" };

  const rangeTextStyle = { fontSize: "12px", marginTop: "4px", color: "#9E9E9E", fontWeight: "500" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ✅ Add ToastContainer here to enable popups */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        {/* Unit Selector */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
          {equipmentDetails.map((ed) => (
            <label key={ed.equipment_id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: selectedRadio === ed.equipment_num ? "600" : "500", color: selectedRadio === ed.equipment_num ? "#232323": "#E17E61" , cursor: "pointer" }}>

              <input
  type="radio"
  checked={selectedRadio === ed.equipment_num}
  onChange={() => setSelectedRadio(ed.equipment_num)}
  style={{
    appearance: "none",
    WebkitAppearance: "none",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    cursor: "pointer",
    border: `2px solid ${selectedRadio === ed.equipment_num ? "#232323" : "#d1d5db"}`,
    backgroundColor: "#fff",
    boxShadow: selectedRadio === ed.equipment_num ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61" : "none",
    outline: "none"
  }}
/> 
{ed.equipment_num}
            </label>
          ))}
        </div>

        {/* Parameters Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues["lensCleanliness"] || "Clean"} onChange={(e) => setValue("lensCleanliness", e.target.value)}>
              <option value="Clean">Clean</option>
              <option value="Needs Cleaning">Needs Cleaning</option>
            </select>
            <label style={labelStyle}>Lens Cleanliness</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Lens Cleanliness")}</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues["lightSource"] || "Functional"} onChange={(e) => setValue("lightSource", e.target.value)}>
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
              <option value="Warning">Warning</option>
            </select>
            <label style={labelStyle}>Light Source Functionality</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Light Source Functionality")}</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues["calibration"] || "Accurate"} onChange={(e) => setValue("calibration", e.target.value)}>
              <option value="Accurate">Accurate</option>
              <option value="Calibration Required">Calibration Required</option>
            </select>
            <label style={labelStyle}>Calibration Checks</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Calibration Checks")}</div>
          </div>

          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues["comments"] || ""} onChange={(e) => setValue("comments", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>Comments</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Comments")}</div>
          </div>

          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues["status"] || "Pass"} onChange={(e) => setValue("status", e.target.value)}>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label style={labelStyle}>Status</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Status")}</div>
          </div>
        </div>

        {/* Footer Info & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "20px", fontSize: "14px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Make :</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>{currentEquipment?.make || "N/A"}</span>
          </div>
          <div style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}></div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Model :</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>{currentEquipment?.model || "N/A"}</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button onClick={handleClear} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #505050", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "700" }}>Clear</button>
            <button onClick={handleSaveLogs} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#505050", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px" }}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Graph Section Starts Here */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "12px",overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          
          {/* Left Side: Icon and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px" }}>
              <img src={Chart_activity} alt="chart icon" style={{ width: "25px", height: "25px" }} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Activity</h3>
          </div>

          {/* Right Side: Legend Indicators */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#6c6c6c" }}></div>
              <span style={{ fontSize: "12px", color: "#949494" }}>Compliant</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#EF9685" }}></div>
              <span style={{ fontSize: "12px", color: "#949494" }}>Non - Compliant</span>
            </div>
          </div>
        </div>        
        
<hr 
  style={{ 
    border: "none", 
    borderTop: "1px solid #E2E3E5", 
    margin: "-20px -24px 16px -24px",
    width: "auto"
  }} 
/>        
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" barGap={-25} margin={{ top: 20, right: 30, left: 45, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8c8c8c" }} axisLine={{ stroke: "#E0E0E0" }} tickLine={false} label={{ value: "Month", position: "bottom", offset: 10, style: { fill: "#9e9e9e", fontSize: 12 } }}/>
              <YAxis domain={['auto', 'auto']} tickCount={9} tick={{ fontSize: 12, fill: "#9e9e9e" }} axisLine={{ stroke: "#E0E0E0" }} tickLine={false} tickFormatter={(value) => (value === 0 ? "" : value)} label={{ value: "No of parameters", angle: -90, position: "insideLeft", offset: -35, dy:40, style: { fill: "#9e9e9e", fontSize: 12 } }} />
              
              <Tooltip 
                cursor={{ fill: "transparent" }} 
                formatter={(value: number, name: string) => {
                  const absoluteValue = Math.abs(value);
                  const label = name === "compliant" ? "Compliant" : "Non-Compliant";
                  return [ `${absoluteValue} m/s`, label ]; // Use m/s for LFH
                }}
              /> 
              <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3"/>

              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={25}>
                <LabelList dataKey="compliant" position="top" formatter={(value: number) => (value === 0 ? "" : value)} style={{ fill: "#6c6c6c", fontSize: 12, fontWeight: 600 }} />
              </Bar>
              
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[4, 4, 0, 0]} barSize={25}>
                <LabelList 
                  dataKey="nonCompliant" 
                  position="top" 
                  formatter={(value: number) => (value === 0 ? "" : Math.abs(value))} 
                  style={{ fill: "#EF9685", fontSize: 12, fontWeight: 600 }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* END OF ACTIVITY SECTION */}
    </div>
  );
};

export default MicroscopesForm;