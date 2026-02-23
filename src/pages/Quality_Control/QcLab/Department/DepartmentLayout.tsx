import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Tooltip from "@mui/material/Tooltip";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Typography,
  Avatar,
  AvatarGroup,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { slugify } from "@/utils/slugify";

const avatarColors = [
  "#091E42",
  "#172B4D",
  "#0052CC",
  "#0747A6",
  "#0065FF",
  "#004F3D",
  "#006644",
  "#00875A",
  "#7A1FA2",
  "#403294",
  "#5E4DB2",
  "#BF2600",
  "#DE350B",
  "#FF5630",
  "#FF8B00",
];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};


/* ---------------- Layout ---------------- */

const DepartmentLayout = () => {
  const location = useLocation();
  const { department: departmentName = "" } = useParams();
  const navigate = useNavigate();
  const allAssignees = useSelector((state: RootState) => state.assignees.data);
  // const normalize = (value: string) => value.replace(/\s+/g, "").toLowerCase();
  const departmentAssignees = allAssignees.filter(
    (a) => a.department_name && slugify(a.department_name) === departmentName,
  );

  const [searchText, setSearchText] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleToggleAssignee = (id: number) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const open = Boolean(anchorEl);

  const getActiveTab = () => {
    if (location.pathname.includes("/equipments")) return "equipments";
    if (location.pathname.includes("/environment")) return "environment";
    return "task";
  };

  return (
    <Box>
      {/* ---------------- Top Bar ---------------- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E5E7EB",
          mx: -3,
          px: 3,
        }}
      >
        {/* ---------------- Tabs ---------------- */}
        <Tabs
          value={getActiveTab()}
          onChange={(_, value) => navigate(value)}
          TabIndicatorProps={{
            sx: { backgroundColor: "#E17E61", height: "1px" },
          }}
          sx={{ minHeight: 30, "& .MuiTabs-flexContainer": { gap: 6 } }}
        >
          {["equipments", "environment", "task"].map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              sx={{
                textTransform: "none",
                fontSize: 14,
                fontWeight: 600,
                color: "#9E9E9E",
                minHeight: 44,
                padding: 0,
                "&.Mui-selected": {
                  color: "#232323",
                  fontWeight: 700,
                },
              }}
            />
          ))}
        </Tabs>

        {/* ---------------- Search + Assignees ---------------- */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <TextField
            size="small"
            placeholder="Search for equipments"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9E9E9E", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              Assignees
            </Typography>

            <AvatarGroup
              max={5}
              spacing={0}
              componentsProps={{
                additionalAvatar: {
                  onClick: (e) => setAnchorEl(e.currentTarget),
                  sx: { cursor: "pointer" },
                },
              }}
              sx={{
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  border: "2px solid #fff",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                },
              }}
            >
              {departmentAssignees.map((person) => {
                const isSelected = selectedAssigneeIds.includes(person.id);
                const hasSelection = selectedAssigneeIds.length > 0;

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
                        opacity: hasSelection && !isSelected ? 0.45 : 1,
                        marginLeft: hasSelection
                          ? isSelected
                            ? "10px !important" 
                            : "-10px !important" 
                          : "-10px !important", 
                        transform: isSelected
                          ? "scale(1.25) translateY(-4px)"
                          : "scale(1)",
                        zIndex: isSelected ? 20 : 1,

                        boxShadow: isSelected
                          ? "0 6px 14px rgba(0,0,0,0.25)"
                          : "none",
                      }}
                    >
                      {getInitials(person.emp_name)}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </AvatarGroup>

            {/* ---------------- Popover ---------------- */}
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  width: 300,
                  maxHeight: 450,
                  borderRadius: "8px",
                  mt: 1,
                },
              }}
            >
              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                <List dense>
                  {departmentAssignees.map((person) => {
                    const isSelected = selectedAssigneeIds.includes(person.id);
                    return (
                      <ListItem
                        key={person.id}
                        button
                        onClick={() => handleToggleAssignee(person.id)}
                        sx={{
                          px: 2,
                          py: 1,
                          backgroundColor: isSelected
                            ? "#E9F2FF"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: isSelected ? "#DEEBFF" : "#F4F5F7",
                          },
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          sx={{
                            mr: 1,
                            p: 0,
                            color: "#C1C7D0",
                            "&.Mui-checked": {
                              color: "#0052CC",
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
                            {getInitials(person.emp_name)}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={person.emp_name}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? "#0052CC" : "#172B4D",
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

      {/* ---------------- Outlet ---------------- */}
      <Box mt={3}>
        <Outlet
          context={{
            departmentName,
            selectedAssigneeIds,
            searchText,
            setSearchText,
          }}
        />
      </Box>
    </Box>
  );
};

export default DepartmentLayout;
