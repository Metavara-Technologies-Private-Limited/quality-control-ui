import { parameterValueApi } from "@/services/api";
import { useState, useMemo, useEffect } from "react";
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

const CryopreservationForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: CryopreservationFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    liquidNitrogenLevels: "",
    temperature: "",
    backSystemFunctionality: "Functional",
    alarmStatus: "Functional",
    status: "Pass",
    comments: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. AUTO-SELECT LOGIC ---
  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  // --- 2. CONFIGURATION: Map Form Keys to DB Parameter Names ---
  const fieldMapping = useMemo(
    () => [
      { key: "liquidNitrogenLevels", dbName: "Liquid Nitrogen Levels" },
      { key: "temperature", dbName: "Temperature" },
      { key: "backSystemFunctionality", dbName: "Back System Functionality" },
      { key: "alarmStatus", dbName: "Alarm Status" },
      { key: "comments", dbName: "Comments" },
      { key: "status", dbName: "Status" },
    ],
    []
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  // --- 3. MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  // GET PARAMETER CONFIG - Handle both formats
  const getParameterConfig = (dbName: string) => {
    const param = getDbParam(dbName);

    if (!param || !param.config) return null;

    let config = param.config;

    // If config has history array, get the latest entry
    if (
      config.history &&
      Array.isArray(config.history) &&
      config.history.length > 0
    ) {
      config = config.history[config.history.length - 1];
    }

    return config;
  };

  const getRangeStatusColor = (dbName: string) => {
    const config = getParameterConfig(dbName);
    
    const stateMapping: Record<string, string> = {
      "Liquid Nitrogen Levels": "liquidNitrogenLevels",
      "Temperature": "temperature",
    };

    const stateKey = stateMapping[dbName];
    const rawValue = stateKey ? formData[stateKey] : null;

    // If empty, stay grey
    if (!rawValue || !config || config.min_value == null || config.max_value == null) {
      return "#9E9E9E";
    }

    const inputValue = parseFloat(rawValue);
    if (isNaN(inputValue)) return "#9E9E9E";

     
    if (inputValue < Number(config.min_value)) return "#D6BA18";  
    if (inputValue > Number(config.max_value)) return "#F25B5B"; 
    
    return "#9E9E9E"; 
  };

  // ✅ UPDATED: renderParameterInfo with dynamic colors
  const renderParameterInfo = (parameterName: string) => {
    const config = getParameterConfig(parameterName);
    if (!config) return null;
    
    const dynamicColor = getRangeStatusColor(parameterName);
    const labelStyle = { 
      color: dynamicColor, 
      fontSize: "12px", 
      fontWeight: "500",
      transition: "color 0.2s ease"
    };

    const dataType = config.data_type;
    
    switch (dataType) {
      case "Integer":
      case "Decimal":
      case "Min/Max":
        if (config.min_value != null && config.max_value != null) {
          return (
            <span style={labelStyle}>
              Range: {config.min_value} {config.unit || ""} - {config.max_value} {config.unit || ""}
            </span>
          );
        }
        break;
      case "Percentage":
        if (config.percentage != null) {
          return (
            <span style={labelStyle}>
              Range: 0% - {config.percentage}%
            </span>
          );
        }
        break;
      // ✅ UPDATED: Fetching the actual text/content instead of data type description
      case "Text":
        const textValue = config.text || config.recommendation || "";
        return (
          <span style={{ color: "#9E9E9E", fontSize: "11px", fontWeight: "500" }}>
            Text: {textValue}
          </span>
        );
      case "Boolean":
        return (
          <span style={{ color: "#9E9E9E", fontSize: "11px", fontWeight: "500" }}>
            Type: {config.boolean_type === "yesno" ? "Yes/No" : "True/False"}
          </span>
        );
      case "Select":
      case "Dropdown":
        if (config.dropdown && Array.isArray(config.dropdown) && config.dropdown.length > 0) {
          return (
            <span style={{ color: "#9E9E9E", fontSize: "11px", fontWeight: "500" }}>
              Options: {config.dropdown.join(", ")}
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
      toast.error("Please select a tank first");
      return;
    }

    const hasData = Object.entries(formData).some(
      ([key, val]) =>
        key !== "backSystemFunctionality" &&
        key !== "alarmStatus" &&
        key !== "status" &&
        val &&
        val.trim() !== ""
    );

    if (!hasData) {
      toast.warning("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    const id = toast.loading("Saving parameter logs...");

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
        toast.update(id, {
          render: "No matching parameters found or no data entered",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.update(id, {
        render: "Parameter logs saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      handleClearForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.update(id, {
        render: "Failed to save logs. Please check console.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
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
    toast.info("Form cleared");
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 12, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -20 },
    { day: "Saturday", compliant: 15, nonCompliant: -6 },
    { day: "Sunday", compliant: 25, nonCompliant: -40 },
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
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    fontSize: "16px",
    outline: "none",
    color: "#232323",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f1f5f9",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    boxSizing: "border-box" as const,
  });

  const labelOverlayStyle = {
    position: "absolute" as const,
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "14px",
    color: "#232323",
  };

  const rangeTextStyle = {
    fontSize: "12px",
    marginTop: "4px",
    color: "#9E9E9E",
    fontWeight: "500",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ✅ Add ToastContainer here to enable popups */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "2px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Unit Selector Radios */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
            borderBottom: "2px solid #f1f5f9",
            paddingBottom: "20px",
          }}
        >
          {equipmentDetails.map((ed) => (
            <label
              key={ed.equipment_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: selectedRadio === ed.equipment_num ? "600" : "500",
                color:
                  selectedRadio === ed.equipment_num ? "#232323" : "#E17E61",
                cursor: "pointer",
              }}
            >
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
                  border: `2px solid ${
                    selectedRadio === ed.equipment_num ? "#232323" : "#d1d5db"
                  }`,
                  backgroundColor: "#fff",
                  boxShadow:
                    selectedRadio === ed.equipment_num
                      ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61"
                      : "none",
                  outline: "none",
                }}
              />
              {ed.equipment_num}
            </label>
          ))}
        </div>

        {/* Form Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div style={inputContainerStyle("Liquid Nitrogen Levels")}>
            <input
              type="text"
              placeholder="Type Here"
              disabled={!getDbParam("Liquid Nitrogen Levels")}
              value={formData.liquidNitrogenLevels}
              onChange={(e) => setValue("liquidNitrogenLevels", e.target.value)}
              style={inputStyle("Liquid Nitrogen Levels")}
            />
            <label style={{ ...labelOverlayStyle, fontSize: "13px" }}>
              Liquid Nitrogen Levels (mm)
            </label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Liquid Nitrogen Levels")}
            </div>
          </div>

          <div style={inputContainerStyle("Temperature")}>
            <input
              type="text"
              placeholder="Type Here"
              disabled={!getDbParam("Temperature")}
              value={formData.temperature}
              onChange={(e) => setValue("temperature", e.target.value)}
              style={inputStyle("Temperature")}
            />
            <label style={labelOverlayStyle}>Temperature (°C)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Temperature")}
            </div>
          </div>

          <div style={inputContainerStyle("Back System Functionality")}>
            <select
              disabled={!getDbParam("Back System Functionality")}
              value={formData.backSystemFunctionality}
              onChange={(e) =>
                setValue("backSystemFunctionality", e.target.value)
              }
              style={{
                ...inputStyle("Back System Functionality"),
                cursor: "pointer",
              }}
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
            <div style={rangeTextStyle}>{renderParameterInfo("Comments")}</div>
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
            <div style={rangeTextStyle}>{renderParameterInfo("Status")}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <div>
            <span style={{ color: "#94a3b8" }}>Make :</span>{" "}
            <b>{currentEquipment?.make || "N/A"}</b>
          </div>
          <div
            style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}
          ></div>
          <div>
            <span style={{ color: "#94a3b8" }}>Model :</span>{" "}
            <b>{currentEquipment?.model || "N/A"}</b>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button
              onClick={handleClearForm}
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: "#fff",
                border: "1px solid #505050",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              Clear
            </button>
            <button
              onClick={handleSaveLogs}
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                backgroundColor: "#505050",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Graph Section */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          {/* Left Side: Icon and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
              }}
            >
              <img
                src={Chart_activity}
                alt="chart icon"
                style={{ width: "25px", height: "25px" }}
              />
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Activity
            </h3>
          </div>

          {/* Right Side: Legend Indicators */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#6c6c6c",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#949494" }}>
                Compliant
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#EF9685",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#949494" }}>
                Non - Compliant
              </span>
            </div>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #E2E3E5",
            margin: "-20px -24px 16px -24px",
            width: "auto",
          }}
        />
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityData}
              stackOffset="sign"
              barGap={-25}
              margin={{ top: 20, right: 30, left: 45, bottom: 20 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#8c8c8c" }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                label={{
                  value: "Month",
                  position: "bottom",
                  offset: 10,
                  style: { fill: "#9e9e9e", fontSize: 12 },
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickCount={9}
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                tickFormatter={(value) => (value === 0 ? "" : value)}
                label={{
                  value: "No of parameters",
                  angle: -90,
                  position: "insideLeft",
                  offset: -35,
                  dy: 40,
                  style: { fill: "#9e9e9e", fontSize: 12 },
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value: number, name: string) => {
                  const absoluteValue = Math.abs(value);
                  const label =
                    name === "compliant" ? "Compliant" : "Non-Compliant";
                  return [`${absoluteValue} m/s`, label];
                }}
              />
              <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" />

              <Bar
                dataKey="compliant"
                fill="#6c6c6c"
                radius={[4, 4, 0, 0]}
                barSize={25}
              >
                <LabelList
                  dataKey="compliant"
                  position="top"
                  formatter={(value: number) => (value === 0 ? "" : value)}
                  style={{ fill: "#6c6c6c", fontSize: 12, fontWeight: 600 }}
                />
              </Bar>

              <Bar
                dataKey="nonCompliant"
                fill="#EF9685"
                radius={[4, 4, 0, 0]}
                barSize={25}
              >
                <LabelList
                  dataKey="nonCompliant"
                  position="top"
                  formatter={(value: number) =>
                    value === 0 ? "" : Math.abs(value)
                  }
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

export default CryopreservationForm;