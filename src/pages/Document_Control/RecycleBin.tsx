import { Container, Typography } from '@mui/material';

const Recyclebin = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Recycle Bin
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Document Control Recycle Bin section - Coming soon
      </Typography>
    </Container>
  );
};

export default Recyclebin;

