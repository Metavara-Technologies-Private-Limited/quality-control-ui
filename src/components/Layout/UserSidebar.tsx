import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  PrecisionManufacturing,
  People,
  Settings,
  Assessment,
  History,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Quality Control', icon: <CheckCircle />, path: '/dashboard' },
  { text: 'Equipments', icon: <PrecisionManufacturing />, path: '/user-configuration' },
  { text: 'User Management', icon: <People />, path: '/user-configuration?tab=1' },
  { text: 'Configuration', icon: <Settings />, path: '/user-configuration?tab=2' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Audit Trail', icon: <History />, path: '/audit-trail' },
];

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      return location.pathname === basePath;
    }
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircle sx={{ color: '#14b8a6', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              color: '#111827',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Quality Control
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.path.includes('?')) {
                    const [basePath, query] = item.path.split('?');
                    navigate(basePath);
                    // Handle tab switching if needed
                    setTimeout(() => {
                      const tab = query.split('=')[1];
                      if (tab) {
                        // You can use state or URL params to switch tabs
                        window.location.hash = `tab=${tab}`;
                      }
                    }, 100);
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: active ? '#ecfdf5' : 'transparent',
                  color: active ? '#14b8a6' : '#6b7280',
                  '&:hover': {
                    backgroundColor: active ? '#ecfdf5' : '#f9fafb',
                  },
                  '& .MuiListItemIcon-root': {
                    color: active ? '#14b8a6' : '#6b7280',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #e5e7eb' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#14b8a6',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            VIDAI AI-Powered EMR
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontSize: '0.7rem',
            }}
          >
            Updated Version: 2.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;

