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

  // ✅ GET PARAMETER CONFIG - Handle both formats (config object and config.history array)
  const getParameterConfig = (parameterName: string) => {
    const param = currentEquipment?.parameters?.find(
      (p: any) => p.parameter_name?.toLowerCase() === parameterName.toLowerCase()
    );

    if (!param || !param.config) return null;

    let config = param.config;

    // If config has history array, get the latest entry
    if (config.history && Array.isArray(config.history) && config.history.length > 0) {
      config = config.history[config.history.length - 1];
    }

    return config;
  };

  // ✅ RENDER PARAMETER RANGE/VALUE TEXT
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
    console.log("=== SAVE LOGS CLICKED ===");
    console.log("1. currentEquipment:", currentEquipment);
    console.log("2. currentEquipmentDetail:", currentEquipmentDetail);
    console.log("3. logValues:", logValues);

    if (!currentEquipment || !currentEquipmentDetail) {
      alert("Please select an equipment first");
      return;
    }

    if (!currentEquipmentDetail.equipment_id) {
      console.error("ERROR: currentEquipmentDetail.equipment_id is missing!");
      alert("Equipment detail ID is missing. Please check your data structure.");
      return;
    }

    // Check if at least one field is filled
    const hasData = Object.values(logValues).some(
      (val) => val && val.trim() !== ""
    );
    console.log("4. hasData:", hasData);

    if (!hasData) {
      alert("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);

    try {
      const requests: Promise<any>[] = [];

      console.log(
        "5. Total parameters available:",
        currentEquipment.parameters?.length || 0
      );
      console.log("6. Parameters:", currentEquipment.parameters);

      if (
        !currentEquipment.parameters ||
        currentEquipment.parameters.length === 0
      ) {
        alert("No parameters found for this equipment");
        setIsSaving(false);
        return;
      }

      // Collect all filled form values
      const formValuesList = [
        { key: "lensCleanliness", value: logValues["lensCleanliness"] },
        { key: "lightSource", value: logValues["lightSource"] },
        { key: "calibration", value: logValues["calibration"] },
        { key: "comments", value: logValues["comments"] },
        { key: "status", value: logValues["status"] },
      ].filter((item) => item.value && item.value.trim() !== "");

      console.log("Filled form values:", formValuesList);

      // Map each filled value to a parameter
      formValuesList.forEach((formItem, index) => {
        if (index >= currentEquipment.parameters.length) {
          console.log(`⚠️ More form values than parameters. Skipping: ${formItem.key}`);
          return;
        }

        const param = currentEquipment.parameters[index];
        const value = formItem.value;

        console.log(`7.${index} Mapping:`, {
          formField: formItem.key,
          formValue: value,
          toParameter: param.parameter_name,
          parameterId: param.id,
        });

        const payload = {
          parameter: param.id,
          equipment_details: currentEquipmentDetail.equipment_id,
          content: value,
        };
        console.log(`   ✓ Adding API request:`, payload);

        requests.push(parameterValueApi.create(payload));
      });

      console.log("8. Total API requests to make:", requests.length);

      if (requests.length === 0) {
        alert(
          "No matching parameters found to save. Please check parameter names in database."
        );
        setIsSaving(false);
        return;
      }

      console.log("9. Making API calls...");
      const results = await Promise.all(requests);
      console.log("10. ✓ API calls successful:", results);

      alert("Parameter logs saved successfully!");

      // Clear form after successful save
      setLogValues({});
    } catch (err) {
      console.error("11. ✗ Failed to save parameter logs:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      alert("Failed to save parameter logs. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({});
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

  const rangeTextStyle = { fontSize: "11px", marginTop: "4px", color: "#94a3b8" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* SECTION 1: Technical Details Card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Unit Selector Radios */}
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
              key={ed.equipment_id}
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

        {/* Technical Parameters Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["lensCleanliness"] || "Clean"}
              onChange={(e) => setValue("lensCleanliness", e.target.value)}
            >
              <option value="Clean">Clean</option>
              <option value="Needs Cleaning">Needs Cleaning</option>
            </select>
            <label style={labelStyle}>Lens Cleanliness</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Lens Cleanliness")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["lightSource"] || "Functional"}
              onChange={(e) => setValue("lightSource", e.target.value)}
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
              <option value="Warning">Warning</option>
            </select>
            <label style={labelStyle}>Light Source Functionality</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Light Source Functionality")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["calibration"] || "Accurate"}
              onChange={(e) => setValue("calibration", e.target.value)}
            >
              <option value="Accurate">Accurate</option>
              <option value="Calibration Required">Calibration Required</option>
            </select>
            <label style={labelStyle}>Calibration Checks</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Calibration Checks")}
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
            <div style={rangeTextStyle}>
              {renderParameterInfo("Status")}
            </div>
          </div>
        </div>

        {/* Make and Model Section with Action Buttons */}
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
                backgroundColor: "#1e293b",
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
                    {Math.abs(value)}
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

export default MicroscopesForm;