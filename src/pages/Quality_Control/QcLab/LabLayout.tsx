import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const LabLayout = () => {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Outlet />
    </Box>
  );
};

export default LabLayout;
