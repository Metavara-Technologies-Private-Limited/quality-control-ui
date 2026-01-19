import { parameterValueApi } from "@/services/api";
import { useEffect, useState } from "react";
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

interface OvensWaterBathFormProps {
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

const OvensWaterBathForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: OvensWaterBathFormProps) => {
  const [activeCategory, setActiveCategory] = useState("Ovens");
  const [logValues, setLogValues] = useState<Record<string, string>>({
    tempConsistency: "",
    waterLevel: "Sufficient",
    alarmFunctionality: "Functional",
    decontaminationLog: "",
    status: "Pass",
    comments: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (selectedRadio) {
      if (selectedRadio.toLowerCase().includes("water bath")) {
        setActiveCategory("Water Bath");
      } else if (selectedRadio.toLowerCase().includes("oven")) {
        setActiveCategory("Ovens");
      }
    }
  }, [selectedRadio]);

  const filteredEquipment = equipmentDetails.filter((ed) => {
    const name = ed.equipment_num.toLowerCase();
    if (activeCategory === "Ovens") {
      return name.includes("oven");
    } else {
      return name.includes("water bath");
    }
  });

  const currentEquipmentDetail = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

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
    if (
      config.history &&
      Array.isArray(config.history) &&
      config.history.length > 0
    ) {
      config = config.history[config.history.length - 1];
    }
    return config;
  };

 
  const getRangeStatusColor = (parameterName: string) => {
    const config = getParameterConfig(parameterName);
    
    const stateMapping: Record<string, string> = {
      "Temperature Consistency": "tempConsistency",
      "Cleanliness & Decontamination Log": "decontaminationLog",
    };

    const stateKey = stateMapping[parameterName];
    const rawValue = stateKey ? logValues[stateKey] : null;

    
    if (!rawValue || !config || config.min_value == null || config.max_value == null) {
      return "#94a3b8";
    }

    const inputValue = parseFloat(rawValue);
    if (isNaN(inputValue)) return "#94a3b8";

  
    if (inputValue < Number(config.min_value)) return "#D6BA18";  
    if (inputValue > Number(config.max_value)) return "#F25B5B"; 
    
    return "#94a3b8";  
  };

// In OvensWaterBathForm.tsx - Update the renderParameterInfo function

const renderParameterInfo = (parameterName: string) => {
  const config = getParameterConfig(parameterName);
  if (!config) return null;

  const dynamicColor = getRangeStatusColor(parameterName);
  
  const dynamicStyle = {
    color: dynamicColor,
    fontSize: "12px",
    fontWeight: "500",
    transition: "color 0.2s ease",
  };

  const defaultGreyStyle = {
    color: "#9E9E9E",
    fontSize: "12px",
    fontWeight: "500"
  };

  const hasDefaultValue = config.default_value != null && config.default_value !== "";
  const dataType = config.data_type;

  switch (dataType) {
    case "Decimal":
    case "Min/Max":
    case "Integer":
      if (config.min_value != null && config.max_value != null) {
        return (
          <span>
            {hasDefaultValue && (
              <span style={defaultGreyStyle}>
                Recommended: {config.default_value}{config.unit || ""} | {" "}
              </span>
            )}
            <span style={dynamicStyle}>
              Range: {config.min_value}{config.unit || ""} - {config.max_value}{config.unit || ""}
            </span>
          </span>
        );
      }
      break;

    case "Percentage":
      if (config.percentage != null) {
        return (
          <span>
            {hasDefaultValue && (
              <span style={defaultGreyStyle}>
                Recommended: {config.default_value}% | {" "}
              </span>
            )}
            <span style={dynamicStyle}>
              Range: 0% - {config.percentage}%
            </span>
          </span>
        );
      }
      break;

    case "Text":
      const textValue = config.text || config.recommendation || "";
      const hasTextDefault = config.default_value || textValue;
      return (
        <span style={defaultGreyStyle}>
          {hasTextDefault ? `Text: ${config.default_value || textValue}` : "No recommended value"}
        </span>
      );

    case "Select":
    case "Dropdown":
      const dropdownOptions = config.dropdown || config.options || [];
      return (
        <span style={defaultGreyStyle}>
          {hasDefaultValue && (
            <>
              Type: {config.default_value} | {" "}
            </>
          )}
          Options: {dropdownOptions.join(", ")}
        </span>
      );

    case "Boolean":
      const hasBoolDefault = config.default_value != null && config.default_value !== "";
      const booleanType = config.boolean_type || "yesno";
      return (
        <span style={defaultGreyStyle}>
          {hasBoolDefault && (
            <>
              Type: {config.default_value} | {" "}
            </>
          )}
          Type: {booleanType === "yesno" ? "Yes/No" : "True/False"}
        </span>
      );

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
      toast.error("Equipment detail ID is missing.");
      return;
    }

    const hasData = Object.values(logValues).some(
      (val) => val && val.trim() !== ""
    );

    if (!hasData) {
      toast.warn("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving parameter logs...");

    try {
      const requests: Promise<any>[] = [];

      if (
        !currentEquipment.parameters ||
        currentEquipment.parameters.length === 0
      ) {
        toast.update(toastId, {
          render: "No parameters found for this equipment",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setIsSaving(false);
        return;
      }

      const parameterMapping: Record<string, string> = {
        tempConsistency: "Temperature Consistency",
        waterLevel: "Water Level Monitoring",
        alarmFunctionality: "Alarm Functionality",
        decontaminationLog: "Cleanliness & Decontamination Log",
        comments: "Comments",
        status: "Status"
      };

      Object.entries(logValues).forEach(([key, value]) => {
        if (!value || value.trim() === '') return;

        const expectedParamName = parameterMapping[key];
        if (!expectedParamName) return;

        const matchingParam = currentEquipment.parameters.find((p: any) => {
          const pName = p.parameter_name?.toLowerCase().trim();
          const expectedName = expectedParamName?.toLowerCase().trim();
          return pName === expectedName || pName?.includes(expectedName) || expectedName?.includes(pName);
        });

        if (matchingParam) {
          requests.push(
            parameterValueApi.create({
              parameter: matchingParam.id,
              equipment_details: currentEquipmentDetail.equipment_id,
              content: value,
            })
          );
        }
      });

      if (requests.length === 0) {
        toast.update(toastId, {
          render: "No matching parameters found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.update(toastId, {
        render: "Parameter logs saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setLogValues({
        tempConsistency: "",
        waterLevel: "Sufficient",
        alarmFunctionality: "Functional",
        decontaminationLog: "",
        status: "Pass",
        comments: "",
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to save logs. Check connection.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({
      tempConsistency: "",
      waterLevel: "Sufficient",
      alarmFunctionality: "Functional",
      decontaminationLog: "",
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

  const inputContainerStyle = {
    position: "relative" as const,
    marginBottom: "20px",
  };
  const inputStyle = {
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    color:"#232323",
    fontSize: "14px",
    outline: "none",
  };
  const labelStyle = {
    position: "absolute" as const,
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    color: "#64748b",
  };
  const rangeTextStyle = {
    fontSize: "11px",
    marginTop: "4px",
    color: "#94a3b8",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {["Ovens", "Water Bath"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 24px",
                borderRadius: "10px",
                border:
                  activeCategory === cat
                    ? "1px solid #E17E61"
                    : "1px solid #e5e7eb",
                backgroundColor: activeCategory === cat ? "#FFF5F2" : "#fff",
                color: activeCategory === cat ? "#E17E61" : "#94a3b8",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Unit Selector */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "20px",
          }}
        >
          {filteredEquipment.map((ed) => (
            <label
              key={ed.equipment_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: selectedRadio === ed.equipment_num ? "700" : "500",
                color:
                  selectedRadio === ed.equipment_num ? "#f97316" : "#0f172a",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={selectedRadio === ed.equipment_num}
                onChange={() => setSelectedRadio(ed.equipment_num)}
                style={{
                  accentColor: "#f97316",
                  width: "16px",
                  height: "16px",
                }}
              />
              {ed.equipment_num}
            </label>
          ))}
        </div>

        {/* Form Fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["tempConsistency"] || ""}
              onChange={(e) => setValue("tempConsistency", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Temperature Consistency (°C)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Temperature Consistency")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["waterLevel"] || "Sufficient"}
              onChange={(e) => setValue("waterLevel", e.target.value)}
            >
              <option value="Sufficient">Sufficient</option>
              <option value="Low">Low</option>
              <option value="Empty">Empty</option>
            </select>
            <label style={labelStyle}>Water Level Monitoring</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Water Level Monitoring")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["alarmFunctionality"] || "Functional"}
              onChange={(e) => setValue("alarmFunctionality", e.target.value)}
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelStyle}>Alarm Functionality</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Alarm Functionality")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["decontaminationLog"] || ""}
              onChange={(e) => setValue("decontaminationLog", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Cleanliness & Decontamination Log</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Cleanliness & Decontamination Log")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["comments"] || ""}
              onChange={(e) => setValue("comments", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Comments</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Comments")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["status"] || "Pass"}
              onChange={(e) => setValue("status", e.target.value)}
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label style={labelStyle}>Status</label>
            <div style={rangeTextStyle}>{renderParameterInfo("Status")}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Make :</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>
              {currentEquipment?.make || "N/A"}
            </span>
          </div>
          <div
            style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}
          ></div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Model :</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>
              {currentEquipment?.model || "N/A"}
            </span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
            <button
              onClick={handleClear}
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
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
                backgroundColor: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#505050"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: 0,
                color: "#0f172a",
              }}
            >
              Activity
            </h3>
          </div>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityData}
              stackOffset="sign"
              margin={{ top: 20, right: 30, left: 45, bottom: 20 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
              />
              <YAxis
                domain={[-40, 40]}
                ticks={[-40, -20, 0, 20, 40]}
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "4px" }}
              />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar
                dataKey="compliant"
                fill="#6c6c6c"
                radius={[4, 4, 0, 0]}
                barSize={15}
              />
              <Bar
                dataKey="nonCompliant"
                fill="#EF9685"
                radius={[0, 0, 4, 4]}
                barSize={15}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OvensWaterBathForm;