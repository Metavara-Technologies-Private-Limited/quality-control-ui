import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { parameterValueApi } from "@/services/api";
import { toast } from "react-toastify";
import LabEquipmentLogs from "./LabEquipmentLogs";
import ParameterInput from "./components/ParameterInput";
import LabEquipmentComplianceChart from "./LabEquipmentComplianceChart";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

/* ---------------- Types ---------------- */

type EquipmentDetail = {
  equipment_num: string;
  equipment_id: number;
  parameters: any[];
  make: string;
  model: string;
};

type Props = {
  equipmentDetails: EquipmentDetail[];
  selectedRadio: string;
  setSelectedRadio: (val: string) => void;
};

/* ---------------- Utils ---------------- */

const getRangeStatusColor = (value: string, cfg: any) => {
  if (!value || cfg?.min_value == null || cfg?.max_value == null)
    return "#9E9E9E";
  const num = Number(value);
  if (isNaN(num)) return "#9E9E9E";
  if (num < cfg.min_value) return "#D6BA18";
  if (num > cfg.max_value) return "#F25B5B";
  return "#16a34a";
};

/* ---------------- Component ---------------- */

export default function LabEquipmentForm({
  equipmentDetails,
  selectedRadio,
  setSelectedRadio,
}: Props) {
  const [activeTab, setActiveTab] = useState<"Form" | "Logs">("Form");
  const [logValues, setLogValues] = useState<Record<string, string>>({});
  const [logDateTime, setLogDateTime] = useState<Dayjs | null>(dayjs());
  const [isSaving, setIsSaving] = useState(false);
  const [refreshChartKey, setRefreshChartKey] = useState(0);

  const currentEquipment = equipmentDetails.find(
    (e) => e.equipment_num === selectedRadio,
  );

  if (!currentEquipment) return null;

  const setValue = (key: string, value: string) =>
    setLogValues((prev) => ({ ...prev, [key]: value }));

  /* ---------------- Actions ---------------- */

  const handleClear = () => {
    setLogValues({});
    setLogDateTime(dayjs());
    toast.info("Form cleared");
  };

  const handleSave = async () => {
    const hasData = Object.values(logValues).some((v) => v?.trim());
    if (!hasData) {
      toast.warn("Please fill at least one field");
      return;
    }

    setIsSaving(true);
    try {
      const requests = currentEquipment.parameters
        .filter((param) => logValues[param.parameter_name])
        .map((param) =>
          parameterValueApi.create({
            parameter: param.id,
            equipment_details: currentEquipment.equipment_id,
            content: logValues[param.parameter_name],
            log_time: logDateTime?.toISOString(),
          }),
        );

      await Promise.all(requests);
      toast.success("Logs saved successfully");
      setLogValues({});
      setRefreshChartKey((k) => k + 1);
    } catch {
      toast.error("Failed to save logs");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        overflow: "hidden",
      }}
    >

      {/* ---------- FORM / LOGS TABS ---------- */}
      <Box
        sx={{
          display: "inline-flex",
          backgroundColor: "#F2F2F2",
          padding: "4px",
          borderRadius: "12px",
          gap: "4px",
          width: "fit-content",
        }}
      >
        {["Form", "Logs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              width: "120px",
              height: "36px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
              backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
              color: activeTab === tab ? "#E17E61" : "#94a3b8",
            }}
          >
            {tab}
          </button>
        ))}
      </Box>

      {/* ---------- CONTENT ---------- */}
      {activeTab === "Logs" ? (
        <LabEquipmentLogs equipment={currentEquipment} />
      ) : (
        <Box
          sx={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            p: "24px",
            overflowY: "auto",
          }}
        >
          {/* ---------- EQUIPMENT SELECTION ---------- */}
          <Box
            sx={{
              display: "flex",
              gap: "24px",
              pb: "20px",
              mb: "24px",
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            {equipmentDetails.map((ed) => {
              const checked = selectedRadio === ed.equipment_num;
              return (
                <label
                  key={ed.equipment_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="equipment"
                    checked={checked}
                    onChange={() => setSelectedRadio(ed.equipment_num)}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid #1f1f1f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {checked && (
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: "#E17E61",
                        }}
                      />
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {ed.equipment_num}
                  </span>
                </label>
              );
            })}
          </Box>

          {/* ---------- PARAMETERS GRID ---------- */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {currentEquipment.parameters.map((param) => {
              const cfg = param.config;
              if (!cfg) return null;

              // Determine if the parameter is inactive
              const isInactive =
                param.is_active === false || param.is_active === 0;
              const value = logValues[param.parameter_name] ?? "";
              const color = getRangeStatusColor(value, cfg);

              return (
                <Box
                  key={param.id}
                  sx={{
                    opacity: isInactive ? 0.7 : 1,
                    pointerEvents: isInactive ? "none" : "auto",
                  }}
                >
                  <ParameterInput
                    parameter={param}
                    value={value}
                    onChange={(val) => setValue(param.parameter_name, val)}
                    disabled={isInactive}
                  />

                  {isInactive ? (
                    /* UI FOR INACTIVE STATE (Matches your image) */
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        sx={{
                          color: "#F25B5B", // Reddish color from your image
                          fontSize: "12px",
                          fontWeight: 700,
                          mb: 0.2,
                        }}
                      >
                        Inactive Parameter
                      </Typography>
                      <Typography
                        sx={{
                          color: "#A0AEC0",
                          fontSize: "11px",
                        }}
                      >
                        Range: —
                      </Typography>
                    </Box>
                  ) : (
                    /* UI FOR ACTIVE STATE */
                    <Box sx={{ mt: 0.5 }}>
                      {cfg.default_value && (
                        <Typography sx={{ fontSize: 12, color: "#9E9E9E" }}>
                          Recommended: {cfg.default_value} {cfg.unit || ""}
                        </Typography>
                      )}

                      {cfg.min_value != null && cfg.max_value != null && (
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 500, color }}
                        >
                          Range: {cfg.min_value} {cfg.unit || ""} –{" "}
                          {cfg.max_value} {cfg.unit || ""}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* ---------- DATE TIME ---------- */}
          <Box sx={{ mt: "24px", width: "260px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date & Time"
                value={logDateTime}
                onChange={(newValue) => setLogDateTime(newValue)}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* ---------- FOOTER ---------- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            <Box sx={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Make :</span>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                {currentEquipment.make || "N/A"}
              </span>
            </Box>
            <Box
              sx={{ width: "1px", height: "14px", backgroundColor: "#e5e7eb" }}
            />
            <Box sx={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Model :</span>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                {currentEquipment.model || "N/A"}
              </span>
            </Box>

            <Box sx={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
              <button
                onClick={handleClear}
                disabled={isSaving}
                style={{
                  padding: "10px 24px",
                  fontWeight: "700",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #505050",
                  borderRadius: "8px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#505050",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <LabEquipmentComplianceChart
              key={refreshChartKey}
              equipmentDetailId={currentEquipment.equipment_id}
              parameters={currentEquipment.parameters}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
