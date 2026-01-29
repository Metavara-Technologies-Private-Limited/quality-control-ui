import { Box } from "@mui/material";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { environmentParameterValueApi } from "@/services/api";
import ParameterInput from "./components/ParameterInput";
import LabEnvironmentLogs from "./LabEnvironmentLogs";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

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

type Props = {
  environment: {
    id: number;
    environment_name: string;
    parameters: any[];
  };
  onSaved: () => void;
};

export default function LabEnvironmentForm({ environment, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<"Form" | "Logs">("Form");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [logDateTime, setLogDateTime] = useState<Dayjs | null>(dayjs());

  const setValue = (k: string, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const activeParams = environment.parameters.filter(
      (p) => p.is_active !== false && !p.is_deleted,
    );

    try {
      setSaving(true);
      await Promise.all(
        activeParams.map((p: any) => {
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
      toast.success("Logs saved successfully");
      onSaved();
    } catch (err) {
      toast.error("Save failed");
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
              console.log(
                "Param Name:",
                param.env_parameter_name,
                "Active:",
                param.is_active,
              );
              const cfg = param.config;
              if (param.is_deleted || !param.id) return null;
              if (!cfg) return null;

              const value = values[param.env_parameter_name] ?? "";
              const color = getRangeStatusColor(value, cfg);

              const isInactive =
                param.is_active === false ||
                param.is_active === 0 ||
                param.status === "inactive";
              return (
                <Box
                  key={param.id}
                  sx={{
                    opacity: isInactive ? 0.6 : 1,
                    pointerEvents: isInactive ? "none" : "auto", 
                  }}
                >
                  <ParameterInput
                    parameter={param}
                    value={value}
                    onChange={(v) => setValue(param.env_parameter_name, v)}
                    disabled={isInactive}
                  />

                  {isInactive && (
                    <Box
                      sx={{
                        fontSize: 11,
                        color: "#f44336",
                        fontWeight: 700,
                        mt: 0.5,
                      }}
                    >
                      Inactive Parameter
                    </Box>
                  )}

                  {cfg.default_value && (
                    <Box sx={{ fontSize: 12, color: "#9E9E9E", mt: "4px" }}>
                      Recommended: {cfg.default_value} {cfg.unit || ""}
                    </Box>
                  )}

                  {cfg.min_value != null && cfg.max_value != null && (
                    <Box
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isInactive ? "#9E9E9E" : color,
                      }}
                    >
                      Range: {cfg.min_value} {cfg.unit || ""} – {cfg.max_value}{" "}
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
                format="DD/MM/YYYY HH:mm"
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
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
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

        </Box>
      )}
    </Box>
  );
}
