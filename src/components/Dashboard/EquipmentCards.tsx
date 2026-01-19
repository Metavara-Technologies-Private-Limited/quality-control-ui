import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Skeleton,
} from "@mui/material";
import {
  MedicalServices,
  Air,
  Storage,
  LocalFireDepartment,
  Whatshot,
  CleaningServices,
} from "@mui/icons-material";
import type { Equipment } from "@/types";

interface EquipmentCardsProps {
  equipments: Equipment[];
  selected: Equipment | null;
  onSelect: (equipment: Equipment) => void;
  loading?: boolean;
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
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={180}
            height={100}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      {equipments.map((equipment) => {
        const isSelected = selected?.id === equipment.id;

        return (
          <Badge
            key={equipment.id}
            badgeContent={0}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                right: 8,
                top: 8,
                border: "2px solid #ffffff",
                fontWeight: 600,
              },
            }}
          >
            <Card
              onClick={() => onSelect(equipment)}
              sx={{
                width: 250,
                height: 82,
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
                transition: "background-color 0.2s ease",

                "&:hover": {
                  backgroundColor: "#F3F4F6",
                },
              }}
            >
              <CardContent
                sx={{
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  "&:last-child": { paddingBottom: 0 },
                }}
              >
                <Box
                  sx={{
                    color: "#ea580c",
                    // mb: 1.5,
                    display: "flex",
                    // justifyContent: 'center',
                    "& svg": { fontSize: 32 },
                  }}
                >
                  {equipmentIcons[equipment.equipment_name] || (
                    <MedicalServices />
                  )}
                </Box>

                <Typography
                  className="equipment-text"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: isSelected ? "#ea580c" : "#111827",
                    fontSize: "16px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {equipment.equipment_name}
                </Typography>
              </CardContent>
            </Card>
          </Badge>
        );
      })}
    </Box>
  );
};

export default EquipmentCards;
