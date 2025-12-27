import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Search,
  Sort,
  FilterList,
  Add,
  KeyboardArrowDown,
} from '@mui/icons-material';

const DashboardHeader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        placeholder='Search by Equipment name'
        size='small'
        sx={{
          minWidth: 300,
          flex: 1,
          maxWidth: 400,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: 2,
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#d1d5db',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#14b8a6',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Search fontSize='small' sx={{ color: '#6b7280' }} />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <Select
            defaultValue='Monthly'
            sx={{
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e5e7eb',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#14b8a6',
              },
            }}
            IconComponent={KeyboardArrowDown}
          >
            <MenuItem value='Monthly'>Monthly</MenuItem>
            <MenuItem value='Weekly'>Weekly</MenuItem>
            <MenuItem value='Daily'>Daily</MenuItem>
          </Select>
        </FormControl>

        <IconButton
          size='small'
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db',
            },
          }}
        >
          <Sort fontSize='small' sx={{ color: '#6b7280' }} />
        </IconButton>

        <IconButton
          size='small'
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db',
            },
          }}
        >
          <FilterList fontSize='small' sx={{ color: '#6b7280' }} />
        </IconButton>

        <Button
          variant='contained'
          startIcon={<Add />}
          sx={{
            textTransform: 'none',
            backgroundColor: '#090909ff',
            borderRadius: 2,
            px: 2.5,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#0b0c0cda',
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          }}
        >
          Record
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
