import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface Department {
  id: number;
  name: string;
  is_active: boolean;
}

interface DepartmentTabsProps {
  selected: string;
  onChange: (department: string) => void;
}

const DepartmentTabs: React.FC<DepartmentTabsProps> = ({ selected, onChange }) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const clinic = localStorage.getItem('clinic');
    if (!clinic) return;

    const parsed = JSON.parse(clinic);
    setDepartments(parsed.department || []);
  }, []);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={selected}
        onChange={(_, newValue) => onChange(newValue)}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
            fontSize: '16px',
           fontFamily: 'sans-serif',
            style:'ExtraBold',
            color: '#232323',
            lineHeight: '22px',
            Case: 'Title Case',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: '#000000',
            },
          },
          '& .Mui-selected': {
            color: '#000000 !important',
            fontWeight: 800,
           
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#ea580c',
            height: 2,
            borderRadius: '2px 2px 0 0',
          },
        }}
      >
        {departments
          .filter((d) => d.is_active)
          .map((dept) => (
            <Tab
              key={dept.id}
              label={dept.name}
              value={dept.name}
            />
          ))}
      </Tabs>
    </Box>
  );
};

export default DepartmentTabs;
