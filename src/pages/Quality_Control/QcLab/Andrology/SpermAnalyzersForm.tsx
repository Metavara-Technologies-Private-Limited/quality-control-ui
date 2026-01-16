import React, { useState, useEffect, useMemo } from "react";
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

const SpermAnalyzersForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);

  const availableEquipments =
    equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const currentEquipment = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  const fieldMapping = useMemo(
    () => [
      { key: "date", dbName: "Date" },
      { key: "time", dbName: "Time" },
      { key: "softwareVersion", dbName: "Software Version" },
      { key: "calibrationChecks", dbName: "Calibration" },
      { key: "qualityControl", dbName: "Quality Control" },
      { key: "status", dbName: "Status" },
      { key: "comments", dbName: "Comments" },
    ],
    []
  );

  const getDbParam = (dbName: string) => {
    if (!currentEquipment?.parameters) return null;
    return currentEquipment.parameters.find((p: any) =>
      p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

  const isFieldEnabled = (dbName: string) => !!getDbParam(dbName);

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderParameterInfo = (dbName: string) => {
    const param = getDbParam(dbName);
    if (!param || !param.config) return null;

    let config = param.config;
    if (
      config.history &&
      Array.isArray(config.history) &&
      config.history.length > 0
    ) {
      config = config.history[config.history.length - 1];
    }

    const dataType = config.data_type;
    switch (dataType) {
      case "Decimal":
      case "Min/Max":
        return config.min_value != null ? (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Range: {config.min_value} - {config.max_value}
          </span>
        ) : null;
      case "Percentage":
        return (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Range: 0% - {config.percentage}%
          </span>
        );
      case "Select":
      case "Dropdown":
        return config.dropdown ? (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Options: {config.dropdown.join(", ")}
          </span>
        ) : null;
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

  useEffect(() => {
    fetchLogs();
  }, [currentEquipment?.equipment_id, currentEquipment?.parameters]);

  const handleSaveLogs = async () => {
    if (!currentEquipment) return;
    const hasData = Object.values(logValues).some(
      (val) => val && val.trim() !== ""
    );
    if (!hasData) {
      toast.error("Please fill at least one field");
      return;
    }

    setIsSaving(true);
    try {
      const requests = fieldMapping
        .filter((item) => logValues[item.key] && getDbParam(item.dbName))
        .map((item) =>
          parameterValueApi.create({
            parameter: getDbParam(item.dbName).id,
            equipment_details: currentEquipment.equipment_id,
            content: logValues[item.key],
          })
        );

      await Promise.all(requests);
      toast.success("Logs saved successfully!");
      setLogValues({});
      setActiveSubTab("Details");
      fetchLogs();
    } catch (err) {
      toast.error("Failed to save logs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => setLogValues({});

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    padding: "24px",
    marginBottom: "20px",
  };

  const inputContainerStyle = (dbName: string): React.CSSProperties => ({
    position: "relative",
    marginBottom: "20px",
    opacity: isFieldEnabled(dbName) ? 1 : 0.4,
  });

  const getInputStyle = (dbName: string): React.CSSProperties => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: isFieldEnabled(dbName) ? "#fff" : "#f1f5f9",
    cursor: isFieldEnabled(dbName) ? "text" : "not-allowed",
    color: "#9E9E9E",
    boxSizing: "border-box" as const,
  });

  const labelOverlayStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "14px",
    color: "#232323",
  };

  const rangeTextStyle: React.CSSProperties = {
    fontSize: "12px",
    marginTop: "4px",
    color: "#9E9E9E",
    fontWeight: "500",
  };

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

      <div style={sectionStyle}>
        {/* Unit Selector */}
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
                  setLogValues({});
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: "8px 32px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor:
                  activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "700" : "600",
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
                  value={logValues["date"] || ""}
                  onChange={(e) => setValue("date", e.target.value)}
                  disabled={!isFieldEnabled("Date")}
                  style={{ ...getInputStyle("Date"), display: "block" }}
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
                  value={logValues["time"] || ""}
                  onChange={(e) => setValue("time", e.target.value)}
                  disabled={!isFieldEnabled("Time")}
                  style={{ ...getInputStyle("Time"), display: "block" }}
                />
                <label style={labelOverlayStyle}>Time</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Time")}
                </div>
              </div>

              {/* Software Version */}
              <div style={inputContainerStyle("Software Version")}>
                <input
                  type="text"
                  placeholder="Type Here"
                  value={logValues["softwareVersion"] || ""}
                  onChange={(e) => setValue("softwareVersion", e.target.value)}
                  disabled={!isFieldEnabled("Software Version")}
                  style={{
                    ...getInputStyle("Software Version"),
                    display: "block",
                  }}
                />
                <label style={labelOverlayStyle}>Software Version</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Software Version")}
                </div>
              </div>

              {/* Calibration */}
              <div style={inputContainerStyle("Calibration")}>
                <select
                  value={logValues["calibrationChecks"] || "Accurate"}
                  onChange={(e) => setValue("calibrationChecks", e.target.value)}
                  disabled={!isFieldEnabled("Calibration")}
                  style={{
                    ...getInputStyle("Calibration"),
                    cursor: "pointer",
                  }}
                >
                  <option value="Accurate">Accurate</option>
                  <option value="Requires Adjustment">
                    Requires Adjustment
                  </option>
                </select>
                <label style={labelOverlayStyle}>Calibration Checks</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Calibration")}
                </div>
              </div>

              {/* Quality Control */}
              <div style={inputContainerStyle("Quality Control")}>
                <select
                  value={logValues["qualityControl"] || "Passed"}
                  onChange={(e) => setValue("qualityControl", e.target.value)}
                  disabled={!isFieldEnabled("Quality Control")}
                  style={{
                    ...getInputStyle("Quality Control"),
                    cursor: "pointer",
                  }}
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
                <label style={labelOverlayStyle}>QC Sample Testing</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Quality Control")}
                </div>
              </div>

              {/* Status */}
              <div style={inputContainerStyle("Status")}>
                <select
                  value={logValues["status"] || "Pass"}
                  onChange={(e) => setValue("status", e.target.value)}
                  disabled={!isFieldEnabled("Status")}
                  style={{
                    ...getInputStyle("Status"),
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
                  placeholder="Type Here"
                  value={logValues["comments"] || ""}
                  onChange={(e) => setValue("comments", e.target.value)}
                  disabled={!isFieldEnabled("Comments")}
                  style={{
                    ...getInputStyle("Comments"),
                    display: "block",
                  }}
                />
                <label style={labelOverlayStyle}>Comments</label>
                <div style={rangeTextStyle}>
                  {renderParameterInfo("Comments")}
                </div>
              </div>
            </div>

            {/* Info Footer */}
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
                  onClick={handleSaveLogs}
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
                    color: "#64748b",
                    borderBottom: "1px solid #f1f5f9",
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

export default SpermAnalyzersForm;