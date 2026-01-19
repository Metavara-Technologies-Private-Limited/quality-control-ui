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
  LabelList,
  CartesianGrid,
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
    { day: "Monday", compliant: 34, nonCompliant: -23 },
    { day: "Tuesday", compliant: 28, nonCompliant: -22 },
    { day: "Wednesday", compliant: 22, nonCompliant: -36 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -28 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -25 },
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
      (p: any) =>
        p.parameter_name?.toLowerCase().trim() ===
        parameterName.toLowerCase().trim()
    );
    if (!param) {
      param = currentEquipment.parameters.find((p: any) =>
        p.parameter_name?.toLowerCase().includes(parameterName.toLowerCase())
      );
    }
    if (!param) {
      param = currentEquipment.parameters.find((p: any) =>
        parameterName.toLowerCase().includes(p.parameter_name?.toLowerCase())
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

  const dataType = config.data_type;

  switch (dataType) {
    case "Decimal":
    case "Min/Max":
    case "Integer":
 
      const hasDefaultValue = config.default_value != null && config.default_value !== "";
      
      if (config.min_value != null && config.max_value != null) {
        return (
          <span>
            {hasDefaultValue && (
              <span style={defaultGreyStyle}>
                 Recommended:{config.default_value}{config.unit || ""} | {" "}
              </span>
            )}
            
            {/* Show Range */}
            <span style={dynamicStyle}>
              Range: {config.min_value}{config.unit || ""} - {config.max_value}{config.unit || ""}
            </span>
          </span>
        );
      }
      break;

    case "Percentage":
      const hasDefaultPercentage = config.default_value != null && config.default_value !== "";
      
      if (config.percentage != null) {
        return (
          <span>
            {hasDefaultPercentage && (
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
      const hasDefaultText = config.default_value || textValue;
      
      return (
        <span style={defaultGreyStyle}>
          {hasDefaultText ? `Text:  ${config.default_value || textValue}` : "No Text value"}
        </span>
      );

    case "Select":
    case "Dropdown":
      const dropdownOptions = config.dropdown || config.options || [];
      const hasDefaultDropdown = config.default_value != null && config.default_value !== "";
      
      return (
        <span style={defaultGreyStyle}>
          {hasDefaultDropdown && (
            <>
              Type: {config.default_value} | {" "}
            </>
          )}
          Type: {dropdownOptions.join(", ")}
        </span>
      );

    case "Boolean":
      const hasDefaultBoolean = config.default_value != null && config.default_value !== "";
      const booleanType = config.boolean_type || "yesno";
      const booleanLabel = booleanType === "yesno" ? "Yes/No" : "True/False";
      
      return (
        <span style={defaultGreyStyle}>
          {hasDefaultBoolean && (
            <>
              Default: {config.default_value} | {" "}
            </>
          )}
          Type: {booleanLabel}
        </span>
      );

    default:
      return null;
  }
};

  const getRangeStatusColor = (parameterName: string) => {
    const config = getParameterConfig(parameterName);

    // Map the display label to the state key
    const stateMapping: Record<string, string> = {
      Temperature: "temperature",
      "CO2 Concentration": "co2",
      "Humidity Levels": "humidity",
      "Gas Mixture": "gas",
      "Alarm Response Time": "alarmResponse",
    };

    const stateKey = stateMapping[parameterName];
    const rawValue = logValues[stateKey];

    // If empty or no config, stay grey
    if (
      !rawValue ||
      !config ||
      config.min_value == null ||
      config.max_value == null
    ) {
      return "#9E9E9E";
    }

    const inputValue = parseFloat(rawValue);
    if (isNaN(inputValue)) return "#9E9E9E";

    if (inputValue < Number(config.min_value)) return "#D6BA18"; // Below range
    if (inputValue > Number(config.max_value)) return "#F25B5B"; // Above range

    return "#9E9E9E"; // In between range
  };

  const fetchGraphData = async () => {
    if (!currentEquipmentDetail?.parameters) return;

    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
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
        const originalParamName =
          currentEquipmentDetail.parameters[index].parameter_name;

        // Get the config for this specific parameter
        const config = getParameterConfig(originalParamName);

        res.data.forEach((entry: any) => {
          if (!entry.created_at || entry.content === "NO_RECORD") return;
          const value = Number(
            entry.content.replace("%", "").replace("°C", "").trim()
          );
          if (isNaN(value)) return;

          const dayName = weekDays[new Date(entry.created_at).getDay()];

          // Check if parameter has a range defined (min/max values)
          if (config?.min_value != null && config?.max_value != null) {
            const isCompliant =
              value >= Number(config.min_value) &&
              value <= Number(config.max_value);

            if (isCompliant) {
              chartMap[dayName].compliant += value;
            } else {
              chartMap[dayName].nonCompliant -= value; // Make negative for display below axis
            }
          } else {
            // If no range defined, treat positive values as compliant
            if (value > 0) {
              chartMap[dayName].compliant += value;
            }
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
    const hasData = Object.values(logValues).some(
      (val) => val && val.trim() !== ""
    );
    if (!hasData) {
      toast.warn("Please fill at least one field before saving");
      return;
    }
    setIsSaving(true);
    try {
      if (
        !currentEquipment.parameters ||
        currentEquipment.parameters.length === 0
      ) {
        toast.error("No parameters found for this equipment");
        setIsSaving(false);
        return;
      }

      const parameterMapping: Record<string, string> = {
        temperature: "Temperature",
        co2: "CO2 Concentration",
        humidity: "Humidity Levels",
        gas: "Gas Mixture",
        alarmStatus: "Alarm Status",
        alarmResponse: "Alarm Response Time",
        comments: "Comments",
        status: "Status",
      };

      const requests: Promise<any>[] = [];

      Object.entries(logValues).forEach(([key, value]) => {
        if (!value || value.trim() === "") return;

        const expectedParamName = parameterMapping[key];
        const matchingParam = currentEquipment.parameters.find((p: any) => {
          const pName = p.parameter_name?.toLowerCase().trim();
          const expectedName = expectedParamName?.toLowerCase().trim();
          return (
            pName === expectedName ||
            pName?.includes(expectedName) ||
            expectedName?.includes(pName)
          );
        });

        if (matchingParam) {
          const payload = {
            parameter: matchingParam.id,
            equipment_details: currentEquipmentDetail.equipment_id,
            content: value,
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

      // Refresh graph after saving
      setTimeout(() => {
        fetchGraphData();
      }, 500);
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

  const inputContainerStyle = {
    position: "relative" as const,
    marginBottom: "20px",
  };
  const inputStyle = {
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "16px",
    color: "#232323",
    fontWeight: "500",
    outline: "none",
  };
  const labelStyle = {
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
                color: "#232323",
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
              value={logValues["temperature"] || ""}
              onChange={(e) => setValue("temperature", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Temperature (°C)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Temperature")}
            </div>
          </div>
          
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["co2"] || ""}
              onChange={(e) => setValue("co2", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>CO2 Concentration (%)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("CO2 Concentration")}
            </div>
          </div>
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["humidity"] || ""}
              onChange={(e) => setValue("humidity", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Humidity Levels (%)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Humidity Levels")}
            </div>
          </div>
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["gas"] || ""}
              onChange={(e) => setValue("gas", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Gas Mixture")}
            </div>
          </div>
          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["alarmStatus"] || "Functional"}
              onChange={(e) => setValue("alarmStatus", e.target.value)}
            >
              <option value="Functional">Functional</option>
              <option value="Maintenance Required">Maintenance Required</option>
            </select>
            <label style={labelStyle}>Alarm Status</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Alarm Status")}
            </div>
          </div>
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["alarmResponse"] || ""}
              placeholder="Type Here"
              onChange={(e) => setValue("alarmResponse", e.target.value)}
            />
            <label style={{ ...labelStyle, fontSize: "13px" }}>
              Alarm Response Time (Mins)
            </label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Alarm Response Time")}
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
            <div style={rangeTextStyle}>{renderParameterInfo("Comments")}</div>
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
                fontWeight: "700",
                backgroundColor: "#FFFFFF",
                border: "1px solid #505050",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "14px",
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
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "14px",
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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
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
                color: "#232323",
                margin: 0,
              }}
            >
              Activity
            </h3>
          </div>

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
            margin: "0 -24px 20px -24px",
          }}
        />

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  const absoluteValue = Math.abs(value);
                  const label =
                    name === "compliant" ? "Compliant" : "Non-Compliant";
                  return [absoluteValue, label];
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
    </div>
  );
};
export default IncubatorForm;
