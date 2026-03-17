import React, { useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Skeleton,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  MedicalServices,
  Air,
  Storage,
  LocalFireDepartment,
  Whatshot,
  CleaningServices,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import type { Equipment } from "@/types";

interface EquipmentCardsProps {
  equipments: Equipment[];
  selected: Equipment | null;
  onSelect: (equipment: Equipment) => void;
  loading?: boolean;
  values?: any[];
}

const equipmentIcons: Record<string, React.ReactElement> = {
  Incubator: <MedicalServices />,
  "Laminar Flow Hoods": <Air />,
  "Cryopreservation Tanks (LN2)": <Storage />,
  Autoclaves: <LocalFireDepartment />,
  "Ovens & Water Baths": <Whatshot />,
  Sterilizers: <CleaningServices />,
};

const EquipmentCards: React.FC<EquipmentCardsProps> = ({
  equipments,
  selected,
  onSelect,
  loading = false,
  values,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollCards = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft += direction === "left" ? -280 : 280;
  };

  const getEquipmentAlerts = (equipment: Equipment, values: any[]) => {
    if (!values?.length) return [];

    const alerts: string[] = [];

    equipment.parameters?.forEach((param) => {
      const relevant = values.filter(
        (v) =>
          Number(v.parameter_id) === Number(param.id) &&
          equipment.equipment_details?.some(
            (ed) => Number(ed.id) === Number(v.equipment_details_id),
          ),
      );

      if (relevant.length < 2) return;

      // Group by equipment_details_id (same logic as RecentActivity)
      const grouped: Record<number, any[]> = {};
      relevant.forEach((v) => {
        const key = Number(v.equipment_details_id);
        grouped[key] ??= [];
        grouped[key].push(v);
      });

      Object.values(grouped).forEach((items) => {
        items.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        if (items.length < 2) return;
        const latest = items[items.length - 1];
        const prev = items[items.length - 2];
        const diff = Number(latest.content) - Number(prev.content);
        if (Math.abs(diff) >= 0.5) {
          alerts.push(
            `${param.parameter_name} ${diff > 0 ? "rise" : "drop"} by ${Math.abs(diff).toFixed(1)}`,
          );
        }
      });
    });

    return alerts;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, pt: 2 }}>
        <IconButton
          size="small"
          disabled
          sx={{
            borderRadius: 2,
            backgroundColor: "transparent",
            flexShrink: 0,
          }}
        >
          <ChevronLeft fontSize="small" sx={{ opacity: 0.45 }} />
        </IconButton>
        <Box
          sx={{ display: "flex", gap: 2, overflow: "hidden", flex: 1, pt: 0.5 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={250}
              height={75}
              sx={{ borderRadius: 2, flexShrink: 0 }}
            />
          ))}
        </Box>
        <IconButton
          size="small"
          disabled
          sx={{
            borderRadius: 2,
            backgroundColor: "transparent",
            flexShrink: 0,
          }}
        >
          <ChevronRight fontSize="small" sx={{ opacity: 0.45 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, pt: 2.5 }}>
      <IconButton
        size="small"
        onClick={() => scrollCards("left")}
        sx={{
          borderRadius: 2,
          backgroundColor: "transparent",
          flexShrink: 0,
        }}
      >
        <ChevronLeft
          fontSize="small"
          sx={{ color: "#6B7280", opacity: 0.45 }}
        />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          flex: 1,
          pt: 0.5,
          overflowX: "auto",
          overflowY: "visible",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {equipments.map((equipment) => {
          const isSelected = selected?.id === equipment.id;
          const alerts = getEquipmentAlerts(equipment, values || []);
          const alertCount = alerts.length;

          return (
            <Tooltip
              key={equipment.id}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#000",
                  },
                },
                arrow: {
                  sx: {
                    color: "#000",
                  },
                },
              }}
              title={
                alertCount > 0 ? (
                  <Box>
                    {alerts.map((a, i) => (
                      <Typography key={i} fontSize={12} sx={{ color: "#fff" }}>
                        {a}
                      </Typography>
                    ))}
                  </Box>
                ) : undefined
              }
              arrow
            >
              <Badge
                invisible={alertCount === 0}
                overlap="rectangular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: "#D84C4C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 700,
                        lineHeight: 1,
                        mt: "-1px",
                      }}
                    >
                      !
                    </Typography>
                  </Box>
                }
                sx={{
                  "& .MuiBadge-badge": {
                    background: "transparent",
                    minWidth: "unset",
                    width: "auto",
                    height: "auto",
                    padding: 0,
                    border: "none",
                    boxShadow: "none",
                    top: 4,
                    right: 4,
                    transform: "translate(50%, -35%)",
                  },
                }}
              >
                <Card
                  onClick={() => onSelect(equipment)}
                  sx={{
                    width: 250,
                    height: 75,
                    flexShrink: 0,
                    padding: "16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: isSelected ? "#FFFFFF" : "#FAFAFA",
                    border: isSelected ? "1px solid #E5E7EB" : "none",
                    boxShadow: isSelected
                      ? "2px 2px 8px rgba(0, 0, 0, 0.12)"
                      : "none",
                    "&:hover": { backgroundColor: "#F3F4F6" },
                  }}
                >
                  <CardContent
                    sx={{
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      "&:last-child": { paddingBottom: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        color: "secondary.main",
                        "& svg": { fontSize: 32 },
                      }}
                    >
                      {equipmentIcons[equipment.equipment_name] || (
                        <MedicalServices />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: isSelected ? "secondary.main" : "text.primary",
                        fontSize: "16px",
                      }}
                    >
                      {equipment.equipment_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Badge>
            </Tooltip>
          );
        })}
      </Box>

      <IconButton
        size="small"
        onClick={() => scrollCards("right")}
        sx={{
          borderRadius: 2,
          backgroundColor: "transparent",
          flexShrink: 0,
        }}
      >
        <ChevronRight
          fontSize="small"
          sx={{ color: "#6B7280", opacity: 0.45 }}
        />
      </IconButton>
    </Box>
  );
};

export default EquipmentCards;
