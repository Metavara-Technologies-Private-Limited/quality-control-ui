import { Container, Typography } from '@mui/material';

const Reports = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Reports
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Reports section - Coming soon
      </Typography>
    </Container>
  );
};

export default Reports;

