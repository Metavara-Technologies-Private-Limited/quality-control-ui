import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import CalendarIcon from '@/assets/icons/calendar.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import MessageQuestionIcon from '@/assets/icons/message-question.svg';
import UserAvatarIcon from '@/assets/icons/ellipse_12.svg';
import DropdownArrowIcon from '@/assets/icons/vector.svg';
import { useEffect, useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [clinicName, setClinicName] = useState<string>("");

  useEffect(() => {
    const clinic = localStorage.getItem("clinic");
    if (clinic) {
      setClinicName(JSON.parse(clinic).name);
    }
  }, []);

  const handleMenuOpen = () => {
    // Menu handler implementation
  };

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

        {/* Right: Clinic, Icons, User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', md: 'block' },
            }}
          >
              Clinic: {clinicName || "—"}
          </Typography>

          <IconButton
            size="small"
            sx={{
              width: 48,
              height: 48,
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
            }}
          >
            <Box
              component="img"
              src={CalendarIcon}
              alt="Calendar"
              sx={{
                width: 24,
                height: 24,
                objectFit: 'contain',
              }}
            />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              width: 48,
              height: 48,
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
            }}
          >
            <Box
              component="img"
              src={NotificationIcon}
              alt="Notifications"
              sx={{
                width: 24,
                height: 24,
                objectFit: 'contain',
              }}
            />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              width: 48,
              height: 48,
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
            }}
          >
            <Box
              component="img"
              src={MessageQuestionIcon}
              alt="Help"
              sx={{
                width: 24,
                height: 24,
                objectFit: 'contain',
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
            <Box
              component="img"
              src={UserAvatarIcon}
              alt="User Avatar"
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ color:'#232323',fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.2 }}>
                Kate Russell
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.2 }}>
                Receptionist
              </Typography>
            </Box>
            <Box
              component="img"
              src={DropdownArrowIcon}
              alt="Dropdown"
              sx={{
                width: 12,
                height: 6,
                objectFit: 'contain',
                display: { xs: 'none', sm: 'block' },
                marginTop: '-20px',
              }}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
