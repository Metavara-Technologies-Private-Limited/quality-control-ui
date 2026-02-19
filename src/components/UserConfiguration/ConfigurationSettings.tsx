import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const ConfigurationSettings = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      system_name: 'VIDAI EMR',
      time_zone: 'UTC+5:30',
      date_format: 'DD/MM/YYYY',
      smtp_server: 'smtp.example.com',
      smtp_port: '587',
      sender_email: 'noreply@vidai.com',
      api_key: '',
      webhook_url: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log('Configuration saved:', data);
    alert('Configuration saved successfully!');
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              General Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="System Name"
                  {...register('system_name', { required: 'System name is required' })}
                  error={!!errors.system_name}
                  helperText={errors.system_name?.message as string}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    label="Time Zone"
                    {...register('time_zone', { required: 'Time zone is required' })}
                    defaultValue="UTC+5:30"
                  >
                    <MenuItem value="UTC+5:30">UTC+5:30 (IST)</MenuItem>
                    <MenuItem value="UTC+0:00">UTC+0:00 (GMT)</MenuItem>
                    <MenuItem value="UTC-5:00">UTC-5:00 (EST)</MenuItem>
                    <MenuItem value="UTC+1:00">UTC+1:00 (CET)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    label="Date Format"
                    {...register('date_format', { required: 'Date format is required' })}
                    defaultValue="DD/MM/YYYY"
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Email Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Server"
                  {...register('smtp_server', { required: 'SMTP server is required' })}
                  error={!!errors.smtp_server}
                  helperText={errors.smtp_server?.message as string}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  {...register('smtp_port', { required: 'Port is required' })}
                  error={!!errors.smtp_port}
                  helperText={errors.smtp_port?.message as string}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sender Email"
                  type="email"
                  {...register('sender_email', { required: 'Sender email is required' })}
                  error={!!errors.sender_email}
                  helperText={errors.sender_email?.message as string}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Integration Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  {...register('api_key')}
                  helperText="Enter API key for external integrations"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  type="url"
                  {...register('webhook_url')}
                  helperText="Enter webhook URL for notifications"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{ borderColor: '#6b7280', color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#14b8a6',
              '&:hover': { backgroundColor: '#0d9488' },
            }}
          >
            Save
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ConfigurationSettings;

