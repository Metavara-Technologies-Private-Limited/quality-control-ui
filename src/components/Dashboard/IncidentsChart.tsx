import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
} from '@mui/material';
import {
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { STATUS_COLORS } from '@/utils/constants';

interface IncidentsChartProps {
  equipmentId: number;
}

const IncidentsChart: React.FC<IncidentsChartProps> = ({ equipmentId }) => {
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([
    'Incubator A',
    'Incubator B',
    'Incubator C',
    'Incubator D',
  ]);

  useEffect(() => {
    // equipmentId is acknowledged to avoid lint error
    console.log('Equipment ID:', equipmentId);
  }, [equipmentId]);

  const highCount = 50;
  const normalCount = 42;
  const lowCount = 53;

  const chartData = [
    { name: 'High', value: highCount, color: STATUS_COLORS.high ?? '#ef4444' },
    { name: 'Normal', value: normalCount, color: STATUS_COLORS.normal ?? '#22c55e' },
    { name: 'Low', value: lowCount, color: STATUS_COLORS.low ?? '#f59e0b' },
  ];

  const totalLogs = highCount + normalCount + lowCount;

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipments(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  // styles for High Normal Low labels in Pie chart 
const statusItemSx = {
  width: 205,
  height: 40,
  opacity: 1,
  borderRadius: '580px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  pt: '8px',
  pr: '24px',
  pb: '8px',
  pl: '8px',
  bgcolor: '#ffffff',

};

  return (
    <Box sx={{ mb: 5, height: 299, width:495  }}>
<Card
  sx={{
    borderRadius: 2,
    border: '1px solid #e2e3e5',
    width: '100%',
    maxWidth: 520,
    mt:1
  }}
>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{
        width: '100%',
        height: 50,
        display: 'flex',
        justifyContent: 'space-between',
        opacity: 1,
        p: 1,
        borderBottom: '1px solid #e2e3e5',
      }}
>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Incidents
        </Typography>

        <img                                      // Filter icon in Pie chart
      src={filter_icon}
      alt="filter"
      style={{
        width: 30,
        height: 30,
        cursor: 'pointer',
        position: 'relative',
        bottom:6
      }}
    />
        </Box>
        

<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
    columnGap: 3,
    rowGap: 1,
    alignItems: 'start',
  }}
>
  {/* ------------------------LEFT : PIE --------------------------*/}
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>                                              
        <foreignObject x={20} y={20} width={210} height={210}>
          <Box                                               //pie chart in incident card
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: 200, height: 200, mt:2 }}>
              <img
                src={pie_chart}
                alt="pie"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        </foreignObject>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </Box>

  {/* --------------------TOP RIGHT : HIGH / NORMAL / LOW  ------------------------*/}

  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', mr:10, mt:3}}>
    {/* TOP */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={statusItemSx}><img src={High_in_pie} /></Box>
      <Box sx={statusItemSx}><img src={Normal_in_pie} /></Box>
      <Box sx={statusItemSx}><img src={Low_in_pie} /></Box>
    </Box>

    {/* --------------------BOTTOM RIGHT : INCUBATORS  A  B  C  D --------------------------*/}
    <Box
      sx={{
        width: 205,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2,
        mt:2
        
      }}
    >
      <img src={Incubator_A} />
      <img src={Incubator_B} />
      <img src={Incubator_C} />
      <img src={Incubator_D} />
    </Box>
  </Box>
</Box>


      </CardContent>
    </Card>
  </Box>
  );
};

export default IncidentsChart;
