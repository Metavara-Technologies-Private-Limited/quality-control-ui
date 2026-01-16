import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import type { Parameter } from '@/types';
import { Add } from '@mui/icons-material';

interface ParameterTabsProps {
  parameters: Parameter[];
  selected: number | null;
  onSelect: (parameterId: number) => void;
  loading?: boolean;
}

const ParameterTabs = ({
  parameters,
  selected,
  onSelect,
  loading = false,
}: ParameterTabsProps) => {
  if (loading || parameters.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant='body2'
          sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}
        >
          Parameters :
        </Typography>

        <Box
          sx={{
            backgroundColor: '#fafafa',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            px: 1,
          }}
        >
          <Tabs
            value={selected}
            onChange={(_, value: number) => onSelect(value)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 40,
                fontSize: '0.875rem',
                color: '#9e9e9e',
                px: 2,
                '&:hover': {
                  color: '#000000',
                },
              },
              '& .Mui-selected': {
                backgroundColor: '#ffffff',
                borderRadius: 1,
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                m: 0.8,
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
      <Button
        variant='contained'
        startIcon={<Add />}
        sx={{
          textTransform: 'none',
          backgroundColor: '#090909ff',
          borderRadius: 2,
          px: 2.5,
          boxShadow: 'none',
          ml: 2, // spacing from tabs
          '&:hover': {
            backgroundColor: '#0b0c0cda',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        Record
      </Button>
    </Box>
  );
};

export default ParameterTabs;
