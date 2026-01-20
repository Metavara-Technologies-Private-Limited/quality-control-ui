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

  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- Load logs for ALL parameters of this equipment -------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all: any[] = [];

        for (const p of equipment.parameters) {
          const { data = [] } = await parameterValueApi.listByParameter(p.id);
          all.push(
            ...data.map((v: any) => ({
              ...v,
              parameter_name: p.parameter_name,
            })),
          );
        }

        setValues(all);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [equipment]);

  /* -------- Group by Equipment -------- */
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};

    values.forEach((v) => {
      const eqNum = equipmentDetailMap.get(v.equipment_details_id) ?? "Unknown";

      if (!map[eqNum]) map[eqNum] = [];
      map[eqNum].push(v);
    });

    return map;
  }, [values, equipmentDetailMap]);

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {Object.entries(grouped).map(([eqNum, rows]) => (
        <Box
          key={eqNum}
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
            {eqNum}
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
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.parameter_name}</td>
                  <td style={td}>{r.content}</td>
                  <td style={td}>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      ))}
    </Box>
  );
}

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
