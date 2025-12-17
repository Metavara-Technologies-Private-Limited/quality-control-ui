import React, { useEffect } from 'react';

import pie_chart from "../../assets/icons/pie_chart.svg";
import High_in_pie from "../../assets/icons/High_in_pie.svg";
import Normal_in_pie from "../../assets/icons/Normal_in_pie.svg";
import Low_in_pie from "../../assets/icons/Low_in_pie.svg";
import Incubator_D from "../../assets/icons/Incubator_D.svg";
import Incubator_C from "../../assets/icons/Incubator_C.svg";
import Incubator_B from "../../assets/icons/Incubator_B.svg";
import Incubator_A from "../../assets/icons/Incubator_A.svg";
import filter_icon from "../../assets/icons/filter_icon_in_pie.svg";

import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

import {
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface IncidentsChartProps {
  equipmentId: number;
}

const IncidentsChart: React.FC<IncidentsChartProps> = ({ equipmentId }) => {

  useEffect(() => {
    console.log('Equipment ID:', equipmentId);
  }, [equipmentId]);

  return (
    <Box sx={{ height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <CardContent
          sx={{
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Incidents
          </Typography>

          <Box
            component="img"
            src={filter_icon}
            alt="filter"
            sx={{
              width: 24,
              height: 24,
              cursor: 'pointer',
            }}
          />
        </CardContent>

        {/* BODY */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
            p: 2,
          }}
        >
          {/* LEFT : PIE (RESPONSIVE) */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <foreignObject x={0} y={0} width="100%" height="100%">
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      component="img"
                      src={pie_chart}
                      alt="pie"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </foreignObject>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* RIGHT : DETAILS */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* HIGH / NORMAL / LOW (RESPONSIVE) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {[High_in_pie, Normal_in_pie, Low_in_pie].map((src, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* INCUBATORS (RESPONSIVE GRID) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
              }}
            >
              {[Incubator_A, Incubator_B, Incubator_C, Incubator_D].map(
                (src, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={src}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                )
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default IncidentsChart;
