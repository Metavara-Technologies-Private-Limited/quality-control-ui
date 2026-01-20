import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Tooltip from '@mui/material/Tooltip';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Tabs, Tab, TextField, InputAdornment,
  Typography, Avatar, AvatarGroup,
  Popover, List, ListItem, ListItemAvatar, ListItemText, Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const avatarColors = [
  '#FF5630', '#FF7452', '#FF8B00', '#FFC400',
  '#36B37E', '#00B8D9', '#2684FF', '#6554C0',
  '#8777D9', '#998DD9', '#0052CC', '#172B4D',
  '#42526E', '#6B778C', '#091E42',
];


const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const EmbryologyLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const allAssignees = useSelector((state: RootState) => state.assignees.data);

  const [searchText, setSearchText] = useState('');

  //  MULTI-SELECT STATE (same as Andrology)
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<number[]>([]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleToggleAssignee = (id: number) => {
    setSelectedAssigneeIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
          mx: -3,
          px: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          TabIndicatorProps={{ sx: { backgroundColor: '#E17E61', height: '1px' } }}
          sx={{ minHeight: 30, '& .MuiTabs-flexContainer': { gap: 6 } }}
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
                '&.Mui-selected': { color: '#232323', fontWeight: 700 },
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <TextField
            size="small"
            placeholder="Search for equipments"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              Assignees
            </Typography>

            <AvatarGroup
              max={5}
              componentsProps={{
                additionalAvatar: {
                  onClick: handleOpenPopover,
                  sx: { cursor: 'pointer' },
                },
              }}
              sx={{
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  border: '2px solid #fff',
                  cursor: 'pointer',
                },
              }}
            >
              {allAssignees.map(person => {
                const isSelected = selectedAssigneeIds.includes(person.id);
                return (
                  <Tooltip
                    key={person.id}
                    title={person.emp_name}
                    arrow
                    placement="bottom"
                  >
                    <Avatar
                      onClick={() => handleToggleAssignee(person.id)}
                      sx={{
                        backgroundColor: getAvatarColor(person.emp_name),
                        outline: isSelected ? '2px solid #0052CC' : 'none',
                        outlineOffset: '2px',
                        opacity:
                          selectedAssigneeIds.length > 0 && !isSelected
                            ? 0.5
                            : 1,
                      }}
                    >
                      {person.emp_name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </AvatarGroup>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  width: 300,
                  maxHeight: 450,
                  borderRadius: '8px',
                  mt: 1,
                },
              }}
            >
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <List dense>
                  {allAssignees.map(person => {
                    const isSelected = selectedAssigneeIds.includes(person.id);
                    return (
                      <ListItem
  key={person.id}
  button
  onClick={() => handleToggleAssignee(person.id)}
  sx={{
    px: 2,
    py: 1,
    backgroundColor: isSelected ? '#E9F2FF' : 'transparent',
    '&:hover': {
      backgroundColor: isSelected ? '#DEEBFF' : '#F4F5F7',
    },
  }}
>
  <Checkbox
    size="small"
    checked={isSelected}
    sx={{
      mr: 1,
      p: 0,
      color: '#C1C7D0', // unchecked
      '&.Mui-checked': {
        color: '#0052CC', // blue checkbox ✔
      },
    }}
  />

  <ListItemAvatar sx={{ minWidth: 36 }}>
    <Avatar
      sx={{
        width: 28,
        height: 28,
        fontSize: 12,
        backgroundColor: getAvatarColor(person.emp_name),
      }}
    >
      {person.emp_name.charAt(0).toUpperCase()}
    </Avatar>
  </ListItemAvatar>

  <ListItemText
    primary={person.emp_name}
    primaryTypographyProps={{
      fontSize: 14,
      fontWeight: isSelected ? 600 : 400,
      color: isSelected ? '#0052CC' : '#172B4D', 
    }}
  />
</ListItem>

                    );
                  })}
                </List>
              </Box>
            </Popover>

          </Box>
        </Box>
      </Box>

      <Box mt={3}>
        <Outlet
          context={{
            selectedAssigneeIds,
            searchText,
            setSearchText,
          }}
        />
      </Box>
    </Box>
  );
};

export default EmbryologyLayout;
