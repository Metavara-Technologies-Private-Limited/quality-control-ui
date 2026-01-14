import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Card,
  Checkbox,
  Button,
  Stack,
  Divider,
} from "@mui/material";

/* ================= COLORS ================= */

const GREEN = "#47B35F";
const LIGHT_GREEN = "#EAF6EE";
const BORDER = "#E5E7EB";
const TEXT_GRAY = "#6B7280";

/* ================= TYPES ================= */

interface EquipmentUnit {
  id: number;
  name: string;
  make?: string;
  model?: string;
}

interface Parameter {
  id: number;
  name: string;
  fieldType?: string;
  min?: number | string;
  max?: number | string;
  value?: number | string;
  unit?: string;
  options?: string[];
}

interface Equipment {
  id: number;
  equipment_name: string;
  units: EquipmentUnit[];
  parameters: Parameter[];
}

export type SelectedEquipmentData = {
  equipment: Equipment;
  units: number[];
  parameters: { id: number; value?: number | string }[];
};

interface Props {
  open: boolean;
  onClose: () => void;
  equipments: any[];
  onAdd: (data: SelectedEquipmentData[]) => void;
}

/* ================= COMPONENT ================= */

export default function AddEquipmentDialog({
  open,
  onClose,
  equipments,
  onAdd,
}: Props) {
  /* ===== NORMALIZE BACKEND ===== */
  const normalized: Equipment[] = useMemo(() => {
    return (equipments || []).map((eq) => ({
      id: eq.id,
      equipment_name: eq.equipment_name,

      units: (eq.equipment_details || []).map((u: any) => ({
        id: u.id,
        name: u.equipment_num,
        make: u.make,
        model: u.model,
      })),

      parameters: (eq.parameters || []).map((p: any) => {
        const content = p.parameter_values?.[0]?.content || p.config || {};
        const dataType = (
          content.data_type ||
          p.parameter_data_type ||
          p.data_type ||
          p.field_type ||
          ""
        ).toLowerCase();

        return {
          id: p.id,
          name: p.parameter_name,
          fieldType: dataType,

          // Only integer uses value, decimal keeps min/max
          value:
            dataType === "integer"
              ? content.value ?? content.default ?? undefined
              : undefined,

          min:
            dataType !== "integer"
              ? content.min_value ?? content.min ?? undefined
              : undefined,
          max:
            dataType !== "integer"
              ? content.max_value ?? content.max ?? undefined
              : undefined,

          unit: content.unit,

          options: Array.isArray(content.dropdown)
            ? content.dropdown
            : content.dropdown
            ? [content.dropdown]
            : [],
        };
      }),
    }));
  }, [equipments]);

  /* ===== PARAMETER DISPLAY LOGIC ===== */
  const renderParameterInfo = (p: Parameter) => {
    switch (p.fieldType) {
      case "decimal":
        return p.min != null && p.max != null ? (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Range: {p.min} – {p.max} {p.unit ? p.unit : ""}
          </Typography>
        ) : (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Range: N/A
          </Typography>
        );

      case "integer":
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Value: {p.value !== undefined ? p.value : "N/A"} {p.unit ?? ""}
          </Typography>
        );

      case "percentage":
        return p.min != null ? (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Value: {p.min}%
          </Typography>
        ) : (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Value: N/A
          </Typography>
        );

      case "dropdown":
      case "select":
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Options: {p.options?.length ? p.options.join(", ") : "N/A"}
          </Typography>
        );

      case "boolean":
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Values: Yes / No
          </Typography>
        );

      case "text":
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Text input
          </Typography>
        );

      default:
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            N/A
          </Typography>
        );
    }
  };

  /* ===== STATE ===== */
  const [selected, setSelected] = useState<SelectedEquipmentData[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setActiveId(null);
    }
  }, [open]);

  const active = selected.find((s) => s.equipment.id === activeId);

  /* ===== HANDLERS ===== */
  const toggleEquipment = (eq: Equipment) => {
    setActiveId(eq.id);
    setSelected((prev) => {
      const exists = prev.find((p) => p.equipment.id === eq.id);
      if (exists) {
        return prev.filter((p) => p.equipment.id !== eq.id);
      }
      return [
        ...prev,
        {
          equipment: eq,
          units: eq.units.map((u) => u.id),
          parameters: eq.parameters.map((p) => ({ id: p.id, value: p.value })),
        },
      ];
    });
  };

  const toggleUnit = (id: number) => {
    if (!active) return;
    setSelected((prev) =>
      prev.map((s) =>
        s.equipment.id === active.equipment.id
          ? {
              ...s,
              units: s.units.includes(id)
                ? s.units.filter((u) => u !== id)
                : [...s.units, id],
            }
          : s
      )
    );
  };

  const toggleParam = (id: number) => {
    if (!active) return;
    setSelected((prev) =>
      prev.map((s) =>
        s.equipment.id === active.equipment.id
          ? {
              ...s,
              parameters: s.parameters.includes(id)
                ? s.parameters.filter((p) => (p as any).id !== id)
                : [...s.parameters, { id, value: undefined }],
            }
          : s
      )
    );
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
      <DialogTitle fontWeight={600}>Add Equipment</DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} minHeight={520}>
          {/* LEFT BOX */}
          <Grid item xs={3}>
            <Box
              sx={{
                border: `1px solid ${BORDER}`,
                borderRadius: 2,
                p: 2,
                height: "100%",
              }}
            >
              <Typography fontWeight={600} mb={1}>
                All Equipment's
              </Typography>

              <Stack spacing={0.5}>
                {normalized.map((eq) => {
                  const checked = selected.some(
                    (s) => s.equipment.id === eq.id
                  );

                  return (
                    <Box
                      key={eq.id}
                      onClick={() => toggleEquipment(eq)}
                      sx={{
                        px: 1,
                        py: 0.75,
                        borderRadius: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: checked ? LIGHT_GREEN : "transparent",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          size="small"
                          checked={checked}
                          sx={{
                            color: GREEN,
                            "&.Mui-checked": { color: GREEN },
                          }}
                        />
                        <Typography fontSize={13}>
                          {eq.equipment_name}
                        </Typography>
                      </Box>
                      <Typography color={TEXT_GRAY}>›</Typography>
                    </Box>
                  );
                })}
              </Stack>

              <Stack direction="row" spacing={1} mt={3}>
                <Button
                  onClick={onClose}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    border: "1px solid #D1D5DB",
                    color: "#374151",
                    px: 3,
                    height: 44,
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!selected.length}
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    textTransform: "none",
                  }}
                  onClick={() => {
                    onAdd(selected);
                    onClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* RIGHT CONTENT */}
          <Grid item xs={9}>
            {active && (
              <Stack spacing={3}>
                <Typography fontWeight={600}>
                  {active.equipment.equipment_name}
                </Typography>

                {/* UNITS */}
                <Grid container spacing={2}>
                  {active.equipment.units.map((u) => {
                    const checked = active.units.includes(u.id);
                    return (
                      <Grid item xs={3} key={u.id}>
                        <Card
                          onClick={() => toggleUnit(u.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${BORDER}`,
                            cursor: "pointer",
                            bgcolor: "#fff",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                              size="small"
                              checked={checked}
                              sx={{
                                color: "#000",
                                "&.Mui-checked": { color: "#000" },
                              }}
                            />
                            <Typography fontSize={13} fontWeight={500}>
                              {u.name}
                            </Typography>
                          </Box>

                          <Typography fontSize={11} color={TEXT_GRAY} mt={0.5}>
                            Make : {u.make || "-"} | Model : {u.model || "-"}
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* PARAMETERS */}
                <Typography fontWeight={600}>Parameters</Typography>
                <Grid container spacing={2}>
                  {active.equipment.parameters.map((p) => {
                    const checked = active.parameters.some(
                      (ap) => ap.id === p.id
                    );
                    return (
                      <Grid item xs={3} key={p.id}>
                        <Card
                          onClick={() => toggleParam(p.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${BORDER}`,
                            cursor: "pointer",
                            bgcolor: "#fff",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                              size="small"
                              checked={checked}
                              sx={{
                                color: "#000",
                                "&.Mui-checked": { color: "#000" },
                              }}
                            />
                            <Typography fontSize={13}>{p.name}</Typography>
                          </Box>

                          {renderParameterInfo(p)}
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
