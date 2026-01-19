import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  min?: number;
  max?: number;
  value?: number;
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
  parameters: { id: number; value?: number }[];
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

        const rawType =
          content.data_type ||
          p.parameter_data_type ||
          p.data_type ||
          p.field_type ||
          "";

        const fieldType = rawType.toLowerCase();

        const toNumber = (v: any) =>
          v !== undefined && v !== null && v !== "" ? Number(v) : undefined;

        return {
          id: p.id,
          name: p.parameter_name,
          fieldType,
          value:
            fieldType === "integer"
              ? toNumber(
                  content.integer_value ?? content.value ?? content.default,
                )
              : fieldType === "percentage"
                ? toNumber(content.percentage)
                : undefined,
          min:
            fieldType === "decimal"
              ? toNumber(content.min_value ?? content.min)
              : fieldType === "integer"
                ? toNumber(content.min_value ?? content.min)
                : undefined,
          max:
            fieldType === "decimal"
              ? toNumber(content.max_value ?? content.max)
              : fieldType === "integer"
                ? toNumber(content.max_value ?? content.max)
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
      case "integer":
        return p.min != null && p.max != null ? (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Range: {p.min} – {p.max} {p.unit ?? ""}
          </Typography>
        ) : (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Value: {p.value != null ? p.value : "N/A"} {p.unit ?? ""}
          </Typography>
        );
      case "percentage":
        return (
          <Typography fontSize={11} color={TEXT_GRAY}>
            Value: {p.value != null ? `${p.value}%` : "N/A"}
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
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setActiveId(null);
      setPopupOpen(false);
    }
  }, [open]);

  const active = selected.find((s) => s.equipment.id === activeId);

  /* ===== HANDLERS ===== */
  const toggleEquipment = (eq: Equipment) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.equipment.id === eq.id);
      if (exists) {
        if (activeId === eq.id) setActiveId(null);
        return prev.filter((p) => p.equipment.id !== eq.id);
      }
      setActiveId(eq.id);
      return [
        ...prev,
        {
          equipment: eq,
          units: eq.units.map((u) => u.id),
          parameters: eq.parameters.map((p) => ({ id: p.id })), // ✅ AUTO SELECT PARAMETERS
        },
      ];
    });
  };

  const toggleUnit = (id: number) => {
    if (!active) return;
    setSelected((prev) =>
      prev
        .map((s) =>
          s.equipment.id === active.equipment.id
            ? {
                ...s,
                units: s.units.includes(id)
                  ? s.units.filter((u) => u !== id)
                  : [...s.units, id],
              }
            : s,
        )
        .filter((s) => s.units.length > 0),
    );
  };

  const toggleParam = (id: number) => {
    if (!active) return;
    setSelected((prev) =>
      prev.map((s) =>
        s.equipment.id === active.equipment.id
          ? {
              ...s,
              parameters: s.parameters.some((p) => p.id === id)
                ? s.parameters.filter((p) => p.id !== id)
                : [...s.parameters, { id }],
            }
          : s,
      ),
    );
  };

  const handleAdd = () => {
    const invalid = selected.some(
      (s) => s.units.length > 0 && s.parameters.length === 0,
    );
    if (invalid) {
      setPopupOpen(true);
      return;
    }

    const cleaned = selected.filter(
      (s) => s.units.length > 0 && s.parameters.length > 0,
    );

    onAdd(cleaned);
    onClose();
  };

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
        <DialogTitle fontWeight={600}>Add Equipment</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} minHeight={520}>
            {/* LEFT */}
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  p: 2,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: 700,
                    fontStyle: "bold",
                    fontSize: "14px",
                    lineHeight: "18px",
                    letterSpacing: "0%",
                    mb: 1,
                  }}
                >
                  All Equipments
                </Typography>

                <Stack spacing={0.5}>
                  {normalized.map((eq) => {
                    const checked = selected.some(
                      (s) => s.equipment.id === eq.id,
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
                          bgcolor: checked ? "#F3F4F6" : "transparent",
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
                          <Typography
                            sx={{
                              fontFamily: "Montserrat",
                              fontWeight: 700,
                              fontStyle: "bold",
                              fontSize: "14px",
                              lineHeight: "18px",
                              letterSpacing: "0%",
                            }}
                          >
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
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!selected.length}
                    sx={{
                      backgroundColor: "#6B7280",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#6B7280" },
                      "&:disabled": {
                        backgroundColor: "#6B7280",
                        opacity: 0.5,
                      },
                    }}
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={9}>
              {active && (
                <Stack spacing={3}>
                  <Typography fontWeight={600}>
                    {active.equipment.equipment_name}
                  </Typography>

                  <Grid container spacing={2}>
                    {active.equipment.units.map((u) => (
                      <Grid item xs={3} key={u.id}>
                        <Card
                          onClick={() => toggleUnit(u.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${BORDER}`,
                            cursor: "pointer",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                              checked={active.units.includes(u.id)}
                              sx={{
                                width: 15,
                                height: 15,
                                padding: 0,
                                color: GREEN,
                                "&.Mui-checked": { color: GREEN },
                                "& .MuiSvgIcon-root": { fontSize: 15 },
                              }}
                            />
                            <Typography fontSize={13}>{u.name}</Typography>
                          </Box>
                          <Typography fontSize={11} color={TEXT_GRAY}>
                            Make : {u.make || "-"} | Model : {u.model || "-"}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography fontWeight={600}>Parameters</Typography>
                  <Grid container spacing={2}>
                    {active.equipment.parameters.map((p) => (
                      <Grid item xs={3} key={p.id}>
                        <Card
                          onClick={() => toggleParam(p.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${BORDER}`,
                            cursor: "pointer",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                              checked={active.parameters.some(
                                (ap) => ap.id === p.id,
                              )}
                              sx={{
                                width: 15,
                                height: 15,
                                padding: 0,
                                color: GREEN,
                                "&.Mui-checked": { color: GREEN },
                                "& .MuiSvgIcon-root": { fontSize: 15 },
                              }}
                            />
                            <Typography fontSize={13}>{p.name}</Typography>
                          </Box>
                          {renderParameterInfo(p)}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* POPUP */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
        <DialogTitle fontWeight={600}>Alert</DialogTitle>
        <DialogContent>
          <Typography>
            Please select at least one parameter for the selected equipment.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPopupOpen(false)}
            sx={{ textTransform: "none", color: "#000" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
