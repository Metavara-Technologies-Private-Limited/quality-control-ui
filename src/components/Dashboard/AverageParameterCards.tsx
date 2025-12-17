import React, { useEffect } from 'react';

import Average_humidity_values from "../../assets/icons/Average_humidity_values.svg";
import filter_icon from "../../assets/icons/filter_icon_in_pie.svg";

import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

interface AverageHumidityProps {
  equipmentId: number;
}

const AverageHumidity: React.FC<AverageHumidityProps> = ({ equipmentId }) => {

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
            Average Humidity
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {/* SVG fills available space */}
          <Box
            component="img"
            src={Average_humidity_values}
            alt="average_humidity"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default AverageHumidity;
