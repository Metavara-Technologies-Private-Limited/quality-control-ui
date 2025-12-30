import { Container, Typography } from '@mui/material';

const Configuration = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Configuration
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Document Control Configuration section - Coming soon
      </Typography>
    </Container>
  );
};

export default Configuration;

