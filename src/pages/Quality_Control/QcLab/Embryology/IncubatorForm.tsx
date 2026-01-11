import { parameterValueApi } from "@/services/api";
import { useEffect, useState } from "react";
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

const activityData = [
  { day: "Monday", compliant: 34, nonCompliant: -23 },
  { day: "Tuesday", compliant: 28, nonCompliant: -22 },
  { day: "Wednesday", compliant: 22, nonCompliant: -36 },
  { day: "Thursday", compliant: 34, nonCompliant: -12 },
  { day: "Friday", compliant: 29, nonCompliant: -28 },
  { day: "Saturday", compliant: 15, nonCompliant: -33 },
  { day: "Sunday", compliant: 25, nonCompliant: -25 },
];

const IncubatorForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: IncubatorFormProps) => {
  const [logValues, setLogValues] = useState<Record<string, string>>({});

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const currentEquipmentDetail = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const handleSaveLogs = async () => {
    if (!currentEquipment || !currentEquipmentDetail) return;

    try {
      const requests = currentEquipment.parameters
        .map((param: any) => {
          const key = param.parameter_name.toLowerCase();
          const value = logValues[key];

          if (!value) return null;

          return parameterValueApi.create({
            parameter: param.id,
            equipment_details: currentEquipmentDetail.equipment_id, // ✅ REQUIRED
            content: value, // ✅ CORRECT FIELD
          });
        })
        .filter(Boolean);

      await Promise.all(requests);

      alert("Parameter logs saved successfully");
    } catch (err) {
      console.error("Failed to save parameter logs", err);
    }
  };

  console.log("cc:selectedRadio", currentEquipmentDetail);
  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  const renderRangeText = (param: any) => {
    console.log("cc:param", param);
    if (!param) return null;

    switch (param.data_type) {
      case "Decimal":
        // Use min_value and max_value
        if (param.min_value != null && param.max_value != null) {
          return (
            <span style={{ color: "#94a3b8" }}>
              Range: {param.min_value} - {param.max_value} °C
            </span>
          );
        }
        break;

      case "Percentage":
        if (param.percentage != null) {
          return (
            <span style={{ color: "#94a3b8" }}>
              Range: 0% - {param.percentage}%
            </span>
          );
        }
        break;

      case "Select":
        if (param.dropdown?.length) {
          return (
            <span style={{ color: "#94a3b8" }}>
              Options: {param.dropdown.join(", ")}
            </span>
          );
        }
        break;

      case "Text":
        if (param.text) {
          return <span style={{ color: "#94a3b8" }}>Value: {param.text}</span>;
        }
        break;

      case "Integer":
        if (param.integer_value != null) {
          return (
            <span style={{ color: "#94a3b8" }}>
              Value: {param.integer_value}
            </span>
          );
        }
        break;

      default:
        return null;
    }
  };

  // Returns the latest history config for a given parameter
  const getLatestParam = (paramName: string) => {
    const currentEq = equipmentDetails.find(
      (ed) => ed.equipment_num === selectedRadio
    );
    const param = currentEq?.parameters.find(
      (p) => p.parameter_name.toLowerCase() === paramName.toLowerCase()
    );
    if (!param || !param.config?.history?.length) return null;
    return param.config.history[param.config.history.length - 1]; // latest
  };
  const latestTemp = getLatestParam("Temperature");
  const latestCO2 = getLatestParam("CO2");
  const latestHumidity = getLatestParam("Humidity");
  const latestGas = getLatestParam("Gas");

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
  const rangeTextStyle = { fontSize: "11px", marginTop: "4px" };

  // Map parameter names to input enabling
  const isParamAvailable = (paramName: string) =>
    currentEquipment?.parameters.some((p: any) =>
      p.parameter_name.toLowerCase().includes(paramName.toLowerCase())
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* SECTION 1: Details Card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Equipment Detail Radios */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "20px",
          }}
        >
          {equipmentDetails.map((ed) => (
            <label
              key={ed.equipment_num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: "500",
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

        {/* Form Grid */}
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
              // defaultValue={}
              disabled={!isParamAvailable("Temperature")}
              onChange={(e) => setValue("temperature", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Temperature (°C)</label>
            {latestTemp && (
              <div style={rangeTextStyle}>
                <span style={{ color: "#94a3b8" }}>
                  {renderRangeText(latestTemp)}
                </span>
              </div>
            )}
          </div>
          {/* CO2 Concentration */}
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              defaultValue={
                latestCO2
                  ? latestCO2.data_type === "Percentage"
                    ? `${latestCO2.percentage}%`
                    : latestCO2.text || ""
                  : ""
              }
              disabled={!isParamAvailable("CO2")}
              onChange={(e) => setValue("co2", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>CO2 Concentration (%)</label>
            {latestCO2 && latestCO2.data_type === "Decimal" && (
              <div style={{ ...rangeTextStyle, color: "#94a3b8" }}>
                {renderRangeText(latestCO2)}
              </div>
            )}
          </div>

          {/* Humidity Levels */}
          <div style={inputContainerStyle}>
            {latestHumidity?.data_type === "Select" ? (
              <select
                style={inputStyle}
                disabled={!isParamAvailable("Humidity")}
                defaultValue={latestHumidity.dropdown[0]}
              >
                {latestHumidity.dropdown.map((opt: string, idx: number) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                defaultValue={
                  latestHumidity?.percentage
                    ? `${latestHumidity.percentage}%`
                    : ""
                }
                disabled={!isParamAvailable("Humidity")}
                onChange={(e) => setValue("humidity", e.target.value)}
                placeholder="Type Here"
              />
            )}
            <label style={labelStyle}>Humidity Levels (%)</label>
            {latestHumidity?.data_type === "Decimal" && (
              <div style={{ ...rangeTextStyle, color: "#eab308" }}>
                {renderRangeText(latestHumidity)}
              </div>
            )}
          </div>
          {/* Gas Mixture */}
          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              defaultValue={
                latestGas?.text || latestGas?.dropdown?.join(", ") || ""
              }
              disabled={!isParamAvailable("Gas")}
              onChange={(e) => setValue("gas", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
            {latestGas && (
              <div style={{ ...rangeTextStyle, color: "#94a3b8" }}>
                {renderRangeText(latestGas)}
              </div>
            )}
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              defaultValue="Functional"
              disabled={!isParamAvailable("alarm status")}
              onChange={(e) => setValue("alarmStatus", e.target.value)}
            >
              <option value="Functional">Functional</option>
              <option value="Maintenance Required">Maintenance Required</option>
            </select>
            <label style={labelStyle}>Alarm Status</label>
          </div>

          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              placeholder="Type Here"
              onChange={(e) => setValue("alarmResponse", e.target.value)}
              disabled={!isParamAvailable("alarm response")}
            />
            <label style={labelStyle}>Alarm Response Time (Mins)</label>
            <div style={{ ...rangeTextStyle, color: "#94a3b8" }}>
              Range : &lt; 5
            </div>
          </div>
        </div>

        {/* --- ADDED MAKE AND MODEL SECTION --- */}
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
              style={{
                padding: "10px 24px",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Clear
            </button>
            <button
              onClick={handleSaveLogs}
              style={{
                padding: "10px 24px",
                backgroundColor: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Activity Graph */}
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

          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#6c6c6c",
                  borderRadius: "50%",
                }}
              />
              <span style={{ color: "#9e9e9e" }}>Compliant</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#EF9685",
                  borderRadius: "50%",
                }}
              />
              <span style={{ color: "#9e9e9e" }}>Non - Compliant</span>
            </div>
          </div>
        </div>

        <div
          style={{ borderBottom: "1px solid #f1f5f9", marginBottom: "24px" }}
        ></div>

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
                label={{
                  value: "No of parameters",
                  angle: -90,
                  position: "insideLeft",
                  offset: -35,
                  style: {
                    textAnchor: "middle",
                    fill: "#9e9e9e",
                    fontSize: 12,
                    fontWeight: 500,
                  },
                }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "4px" }}
              />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <ReferenceLine y={20} stroke="#F1F1F1" />
              <ReferenceLine y={40} stroke="#F1F1F1" />
              <ReferenceLine y={-20} stroke="#F1F1F1" />
              <ReferenceLine y={-40} stroke="#F1F1F1" />

              <Bar
                dataKey="compliant"
                fill="#6c6c6c"
                radius={[4, 4, 0, 0]}
                barSize={15}
                label={{ position: "top", fill: "#9e9e9e", fontSize: 10 }}
              />
              <Bar
                dataKey="nonCompliant"
                fill="#EF9685"
                radius={[0, 0, 4, 4]}
                barSize={15}
                label={({ x, y, value, width }: any) => (
                  <text
                    x={x + width / 2}
                    y={y + 14}
                    fill="#EF9685"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {value}
                  </text>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: "12px",
            color: "#B1B1B1",
            fontSize: "12px",
          }}
        >
          Month
        </p>
      </div>
    </div>
  );
};

export default IncubatorForm;
