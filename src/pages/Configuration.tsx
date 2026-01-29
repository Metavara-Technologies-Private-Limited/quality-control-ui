import { Container } from '@mui/material';
import EquipmentPage from '@/components/Configuration/Equipment/EquipmentPage';

const Configuration = () => {

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <EquipmentPage />
    </Container>
  );
};

export default Configuration;
