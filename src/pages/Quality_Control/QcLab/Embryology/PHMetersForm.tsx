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
  CartesianGrid, LabelList
} from "recharts";

interface PHMetersFormProps {
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
  { day: "Monday", compliant: 24, nonCompliant: -33 },
  { day: "Tuesday", compliant: 28, nonCompliant: -23 },
  { day: "Wednesday", compliant: 22, nonCompliant: -38 },
  { day: "Thursday", compliant: 34, nonCompliant: -12 },
  { day: "Friday", compliant: 28, nonCompliant: -33 },
  { day: "Saturday", compliant: 15, nonCompliant: -10 },
  { day: "Sunday", compliant: 25, nonCompliant: -33 },
];

const PHMetersForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: PHMetersFormProps) => {
  const [logValues, setLogValues] = useState<Record<string, string>>({
    calibrationChecks: "Accurate",
    electrodeCondition: "Clean",
    temperatureCompensation: "Functional",
    status: "Pass",
    comments: "",
  });
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

    // Check if at least one field is filled (excluding default values)
    const hasData = logValues.comments && logValues.comments.trim() !== "";
    if (!hasData) {
      toast.warn("Please add comments before saving");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving pH Meter logs...");

    try {
      const requests: Promise<any>[] = [];

      if (!currentEquipment.parameters || currentEquipment.parameters.length === 0) {
        toast.update(toastId, { render: "No parameters found", type: "error", isLoading: false, autoClose: 3000 });
        setIsSaving(false);
        return;
      }

      const formValuesList = [
        { key: "calibrationChecks", value: logValues["calibrationChecks"] },
        { key: "electrodeCondition", value: logValues["electrodeCondition"] },
        { key: "temperatureCompensation", value: logValues["temperatureCompensation"] },
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
      toast.update(toastId, { render: "Parameter logs saved successfully!", type: "success", isLoading: false, autoClose: 3000 });

      setLogValues({
        calibrationChecks: "Accurate",
        electrodeCondition: "Clean",
        temperatureCompensation: "Functional",
        status: "Pass",
        comments: "",
      });
    } catch (err) {
      toast.update(toastId, { render: "Failed to save logs.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({
      calibrationChecks: "Accurate",
      electrodeCondition: "Clean",
      temperatureCompensation: "Functional",
      status: "Pass",
      comments: "",
    });
    toast.info("Form cleared");
  };

  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "14px",  color: "#232323" };
  const rangeTextStyle = { fontSize: "12px", marginTop: "4px", color: "#9E9E9E", fontWeight: "500" };

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* ✅ ToastContainer added here */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "2px solid #e5e7eb", padding: "24px", marginBottom: "16px" }}>
        {/* Unit Selector */}
        <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "2px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <select value={logValues.calibrationChecks} onChange={(e) => setValue("calibrationChecks", e.target.value)} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Accurate</option><option>Needs Calibration</option>
            </select>
            <label style={labelStyle}>Calibration Checks</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Calibration Checks")}</div>
          </div>

          <div style={{ position: "relative" }}>
            <select value={logValues.electrodeCondition} onChange={(e) => setValue("electrodeCondition", e.target.value)} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Clean</option><option>Dirty</option><option>Needs Replacement</option>
            </select>
            <label style={labelStyle}>Electrode Condition</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Electrode Condition")}</div>
          </div>

          <div style={{ position: "relative" }}>
            <select value={logValues.temperatureCompensation} onChange={(e) => setValue("temperatureCompensation", e.target.value)} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Functional</option><option>Non-Functional</option>
            </select>
            <label style={labelStyle}>Temperature Compensation Verification</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Temperature Compensation Verification")}</div>
          </div>

          <div style={{ position: "relative" }}>
            <input type="text" placeholder="Type Here" value={logValues.comments} onChange={(e) => setValue("comments", e.target.value)} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
            <label style={labelStyle}>Comments</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Comments")}</div>
          </div>

          <div style={{ position: "relative" }}>
            <select value={logValues.status} onChange={(e) => setValue("status", e.target.value)} style={{ width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
              <option>Pass</option><option>Fail</option>
            </select>
            <label style={labelStyle}>Status</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Status")}</div>
          </div>
        </div>

        {/* Footer Info & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "24px", fontSize: "14px" }}>
          <div style={{ display: "flex", gap: "8px" }}>Make : <span style={{ fontWeight: "600" }}>{currentEquipment?.make || "N/A"}</span></div>
          <div style={{ display: "flex", gap: "8px" }}>Model : <span style={{ fontWeight: "600" }}>{currentEquipment?.model || "N/A"}</span></div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button onClick={handleClear} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #505050", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: isSaving ? "not-allowed" : "pointer" }}>Clear</button>
            <button onClick={handleSaveLogs} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#505050", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.6 : 1 }}>{isSaving ? "Saving..." : "Save"}</button>
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

export default PHMetersForm;