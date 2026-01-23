// pages/Quality_Control/QcLab/Department/LabEnvironmentForm.tsx

import { Box } from "@mui/material";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { environmentParameterValueApi } from "@/services/api";
import ParameterInput from "./components/ParameterInput";
import LabEnvironmentLogs from "./LabEnvironmentLogs";
// import LabEnvironmentComplianceChart from "./LabEnvironmentComplianceChart";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

/* ---------------- Utils ---------------- */

// ✅ ADDED (same logic as equipment)
const getRangeStatusColor = (value: string, cfg: any) => {
  if (!value || cfg?.min_value == null || cfg?.max_value == null)
    return "#9E9E9E";

  const num = Number(value);
  if (isNaN(num)) return "#9E9E9E";
  if (num < cfg.min_value) return "#D6BA18";
  if (num > cfg.max_value) return "#F25B5B";
  return "#16a34a";
};

// const getLocalDateTime = () => {
//   const now = new Date();
//   const tzOffset = now.getTimezoneOffset() * 60000;
//   return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
// };

/* ---------------- Component ---------------- */

type Props = {
  environment: {
    id: number;
    environment_name: string;
    parameters: any[];
  };
  onSaved: () => void; // ✅ ADD
};

export default function LabEnvironmentForm({ environment, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<"Form" | "Logs">("Form");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // const [refreshKey, setRefreshKey] = useState(0);
const [logDateTime, setLogDateTime] = useState<Dayjs | null>(dayjs());

  const setValue = (k: string, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const hasData = Object.values(values).some((v) => v?.trim());
    if (!hasData) {
      toast.warn("Please fill at least one field");
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        environment.parameters.map((p: any) => {
          const value = values[p.env_parameter_name];
          if (!value) return null;

          return environmentParameterValueApi.create({
            environment: environment.id,
            environment_parameter: p.id,
            content: value,
log_time: logDateTime?.toISOString(),
          });
        }),
      );

      toast.success("Environment logs saved");
      setValues({});
      // setRefreshKey((k) => k + 1);
      onSaved();
    } catch {
      toast.error("Failed to save logs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ToastContainer />

      {/* Tabs */}
      <div
        style={{
          display: "inline-flex",
          width: "fit-content",
          background: "#F2F2F2",
          padding: 4,
          borderRadius: 12,
        }}
      >
        {["Form", "Logs"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            style={{
              width: 120,
              height: 36,
              borderRadius: 10,
              border: "none",
              fontWeight: 700,
              background: activeTab === t ? "#fff" : "transparent",
              color: activeTab === t ? "#E17E61" : "#94a3b8",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Logs" ? (
        <LabEnvironmentLogs environment={environment} />
      ) : (
        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}>
          {/* PARAMETERS GRID */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 3,
            }}
          >
            {environment.parameters.map((param: any) => {
              const cfg = param.config;
              if (!cfg) return null;

              const value = values[param.env_parameter_name] ?? "";
              const color = getRangeStatusColor(value, cfg);

              return (
                <Box key={param.id}>
                  <ParameterInput
                    parameter={param}
                    value={value}
                    onChange={(v) => setValue(param.env_parameter_name, v)}
                  />

                  {/* ✅ Recommended */}
                  {cfg.default_value && (
                    <Box sx={{ fontSize: 12, color: "#9E9E9E", mt: "4px" }}>
                      Recommended: {cfg.default_value}
                      {cfg.unit || ""}
                    </Box>
                  )}

                  {/* ✅ Range */}
                  {cfg.min_value != null && cfg.max_value != null && (
                    <Box
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color,
                      }}
                    >
                      Range: {cfg.min_value}
                      {cfg.unit || ""} – {cfg.max_value}
                      {cfg.unit || ""}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* DATE TIME */}
<Box sx={{ mt: 3, width: 260 }}>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DateTimePicker
      label="Date & Time"
      value={logDateTime}
      onChange={(newValue) => setLogDateTime(newValue)}
      slotProps={{
        textField: {
          fullWidth: true,
          InputLabelProps: { shrink: true },
          sx: {
            "& .MuiOutlinedInput-root": {
              height: 50,
              fontSize: 16,
              fontWeight: 500,
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9e9e9e",
              borderWidth: "1.5px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#232323",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#828282",
            },
            "& .MuiInputLabel-root": {
              color: "#232323",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#232323",
            },
          },
        },
      }}
    />
  </LocalizationProvider>
</Box>


          {/* FOOTER */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              onClick={() => setValues({})}
              disabled={saving}
              style={{
                padding: "10px 24px",
                border: "1px solid #505050",
                borderRadius: 8,
                fontWeight: 700,
                opacity: saving ? 0.6 : 1,
              }}
            >
              Clear
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 24px",
                background: "#505050",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 700,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* <Box sx={{ mt: 3 }}>
            <LabEnvironmentComplianceChart
              key={refreshKey}
              environmentId={environment.id}
              parameters={environment.parameters}
            />
          </Box> */}
        </Box>
      )}
    </Box>
  );
}
