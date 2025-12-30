import { Container, Typography } from '@mui/material';

const Clinical = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Clinical
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Clinical section - Coming soon
      </Typography>
    </Container>
  );
};

export default Clinical;

