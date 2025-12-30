import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Tabs, Tab, TextField, InputAdornment, 
  Typography, Avatar, AvatarGroup, IconButton, InputBase 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const EmbryologyLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- NEW STATE FOR INTERACTION ---
  const [maxAvatars, setMaxAvatars] = useState(5); // Default to 5
  const [showMiniSearch, setShowMiniSearch] = useState(false); // Toggle for small search

  // Mock data for the avatars
  const assignees = [
    { name: 'U1', src: 'https://i.pravatar.cc/150?u=1' },
    { name: 'U2', src: 'https://i.pravatar.cc/150?u=2' },
    { name: 'U3', src: 'https://i.pravatar.cc/150?u=3' },
    { name: 'U4', src: 'https://i.pravatar.cc/150?u=4' },
    { name: 'U5', src: 'https://i.pravatar.cc/150?u=5' },
    { name: 'U6', src: 'https://i.pravatar.cc/150?u=6' },
    { name: 'U7', src: 'https://i.pravatar.cc/150?u=7' },
    { name: 'U8', src: 'https://i.pravatar.cc/150?u=8' },
  ];

  const getActiveTab = () => {
    if (location.pathname.includes('/equipments')) return 'equipments';
    if (location.pathname.includes('/environment')) return 'environment';
    return 'task';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (_: any, value: string) => {
    navigate(value);
  };

  return (
    <Box>
      {/* ===== HEADER ROW (EXISTING STRUCTURE) ===== */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
          mx: -3, px: 3
        }}
      >
        {/* ===== TABS (UNCHANGED) ===== */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          TabIndicatorProps={{ sx: { backgroundColor: '#E17E61', height: '1px' } }}
          sx={{
            minHeight: 30,
            '& .MuiTabs-flexContainer': {
              gap: 6, 
            },
          }}
        >
          {['equipments', 'environment', 'task'].map(tab => (
            <Tab
              key={tab}
              value={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              sx={{
                textTransform: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: '#9E9E9E',
                minHeight: 44,
                padding: 0,
                '&.Mui-selected': {
                  color: '#232323', fontWeight: 700
                },
              }}
            />
          ))}
        </Tabs>

        {/* ===== MODIFIED RIGHT SIDE (ADAPTED FOR AVATARS) ===== */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          
          {/* SEARCH BAR (YOUR EXISTING COMPONENT) */}
          <TextField
            size="small"
            placeholder="Search"
            sx={{
              width: '300px', // Adjusted slightly to fit avatars
              '& .MuiOutlinedInput-root': { borderRadius: '10px' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* NEW: ASSIGNEES SECTION */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#232323' }}>
              Assignees
            </Typography>
            
            <AvatarGroup 
              max={maxAvatars} 
              componentsProps={{ 
                additionalAvatar: { 
                  onClick: () => setMaxAvatars(8), // Clicking +3 expands the group
                  sx: { cursor: 'pointer' } 
                } 
              }}
              sx={{ 
                '& .MuiAvatar-root': { 
                  width: 30, 
                  height: 30, 
                  fontSize: 12,
                  border: '2px solid #fff' 
                } 
              }}
            >
              {assignees.map((person, index) => (
                <Avatar key={index} src={person.src} />
              ))}
            </AvatarGroup>

            {/* NEW: MINI SEARCH TOGGLE */}
            {showMiniSearch ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px', 
                  px: 1, 
                  height: 32 
                }}
              >
                <InputBase 
                  placeholder="Find..." 
                  sx={{ fontSize: 12, width: 80 }} 
                  autoFocus 
                />
                <IconButton size="small" onClick={() => setShowMiniSearch(false)}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ) : (
              <IconButton 
                size="small" 
                onClick={() => setShowMiniSearch(true)}
                sx={{ 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  width: 32,
                  height: 32
                }}
              >
                <SearchIcon sx={{ fontSize: 18, color: '#232323' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* ===== CONTENT (UNCHANGED) ===== */}
      <Box mt={3}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default EmbryologyLayout;