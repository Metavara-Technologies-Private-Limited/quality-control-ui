import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import type { Parameter } from '@/types';

interface ParameterTabsProps {
  parameters: Parameter[];
  selected: Parameter | null;
  onSelect: (parameter: Parameter) => void;
  loading?: boolean;
}

const ParameterTabs: React.FC<ParameterTabsProps> = ({
  parameters,
  selected,
  onSelect,
  loading = false,
}) => {
  if (loading || parameters.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* PARAMETERS ROW */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="body2"
          sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'sans-serif' }}
        >
          Parameters :
        </Typography>

        {/* GREEN BACKGROUND CARD */}
        <Box
          sx={{
            backgroundColor: '#fafafa', 
            borderRadius: 1, 
            display: 'inline-block',
          }}
        >
          <Tabs
            value={selected?.id || parameters[0]?.id}
            onChange={(_, value) => {
              const param = parameters.find((p) => p.id === value);
              if (param) onSelect(param);
            }}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 40,
                fontSize: '0.875rem',
                fontFamily: 'sans-serif',
                color: '#9e9e9e', 
                px: 2,
                '&:hover': {
                  color: '#000000',
                },
              },
              '& .Mui-selected': {
                backgroundColor: '#ffffff',
                borderRadius:1,
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                m:0.8,
                color: '#E17E61 !important',
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {parameters.map((param) => (
              <Tab
                key={param.id}
                label={param.parameter_name}
                value={param.id}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};

export default ParameterTabs;
