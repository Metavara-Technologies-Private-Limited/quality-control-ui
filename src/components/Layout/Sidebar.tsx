import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldTickIcon from "../../assets/icons/shield-tick.svg";
import BriefcaseIcon from "../../assets/icons/brifecase-tick.svg";
import ReceiptSearch from "../../assets/icons/receipt-search.svg";
import TickmarkCircle from "../../assets/icons/Tick-mark-circle.svg";
import SecuritySafe from "../../assets/icons/security-safe.svg";
import ClinicLogo from "../../assets/icons/Clinic-Logo.svg";
import VidaiLogo from "../../assets/icons/Vidai-logo.svg";
import UpdatedVersionIcon from "../../assets/icons/Updated_Version.svg";
import DashboardCardBg from "../../assets/icons/dashboard_card_bg.svg";
import SubtractBg from "../../assets/icons/Subtract.svg";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  IconButton,
} from '@mui/material';

import { useView } from '@/utils/viewContext';

// Responsive drawer width
const getDrawerWidth = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 600) return 200; // xs
    if (window.innerWidth < 900) return 220; // sm
    return 240; // md and up
  }
  return 240;
};

const drawerWidth = getDrawerWidth();

const getMenuItems = (view: 'technician' | 'admin' | 'user') => {
  switch (view) {
    case 'admin':
      return [
        { text: 'Dashboard', path: '/admin-dashboard' },
        { text: 'Clinical', path: '/clinical' },
        { text: 'Lab', path: '/lab' },
        { text: 'Reports', path: '/reports' },
        { text: 'Configuration', path: '/configuration' },
      ];
    case 'user':
      return [
        { text: 'Dashboard', path: '/dashboard' },
        { text: 'Configuration', path: '/user-configuration' },
      ];
    case 'technician':
    default:
      return [
        { text: 'Dashboard', path: '/dashboard' },
        { text: 'Clinical', path: '/clinical' },
        { text: 'Lab', path: '/lab' },
        { text: 'Reports', path: '/reports' },
        { text: 'Configuration', path: '/configuration' },
      ];
  }
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentView } = useView();

  const [selectedIcon, setSelectedIcon] = useState(0);

  const menuItems = getMenuItems(currentView);

  const handleIconClick = (iconIndex: number) => {
    setSelectedIcon(iconIndex);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 200, sm: 220, md: drawerWidth },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: 200, sm: 220, md: drawerWidth },
          boxSizing: 'border-box',
         backgroundColor: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: 'none',
          borderRight: 'none',
          outline: 'none',
        },
      }}
    >
      {/* Logo at Top */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
        <img
          src={ClinicLogo}
          alt="Clinic Logo"
          style={{
            width: '134px',
            maxWidth: '134',
            height: '46px',
            opacity: 1,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* Icon Row using Subtract SVG as the card */}
      <Box
        sx={{
          position: 'relative',
          width: 'calc(100% - 16px)',
          maxWidth: { xs: 250, sm: 270, md: 282 },
          height: 56,
          ml: 1,
          mr: 1,
          mt: 1,
          mb: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={SubtractBg}
          alt="card background"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pl: 1.5,
            pr: 1,
            gap: 1.5,
          }}
        >
          {/* Icon 1 - Shield with checkmark (Positioned in curved area) */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: selectedIcon === 0 ? 1 : 0,
              ml: selectedIcon === 0 ? 1.7 : 0,
              transition: 'margin-top 120ms ease',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleIconClick(0)}
              sx={{
                p: 0.5,
                position: 'relative',
                zIndex: 1,
                width: selectedIcon === 0 ? 36 : 40,
                height: selectedIcon === 0 ? 36 : 40,
                backgroundColor: 'transparent',
                color: selectedIcon === 0 ? '#E17E61' : '#6b7280',
                borderRadius: '50%',
                border: 'none',
                boxShadow: 'none',
                transition: 'width 120ms ease, height 120ms ease, color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              <img
                src={TickmarkCircle}
                alt="tick mark"
                style={{
                  width: selectedIcon === 0 ? 36 : 24,
                  height: selectedIcon === 0 ? 36 : 24,
                  objectFit: 'contain',
                  transition: 'width 120ms ease, height 120ms ease',
                }}
              />
            </IconButton>
          </Box>

          {/* Icon 2 - Work/Briefcase */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: selectedIcon === 1 ? -1.5 : 0,
              transition: 'margin-top 120ms ease',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleIconClick(1)}
              sx={{
                p: 0.5,
                position: 'relative',
                zIndex: 1,
                width: selectedIcon === 1 ? 48 : 40,
                height: selectedIcon === 1 ? 48 : 40,
                backgroundColor: 'transparent',
                color: selectedIcon === 1 ? '#E17E61' : '#6b7280',
                borderRadius: '50%',
                border: 'none',
                boxShadow: 'none',
                transition: 'width 120ms ease, height 120ms ease, color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              <img
                src={BriefcaseIcon}
                alt="briefcase"
                style={{
                  width: selectedIcon === 1 ? 28 : 20,
                  height: selectedIcon === 1 ? 28 : 20,
                  objectFit: 'contain',
                  transition: 'width 120ms ease, height 120ms ease',
                }}
              />
            </IconButton>
          </Box>

          {/* Icon 3 - Security Safe */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: selectedIcon === 2 ? -1.5 : 0,
              transition: 'margin-top 120ms ease',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleIconClick(2)}
              sx={{
                p: 0.5,
                position: 'relative',
                zIndex: 1,
                width: selectedIcon === 2 ? 48 : 40,
                height: selectedIcon === 2 ? 48 : 40,
                backgroundColor: 'transparent',
                color: selectedIcon === 2 ? '#E17E61' : '#6b7280',
                borderRadius: '50%',
                border: 'none',
                boxShadow: 'none',
                transition: 'width 120ms ease, height 120ms ease, color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              <img
                src={SecuritySafe}
                alt="security safe"
                style={{
                  width: selectedIcon === 2 ? 28 : 20,
                  height: selectedIcon === 2 ? 28 : 20,
                  objectFit: 'contain',
                  transition: 'width 120ms ease, height 120ms ease',
                }}
              />
            </IconButton>
          </Box>

          {/* Icon 4 - Description/Document */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: selectedIcon === 3 ? -1.5 : 0,
              transition: 'margin-top 120ms ease',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleIconClick(3)}
              sx={{
                p: 0.5,
                position: 'relative',
                zIndex: 1,
                width: selectedIcon === 3 ? 48 : 40,
                height: selectedIcon === 3 ? 48 : 40,
                backgroundColor: 'transparent',
                color: selectedIcon === 3 ? '#E17E61' : '#6b7280',
                borderRadius: '50%',
                border: 'none',
                boxShadow: 'none',
                transition: 'width 120ms ease, height 120ms ease, color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              <img
                src={ReceiptSearch}
                alt="receipt search"
                style={{
                  width: selectedIcon === 3 ? 28 : 20,
                  height: selectedIcon === 3 ? 28 : 20,
                  objectFit: 'contain',
                  transition: 'width 120ms ease, height 120ms ease',
                }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Quality Control Heading and Menu Container */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        px: { xs: 1, sm: 1.5, md: 2 },
        overflow: 'hidden',
      }}>
        <Box sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          backgroundColor: '#FFFFFF',
          position: 'relative',
          mt: 1,
          mb: 2, 
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0px 0px 14px 0px #0000000F',
          p: { xs: 1.5, sm: 2, md: 2.5 },
          pt: { xs: 1.5, sm: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
            <Box sx={{ px: 0, pt: 0, pb: { xs: 0.5, sm: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, justifyContent: 'flex-start', pl: 0, ml: { xs: -1, sm: -1.5 } }}>
    
    {/* Logo Circle for Quality Control */}
<Box
  sx={{
    width: { xs: 28, sm: 30, md: 32 },
    height: { xs: 28, sm: 30, md: 32 },
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    ml: 0,
    flexShrink: 0
  }}
>
  <img
    src={ShieldTickIcon}
    alt="Shield Tick Icon"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />
</Box>


    {/* Quality Control Title */}
    <Typography
      sx={{
        fontFamily: 'sans-serif',
        fontWeight: 700,
        fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' },
        lineHeight: '100%',
        color: '#E17E61',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        ml: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      Quality Control
    </Typography>

  </Box>
</Box>

          {/* Navigation Menu */}
          <List sx={{ 
            pt: 0, 
            flex: 1, 
            px: { xs: 0.5, sm: 1, md: 1.5 }, 
            overflowY: 'auto',
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#E0E0E0',
              borderRadius: '4px',
            },
          }}>
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path.split('?')[0]) && item.path.includes('?'));

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: { xs: '6px', sm: '8px', md: '10px' } }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: '100%',
                      height: { xs: 32, sm: 34, md: 36 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      px: { xs: 1, sm: 1.5, md: 2 },
                      py: { xs: '6px', sm: '7px', md: '8px' },
                      borderRadius: 1,
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: { xs: '13px', sm: '14px', md: '15px', lg: '16px' },
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: 'sans-serif',
                        color: isActive ? '#232323' : '#9E9E9E',
                        letterSpacing: '-0.01em',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Decorative background SVG placed above the VIDAI logo */}
          <Box
            component="img"
            src={DashboardCardBg}
            alt="dashboard background"
            sx={{
              position: 'absolute',
              bottom: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: 'auto',
              opacity: 2,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Bottom Section with VIDAI Logo */}
          <Box sx={{ 
            p: { xs: 1, sm: 1.5, md: 2 }, 
            mt: 'auto', 
            position: 'relative', 
            zIndex: 1,
            flexShrink: 0,
          }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 0.25, sm: 0.375 },
              }}
            >
             
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <img
                  src={VidaiLogo}
                  alt="VIDAI Logo"
                  style={{
                    width: '70%',
                    maxWidth: 163,
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography sx={{
                fontSize: { xs: '10px', sm: '11px', md: '12px' },
                fontWeight: 500,
                fontFamily: 'Inter',
                color: '#CFD1D4',
                letterSpacing: '-0.01em',  
              }}>
                Updated Version 2.0
              </Typography>
                
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
