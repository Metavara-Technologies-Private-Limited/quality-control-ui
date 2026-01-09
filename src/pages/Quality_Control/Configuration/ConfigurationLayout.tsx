import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const ConfigurationLayout = () => {
  return (
    <Box sx={{ p: 2 }}>
     

      <Outlet />
    </Box>
  );
};

export default ConfigurationLayout;
