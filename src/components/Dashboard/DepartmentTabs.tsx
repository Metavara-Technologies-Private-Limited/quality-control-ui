import { useRef, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Search,
  SwapVert,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import type { Department } from "@/types";

interface DepartmentTabsProps {
  departments: Department[];
  selected: number | null;
  onChange: (departmentId: number) => void;
  onSearch?: (value: string) => void;
  onSort?: (direction: "asc" | "desc") => void;
  sortActive?: boolean;
  filterActive?: boolean;
}

const iconButtonSx = {
  borderRadius: 2,
  backgroundColor: "transparent",
};

const DepartmentTabs = ({
  departments,
  selected,
  onChange,
  onSearch,
  onSort,
}: DepartmentTabsProps) => {
  const theme = useTheme();
  const iconColor = theme.palette.text.secondary;
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSortClick = () => {
    const next = sortDir === "asc" ? "desc" : "asc";
    setSortDir(next);
    onSort?.(next);
  };

  const activeDepartments = departments.filter((d) => d.is_active);

  const scrollTabs = (dir: "left" | "right") => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollLeft += dir === "left" ? -160 : 160;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 3,
        gap: 1,
      }}
    >
      {/* Left scroll arrow */}
      <IconButton
        size="small"
        onClick={() => scrollTabs("left")}
        sx={{ ...iconButtonSx, flexShrink: 0 }}
      >
        <ChevronLeft
          fontSize="small"
          sx={{ color: iconColor, opacity: 0.45 }}
        />
      </IconButton>

      {/* Scrollable tabs */}
      <Box
        ref={tabsScrollRef}
        sx={{
          flex: 1,
          overflow: "hidden",
          scrollBehavior: "smooth",
          borderBottom: 1,
          borderColor: "divider",
          minWidth: 0,
        }}
      >
        <Tabs
          value={selected ?? false}
          onChange={(_, value) => onChange(value as number)}
          variant="scrollable"
          scrollButtons={false}
          sx={{ minWidth: "max-content" }}
        >
          {activeDepartments.map((dept) => (
            <Tab key={dept.id} label={dept.name} value={dept.id} />
          ))}
        </Tabs>
      </Box>

      {/* Right scroll arrow */}
      <IconButton
        size="small"
        onClick={() => scrollTabs("right")}
        sx={{ ...iconButtonSx, flexShrink: 0 }}
      >
        <ChevronRight
          fontSize="small"
          sx={{ color: iconColor, opacity: 0.45 }}
        />
      </IconButton>

      {/* Search bar */}
      <TextField
        inputProps={{ style: { fontSize: 14 } }}
        placeholder="Search by Equipment name"
        onChange={(e) => onSearch?.(e.target.value)}
        sx={{ width: 260, flexShrink: 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" sx={{ color: iconColor }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Sort icon — click toggles A→Z / Z→A */}
      <IconButton
        size="small"
        onClick={handleSortClick}
        sx={{
          ...iconButtonSx,
          flexShrink: 0,
          width: 36,
          height: 36,
        }}
      >
        <SwapVert fontSize="small" sx={{ color: iconColor }} />
      </IconButton>
    </Box>
  );
};

export default DepartmentTabs;
