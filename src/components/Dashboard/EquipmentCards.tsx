import React from 'react';
import { Box, Card, CardContent, Typography, Badge, Skeleton } from '@mui/material';
import {
  MedicalServices,
  Air,
  Storage,
  LocalFireDepartment,
  Whatshot,
  CleaningServices,
} from '@mui/icons-material';
import type { Equipment } from '@/types';

interface EquipmentCardsProps {
  equipments: Equipment[];
  selected: Equipment | null;
  onSelect: (equipment: Equipment) => void;
  loading?: boolean;
}

const equipmentIcons: Record<string, React.ReactElement> = {
  Incubator: <MedicalServices />,
  'Laminar Flow Hoods': <Air />,
  'Cryopreservation Tanks (LN2)': <Storage />,
  Autoclaves: <LocalFireDepartment />,
  'Ovens & Water Baths': <Whatshot />,
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
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {equipments.map((equipment) => {
        const isSelected = selected?.id === equipment.id;

        return (
          <Badge
            key={equipment.id}
            badgeContent={0}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: 8,
                top: 8,
                border: '2px solid #ffffff',
                fontWeight: 600,
              },
            }}
          >
            <Card
              onClick={() => onSelect(equipment)}
              sx={{
                minWidth: 180,
                cursor: 'pointer',
                borderRadius: 2,
                border: isSelected ? '2px solid #ea580c' : '1px solid #e5e7eb',
                backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                boxShadow:
                  isSelected
                    ? '0 4px 6px rgba(0,0,0,0.15)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                mt: 1,

                '&:hover': {
                  transform: 'translateY(-2px)',
                  '& .equipment-text': { color: '#ea580c' },
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    color: isSelected ? '#ea580c' : '#ea580c',
                    // mb: 1.5,
                    display: 'flex',
                    // justifyContent: 'center',
                    '& svg': { fontSize: 32 },
                  }}
                >
                  {equipmentIcons[equipment.equipment_name] || <MedicalServices />}
                </Box>

                <Typography
                  className="equipment-text"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: isSelected ? '#ea580c' : '#111827',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
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
