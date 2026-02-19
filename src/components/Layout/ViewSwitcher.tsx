import React from 'react';
import { Chip, Menu, MenuItem } from '@mui/material';
import { AdminPanelSettings, Person, Science, KeyboardArrowDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type ViewType = 'admin' | 'user' | 'technician';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewSelect = (view: ViewType) => {
    onViewChange(view);
    handleClose();

    // Navigate to appropriate page based on view
    if (view === 'admin') {
      navigate('/admin-dashboard');
    } else if (view === 'user') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const getViewLabel = (view: ViewType) => {
    switch (view) {
      case 'admin':
        return 'Admin View';
      case 'user':
        return 'User View';
      case 'technician':
        return 'Technician View';
      default:
        return 'Technician View';
    }
  };

  const getViewIcon = (view: ViewType) => {
    switch (view) {
      case 'admin':
        return <AdminPanelSettings fontSize="small" />;
      case 'user':
        return <Person fontSize="small" />;
      case 'technician':
        return <Science fontSize="small" />;
      default:
        return <Science fontSize="small" />;
    }
  };

  const getViewColor = (view: ViewType) => {
    switch (view) {
      case 'admin':
        return '#ef4444'; // Red
      case 'user':
        return '#3b82f6'; // Blue
      case 'technician':
        return '#14b8a6'; // Teal
      default:
        return '#6b7280'; // Gray
    }
  };

  return (
    <>
      <Chip
        icon={getViewIcon(currentView)}
        label={getViewLabel(currentView)}
        onClick={handleClick}
        deleteIcon={<KeyboardArrowDown fontSize="small" />}
        onDelete={handleClick}
        sx={{
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          border: `1px solid ${getViewColor(currentView)}`,
          color: getViewColor(currentView),
          fontWeight: 500,
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
          '& .MuiChip-icon': {
            color: getViewColor(currentView),
          },
          '& .MuiChip-deleteIcon': {
            color: getViewColor(currentView),
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <MenuItem
          onClick={() => handleViewSelect('technician')}
          selected={currentView === 'technician'}
          sx={{
            fontSize: '0.875rem',
            borderRadius: 1,
            mx: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#ecfdf5',
              color: '#14b8a6',
            },
          }}
        >
          <Science fontSize="small" sx={{ mr: 1.5, color: currentView === 'technician' ? '#14b8a6' : '#6b7280' }} />
          Technician View
        </MenuItem>
        <MenuItem
          onClick={() => handleViewSelect('admin')}
          selected={currentView === 'admin'}
          sx={{
            fontSize: '0.875rem',
            borderRadius: 1,
            mx: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#fef2f2',
              color: '#ef4444',
            },
          }}
        >
          <AdminPanelSettings fontSize="small" sx={{ mr: 1.5, color: currentView === 'admin' ? '#ef4444' : '#6b7280' }} />
          Admin View
        </MenuItem>
        <MenuItem
          onClick={() => handleViewSelect('user')}
          selected={currentView === 'user'}
          sx={{
            fontSize: '0.875rem',
            borderRadius: 1,
            mx: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
            },
          }}
        >
          <Person fontSize="small" sx={{ mr: 1.5, color: currentView === 'user' ? '#3b82f6' : '#6b7280' }} />
          User View
        </MenuItem>
      </Menu>
    </>
  );
};

export default ViewSwitcher;
