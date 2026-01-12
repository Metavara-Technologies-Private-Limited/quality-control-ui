import React, { useState, useEffect  } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Tooltip from '@mui/material/Tooltip';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Tabs, Tab, TextField, InputAdornment, 
  Typography, Avatar, AvatarGroup, IconButton, InputBase 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const avatarColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#607D8B',
];

// Stable color based on name (same person → same color)
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};


const AndrologyLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const allAssignees = useSelector(
  (state: RootState) => state.assignees.data
);
const [searchText, setSearchText] = useState('');
const [showMiniSearch, setShowMiniSearch] = useState(false); // Toggle for small search
const [assigneeSearch, setAssigneeSearch] = useState('');
const [maxAvatars, setMaxAvatars] = useState(4); // Default to 5
const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null);

const filteredAssignees = allAssignees;
const miniFilteredAssignees = allAssignees.filter(a =>
  a.emp_name
    .toLowerCase()
    .startsWith(assigneeSearch.toLowerCase())
);


  // --- NEW STATE FOR INTERACTION ---

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
          <Box sx={{ position: 'relative' }}>
  <TextField
    size="small"
    placeholder="Search for equipments"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    sx={{
      width: '300px',
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

  {/* 🔽 ASSIGNEE DROPDOWN */}
</Box>



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
              {filteredAssignees.map((person) => (
<Tooltip key={person.id} title={person.emp_name} arrow>
  <Avatar sx={{ backgroundColor: getAvatarColor(person.emp_name), color: '#fff' }}>
    {person.emp_name.charAt(0).toUpperCase()}
  </Avatar>
</Tooltip>

))}

            </AvatarGroup>

            {/* NEW: MINI SEARCH TOGGLE */}
            {showMiniSearch ? (
  <Box sx={{ position: 'relative' }}>
    {/* MINI INPUT */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        px: 1,
        height: 32,
        backgroundColor: '#fff'
      }}
    >
      <InputBase
        placeholder="Find assignee..."
        value={assigneeSearch}
        onChange={(e) => setAssigneeSearch(e.target.value)}
        sx={{ fontSize: 12, width: 100 }}
        autoFocus
      />
      <IconButton
        size="small"
        onClick={() => {
          setShowMiniSearch(false);
          setAssigneeSearch('');
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>

    {/* 🔽 ASSIGNEE DROPDOWN */}
    <Box
      sx={{
        position: 'absolute',
        top: '36px',
        right: 0,
        width: '180px',
        maxHeight: '120px',   // 3 items
        overflowY: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        zIndex: 30,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {(assigneeSearch ? miniFilteredAssignees : allAssignees).map(person => (
        <Box
          key={person.id}
          onClick={() => {
  setSelectedAssigneeId(person.id);
  setShowMiniSearch(false);
  setAssigneeSearch('');
}}

          sx={{
            px: 1.5,
            py: 0.8,
            cursor: 'pointer',
            '&:hover': { backgroundColor: '#F8F8F8' }
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
            {person.emp_name}
          </Typography>
        </Box>
      ))}

      {(assigneeSearch ? miniFilteredAssignees : allAssignees).length === 0 && (
        <Typography sx={{ px: 1.5, py: 1, fontSize: 11, color: '#9E9E9E' }}>
          No assignees found
        </Typography>
      )}
    </Box>
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
        <Outlet context={{ selectedAssigneeId }} />

      </Box>
    </Box>
  );
};

export default AndrologyLayout;