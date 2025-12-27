import { Tabs, Tab, Box } from '@mui/material';
import type { Department } from '@/types';

interface DepartmentTabsProps {
  departments: Department[];
  selected: number | null;
  onChange: (departmentId: number) => void;
}

const DepartmentTabs = ({
  departments,
  selected,
  onChange,
}: DepartmentTabsProps) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={selected ?? false}
        onChange={(_, value) => onChange(value as number)}
      >
        {departments
          .filter((d) => d.is_active)
          .map((dept) => (
            <Tab
              key={dept.id}
              label={dept.name}
              value={dept.id}
            />
          ))}
      </Tabs>
    </Box>
  );
};

export default DepartmentTabs;
