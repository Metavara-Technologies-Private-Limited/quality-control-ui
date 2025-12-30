import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const ConfigurationLayout = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Quality Control Configuration
      </Typography>

      <Outlet />
    </Box>
  );
};

export default ConfigurationLayout;
