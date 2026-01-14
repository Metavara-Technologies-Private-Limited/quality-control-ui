import React, { useState, useRef, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parameterValueApi } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Eye, ArrowLeft, Link2 } from "lucide-react";

interface AutoclavesFormProps {
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

const AutoclavesForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: AutoclavesFormProps) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [viewingFile, setViewingFile] = useState<{
    name: string;
    data: string;
    type: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique equipment numbers from equipmentDetails
  const availableEquipments =
    equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const [formData, setFormData] = useState<Record<string, string>>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: "",
    pressure: "",
    sterilizationCycle: "Valid",
    maintenanceLogs: "",
    status: "Pass",
    comments: "",
    fileName: "No File",
    fileData: "",
    fileType: "",
  });

  // --- CONFIGURATION: Map Form Keys to DB Parameter Names ---
  const fieldMapping = useMemo(
    () => [
      { key: "date", dbName: "Date" },
      { key: "time", dbName: "Time" },
      { key: "temperature", dbName: "Temperature" },
      { key: "pressure", dbName: "Pressure" },
      { key: "sterilizationCycle", dbName: "Sterilization Cycle Validation" },
      { key: "maintenanceLogs", dbName: "Maintenance Logs" },
      { key: "comments", dbName: "Comments" },
      { key: "status", dbName: "Status" },
      { key: "fileData", dbName: "Uploads" },
    ],
    []
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  // --- MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  // ✅ GET PARAMETER CONFIG - Handle both formats (config object and config.history array)
  const getParameterConfig = (parameterName: string) => {
    const param = currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name?.toLowerCase() === parameterName.toLowerCase()
    );

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
        if (
          config.dropdown &&
          Array.isArray(config.dropdown) &&
          config.dropdown.length > 0
        ) {
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          fileName: file.name,
          fileData: reader.result as string,
          fileType: file.type,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentEquipment) {
      toast.error("Please select an equipment first");
      return;
    }

    const hasData = Object.entries(formData).some(([key, val]) => {
      if (key === "fileName") return val !== "No File";
      if (key === "date" || key === "time") return true;
      return val && val.trim() !== "";
    });

    if (!hasData) {
      toast.error("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];

      fieldMapping.forEach((field) => {
        const dbParam = getDbParam(field.dbName);
        let value = formData[field.key];

        if (field.key === "fileData") {
          value = formData.fileName;
        }

        if (dbParam && value && value.trim() !== "" && value !== "No File") {
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
        toast.warn("No matching parameters found to save.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.success("Successfully Saved!");
      setFormData({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: "",
        pressure: "",
        sterilizationCycle: "Valid",
        maintenanceLogs: "",
        status: "Pass",
        comments: "",
        fileName: "No File",
        fileData: "",
        fileType: "",
      });
      setActiveSubTab("Details");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save logs.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch logs from database
  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentEquipment?.equipment_id) return;

      try {
        const response = await parameterValueApi.list({
          equipment_details: currentEquipment.equipment_id,
        });

        if (response && response.results) {
          const logsByParam: Record<string, any> = {};

          response.results.forEach((log: any) => {
            const paramId = log.parameter;
            if (
              !logsByParam[paramId] ||
              new Date(log.created_at) >
                new Date(logsByParam[paramId].created_at)
            ) {
              logsByParam[paramId] = log;
            }
          });

          const formattedLogs = Object.values(logsByParam).map((log: any) => {
            const param = currentEquipment.parameters.find(
              (p: any) => p.id === log.parameter
            );
            return {
              id: log.id,
              dateTime: new Date(log.created_at).toLocaleString(),
              paramName: param?.parameter_name || "N/A",
              content: log.content || "N/A",
            };
          });

          setLogsData(formattedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogs();
  }, [currentEquipment?.equipment_id, currentEquipment?.parameters]);

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const handleClear = () => {
    setFormData({
      ...formData,
      temperature: "",
      pressure: "",
      sterilizationCycle: "Valid",
      maintenanceLogs: "",
      comments: "",
      fileName: "No File",
      fileData: "",
      fileType: "",
    });
  };

  // Styles
  const inputContainerStyle = (dbName: string) => ({
    position: "relative" as const,
    marginBottom: "24px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const inputStyle = (dbName: string) => ({
    width: "100%",
    height: "50px",
    padding: "0 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f1f5f9",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    color: getDbParam(dbName) ? "inherit" : "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

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
    display: "block",
  };

  if (viewingFile) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          minHeight: "600px",
        }}
      >
        <button
          onClick={() => setViewingFile(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#E17E61",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff",
              borderBottom: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <span style={{ fontWeight: "600" }}>
              Viewing: {viewingFile.name}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "#fff",
              minHeight: "400px",
            }}
          >
            {viewingFile.type.startsWith("image/") ? (
              <img
                src={viewingFile.data}
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                }}
                alt="preview"
              />
            ) : (
              <iframe
                src={viewingFile.data}
                width="100%"
                height="500px"
                title="pdf"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        {/* Unit Selector - Dynamic based on available equipments */}
        {availableEquipments.length > 0 && (
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
            {availableEquipments.map((equipment: string) => (
              <label
                key={equipment}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: selectedRadio === equipment ? "700" : "500",
                  color: selectedRadio === equipment ? "#f97316" : "#0f172a",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  checked={selectedRadio === equipment}
                  onChange={() => {
                    setSelectedRadio(equipment);
                    setFormData({
                      date: new Date().toISOString().split("T")[0],
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      temperature: "",
                      pressure: "",
                      sterilizationCycle: "Valid",
                      maintenanceLogs: "",
                      status: "Pass",
                      comments: "",
                      fileName: "No File",
                      fileData: "",
                      fileType: "",
                    });
                  }}
                  style={{
                    accentColor: "#f97316",
                    width: "16px",
                    height: "16px",
                  }}
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: "8px 32px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                backgroundColor:
                  activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: "600",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Date */}
              <div style={inputContainerStyle("Date")}>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={!getDbParam("Date")}
                  style={{ ...(inputStyle("Date") as any), display: "block" }}
                />
                <label style={labelStyle}>Date</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Date")}
                </span>
              </div>

              {/* Time */}
              <div style={inputContainerStyle("Time")}>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!getDbParam("Time")}
                  style={{ ...(inputStyle("Time") as any), display: "block" }}
                />
                <label style={labelStyle}>Time</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Time")}
                </span>
              </div>

              {/* Temperature */}
              <div style={inputContainerStyle("Temperature")}>
                <input
                  type="text"
                  name="temperature"
                  placeholder="Type Here"
                  disabled={!getDbParam("Temperature")}
                  value={formData.temperature}
                  onChange={handleChange}
                  style={{
                    ...(inputStyle("Temperature") as any),
                    display: "block",
                  }}
                />
                <label style={labelStyle}>Temperature (°C)</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Temperature") || (
                    <span style={{ color: "#94a3b8" }}>
                      Range: 121 °C - 134 °C
                    </span>
                  )}
                </span>
              </div>

              {/* Pressure */}
              <div style={inputContainerStyle("Pressure")}>
                <input
                  type="text"
                  name="pressure"
                  placeholder="Type Here"
                  disabled={!getDbParam("Pressure")}
                  value={formData.pressure}
                  onChange={handleChange}
                  style={{
                    ...(inputStyle("Pressure") as any),
                    display: "block",
                  }}
                />
                <label style={labelStyle}>Pressure (kPa)</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Pressure")}
                </span>
              </div>

              {/* Sterilization Cycle */}
              <div
                style={inputContainerStyle("Sterilization Cycle Validation")}
              >
                <select
                  name="sterilizationCycle"
                  disabled={!getDbParam("Sterilization Cycle Validation")}
                  value={formData.sterilizationCycle}
                  onChange={handleChange}
                  style={{
                    ...(inputStyle("Sterilization Cycle Validation") as any),
                    display: "block",
                  }}
                >
                  <option value="Valid">Valid</option>
                  <option value="Invalid">Invalid</option>
                </select>
                <label style={labelStyle}>Sterilization Cycle Validation</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Sterilization Cycle Validation")}
                </span>
              </div>

              {/* Maintenance Logs */}
              <div style={inputContainerStyle("Maintenance Logs")}>
                <input
                  type="text"
                  name="maintenanceLogs"
                  placeholder="Type Here"
                  disabled={!getDbParam("Maintenance Logs")}
                  value={formData.maintenanceLogs}
                  onChange={handleChange}
                  style={{
                    ...(inputStyle("Maintenance Logs") as any),
                    display: "block",
                  }}
                />
                <label style={labelStyle}>Maintenance Logs</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Maintenance Logs")}
                </span>
              </div>

              {/* Uploads Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  opacity: getDbParam("Uploads") ? 1 : 0.4,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    height: "50px",
                    padding: "0 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#F0F4FF",
                  }}
                >
                  <Link2
                    size={18}
                    color="#3b82f6"
                    cursor="pointer"
                    onClick={() =>
                      getDbParam("Uploads") && fileInputRef.current?.click()
                    }
                    style={{ marginRight: "12px" }}
                  />
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#E0E7FF",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#1e293b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formData.fileName}
                    </span>
                  </div>
                  <label style={labelStyle}>Uploads</label>
                </div>
                <div
                  onClick={() =>
                    formData.fileData &&
                    setViewingFile({
                      name: formData.fileName,
                      data: formData.fileData,
                      type: formData.fileType,
                    })
                  }
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: formData.fileData
                      ? "2px solid #DEEFE1"
                      : "2px solid #FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: formData.fileData ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: formData.fileData
                        ? "#22c55e"
                        : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Eye size={16} color="white" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={inputContainerStyle("Status")}>
                <select
                  name="status"
                  disabled={!getDbParam("Status")}
                  value={formData.status}
                  onChange={handleChange}
                  style={{ ...(inputStyle("Status") as any), display: "block" }}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={labelStyle}>Status</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Status")}
                </span>
              </div>

              {/* Comments */}
              <div style={inputContainerStyle("Comments")}>
                <input
                  type="text"
                  name="comments"
                  placeholder="Type Here"
                  disabled={!getDbParam("Comments")}
                  value={formData.comments}
                  onChange={handleChange}
                  style={{
                    ...(inputStyle("Comments") as any),
                    display: "block",
                  }}
                />
                <label style={labelStyle}>Comments</label>
                <span style={rangeTextStyle}>
                  {renderParameterInfo("Comments")}
                </span>
              </div>
            </div>

            {/* Make and Model Footer */}
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
                style={{
                  width: "1px",
                  height: "14px",
                  backgroundColor: "#e5e7eb",
                }}
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
                  style={{
                    padding: "10px 40px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: "10px 40px",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    textAlign: "left",
                    color: "#64748b",
                  }}
                >
                  <th style={{ padding: "12px" }}>Date & Time</th>
                  <th style={{ padding: "12px" }}>Parameter</th>
                  <th style={{ padding: "12px" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {logsData.length > 0 ? (
                  logsData.map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: "12px", fontWeight: "600" }}>
                        {log.dateTime}
                      </td>
                      <td style={{ padding: "12px" }}>{log.paramName}</td>
                      <td style={{ padding: "12px" }}>{log.content}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#94a3b8",
                      }}
                    >
                      No logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Graph Section */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}
        >
          Activity
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { day: "Mon", compliant: 34, nonCompliant: -23 },
                { day: "Tue", compliant: 28, nonCompliant: -22 },
                { day: "Wed", compliant: 22, nonCompliant: -36 },
                { day: "Thu", compliant: 34, nonCompliant: -12 },
                { day: "Fri", compliant: 29, nonCompliant: -28 },
                { day: "Sat", compliant: 15, nonCompliant: -33 },
                { day: "Sun", compliant: 25, nonCompliant: -25 },
              ]}
              stackOffset="sign"
            >
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9e9e9e" }}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="compliant"
                fill="#6c6c6c"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="nonCompliant"
                fill="#EF9685"
                radius={[0, 0, 4, 4]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AutoclavesForm;
