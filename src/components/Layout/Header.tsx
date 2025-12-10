import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import ViewSwitcher from './ViewSwitcher';
import { useView } from '@/utils/viewContext';

const Header = () => {
  const location = useLocation();
  // removed technical view dropdown (ViewSwitcher)

  // Get breadcrumb path
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    'admin-dashboard': 'Admin Dashboard',
    configuration: 'Configuration',
    'user-configuration': 'User Configuration',
    'user-management': 'User Management',
    'audit-trail': 'Audit Trail',
    clinical: 'Clinical',
    lab: 'Lab',
    reports: 'Reports',
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#FAFAFA',
        borderRadius: 2,
        color: '#111827',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, py: 1.5 }}>
        {/* Left: Logo and Breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2, md: 3 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: '#14b8a6',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              letterSpacing: '-0.025em',
            }}
          >
          
          </Typography>

          <Breadcrumbs
            separator={<Typography sx={{ color: '#232323', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>›</Typography>}
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                mx: { xs: 0.5, sm: 1 },
              },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Link
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: '#666666',
                display: 'inline-block',
                width: 123,
                height: 20,
                transform: 'none',
                opacity: 1,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '0',
                '&:hover': {
                  color: '#14b8a6',
                },
              }}
            >
              Quality Control
            </Link>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const displayText = breadcrumbMap[name] || name;
              const isDashboard = displayText === 'Dashboard' || name === 'dashboard';

              return isLast ? (
                <Typography
                  key={name}
                  sx={{
                    transform: 'none',
                    opacity: 1,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: isDashboard ? 700 : 500,
                    fontStyle: 'normal',
                    fontSize: isDashboard ? '18px' : '0.875rem',
                    lineHeight: isDashboard ? '100%' : '24px',
                    letterSpacing: '0',
                    width: isDashboard ? 104 : 'auto',
                    height: isDashboard ? 22 : 'auto',
                    color: isDashboard ? '#232323' : '#111827',
                    textTransform: 'capitalize',
                    display: 'inline-block',
                    px: isDashboard ? 1 : 0,
                  }}
                >
                  {displayText}
                </Typography>
              ) : (
                <Link
                  key={name}
                  component={RouterLink}
                  to={routeTo}
                  sx={{
                    textDecoration: 'none',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    '&:hover': {
                      color: '#14b8a6',
                    },
                  }}
                >
                  {displayText}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Right: View Switcher, Clinic, Icons, User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            Clinic: Crysta IVF, Banglore
          </Typography>

          <IconButton
            size="small"
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <img
              src={CalendarIcon}
              alt="Calendar"
              style={{
                width: 24,
                height: 24,
                objectFit: 'contain',
              }}
            />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: '#6b7280',
              position: 'relative',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <Notifications fontSize="small" />
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '2px solid #ffffff',
              }}
            />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <img
              src={MessageQuestionIcon}
              alt="Help"
              style={{
                width: 24,
                height: 24,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1 },
              cursor: 'pointer',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#f3f4f6' },
            }}
            onClick={handleMenuOpen}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#14b8a6',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              KR
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.2 }}>
                Kate Russell
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.2 }}>
                Receptionist
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
