import React, { useState, useRef, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parameterValueApi } from "@/services/api";
import Chart_activity from "@/assets/icons/Chart_activity.svg";
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

  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  const getParameterConfig = (parameterName: string) => {
    const param = currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name?.toLowerCase() === parameterName.toLowerCase()
    );

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

  const inputContainerStyle = (dbName: string) => ({
    position: "relative" as const,
    marginBottom: "20px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const inputStyle = (dbName: string) => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontSize: "16px",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f1f5f9",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    color: "#9E9E9E",
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
            fontSize: "14px",
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
            <span style={{ fontWeight: "600", fontSize: "14px" }}>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
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
          border: "2px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Unit Selector */}
        {availableEquipments.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #f1f5f9",
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
                  fontWeight: selectedRadio === equipment ? "600" : "500",
                  color: selectedRadio === equipment ? "#232323" : "#E17E61",
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
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: `2px solid ${
                      selectedRadio === equipment ? "#232323" : "#d1d5db"
                    }`,
                    backgroundColor: "#fff",
                    boxShadow:
                      selectedRadio === equipment
                        ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61"
                        : "none",
                    outline: "none",
                  }}
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          {["Details", "Logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: "8px 32px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "700" : "600",
                fontSize: "14px",
                borderBottom:
                  activeSubTab === tab ? "2px solid #E17E61" : "none",
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
                gap: "20px",
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
                  style={{ ...inputStyle("Date"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Date</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Date")}
                </div>
              </div>

              {/* Time */}
              <div style={inputContainerStyle("Time")}>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!getDbParam("Time")}
                  style={{ ...inputStyle("Time"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Time</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Time")}
                </div>
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
                  style={{ ...inputStyle("Temperature"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Temperature (°C)</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Temperature")}
                </div>
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
                  style={{ ...inputStyle("Pressure"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Pressure (kPa)</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Pressure")}
                </div>
              </div>

              {/* Sterilization Cycle */}
              <div
                style={inputContainerStyle(
                  "Sterilization Cycle Validation"
                )}
              >
                <select
                  name="sterilizationCycle"
                  disabled={!getDbParam("Sterilization Cycle Validation")}
                  value={formData.sterilizationCycle}
                  onChange={handleChange}
                  style={{
                    ...inputStyle("Sterilization Cycle Validation"),
                    cursor: "pointer",
                  }}
                >
                  <option value="Valid">Valid</option>
                  <option value="Invalid">Invalid</option>
                </select>
                <label style={labelOverlayStyle}>Sterilization Cycle</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Sterilization Cycle Validation")}
                </div>
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
                    ...inputStyle("Maintenance Logs"),
                    display: "block",
                  }}
                />
                <label style={labelOverlayStyle}>Maintenance Logs</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Maintenance Logs")}
                </div>
              </div>

              {/* Uploads Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  opacity: getDbParam("Uploads") ? 1 : 0.4,
                  marginBottom: "20px",
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
                  <label style={labelOverlayStyle}>Uploads</label>
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
                  style={{
                    ...inputStyle("Status"),
                    cursor: "pointer",
                  }}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={labelOverlayStyle}>Status</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Status")}
                </div>
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
                  style={{ ...inputStyle("Comments"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Comments</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Comments")}
                </div>
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
              <div>
                <span style={{ color: "#94a3b8" }}>Make :</span>{" "}
                <b style={{ color: "#232323" }}>
                  {currentEquipment?.make || "N/A"}
                </b>
              </div>
              <div
                style={{
                  width: "1px",
                  height: "14px",
                  backgroundColor: "#e5e7eb",
                }}
              ></div>
              <div>
                <span style={{ color: "#94a3b8" }}>Model :</span>{" "}
                <b style={{ color: "#232323" }}>
                  {currentEquipment?.model || "N/A"}
                </b>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  style={{
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "700",
                    backgroundColor: "#fff",
                    border: "2px solid #505050",
                    borderRadius: "8px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "700",
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
          </>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                fontFamily: "'Montserrat', sans-serif",
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
                  <th style={{ padding: "12px", fontWeight: "600" }}>
                    Date & Time
                  </th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>
                    Parameter
                  </th>
                  <th style={{ padding: "12px", fontWeight: "600" }}>Value</th>
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
            padding: "12px",
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
              data={[
                { day: "Monday", compliant: 34, nonCompliant: -23 },
                { day: "Tuesday", compliant: 28, nonCompliant: -22 },
                { day: "Wednesday", compliant: 22, nonCompliant: -36 },
                { day: "Thursday", compliant: 34, nonCompliant: -12 },
                { day: "Friday", compliant: 29, nonCompliant: -28 },
                { day: "Saturday", compliant: 15, nonCompliant: -33 },
                { day: "Sunday", compliant: 25, nonCompliant: -25 },
              ]}
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
                  return [`${absoluteValue}`, label];
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

export default AutoclavesForm;