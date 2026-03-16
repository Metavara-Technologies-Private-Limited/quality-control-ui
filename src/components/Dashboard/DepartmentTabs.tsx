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

  const activeDepartments = departments.filter(
    (department) => department.is_active,
  );

  const handleSortClick = () => {
    const next = sortDir === "asc" ? "desc" : "asc";
    setSortDir(next);
    onSort?.(next);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsScrollRef.current) return;
    tabsScrollRef.current.scrollLeft += direction === "left" ? -160 : 160;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", xl: "row" },
        alignItems: { xs: "stretch", xl: "center" },
        mb: 3,
        gap: { xs: 1.5, xl: 1 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
          width: "100%",
          flex: 1,
        }}
      >
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
            allowScrollButtonsMobile
            sx={{ minWidth: "max-content" }}
          >
            {activeDepartments.map((dept) => (
              <Tab key={dept.id} label={dept.name} value={dept.id} />
            ))}
          </Tabs>
        </Box>

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
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: { xs: "100%", sm: "auto" },
          flexShrink: 0,
        }}
      >
        <TextField
          inputProps={{ style: { fontSize: 14 } }}
          placeholder="Search by Equipment name"
          onChange={(event) => onSearch?.(event.target.value)}
          sx={{ width: { xs: "100%", sm: 280, xl: 260 }, flexShrink: 0 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: iconColor }} />
              </InputAdornment>
            ),
          }}
        />

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
    </Box>
  );
};

export default DepartmentTabs;
