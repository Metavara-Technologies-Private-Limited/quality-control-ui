// pages/Quality_Control/QcLab/Department/LabEquipmentLogs.tsx

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { parameterValueApi } from "@/services/api";

type Props = {
  equipment: {
    parameters: any[];
  };
};

export default function LabEquipmentLogs({ equipment }: Props) {
  const clinic = useSelector((s: RootState) => s.clinic.data);

  /* -------- Equipment Detail Map -------- */
  const equipmentDetailMap = useMemo(() => {
    const map = new Map<number, string>();

    clinic?.department.forEach((d) => {
      d.equipments.forEach((eq) => {
        eq.equipment_details.forEach((ed) => {
          map.set(ed.id!, ed.equipment_num);
        });
      });
    });

    return map;
  }, [clinic]);

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- Load logs -------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all: any[] = [];

        for (const p of equipment.parameters) {
          const { data = [] } = await parameterValueApi.listByParameter(p.id);
          all.push(...data);
        }

        setLogs(all);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [equipment]);

  /* -------- Build Parameter Meta -------- */
  const parameterMeta = useMemo(() => {
    return equipment.parameters.map((p) => ({
      name: p.parameter_name,
      unit: p.config?.unit ?? "-",
    }));
  }, [equipment]);

  /* -------- Transform Logs → Row-Based Table -------- */
  const rows = useMemo(() => {
    const result: any[] = [];

    logs.forEach((log, index) => {
      const paramIndex = index % parameterMeta.length;
      const param = parameterMeta[paramIndex];

      result.push({
        id: log.id,
        date: new Date(log.created_at).toLocaleString(),
        equipment:
          equipmentDetailMap.get(log.equipment_details_id) ?? "Unknown",
        parameter: param.name,
        unit: param.unit,
        value: log.content,
      });
    });

    return result;
  }, [logs, parameterMeta, equipmentDetailMap]);

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
      <Box sx={{ maxHeight: "430px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>Date & Time</th>
              <th style={th}>Equipment</th>
              <th style={th}>Parameter</th>
              <th style={th}>Unit</th>
              <th style={th}>Value</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.date}</td>
                <td style={td}>{r.equipment}</td>
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

/* -------- Styles -------- */
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
