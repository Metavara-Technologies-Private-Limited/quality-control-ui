import { parameterValueApi } from "@/services/api";
import { useEffect, useState, useRef } from "react";
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
  CartesianGrid
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
  { day: "Tuesday", compliant: 62, nonCompliant: -22 },
  { day: "Wednesday", compliant: 22, nonCompliant: -47 },
  { day: "Thursday", compliant: 34, nonCompliant: -12 },
  { day: "Friday", compliant: 29, nonCompliant: -70 },
  { day: "Saturday", compliant: 53, nonCompliant: -33 },
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

 
  const getColorByUnit = (parameterName: string): string => {
    const config = getParameterConfig(parameterName);
    
    if (config?.unit === "%" || config?.unit === "ppm") {
      return "#D6BA18";
    } else if (config?.unit === "°C" || config?.unit === "°F") {
      return "#F25B5B";
    }
    
    return "#505050";
  };

 
  const getRangeStatusColor = (parameterName: string) => {
    const config = getParameterConfig(parameterName);
    
    const stateMapping: Record<string, string> = {
      "Airflow Velocity": "airflowVelocity",
      "HEPA Filter Integrity": "hepaFilter",
      "UV Light Functionality": "uvLight",
      "Cleanliness & Decontamination Log": "cleanlinessLog",
    };

    const stateKey = stateMapping[parameterName];
    const rawValue = logValues[stateKey];

 
    if (!rawValue || !config || config.min_value == null || config.max_value == null) {
      return "#9E9E9E";
    }

    const inputValue = parseFloat(rawValue);
    if (isNaN(inputValue)) return "#9E9E9E";

 
    if (inputValue < Number(config.min_value)) return "#D6BA18";  
    if (inputValue > Number(config.max_value)) return "#F25B5B";  
    
    return "#9E9E9E";  
  };
 
// In LFHForm.tsx - Update the renderParameterInfo function

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

  const defaultGreyStyle = {
    color: "#9E9E9E",
    fontSize: "12px",
    fontWeight: "500"
  };

  const hasDefaultValue = config.default_value != null && config.default_value !== "";
  const dataType = config.data_type;
  
  switch (dataType) {
    case "Integer":
    case "Decimal":
    case "Min/Max":
      if (config.min_value != null && config.max_value != null) {
        return (
          <span>
            {hasDefaultValue && (
              <span style={defaultGreyStyle}>
                Recommended: {config.default_value}{config.unit || ""} | {" "}
              </span>
            )}
            <span style={labelStyle}>
              Range: {config.min_value} {config.unit || ""} - {config.max_value} {config.unit || ""}
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
            <span style={labelStyle}>
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
          {hasTextDefault ? `Recommended: ${config.default_value || textValue}` : "No recommended value"}
        </span>
      );
    case "Boolean":
      const hasBoolDefault = config.default_value != null && config.default_value !== "";
      const booleanType = config.boolean_type || "yesno";
      return (
        <span style={defaultGreyStyle}>
          {hasBoolDefault && (
            <>
              Recommended: {config.default_value} | {" "}
            </>
          )}
          Type: {booleanType === "yesno" ? "Yes/No" : "True/False"}
        </span>
      );
    case "Select":
    case "Dropdown":
      if (config.dropdown && Array.isArray(config.dropdown) && config.dropdown.length > 0) {
        return (
          <span style={defaultGreyStyle}>
            {hasDefaultValue && (
              <>
                Recommended: {config.default_value} | {" "}
              </>
            )}
            Options: {config.dropdown.join(", ")}
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
      toast.info(`File "${file.name}" selected`);
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

      const parameterMapping: Record<string, string> = {
        airflowVelocity: "Airflow Velocity",
        hepaFilter: "HEPA Filter Integrity",
        uvLight: "UV Light Functionality",
        cleanlinessLog: "Cleanliness & Decontamination Log",
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
      setUploadedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parameter logs. Please try again.");
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
    border: "2px solid #e5e7eb", 
    borderRadius: "8px", 
    fontSize: "16px", 
    color:"#232323", 
    fontWeight: "500", 
    outline: "none" 
  };

  const labelStyle = { 
    position: "absolute" as const, 
    left: "12px", 
    top: "-8px", 
    backgroundColor: "#fff", 
    padding: "0 4px", 
    fontSize: "14px",  
    color: "#232323" 
  };

  const rangeTextStyle = { 
    fontSize: "12px", 
    marginTop: "4px", 
    color: "#9E9E9E", 
    fontWeight: "500" 
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                cursor: "pointer" 
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

          <div style={{ gridColumn: "span 2" }}>
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
        
          <div style={{ ...inputContainerStyle, gridColumn: "span 2"}}>
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

          <div style={{ ...inputContainerStyle, gridColumn: "span 1" }}>
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
                border: "1px solid #505050",
                borderRadius: "8px",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight:"700",
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
                fontSize: "14px",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Graph Section */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "12px",overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px" }}>
              <img src={Chart_activity} alt="chart icon" style={{ width: "25px", height: "25px" }} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#232323", margin: 0 }}>Activity</h3>
          </div>

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
                  return [ `${absoluteValue} m/s`, label ];
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
    </div>
  );
};

export default LFHForm;