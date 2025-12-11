import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { DEPARTMENTS } from '@/utils/constants';

interface DepartmentTabsProps {
  selected: string;
  onChange: (department: string) => void;
}

const DepartmentTabs: React.FC<DepartmentTabsProps> = ({ selected, onChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={selected} // selected is always a string from state
        onChange={(_, newValue) => onChange(newValue)}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
            fontSize: '0.875rem',
            color: '#000000',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: '#ea580c',
            },
          },
          '& .Mui-selected': {
            color: '#ea580c !important',
            fontWeight: 600,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#ea580c',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {DEPARTMENTS.map((dept) => (
          <Tab key={dept} label={dept} value={dept} />
        ))}
      </Tabs>
    </Box>
  );
};

export default DepartmentTabs;
