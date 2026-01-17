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

// MUI and Dayjs Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

const CentrifugesForm = ({
  selectedRadio,
  setSelectedRadio,
  equipmentDetails,
}: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  // Updated logValues to handle dayjs objects for date/time keys
  const [logValues, setLogValues] = useState<Record<string, any>>({
    date: dayjs(),
    time: dayjs(),
  });
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
      { key: "rpmCalibration", dbName: "RPM Calibration" },
      { key: "timeAccuracy", dbName: "Time Accuracy" },
      { key: "rotorCondition", dbName: "Rotor Condition" },
      { key: "status", dbName: "Status" },
      { key: "comments", dbName: "Comments" },
    ],
    []
  );

  const getDbParam = (dbName: string) => {
    return currentEquipment?.parameters?.find(
      (p: any) =>
        p.parameter_name.toLowerCase().trim() === dbName.toLowerCase().trim()
    );
  };

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

  const renderParameterInfo = (parameterName: string) => {
    const config = getParameterConfig(parameterName);
    if (!config) return null;

    const dataType = config.data_type;

    switch (dataType) {
      case "Integer":
      case "Decimal":
      case "Min/Max":
        if (config.min_value != null && config.max_value != null) {
          return (
            <span
              style={{ color: "#9E9E9E", fontSize: "12px", fontWeight: "500" }}
            >
              Range: {config.min_value} - {config.max_value}
            </span>
          );
        }
        break;
      case "Percentage":
        if (config.percentage != null) {
          return (
            <span
              style={{ color: "#9E9E9E", fontSize: "12px", fontWeight: "500" }}
            >
              Range: 0% - {config.percentage}%
            </span>
          );
        }
        break;
      case "Boolean":
        return (
          <span
            style={{ color: "#9E9E9E", fontSize: "12px", fontWeight: "500" }}
          >
            Type: {config.boolean_type === "yesno" ? "Yes/No" : "True/False"}
          </span>
        );
      case "Text":
        return (
          <span
            style={{ color: "#9E9E9E", fontSize: "12px", fontWeight: "500" }}
          >
            Type: {config.text_type === "single" ? "Single Line" : "Multi Line"}{" "}
            Text
          </span>
        );
      case "Select":
      case "Dropdown":
        if (
          config.dropdown &&
          Array.isArray(config.dropdown) &&
          config.dropdown.length > 0
        ) {
          return (
            <span
              style={{ color: "#9E9E9E", fontSize: "12px", fontWeight: "500" }}
            >
              Options: {config.dropdown.join(", ")}
            </span>
          );
        }
        break;
      default:
        return null;
    }
  };

  const setValue = (key: string, value: any) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveLogs = async () => {
    if (!currentEquipment) {
      toast.error("Please select an equipment first");
      return;
    }

    const hasData = Object.values(logValues).some(
      (val) => val && (typeof val === 'string' ? val.trim() !== "" : true)
    );
    if (!hasData) {
      toast.error("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);
    try {
      const requests: Promise<any>[] = [];

      fieldMapping.forEach((item) => {
        const dbParam = getDbParam(item.dbName);
        let val = logValues[item.key];

        // Format dates and times using dayjs before saving
        if (item.key === "date" && val) val = val.format("YYYY-MM-DD");
        if (item.key === "time" && val) val = val.format("HH:mm");

        if (dbParam && val && val.toString().trim() !== "") {
          requests.push(
            parameterValueApi.create({
              parameter: dbParam.id,
              equipment_details: currentEquipment.equipment_id,
              content: val.toString(),
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
      toast.success("Parameter logs saved successfully!");
      setLogValues({ date: dayjs(), time: dayjs() });
      setActiveSubTab("Details");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save parameter logs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({ date: dayjs(), time: dayjs() });
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
    opacity: getDbParam(dbName) ? 1 : 0.4,
  });

  const getInputStyle = (dbName: string): React.CSSProperties => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: getDbParam(dbName) ? "#fff" : "#f1f5f9",
    cursor: getDbParam(dbName) ? "text" : "not-allowed",
    color: "#9E9E9E",
    boxSizing: "border-box" as const,
  });

  // MUI input specific styling to match your look
  const muiInputStyle = {
    '& .MuiOutlinedInput-root': {
      height: '50px',
      borderRadius: '8px',
      fontFamily: "'Montserrat', sans-serif",
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: '#E17E61' },
      '&.Mui-focused fieldset': { borderColor: '#E17E61' },
    },
    '& .MuiInputBase-input': {
      fontSize: '16px',
      color: '#9E9E9E',
    },
    '& .Mui-disabled': {
        backgroundColor: "#f1f5f9",
        cursor: "not-allowed"
    }
  };

  const labelOverlayStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "-8px",
    backgroundColor: "#fff",
    padding: "0 4px",
    fontSize: "14px",
    color: "#232323",
    zIndex: 1, // Ensures label stays above MUI border
  };

  const rangeTextStyle: React.CSSProperties = {
    fontSize: "12px",
    marginTop: "4px",
    color: "#9E9E9E",
    fontWeight: "500",
    display: "block",
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          {/* Unit Selector Radios */}
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
                      setLogValues({ date: dayjs(), time: dayjs() });
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

          {/* Sub-Tabs Toggle */}
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
                {/* MUI Date Picker */}
                <div style={inputContainerStyle("Date")}>
                  <DatePicker
                    value={logValues["date"]}
                    onChange={(newValue) => setValue("date", newValue)}
                    disabled={!getDbParam("Date")}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        sx: muiInputStyle 
                      } 
                    }}
                  />
                  <label style={labelOverlayStyle}>Date</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("Date")}
                  </span>
                </div>

                {/* MUI Time Picker */}
                <div style={inputContainerStyle("Time")}>
                  <TimePicker
                    value={logValues["time"]}
                    onChange={(newValue) => setValue("time", newValue)}
                    disabled={!getDbParam("Time")}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        sx: muiInputStyle 
                      } 
                    }}
                  />
                  <label style={labelOverlayStyle}>Time</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("Time")}
                  </span>
                </div>

                {/* RPM Calibration */}
                <div style={inputContainerStyle("RPM Calibration")}>
                  <input
                    type="text"
                    name="rpmCalibration"
                    placeholder="Type Here"
                    value={logValues["rpmCalibration"] || ""}
                    onChange={(e) => setValue("rpmCalibration", e.target.value)}
                    disabled={!getDbParam("RPM Calibration")}
                    style={{
                      ...getInputStyle("RPM Calibration"),
                      display: "block",
                    }}
                  />
                  <label style={labelOverlayStyle}>RPM Calibration (RPM)</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("RPM Calibration")}
                  </span>
                </div>

                {/* Time Accuracy */}
                <div style={inputContainerStyle("Time Accuracy")}>
                  <select
                    name="timeAccuracy"
                    value={logValues["timeAccuracy"] || "Accurate"}
                    onChange={(e) => setValue("timeAccuracy", e.target.value)}
                    disabled={!getDbParam("Time Accuracy")}
                    style={{
                      ...getInputStyle("Time Accuracy"),
                      cursor: "pointer",
                    }}
                  >
                    <option value="Accurate">Accurate</option>
                    <option value="Inaccurate">Inaccurate</option>
                  </select>
                  <label style={labelOverlayStyle}>Time Accuracy</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("Time Accuracy")}
                  </span>
                </div>

                {/* Rotor Condition */}
                <div style={inputContainerStyle("Rotor Condition")}>
                  <select
                    name="rotorCondition"
                    value={logValues["rotorCondition"] || "Good"}
                    onChange={(e) => setValue("rotorCondition", e.target.value)}
                    disabled={!getDbParam("Rotor Condition")}
                    style={{
                      ...getInputStyle("Rotor Condition"),
                      cursor: "pointer",
                    }}
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                  </select>
                  <label style={labelOverlayStyle}>Rotor Condition</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("Rotor Condition")}
                  </span>
                </div>

                {/* Status */}
                <div style={inputContainerStyle("Status")}>
                  <select
                    name="status"
                    value={logValues["status"] || "Pass"}
                    onChange={(e) => setValue("status", e.target.value)}
                    disabled={!getDbParam("Status")}
                    style={{
                      ...getInputStyle("Status"),
                      cursor: "pointer",
                    }}
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                  <label style={labelOverlayStyle}>Status</label>
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
                    value={logValues["comments"] || ""}
                    onChange={(e) => setValue("comments", e.target.value)}
                    disabled={!getDbParam("Comments")}
                    style={{
                      ...getInputStyle("Comments"),
                      display: "block",
                    }}
                  />
                  <label style={labelOverlayStyle}>Comments</label>
                  <span style={rangeTextStyle}>
                    {renderParameterInfo("Comments")}
                  </span>
                </div>
              </div>

              {/* Make and Model Info */}
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
                    type="button"
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
                    type="button"
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
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          {log.dateTime}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: "#64748b",
                          }}
                        >
                          {log.paramName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: "#64748b",
                          }}
                        >
                          {log.content}
                        </td>
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={Chart_activity}
                alt="chart icon"
                style={{ width: "25px", height: "25px" }}
              />
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
    </LocalizationProvider>
  );
};

export default CentrifugesForm;