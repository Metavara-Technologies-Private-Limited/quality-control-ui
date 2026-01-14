import { parameterValueApi } from "@/services/api";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify"; // Added ToastContainer here
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

interface LFHFormProps {
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

const LFHForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: LFHFormProps) => {
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
              Range: {config.min_value} - {config.max_value} m/s
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

  const handleLinkClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.info(`File "${file.name}" selected`); // Optional: notify file select
    }
  };

  const handleViewFile = () => {
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, "_blank");
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

    const hasData =
      Object.values(logValues).some((val) => val && val.trim() !== "") ||
      uploadedFile !== null;

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

      if (uploadedFile) {
        logValues["uploadedFileName"] = uploadedFile.name;
      }

      const formValuesList = [
        { key: "airflowVelocity", value: logValues["airflowVelocity"] },
        { key: "hepaFilter", value: logValues["hepaFilter"] },
        { key: "uvLight", value: logValues["uvLight"] },
        { key: "cleanlinessLog", value: logValues["cleanlinessLog"] },
        { key: "uploadedFileName", value: logValues["uploadedFileName"] },
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
        toast.warn("No valid parameters found to match your input.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.success("Parameter logs saved successfully!"); // Toast for success

      setLogValues({});
      setUploadedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parameter logs. Please try again."); // Toast for failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({});
    setUploadedFile(null);
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
      {/* REQUIRED: The ToastContainer must be rendered for toasts to show */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

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
                fontWeight: selectedRadio === ed.equipment_num ? "700" : "500",
                color: selectedRadio === ed.equipment_num ? "#f97316" : "#0f172a",
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
              value={logValues["airflowVelocity"] || ""}
              onChange={(e) => setValue("airflowVelocity", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Airflow Velocity (m/s)</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Airflow Velocity")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["hepaFilter"] || "Intact"}
              onChange={(e) => setValue("hepaFilter", e.target.value)}
            >
              <option value="Intact">Intact</option>
              <option value="Damaged">Damaged</option>
              <option value="Needs Replacement">Needs Replacement</option>
            </select>
            <label style={labelStyle}>HEPA Filter Integrity</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("HEPA Filter Integrity")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <select
              style={inputStyle}
              value={logValues["uvLight"] || "Functional"}
              onChange={(e) => setValue("uvLight", e.target.value)}
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
            </select>
            <label style={labelStyle}>UV Light Functionality</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("UV Light Functionality")}
            </div>
          </div>

          <div style={inputContainerStyle}>
            <input
              style={inputStyle}
              value={logValues["cleanlinessLog"] || ""}
              onChange={(e) => setValue("cleanlinessLog", e.target.value)}
              placeholder="Type Here"
            />
            <label style={labelStyle}>Cleanliness & Decontamination Log</label>
            <div style={rangeTextStyle}>
              {renderParameterInfo("Cleanliness & Decontamination Log")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "50px",
            }}
          >
            <div
              style={{
                backgroundColor: "#F1F5F9",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <span
                style={{ color: "#3B82F6", cursor: "pointer" }}
                onClick={handleLinkClick}
              >
                🔗
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {uploadedFile ? uploadedFile.name : "Sample ID.doc"}
              </span>
              {uploadedFile && (
                <span
                  style={{
                    color: "#EF4444",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => setUploadedFile(null)}
                >
                  ✕
                </span>
              )}
            </div>

            <div
              onClick={handleViewFile}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: uploadedFile ? "#f97316" : "#FEF2F2",
                border: "1px solid #FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploadedFile ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: uploadedFile ? "auto" : "8px",
                  height: uploadedFile ? "auto" : "8px",
                  backgroundColor: uploadedFile ? "transparent" : "#EF4444",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                {uploadedFile ? "👁️" : ""}
              </div>
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

      {/* Activity Graph Section stays the same */}
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
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>
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
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "No of parameters",
                  angle: -90,
                  position: "insideLeft",
                  offset: -35,
                  style: { fill: "#9e9e9e", fontSize: 12 },
                }}
              />
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

export default LFHForm;