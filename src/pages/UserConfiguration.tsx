import  { useState } from 'react';
import { Box, Container, Tabs, Tab, Alert } from '@mui/material';
import EquipmentPage from '@/components/Configuration/Equipment/EquipmentPage';
import DepartmentConfig from '@/components/Configuration/Equipment/DepartmentConfig';
import ParameterConfig from '@/components/Configuration/Equipment/ParameterConfig';
import TestTypeConfig from '@/components/Configuration/Equipment/TestTypeConfig';

const UserConfiguration = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          You are viewing the configuration in read-only mode. Contact an administrator to make changes.
        </Alert>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
              fontSize: '0.875rem',
              color: '#6b7280',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#14b8a6',
              },
            },
            '& .Mui-selected': {
              color: '#14b8a6',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#14b8a6',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="Equipment" />
          <Tab label="Parameters" />
          <Tab label="Test Types" />
          <Tab label="Departments" />
        </Tabs>
      </Box>

      {activeTab === 0 && <EquipmentPage readOnly={true} />}
      {activeTab === 1 && <ParameterConfig readOnly={true} />}
      {activeTab === 2 && <TestTypeConfig readOnly={true} />}
      {activeTab === 3 && <DepartmentConfig readOnly={true} />}
    </Container>
  );
};

export default UserConfiguration;
