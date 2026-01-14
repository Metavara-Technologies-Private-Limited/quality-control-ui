import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parameterValueApi } from "@/services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const SpermAnalyzersForm = ({ selectedRadio, setSelectedRadio, equipmentDetails }: any) => {
  const [activeSubTab, setActiveSubTab] = useState("Details");
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Get unique equipment numbers from equipmentDetails
  const availableEquipments = equipmentDetails?.map((ed: any) => ed.equipment_num) || [];

  const currentEquipment = equipmentDetails?.find(
    (ed: any) => ed.equipment_num === selectedRadio
  );

  // Helper to check if parameter exists in the equipment's parameter list
  const getParamData = (searchName: string) => {
    if (!currentEquipment?.parameters) return null;
    return currentEquipment.parameters.find((p) =>
      p.parameter_name.toLowerCase().includes(searchName.toLowerCase())
    );
  };

  const isFieldEnabled = (searchName: string) => {
    return !!getParamData(searchName);
  };

  const setValue = (key: string, value: string) => {
    setLogValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  };

  const handleSaveLogs = async () => {
    if (!currentEquipment) {
      toast.error("Please select an equipment first");
      return;
    }

    const hasData = Object.values(logValues).some(val => val && val.trim() !== '');
    if (!hasData) {
      toast.error("Please fill at least one field before saving");
      return;
    }

    setIsSaving(true);

    try {
      const requests: Promise<any>[] = [];

      // Map local form fields to actual DB parameter objects
      const mapping = [
        { key: "softwareVersion", search: "Software Version" },
        { key: "calibrationChecks", search: "Calibration" },
        { key: "qualityControl", search: "Quality Control" },
        { key: "status", search: "Status" },
        { key: "comments", search: "Comments" },
      ];

      mapping.forEach((item) => {
        const dbParam = getParamData(item.search);
        const val = logValues[item.key];

        if (dbParam && val && val.trim() !== "") {
          requests.push(parameterValueApi.create({
            parameter: dbParam.id,
            equipment_details: currentEquipment.equipment_id,
            content: val,
          }));
        }
      });

      if (requests.length === 0) {
        toast.error("No matching parameters found to save.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      toast.success("Parameter logs saved successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setLogValues({});
      setActiveSubTab("Details");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save parameter logs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLogValues({});
  };

  useEffect(() => {
    if (!selectedRadio && equipmentDetails?.length > 0) {
      setSelectedRadio(equipmentDetails[0].equipment_num);
    }
  }, [equipmentDetails, selectedRadio, setSelectedRadio]);

  const renderRangeText = (paramName: string) => {
    const param = getParamData(paramName);
    if (!param || !param.config) return null;

    let config = param.config;
    if (config.history?.length > 0) {
      config = config.history[config.history.length - 1];
    }

    switch (config.data_type) {
      case "Decimal":
      case "Min/Max":
        return <span style={{ color: "#94a3b8", fontSize: "11px" }}>Range: {config.min_value} - {config.max_value}</span>;
      case "Percentage":
        return <span style={{ color: "#94a3b8", fontSize: "11px" }}>Range: {config.percentage}%</span>;
      case "Select":
      case "Dropdown":
        return <span style={{ color: "#94a3b8", fontSize: "11px" }}>Options: {config.dropdown?.join(", ")}</span>;
      default:
        return null;
    }
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -23 },
    { day: "Tuesday", compliant: 28, nonCompliant: -22 },
    { day: "Wednesday", compliant: 22, nonCompliant: -36 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -28 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -25 },
  ];

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "16px",
  };

  const inputContainerStyle = {
    position: "relative" as const,
    marginBottom: "20px",
  };

  const getInputStyle = (enabled: boolean) => ({
    width: "100%",
    height: "50px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: enabled ? "#fff" : "#f8fafc",
    cursor: enabled ? "text" : "not-allowed",
    color: enabled ? "inherit" : "#94a3b8"
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

  return (
    <div style={{ maxWidth: "1200px" }}>
      <ToastContainer />

      <div style={sectionStyle}>
        {/* Radio Selection - Dynamic based on available equipments */}
        {availableEquipments.length > 0 && (
          <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
            {availableEquipments.map((equipment: string) => (
              <label key={equipment} style={{ 
                display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", 
                fontWeight: selectedRadio === equipment ? "700" : "500", 
                color: selectedRadio === equipment ? "#f97316" : "#0f172a", 
                cursor: "pointer" 
              }}>
                <input 
                  type="radio" 
                  checked={selectedRadio === equipment} 
                  onChange={() => {
                    setSelectedRadio(equipment);
                    setLogValues({});
                  }}
                  style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
                />
                {equipment}
              </label>
            ))}
          </div>
        )}

        {/* Details/Logs Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["Details", "Logs"].map(tab => (
            <button key={tab} type="button" onClick={() => setActiveSubTab(tab)} style={{
                padding: "6px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", cursor: "pointer",
                backgroundColor: activeSubTab === tab ? "#FFFFFF" : "transparent",
                color: activeSubTab === tab ? "#E17E61" : "#94a3b8",
                fontWeight: activeSubTab === tab ? "600" : "400",
                boxShadow: activeSubTab === tab ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}>{tab}</button>
          ))}
        </div>

        {activeSubTab === "Details" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              
              {/* Date */}
              <div style={inputContainerStyle}>
                <input 
                  type="date" 
                  name="date" 
                  disabled={!isFieldEnabled("Software Version")}
                  style={getInputStyle(isFieldEnabled("Software Version"))}
                />
                <label style={labelStyle}>Date</label>
              </div>

              {/* Time */}
              <div style={inputContainerStyle}>
                <input 
                  type="time" 
                  name="time" 
                  disabled={!isFieldEnabled("Software Version")}
                  style={getInputStyle(isFieldEnabled("Software Version"))}
                />
                <label style={labelStyle}>Time</label>
              </div>

              {/* Software Version */}
              <div style={inputContainerStyle}>
                <input 
                  type="text" 
                  name="softwareVersion" 
                  placeholder="Type Here" 
                  value={logValues['softwareVersion'] || ''} 
                  onChange={(e) => setValue("softwareVersion", e.target.value)}
                  disabled={!isFieldEnabled("Software Version")}
                  style={getInputStyle(isFieldEnabled("Software Version"))}
                />
                <label style={labelStyle}>Software Version</label>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{renderRangeText("Software Version")}</div>
              </div>

              {/* Calibration Checks */}
              <div style={inputContainerStyle}>
                <select 
                  name="calibrationChecks" 
                  value={logValues['calibrationChecks'] || 'Accurate'} 
                  onChange={(e) => setValue("calibrationChecks", e.target.value)}
                  disabled={!isFieldEnabled("Calibration")}
                  style={getInputStyle(isFieldEnabled("Calibration"))}
                >
                  <option value="Accurate">Accurate</option>
                  <option value="Requires Adjustment">Requires Adjustment</option>
                </select>
                <label style={labelStyle}>Calibration Checks</label>
              </div>

              {/* Quality Control */}
              <div style={inputContainerStyle}>
                <select 
                  name="qualityControl" 
                  value={logValues['qualityControl'] || 'Passed'} 
                  onChange={(e) => setValue("qualityControl", e.target.value)}
                  disabled={!isFieldEnabled("Quality Control")}
                  style={getInputStyle(isFieldEnabled("Quality Control"))}
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
                <label style={labelStyle}>QC Sample Testing</label>
              </div>

              {/* Status */}
              <div style={inputContainerStyle}>
                <select 
                  name="status" 
                  value={logValues['status'] || 'Pass'} 
                  onChange={(e) => setValue("status", e.target.value)}
                  disabled={!isFieldEnabled("Status")}
                  style={getInputStyle(isFieldEnabled("Status"))}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
                <label style={labelStyle}>Status</label>
              </div>

              {/* Comments */}
              <div style={inputContainerStyle}>
                <input 
                  type="text" 
                  name="comments" 
                  placeholder="Type Here" 
                  value={logValues['comments'] || ''} 
                  onChange={(e) => setValue("comments", e.target.value)}
                  disabled={!isFieldEnabled("Comments")}
                  style={getInputStyle(isFieldEnabled("Comments"))}
                />
                <label style={labelStyle}>Comments</label>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{renderRangeText("Comments")}</div>
              </div>
            </div>

            {/* Make and Model Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", fontSize: "14px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#94a3b8" }}>Make :</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {currentEquipment?.make || "N/A"}
                </span>
              </div>
              <div style={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}></div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#94a3b8" }}>Model :</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {currentEquipment?.model || "N/A"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <button 
                type="button" 
                onClick={handleClear}
                disabled={isSaving}
                style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px" }}>
                Clear
              </button>
              <button 
                type="button" 
                onClick={handleSaveLogs}
                disabled={isSaving}
                style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", opacity: isSaving ? 0.6 : 1 }}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            Logs will appear here after saving
          </div>
        )}
      </div>

      {/* Activity Graph Card */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '14px' }}>📈</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e9e9e' }} domain={[-40, 40]} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpermAnalyzersForm;