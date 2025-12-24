import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Divider,
  Popover,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import CalendarIcon from '@/assets/icons/calendar.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import MessageQuestionIcon from '@/assets/icons/message-question.svg';
import UserAvatarIcon from '@/assets/icons/ellipse_12.svg';
import { useEffect, useState } from 'react';

const Header = () => {
  const location = useLocation();

  const [clinicName, setClinicName] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [helpAnchor, setHelpAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const clinic = localStorage.getItem('clinic');
    if (clinic) setClinicName(JSON.parse(clinic).name);
  }, []);

  const pathnames = location.pathname.split('/').filter(Boolean);

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#FAFAFA', borderRadius: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, py: 1.5 }}>

        {/* LEFT */}
        <Breadcrumbs>
          <Typography 
          sx={{ color: '#666666', fontFamily:'montserrat', 
                fontWeight:'500', fontSize:'16px' }}>
            Quality Control
          </Typography>
          {pathnames.map((path) => (
            <Typography key={path} 
            sx={{ textTransform: 'capitalize', 
            fontWeight: '700', 
            fontSize: '18px',
            fontFamily:'montserrat',
            color: '#232323' }}>
              {path}
            </Typography>
          ))}
        </Breadcrumbs>

        {/* RIGHT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          <Typography variant="body2" 
          sx={{ color: '#232323', 
          fontWeight: '500', 
          fontFamily:'nunito', 
          fontSize:'16px' }}>
            Clinic: {clinicName || '—'}
          </Typography>

          {/* CALENDAR */}
          <IconButton
  onClick={(e) => setCalendarAnchor(e.currentTarget)}
  sx={{
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  }}
>
  <Box component="img" src={CalendarIcon} width={24} />
</IconButton>


          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <MenuItem>Today</MenuItem>
            <MenuItem>Last 7 Days</MenuItem>
            <MenuItem>Last 30 Days</MenuItem>
            <MenuItem>Custom Range</MenuItem>
          </Popover>

          {/* NOTIFICATIONS */}
          <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)}
            sx={{
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  }}>  
            <Box component="img" src={NotificationIcon} width={24} />
          </IconButton>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
          >
            <MenuItem>🔔 Equipment calibration due</MenuItem>
            <MenuItem>⚠️ Environmental limit exceeded</MenuItem>
            <MenuItem>📝 QC record pending approval</MenuItem>
          </Menu>

          {/* HELP */}
          <IconButton onClick={(e) => setHelpAnchor(e.currentTarget)}
            sx={{
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  }}>
            <Box component="img" src={MessageQuestionIcon} width={24} />
          </IconButton>

          <Menu anchorEl={helpAnchor} open={Boolean(helpAnchor)} onClose={() => setHelpAnchor(null)}>
            <MenuItem>Help Center</MenuItem>
            <MenuItem>User Guide</MenuItem>
            <MenuItem>Contact Support</MenuItem>
          </Menu>

          {/* USER */}
          <Box
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }}
          >
            <Box component="img" src={UserAvatarIcon} width={36} />
            <Box>
              <Typography 
                          sx={{
                fontSize: '14px',
                color: '#232323',
                fontWeight: 700,
                lineHeight: '20px',
                letterSpacing: '0px',
                fontFamily: 'Nunito',
              }}>Kate Russell</Typography>

              <Typography 
              sx={{fontSize:"14px" ,
              fontWeight:'400',
              lineHeight:'18px',
              letterSpacing:'0px',
              color:'#9E9E9E',
              fontFamily:'noto sans'}}>Receptionist</Typography>

            </Box>
            <KeyboardArrowDownIcon
  sx={{
    fontSize: 22,
    color: '#232323',
    display: { xs: 'none', sm: 'block' },
  }}
/>

          </Box>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
          >
            <MenuItem>Profile</MenuItem>
            <MenuItem>Change Password</MenuItem>
            <MenuItem>Switch Clinic</MenuItem>
            <Divider />
            <MenuItem sx={{ color: 'red' }}>Logout</MenuItem>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
