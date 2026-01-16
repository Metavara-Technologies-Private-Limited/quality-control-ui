import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const LabLayout = () => {
  return (
    <Box>
      <Outlet />
    </Box>
  );
};

export default LabLayout;
