import { Container, Typography } from '@mui/material';

const Task = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Task
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Cryopreservation Task section - Coming soon
      </Typography>
    </Container>
  );
};

export default Task;

