import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldTickIcon from "../../assets/icons/shield-tick.svg";
import BriefcaseIcon from "../../assets/icons/brifecase-tick.svg";
import ReceiptSearch from "../../assets/icons/receipt-search.svg";
import TickmarkCircle from "../../assets/icons/Tick-mark-circle.svg";
import SecuritySafe from "../../assets/icons/security-safe.svg";
<<<<<<< Updated upstream
import ClinicLogo from "../../assets/icons/Clinic-Logo.svg";
import VidaiLogo from "../../assets/icons/Vidai-logo.svg";
import UpdatedVersionIcon from "../../assets/icons/Updated_Version.svg";
import DashboardCardBg from "../../assets/icons/dashboard_card_bg.svg";
import SubtractBg from "../../assets/icons/Subtract.svg";
=======
import ClinicLogo from "../../assets/icons/Clinic Logo.svg";
import VidaiLogo from "../../assets/icons/Vidai-logo.svg";
import UpdatedVersionIcon from "../../assets/icons/Updated Version _ 2.0.svg";
>>>>>>> Stashed changes

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Card,
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

<<<<<<< Updated upstream
=======
  // ✏️ ADDED: State to track which icon is selected (0, 1, 2, or 3)
>>>>>>> Stashed changes
  const [selectedIcon, setSelectedIcon] = useState(0);

  const menuItems = getMenuItems(currentView);

<<<<<<< Updated upstream
  const handleIconClick = (iconIndex: number) => {
    setSelectedIcon(iconIndex);
=======
  // ✏️ ADDED: Function to handle icon clicks
  const handleIconClick = (iconIndex: number) => {
    setSelectedIcon(iconIndex);
    // You can add navigation logic here if each icon should navigate somewhere
    // For example: navigate('/some-path');
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      {/* Logo at Top */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
=======
      {/* Logo at Top (replaced with Clinic Logo) */}
      <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center' }}>
>>>>>>> Stashed changes
        <img
          src={ClinicLogo}
          alt="Clinic Logo"
          style={{
<<<<<<< Updated upstream
            width: '80%',
            maxWidth: 134,
            height: 'auto',
=======
            width: 134,
            height: 46,
>>>>>>> Stashed changes
            transform: 'rotate(0deg)',
            opacity: 1,
            objectFit: 'contain',
            display: 'block',
<<<<<<< Updated upstream
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
      <Box sx={{ pr: { xs: 4, sm: 4.5, md: 5 } }}>
      <div>
        <Box sx={{
          maxWidth: { xs: 250, sm: 270, md: 282 },
          width: "105%",
          height: { xs: 'auto', sm: 450, md: 520 },
          maxHeight: { xs: 'calc(100vh - 250px)', sm: 'calc(100vh - 220px)' },
          backgroundColor: '#FFFFFF',
          position: 'relative',
          mt: 1,
          mr: 2,
          ml: 2,
          mb: 2, 
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0px 0px 14px 0px #0000000F',
          p: { xs: 2, sm: 2.5, md: 3 },
          pt: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          transform: 'rotate(0deg)',
          opacity: 1,
        }}>
            <Box sx={{ px: 0, pt: 0, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start', pl: 0, ml: -1.5 }}>
    
    {/* Logo Circle for Quality Control */}
<Box
  sx={{
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "felxstart",
    ml:'0',
    flexShrink: 0
  }}
>
  <img
    src={ShieldTickIcon}
    alt="Shield Tick Icon"
    style={{
      width: "28px",
      height: "28px",
      objectFit: "contain",
    }}
  />
</Box>


    {/* Quality Control Title */}
    <Typography
      sx={{
        transform: 'none',
        opacity: 1,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontStyle: 'normal',
        fontSize: { xs: '15px', sm: '16px', md: '17px' },
        lineHeight: '24px',
        letterSpacing: '0',
        color: '#E17E61',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
          <List sx={{ pt: 0, flex: 1, px: { xs: 1.5, sm: 2 }, overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path.split('?')[0]) && item.path.includes('?'));

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: '10px' }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: { xs: '100%', sm: 194 },
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      px: { xs: 1.5, sm: 2 },
                      py: '8px',
                      borderRadius: 1,
                      backgroundColor: 'transparent',
                      boxSizing: 'border-box',
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: { xs: '14px', sm: '15px', md: '16px' },
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? '#111827' : '#9ca3af',
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
              left: 0,
              right: 0,
              bottom: 70,
              width: '80%',
              height: 'auto',
              pointerEvents: 'none',
              opacity: 4,
              zIndex: 0,
              color:'#E17E61'
            }}
          />

          {/* Bottom Section with VIDAI Logo */}
          <Box sx={{ p: 2, mt: 'auto', position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.375,
              }}
            >
             
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={VidaiLogo}
                  alt="VIDAI Logo"
                  style={{
                    width: '80%',
                    maxWidth: 163,
                    height: 'auto',
                    transform: 'rotate(0deg)',
                    opacity: 1,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: 160, sm: 180, md: 190 },
                  height: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pl: { xs: 1.5, sm: 2 },
                  transform: 'rotate(0deg)',
                  opacity: 1,
                  borderRadius: 1,
                  ml: { xs: '20px', sm: '24px', md: '28px' },
                }}
              >
                <img
                  src={UpdatedVersionIcon}
                  alt="Updated Version 2.0"
                  style={{
                    width: '100%',
                    maxWidth: 124,
                    height: 15,
                    transform: 'rotate(0deg)',
                    opacity: 1,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
      </Box>
=======
          }}
        />
      </Box>

      {/* ✏️ MODIFIED: Icon Row - Now with clickable selection behavior */}
      <Card
          sx={{
    p: 1,
    mx: 1,
    mt: 1,
    mb: 1,
    borderRadius: 2,
    // requested box-shadow
    boxShadow: '0px 0px 14px 0px #0000000F',
    position: 'relative',
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 56,
    minHeight: 50,
    flexShrink: 0,
    overflow: "hidden",
    opacity: 1,
  }}
      >
        <Box
          sx={{
            position: 'relative',
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            pl: 1.5,
            pr: 1,
            gap: 1.5,
          }}
        >
          {/* ✏️ MODIFIED: Icon 1 - Shield with checkmark */}
          <IconButton
            size="small"
            onClick={() => handleIconClick(0)}
            sx={{
              p: 0.5,
              position: 'relative',
              width: 40,
              height: 40,
              backgroundColor: 'transparent',
              color: selectedIcon === 0 ? '#E17E61' : '#6b7280',
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              transition: 'none',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <img
              src={TickmarkCircle}
              alt="tick mark"
              style={{
                width: 36,
                height: 36,
                objectFit: 'contain',
                display: 'block',
                opacity: 1,
                transform: 'none',
              }}
            />
          </IconButton>

          {/* ✏️ MODIFIED: Icon 2 - Work/Briefcase */}
          <IconButton
            size="small"
            onClick={() => handleIconClick(1)}
            sx={{
              p: 0.5,
              position: 'relative',
              width: 40,
              height: 40,
              backgroundColor: 'transparent',
              color: selectedIcon === 1 ? '#E17E61' : '#6b7280',
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              transition: 'none',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <img src={BriefcaseIcon} alt="briefcase" style={{ width: 20, height: 20, objectFit: 'contain', opacity: 1 }} />
          </IconButton>

          {/* ✏️ MODIFIED: Icon 3 - Security Safe */}
          <IconButton
            size="small"
            onClick={() => handleIconClick(2)}
            sx={{
              p: 0.5,
              position: 'relative',
              width: 40,
              height: 40,
              backgroundColor: 'transparent',
              color: selectedIcon === 2 ? '#E17E61' : '#6b7280',
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              transition: 'none',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <img src={SecuritySafe} alt="security safe" style={{ width: 20, height: 20, objectFit: 'contain', opacity: 1 }} />
          </IconButton>

          {/* ✏️ MODIFIED: Icon 4 - Description/Document */}
          <IconButton
            size="small"
            onClick={() => handleIconClick(3)}
            sx={{
              p: 0.5,
              position: 'relative',
              width: 40,
              height: 40,
              backgroundColor: 'transparent',
              color: selectedIcon === 3 ? '#E17E61' : '#6b7280',
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              transition: 'none',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <img src={ReceiptSearch} alt="receipt search" style={{ width: 20, height: 20, objectFit: 'contain', opacity: 1 }} />
          </IconButton>
        </Box>
      </Card>

      {/* Quality Control Heading */}
      <div>
        <Box sx={{
          width: 282,
          height: 898,
          backgroundColor: '#FFFFFF',
          mx: 1,
          mt: 1,
          borderRadius: '20px',
          // Use transparent border with gradient source for border-image
          border: '1px solid transparent',
          borderImageSource: 'linear-gradient(174.5deg, rgba(228, 228, 228, 0) -0.5%, #EEEEEE 100%)',
          borderImageSlice: 1,
          boxShadow: '0px 0px 14px 0px #0000000F',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          transform: 'rotate(0deg)',
          opacity: 1,
        }}>
            <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    
    {/* Logo Circle (bigger & centered like your screenshot) */}
<Box
  sx={{
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    
  }}
>
  <img
    src={ShieldTickIcon}
    alt="Shield Tick Icon"
    style={{
      width: "28px",
      height: "28px",
      objectFit: "contain",
      

    }}
  />
</Box>


    {/* Title in single horizontal line */}
    <Typography
      sx={{
        transform: 'none',
        opacity: 1,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontStyle: 'normal',
        fontSize: '20px',
        lineHeight: '24px',
        letterSpacing: '0',
        color: '#E17E61',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        ml: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      Quality Control
    </Typography>

  </Box>
</Box>

          {/* Navigation Menu - Simple text, active in black */}
          <List sx={{ pt: 0, flex: 1, px: 2 }}>
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path.split('?')[0]) && item.path.includes('?'));

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.125 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      px: 2,
                      py: 1.25,
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
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? '#111827' : '#9ca3af',
                        letterSpacing: '-0.01em',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Bottom Section with VIDAI Logo */}
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.375,
              }}
            >
             
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={VidaiLogo}
                  alt="VIDAI Logo"
                  style={{
                    width: 163.00006103515625,
                    height: 51.643035888671875,
                    transform: 'rotate(0deg)',
                    opacity: 1,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 124,
                  height: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(0deg)',
                  opacity: 1,
                  borderRadius: 1,
                }}
              >
                <img
                  src={UpdatedVersionIcon}
                  alt="Updated Version 2.0"
                  style={{
                    width: 124,
                    height: 15,
                    transform: 'rotate(0deg)',
                    opacity: 1,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
>>>>>>> Stashed changes
    </Drawer>
  );
};

export default Sidebar;