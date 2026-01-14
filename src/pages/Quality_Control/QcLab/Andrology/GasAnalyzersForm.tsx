import React, { useState, useMemo, useEffect } from "react";
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

interface GasAnalyzersFormProps {
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

const GasAnalyzersForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: GasAnalyzersFormProps) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [isSaving, setIsSaving] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);

  const availableEquipments =
    equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const initialFormState = {
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    gasMixture: "",
    calibrationChecks: "Accurate",
    sensorCondition: "Good",
    status: "Pass",
    comments: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- CONFIGURATION: Map Form Keys to EXACT DB Parameter Names ---
  const fieldMapping = useMemo(
    () => [
      { key: "date", dbName: "Date" },
      { key: "time", dbName: "Time" },
      { key: "gasMixture", dbName: "Gas Mixture" },
      { key: "calibrationChecks", dbName: "Calibration Checks" },
      { key: "sensorCondition", dbName: "Sensor Condition" },
      { key: "status", dbName: "Status" },
      { key: "comments", dbName: "Comments" },
    ],
    []
  );

  const currentEquipment = equipmentDetails.find(
    (ed) => ed.equipment_num === selectedRadio
  );

  // --- MATCHING HELPER ---
  const getDbParam = (dbName: string) => {
    if (!currentEquipment?.parameters) return null;
    return currentEquipment.parameters.find((p: any) => {
      const paramName = p.parameter_name || p.name || "";
      return paramName.toLowerCase().trim() === dbName.toLowerCase().trim();
    });
  };

  // ✅ GET PARAMETER CONFIG (Handles history array logic)
  const getParameterConfig = (parameterName: string) => {
    const param = getDbParam(parameterName);
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

  // ✅ RENDER PARAMETER INFO (Displays Ranges/Options below fields)
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
        return (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Range: 0% - {config.percentage}%
          </span>
        );
      case "Select":
      case "Dropdown":
        if (config.dropdown && Array.isArray(config.dropdown)) {
          return (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Options: {config.dropdown.join(", ")}
            </span>
          );
        }
        break;
      case "Text":
        return config.text ? (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Value: {config.text}
          </span>
        ) : null;
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
            new Date(log.created_at) > new Date(logsByParam[paramId].created_at)
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

  const handleSave = async () => {
    if (!currentEquipment) {
      toast.error("Please select equipment");
      return;
    }
    setIsSaving(true);
    try {
      const requests = fieldMapping
        .filter(
          (field) =>
            formData[field.key as keyof typeof formData] &&
            getDbParam(field.dbName)
        )
        .map((field) =>
          parameterValueApi.create({
            parameter: getDbParam(field.dbName).id,
            equipment_details: currentEquipment.equipment_id,
            content: formData[field.key as keyof typeof formData],
          })
        );

      if (requests.length === 0) {
        toast.warn("No matching parameters found to save.");
      } else {
        await Promise.all(requests);
        toast.success("Successfully Saved!", { theme: "colored" });
        setFormData(initialFormState);
        fetchLogs();
      }
    } catch (err) {
      toast.error("Failed to save logs.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentEquipment?.equipment_id]);

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio]);

  const handleClear = () => setFormData(initialFormState);

  // Styles
  const inputContainerStyle = (dbName: string): React.CSSProperties => ({
    position: "relative",
    marginBottom: "24px",
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const inputStyle = (dbName: string): React.CSSProperties => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f8fafc",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    color: getDbParam(dbName) ? "inherit" : "#94a3b8",
  });

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "12px",
    color: "#64748b",
  };
  const infoTextStyle: React.CSSProperties = {
    display: "block",
    marginTop: "4px",
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        {/* Unit Selector */}
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
                  fontWeight: selectedRadio === equipment ? 700 : 500,
                  cursor: "pointer",
                  color: selectedRadio === equipment ? "#f97316" : "#0f172a",
                }}
              >
                <input
                  type="radio"
                  checked={selectedRadio === equipment}
                  onChange={() => setSelectedRadio(equipment)}
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

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: "6px 24px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
                cursor: "pointer",
                backgroundColor:
                  activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: 600,
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
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={inputContainerStyle("Date")}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={!getDbParam("Date")}
                  style={inputStyle("Date")}
                />
                <div style={infoTextStyle}>{renderParameterInfo("Date")}</div>
              </div>

              <div style={inputContainerStyle("Time")}>
                <label style={labelStyle}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!getDbParam("Time")}
                  style={inputStyle("Time")}
                />
                <div style={infoTextStyle}>{renderParameterInfo("Time")}</div>
              </div>

              <div style={inputContainerStyle("Gas Mixture")}>
                <label style={labelStyle}>Gas Mixture (% O2, CO2)</label>
                <input
                  type="text"
                  name="gasMixture"
                  placeholder="Type Here"
                  value={formData.gasMixture}
                  onChange={handleChange}
                  disabled={!getDbParam("Gas Mixture")}
                  style={inputStyle("Gas Mixture")}
                />
                <div style={infoTextStyle}>
                  {renderParameterInfo("Gas Mixture")}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={inputContainerStyle("Calibration Checks")}>
                <label style={labelStyle}>Calibration Checks</label>
                <select
                  name="calibrationChecks"
                  value={formData.calibrationChecks}
                  onChange={handleChange}
                  disabled={!getDbParam("Calibration Checks")}
                  style={inputStyle("Calibration Checks")}
                >
                  <option value="Accurate">Accurate</option>
                  <option value="Needs Adjustment">Needs Adjustment</option>
                </select>
                <div style={infoTextStyle}>
                  {renderParameterInfo("Calibration Checks")}
                </div>
              </div>

              <div style={inputContainerStyle("Sensor Condition")}>
                <label style={labelStyle}>Sensor Condition</label>
                <select
                  name="sensorCondition"
                  value={formData.sensorCondition}
                  onChange={handleChange}
                  disabled={!getDbParam("Sensor Condition")}
                  style={inputStyle("Sensor Condition")}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Cleaning">Needs Cleaning</option>
                </select>
                <div style={infoTextStyle}>
                  {renderParameterInfo("Sensor Condition")}
                </div>
              </div>

              <div style={inputContainerStyle("Status")}>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!getDbParam("Status")}
                  style={inputStyle("Status")}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <div style={infoTextStyle}>{renderParameterInfo("Status")}</div>
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <div style={inputContainerStyle("Comments")}>
                <label style={labelStyle}>Comments</label>
                <input
                  type="text"
                  name="comments"
                  placeholder="Type Here"
                  value={formData.comments}
                  onChange={handleChange}
                  disabled={!getDbParam("Comments")}
                  style={inputStyle("Comments")}
                />
                <div style={infoTextStyle}>
                  {renderParameterInfo("Comments")}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                fontSize: "14px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#94a3b8" }}>Make :</span>
                <span style={{ fontWeight: "600" }}>
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
                <span style={{ fontWeight: "600" }}>
                  {currentEquipment?.model || "N/A"}
                </span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
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
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#64748b",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <th style={{ padding: "12px 8px" }}>Date & Time</th>
                  <th style={{ padding: "12px 8px" }}>Parameter</th>
                  <th style={{ padding: "12px 8px" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {logsData.length > 0 ? (
                  logsData.map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "16px 8px",
                          color: "#0f172a",
                          fontWeight: "600",
                        }}
                      >
                        {log.dateTime}
                      </td>
                      <td style={{ padding: "16px 8px", color: "#64748b" }}>
                        {log.paramName}
                      </td>
                      <td style={{ padding: "16px 8px", color: "#64748b" }}>
                        {log.content}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      No records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Chart Section */}
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

export default GasAnalyzersForm;
