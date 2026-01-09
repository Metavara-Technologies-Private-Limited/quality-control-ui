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
  min?: string;
  max?: string;
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
  parameters: number[];
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
      parameters: (eq.parameters || []).map((p: any) => ({
        id: p.id,
        name: p.parameter_name,
        min: p.parameter_values?.[0]?.content?.min_value,
        max: p.parameter_values?.[0]?.content?.max_value,
      })),
    }));
  }, [equipments]);

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
          parameters: eq.parameters.map((p) => p.id),
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
                ? s.parameters.filter((p) => p !== id)
                : [...s.parameters, id],
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
          {/* ================= LEFT BOX ================= */}
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

              {/* ACTION BUTTONS */}
              <Stack direction="row" spacing={1} mt={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#4B4B4B",
                    textTransform: "none",
                  }}
                  disabled={!selected.length}
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

          {/* ================= RIGHT CONTENT ================= */}
          <Grid item xs={9}>
            {active && (
              <Stack spacing={3}>
                <Typography fontWeight={600}>
                  {active.equipment.equipment_name}
                </Typography>

                {/* ===== UNITS ===== */}
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
                            bgcolor: checked ? LIGHT_GREEN : "#FFF",
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
                            <Typography fontSize={13} fontWeight={500}>
                              {u.name}
                            </Typography>
                          </Box>

                          {/* MAKE & MODEL — FIXED */}
                          <Typography fontSize={11} color={TEXT_GRAY} mt={0.5}>
                            Make : {u.make || "-"} | Model : {u.model || "-"}
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* ===== PARAMETERS ===== */}
                <Typography fontWeight={600}>Parameters</Typography>

                <Grid container spacing={2}>
                  {active.equipment.parameters.map((p) => {
                    const checked = active.parameters.includes(p.id);
                    return (
                      <Grid item xs={3} key={p.id}>
                        <Card
                          onClick={() => toggleParam(p.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${BORDER}`,
                            cursor: "pointer",
                            bgcolor: checked ? LIGHT_GREEN : "#FFF",
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
                              {p.name}
                            </Typography>
                          </Box>

                          <Typography fontSize={11} color={TEXT_GRAY}>
                            Range: {p.min} – {p.max}
                          </Typography>
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
