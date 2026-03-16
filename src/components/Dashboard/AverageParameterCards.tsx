import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import { EquipmentDetail, Parameter } from "@/types";

interface AverageParameterCardsProps {
  equipmentId: number;
  equipmentDetails: EquipmentDetail[];
  parameter: Parameter;
  values: any[];
}

type AvgItem = {
  name: string;
  avg: number | null;
};

const AverageParameterCards: React.FC<AverageParameterCardsProps> = ({
  equipmentDetails,
  parameter,
  values,
}) => {
  /* -----------------------------
     COMPUTE AVERAGE PER EQUIPMENT_DETAIL
  ----------------------------- */
  const averages = useMemo<AvgItem[]>(() => {
    const byDetail: Record<number, number[]> = {};

    values
      .filter((v) => !v.is_deleted)
      .forEach((v) => {
        const val = Number(v.content);
        if (isNaN(val)) return;

        byDetail[v.equipment_details_id] ??= [];
        byDetail[v.equipment_details_id].push(val);
      });

    return equipmentDetails.map((ed) => {
      const list = byDetail[ed.id ?? -1];

      if (!list || list.length === 0) {
        return { name: ed.equipment_num, avg: null };
      }

      const avg = list.reduce((sum, v) => sum + v, 0) / list.length;

      return {
        name: ed.equipment_num,
        avg: Number(avg.toFixed(2)),
      };
    });
  }, [equipmentDetails, values]);

  const unit = parameter?.config?.unit ?? "";

  return (
    <Card sx={{ height: "100%", minHeight: 350, borderRadius: 3 }}>
      {/* HEADER */}
      <CardContent
        sx={{
          height: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700}>
          Average {parameter.parameter_name}
        </Typography>
        <IconButton size="small">
          <FilterAltOutlinedIcon fontSize="small" />
        </IconButton>
      </CardContent>

      <Divider />

      {/* BODY */}
      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {averages.map((item) => (
          <Box
            key={item.name}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: "#F9FAFB",
            }}
          >
            <Typography fontSize={14} color="text.secondary">
              {item.name}
            </Typography>

            {item.avg === null ? (
              <Typography fontSize={14} color="text.secondary">
                No data available
              </Typography>
            ) : (
              <>
                <Typography fontSize={24} fontWeight={700}>
                  {item.avg}
                  {unit}
                </Typography>

                {/* Placeholder trend (wire later) */}
                <Typography fontSize={13} color="#22c55e">
                  ▲ 2.5% vs last week
                </Typography>
              </>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default AverageParameterCards;
