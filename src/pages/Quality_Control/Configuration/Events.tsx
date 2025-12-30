import { Container, Typography } from '@mui/material';

const Events = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Events
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
       Quality Control / Configuration /Events section - Coming soon
      </Typography>
    </Container>
  );
};

export default Events;

