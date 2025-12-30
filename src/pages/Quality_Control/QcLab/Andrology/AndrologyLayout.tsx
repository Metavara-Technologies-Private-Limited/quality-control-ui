import { Container, Typography } from '@mui/material';

const AndrologyLayout = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Andrology
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        AndrologyLayout section - Coming soon
      </Typography>
    </Container>
  );
};

export default AndrologyLayout;

