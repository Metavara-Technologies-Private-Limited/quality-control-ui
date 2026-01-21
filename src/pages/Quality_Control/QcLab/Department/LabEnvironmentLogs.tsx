// pages/Quality_Control/QcLab/Department/LabEnvironmentLogs.tsx

import { CSSProperties, useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { environmentParameterValueApi } from "@/services/api";

type Props = {
  environment: {
    id: number;
    parameters: any[];
  };
};

export default function LabEnvironmentLogs({ environment }: Props) {
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- Load logs for ALL parameters of this environment -------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all: any[] = [];

        for (const p of environment.parameters) {
          const { data = [] } =
            await environmentParameterValueApi.listByParameter(p.id);

          all.push(
            ...data.map((v: any) => ({
              ...v,
              parameter_name: p.env_parameter_name,
            })),
          );
        }

        // latest first (same intent as equipment logs order)
        setValues(
          all.sort(
            (a, b) =>
              new Date(b.log_time).getTime() - new Date(a.log_time).getTime(),
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [environment]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!values.length) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
        No logs found
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          fontWeight: 700,
          fontSize: "14px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Environment Logs
      </Box>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            <th style={th}>Parameter</th>
            <th style={th}>Value</th>
            <th style={th}>Recorded At</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v) => (
            <tr key={v.id}>
              <td style={td}>{v.parameter_name}</td>
              <td style={td}>{v.content}</td>
              <td style={td}>{new Date(v.log_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

/* ---------- Shared styles (same as equipment) ---------- */

const th: CSSProperties = {
  textAlign: "left",
  padding: "10px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#4B5563",
  borderBottom: "1px solid #E5E7EB",
};

const td: CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  color: "#374151",
  borderBottom: "1px solid #F1F5F9",
};
