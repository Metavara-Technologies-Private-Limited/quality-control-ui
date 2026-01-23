import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { environmentParameterValueApi } from "@/services/api";

type Props = {
  environment: {
    id: number;
    parameters: any[];
  };
};

export default function LabEnvironmentLogs({ environment }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- Load logs for ALL environment parameters -------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all: any[] = [];

        for (const p of environment.parameters) {
          const { data = [] } =
            await environmentParameterValueApi.listByParameter(p.id);

          all.push(...data);
        }

        setLogs(
          all.sort(
            (a, b) =>
              new Date(b.log_time ?? b.created_at).getTime() -
              new Date(a.log_time ?? a.created_at).getTime()
          )
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [environment]);

  /* -------- Parameter Meta (name + unit) -------- */
  const parameterMeta = useMemo(() => {
    return environment.parameters.map((p) => ({
      name: p.env_parameter_name,
      unit: p.config?.unit ?? "-",
    }));
  }, [environment]);

  /* -------- Build Row-Based Table -------- */
  const rows = useMemo(() => {
    if (!parameterMeta.length) return [];

    return logs.map((log, index) => {
      const param = parameterMeta[index % parameterMeta.length];

      return {
        id: log.id,
        date: new Date(log.log_time ?? log.created_at).toLocaleString(),
        parameter: param.name,
        unit: param.unit,
        value: log.content,
      };
    });
  }, [logs, parameterMeta]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
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
      <Box sx={{ maxHeight: "520px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>Date & Time</th>
              <th style={th}>Parameter</th>
              <th style={th}>Unit</th>
              <th style={th}>Value</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.date}</td>
                <td style={td}>{r.parameter}</td>
                <td style={td}>{r.unit}</td>
                <td style={td}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

/* ---------- Shared styles ---------- */

const th: CSSProperties = {
  textAlign: "left",
  padding: "10px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#4B5563",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const td: CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  color: "#374151",
  borderBottom: "1px solid #F1F5F9",
  whiteSpace: "nowrap",
};
