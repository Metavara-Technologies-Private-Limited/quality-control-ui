import { parameterValueApi } from "@/services/api";
import { useEffect, useState, useMemo } from "react";
// ✅ Import toast and ToastContainer
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
} from "recharts";

interface IncubatorFormProps {
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

const IncubatorForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: IncubatorFormProps) => {
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [chartData, setChartData] = useState<any[]>([
    { day: "Mon", compliant: 0, nonCompliant: 0 },
    { day: "Tue", compliant: 0, nonCompliant: 0 },
    { day: "Wed", compliant: 0, nonCompliant: 0 },
    { day: "Thu", compliant: 0, nonCompliant: 0 },
    { day: "Fri", compliant: 0, nonCompliant: 0 },
  ]);

  const currentEquipmentDetail = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const getParameterConfig = (parameterName: string) => {
    if (!currentEquipment?.parameters) return null;
    let param = currentEquipment.parameters.find(
      (p: any) => p.parameter_name?.toLowerCase().trim() === parameterName.toLowerCase().trim()
    );
    if (!param) {
      param = currentEquipment.parameters.find(
        (p: any) => p.parameter_name?.toLowerCase().includes(parameterName.toLowerCase())
      );
    }
    if (!param) {
      param = currentEquipment.parameters.find(
        (p: any) => parameterName.toLowerCase().includes(p.parameter_name?.toLowerCase())
      );
    }
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
              Range: {config.min_value} - {config.max_value} °C
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

  const fetchGraphData = async () => {
    if (!currentEquipmentDetail?.parameters) return;
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const chartMap: any = {};
    weekDays.forEach((day) => {
      chartMap[day] = { day, compliant: 0, nonCompliant: 0 };
    });
    try {
      const requests = currentEquipmentDetail.parameters.map((param: any) =>
        parameterValueApi.listByParameter(param.id)
      );
      const responses = await Promise.all(requests);
      responses.forEach((res, index) => {
        const paramName = currentEquipmentDetail.parameters[index].parameter_name.toLowerCase();
        res.data.forEach((entry: any) => {
          if (!entry.created_at || entry.content === "NO_RECORD") return;
          const value = Number(entry.content.replace('%', ''));
          if (isNaN(value)) return;
          const dayName = weekDays[new Date(entry.created_at).getDay()];
          let isCompliant = false;
          if (paramName.includes("temperature")) {
            isCompliant = value >= 20 && value <= 55;
          } else {
            isCompliant = value > 0;
          }
          if (isCompliant) {
            chartMap[dayName].compliant += value;
          } else {
            chartMap[dayName].nonCompliant -= value;
          }
        });
      });
      setChartData(weekDays.map((day) => chartMap[day]));
    } catch (err) {
      console.error("Graph fetch failed", err);
    }
  };

  const handleSaveLogs = async () => {
    if (!currentEquipment || !currentEquipmentDetail) {
      toast.error("Please select an equipment first");
      return;
    }
    if (!currentEquipmentDetail.equipment_id) {
      toast.error("Equipment detail ID is missing.");
      return;
    }
    const hasData = Object.values(logValues).some(val => val && val.trim() !== '');
    if (!hasData) {
      toast.warn("Please fill at least one field before saving");
      return;
    }
    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];
      if (!currentEquipment.parameters || currentEquipment.parameters.length === 0) {
        toast.error("No parameters found for this equipment");
        setIsSaving(false);
        return;
      }
      const formValuesList = [
        { key: "temperature", value: logValues["temperature"] },
        { key: "co2", value: logValues["co2"] },
        { key: "humidity", value: logValues["humidity"] },
        { key: "gas", value: logValues["gas"] },
        { key: "alarmStatus", value: logValues["alarmStatus"] },
        { key: "alarmResponse", value: logValues["alarmResponse"] },
        { key: "comments", value: logValues["comments"] },
        { key: "status", value: logValues["status"] },
      ].filter((item) => item.value && item.value.trim() !== "");

      formValuesList.forEach((formItem, index) => {
        if (index < currentEquipment.parameters.length) {
          const param = currentEquipment.parameters[index];
          const payload = {
            parameter: param.id,
            equipment_details: currentEquipmentDetail.equipment_id,
            content: formItem.value,
          };
          requests.push(parameterValueApi.create(payload));
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parameter logs.");
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

  useEffect(() => {
    if (selectedRadio && currentEquipmentDetail) {
      fetchGraphData();
    }
  }, [selectedRadio, currentEquipmentDetail]);

  const inputContainerStyle = { position: "relative" as const, marginBottom: "20px" };
  const inputStyle = { width: "100%", height: "50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" };
  const labelStyle = { position: "absolute" as const, left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", color: "#64748b" };
  const rangeTextStyle = { fontSize: "11px", marginTop: "4px", color: "#94a3b8" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* REQUIRED: The ToastContainer must be rendered for toasts to show */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
          {equipmentDetails.map((ed) => (
            <label key={ed.equipment_id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: selectedRadio === ed.equipment_num ? "700" : "500", color: selectedRadio === ed.equipment_num ? "#f97316" : "#0f172a", cursor: "pointer" }}>
              <input type="radio" checked={selectedRadio === ed.equipment_num} onChange={() => setSelectedRadio(ed.equipment_num)} style={{ accentColor: "#f97316", width: "16px", height: "16px" }} />
              {ed.equipment_num}
            </label>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['temperature'] || ''} onChange={(e) => setValue("temperature", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>Temperature (°C)</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Temperature")}</div>
          </div>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['co2'] || ''} onChange={(e) => setValue("co2", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>CO2 Concentration (%)</label>
            <div style={rangeTextStyle}>{renderParameterInfo("CO2 Concentration")}</div>
          </div>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['humidity'] || ''} onChange={(e) => setValue("humidity", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>Humidity Levels (%)</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Humidity Levels")}</div>
          </div>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['gas'] || ''} onChange={(e) => setValue("gas", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Gas Mixture")}</div>
          </div>
          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues['alarmStatus'] || 'Functional'} onChange={(e) => setValue("alarmStatus", e.target.value)}>
              <option value="Functional">Functional</option>
              <option value="Maintenance Required">Maintenance Required</option>
            </select>
            <label style={labelStyle}>Alarm Status</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Alarm Status")}</div>
          </div>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['alarmResponse'] || ''} placeholder="Type Here" onChange={(e) => setValue("alarmResponse", e.target.value)} />
            <label style={labelStyle}>Alarm Response Time (Mins)</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Alarm Response Time")}</div>
          </div>
          <div style={inputContainerStyle}>
            <input style={inputStyle} value={logValues['comments'] || ''} onChange={(e) => setValue("comments", e.target.value)} placeholder="Type Here" />
            <label style={labelStyle}>Comments</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Comments")}</div>
          </div>
          <div style={inputContainerStyle}>
            <select style={inputStyle} value={logValues['status'] || 'Pass'} onChange={(e) => setValue("status", e.target.value)}>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label style={labelStyle}>Status</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Status")}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "20px", fontSize: "14px" }}>
          <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "#94a3b8" }}>Make :</span><span style={{ fontWeight: "600", color: "#0f172a" }}>{currentEquipment?.make || "N/A"}</span></div>
          <div style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}></div>
          <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "#94a3b8" }}>Model :</span><span style={{ fontWeight: "600", color: "#0f172a" }}>{currentEquipment?.model || "N/A"}</span></div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button onClick={handleClear} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", opacity: isSaving ? 0.6 : 1 }}>Clear</button>
            <button onClick={handleSaveLogs} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", opacity: isSaving ? 0.6 : 1 }}>{isSaving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>Activity</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9e9e9e" }} axisLine={{ stroke: "#E0E0E0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9e9e9e" }} axisLine={false} tickLine={false} label={{ value: "No of parameters", angle: -90, position: "insideLeft", offset: -35, style: { fill: "#9e9e9e", fontSize: 12 } }} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IncubatorForm;