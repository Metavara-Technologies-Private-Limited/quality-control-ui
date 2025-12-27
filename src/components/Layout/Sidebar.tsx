import { useNavigate, useLocation } from 'react-router-dom';
import ClinicLogo from '../../assets/icons/Clinic-Logo.svg';
import VidaiLogo from '../../assets/icons/Vidai-logo.svg';
import UpdatedVersionIcon from '../../assets/icons/Updated_Version.svg';
import DashboardCardBg from '../../assets/icons/dashboard_card_bg.svg';
import SubtractBg from '../../assets/icons/Subtract.svg';
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
import { SIDEBAR_TABS } from '@/config/sidebar.config';
import { useTab } from '@/utils/tabContext';

const NAV_ICON_SIZE = 18;

const ICON_POSITIONS = [-9, 45, 103, 154];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentView } = useView();
  const { activeTabIndex, setActiveTabIndex } = useTab();
  

  const activeTab = SIDEBAR_TABS.find(
    (tab) => tab.iconIndex === activeTabIndex && tab.views.includes(currentView)
  );

  const menuItems =
    activeTab?.menu.filter((item) => item.views.includes(currentView)) ?? [];
  const visibleTabs = SIDEBAR_TABS.filter((tab) =>
    tab.views.includes(currentView)
  );

  const handleIconClick = (iconIndex: number) => setActiveTabIndex(iconIndex);

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: { xs: 240, sm: 240, md: 240 },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: 240, sm: 240, md: 240 },
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
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={ClinicLogo}
          alt='Clinic Logo'
          style={{
            width: '80%',
            maxWidth: 134,
            height: 'auto',
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
          component='img'
          src={SubtractBg}
          alt='card background'
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
            userSelect: 'none',
            left: `${ICON_POSITIONS[activeTabIndex]}px`,
            transition: 'left 200ms ease',
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
          {visibleTabs.map((tab) => {
            const isActive = activeTabIndex === tab.iconIndex;

            return (
              <Box
                key={tab.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: isActive ? -1.5 : 0,
                  transition: 'margin-top 120ms ease',
                }}
              >
                <IconButton
                  size='small'
                  onClick={() => handleIconClick(tab.iconIndex)}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Box
                    sx={{
                      width: NAV_ICON_SIZE,
                      height: NAV_ICON_SIZE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isActive ? 'scale(1.25)' : 'scale(1)',
                      transition: 'transform 120ms ease',
                    }}
                  >
                    <img
                      src={tab.icon.src}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `scale(${tab.icon.baseScale})`,
                      }}
                    />
                  </Box>
                </IconButton>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Quality Control Heading and Menu Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
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
          }}
        >
          <Box sx={{ px: 0, pt: 0, pb: { xs: 0.5, sm: 1 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                justifyContent: 'flex-start',
                pl: 0,
                ml: { xs: -1, sm: -1.5 },
              }}
            >
              {/* Logo Circle for Quality Control */}
              <Box
                sx={{
                  width: { xs: 28, sm: 30, md: 32 },
                  height: { xs: 28, sm: 30, md: 32 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  ml: 0,
                  flexShrink: 0,
                }}
              >
                {activeTab?.icon && (
                  <img
                    src={activeTab.icon.src}
                    alt={`${activeTab.label} icon`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>

              {/* Quality Control Title */}
              <Typography
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '14px', sm: '15px', md: '16px', lg: '17px' },
                  lineHeight: 1.4,
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
                {activeTab?.label}
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <List
            sx={{
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
            }}
          >
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path.split('?')[0]) &&
                  item.path.includes('?'));

              return (
                <ListItem
                  key={item.label}
                  disablePadding
                  sx={{ mb: { xs: '6px', sm: '8px', md: '10px' } }}
                >
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
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: {
                          xs: '13px',
                          sm: '14px',
                          md: '15px',
                          lg: '16px',
                        },
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
            component='img'
            src={DashboardCardBg}
            alt='dashboard background'
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
          <Box
            sx={{
              p: { xs: 1, sm: 1.5, md: 2 },
              mt: 'auto',
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 0.25, sm: 0.375 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <img
                  src={VidaiLogo}
                  alt='VIDAI Logo'
                  style={{
                    width: '70%',
                    maxWidth: 163,
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 1, sm: 1.5, md: 2 },
                }}
              >
                <img
                  src={UpdatedVersionIcon}
                  alt='Updated Version 2.0'
                  style={{
                    width: '60%',
                    maxWidth: 124,
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
