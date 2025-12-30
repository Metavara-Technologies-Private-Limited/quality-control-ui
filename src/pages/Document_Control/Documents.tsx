import { Container, Typography } from '@mui/material';

const Documents = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Documents
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6b7280' }}>
        Document Control Documents section - Coming soon
      </Typography>
    </Container>
  );
};

export default Documents;

