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

  // Debug logs
  console.log("PHMetersForm rendered");
  console.log("equipmentDetails:", equipmentDetails);
  console.log("selectedRadio:", selectedRadio);

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const currentEquipmentDetail = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

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

    // Check if at least one field is filled (excluding default values)
    const hasData = logValues.comments && logValues.comments.trim() !== "";
    console.log("4. hasData:", hasData);

    if (!hasData) {
      alert("Please add comments before saving");
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

      // Collect all form values (including dropdowns with defaults)
      const formValuesList = [
        { key: "calibrationChecks", value: logValues["calibrationChecks"] },
        { key: "electrodeCondition", value: logValues["electrodeCondition"] },
        {
          key: "temperatureCompensation",
          value: logValues["temperatureCompensation"],
        },
        { key: "comments", value: logValues["comments"] },
        { key: "status", value: logValues["status"] },
      ].filter((item) => item.value && item.value.trim() !== "");

      console.log("7. Filled form values:", formValuesList);

      // Map each filled value to a parameter
      formValuesList.forEach((formItem, index) => {
        if (index >= currentEquipment.parameters.length) {
          console.log(
            `⚠️ More form values (${formValuesList.length}) than parameters (${currentEquipment.parameters.length}). Skipping: ${formItem.key}`
          );
          return;
        }

        const param = currentEquipment.parameters[index];
        const value = formItem.value;

        console.log(`8.${index} Mapping:`, {
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

      console.log("9. Total API requests to make:", requests.length);

      if (requests.length === 0) {
        alert(
          "No matching parameters found to save. Please check parameter names in database."
        );
        setIsSaving(false);
        return;
      }

      console.log("10. Making API calls...");
      const results = await Promise.all(requests);
      console.log("11. ✓ API calls successful:", results);

      alert("Parameter logs saved successfully!");

      // Clear only comments field, keep dropdown defaults
      setLogValues({
        calibrationChecks: "Accurate",
        electrodeCondition: "Clean",
        temperatureCompensation: "Functional",
        status: "Pass",
        comments: "",
      });
    } catch (err) {
      console.error("12. ✗ Failed to save parameter logs:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      alert("Failed to save parameter logs. Check console for details.");
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
  };

  useEffect(() => {
    if (!selectedRadio && equipmentDetails.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* SECTION 1: Radio Buttons, Form Fields, and Submission */}
      <div style={sectionStyle}>
        {/* Radio Buttons */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            paddingBottom: "24px",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: "24px",
            flexWrap: "wrap",
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
                fontWeight: selectedRadio === ed.equipment_num ? "700" : "500",
                cursor: "pointer",
                color: selectedRadio === ed.equipment_num ? "#f97316" : "#0f172a",
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

        {/* Form Fields Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Calibration Checks */}
          <div style={{ position: "relative" }}>
            <select
              value={logValues.calibrationChecks}
              onChange={(e) => setValue("calibrationChecks", e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "#fff",
                color: "#0f172a",
              }}
            >
              <option>Accurate</option>
              <option>Needs Calibration</option>
            </select>
            <label
              style={{
                position: "absolute",
                left: "12px",
                top: "-8px",
                backgroundColor: "#fff",
                padding: "0 4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#64748b",
              }}
            >
              Calibration Checks
            </label>
          </div>

          {/* Electrode Condition */}
          <div style={{ position: "relative" }}>
            <select
              value={logValues.electrodeCondition}
              onChange={(e) => setValue("electrodeCondition", e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "#fff",
                color: "#0f172a",
              }}
            >
              <option>Clean</option>
              <option>Dirty</option>
              <option>Needs Replacement</option>
            </select>
            <label
              style={{
                position: "absolute",
                left: "12px",
                top: "-8px",
                backgroundColor: "#fff",
                padding: "0 4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#64748b",
              }}
            >
              Electrode Condition
            </label>
          </div>

          {/* Temperature Compensation Verification */}
          <div style={{ position: "relative" }}>
            <select
              value={logValues.temperatureCompensation}
              onChange={(e) =>
                setValue("temperatureCompensation", e.target.value)
              }
              style={{
                width: "100%",
                height: "50px",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "#fff",
                color: "#0f172a",
              }}
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <label
              style={{
                position: "absolute",
                left: "12px",
                top: "-8px",
                backgroundColor: "#fff",
                padding: "0 4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#64748b",
              }}
            >
              Temperature Compensation Verification
            </label>
          </div>

          {/* Comments */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Type Here"
              value={logValues.comments}
              onChange={(e) => setValue("comments", e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                color: "#0f172a",
                backgroundColor: "#fff",
              }}
            />
            <label
              style={{
                position: "absolute",
                left: "12px",
                top: "-8px",
                backgroundColor: "#fff",
                padding: "0 4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#64748b",
              }}
            >
              Comments
            </label>
          </div>

          {/* Status */}
          <div style={{ position: "relative" }}>
            <select
              value={logValues.status}
              onChange={(e) => setValue("status", e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "#fff",
                color: "#0f172a",
              }}
            >
              <option>Pass</option>
              <option>Fail</option>
            </select>
            <label
              style={{
                position: "absolute",
                left: "12px",
                top: "-8px",
                backgroundColor: "#fff",
                padding: "0 4px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#64748b",
              }}
            >
              Status
            </label>
          </div>
        </div>

        {/* Make and Model Section with Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "24px",
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
                fontSize: "14px",
                fontWeight: "500",
                cursor: isSaving ? "not-allowed" : "pointer",
                color: "#0f172a",
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
                fontSize: "14px",
                fontWeight: "500",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Activity Chart */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
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
                fontSize: "14px",
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
            marginTop: "8px",
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

export default PHMetersForm;