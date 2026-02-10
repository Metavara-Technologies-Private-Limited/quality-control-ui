import {
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import { Search, Sort } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import type { Department } from "@/types";

interface DepartmentTabsProps {
  departments: Department[];
  selected: number | null;
  onChange: (departmentId: number) => void;
  onSearch?: (value: string) => void;
  onSort?: () => void;
  sortActive?: boolean;
  filterActive?: boolean;
}

const iconButtonSx = {
  border: "1px solid #E5E7EB",
  borderRadius: 2,
  backgroundColor: "#fff",
};

const DepartmentTabs = ({
  departments,
  selected,
  onChange,
  onSearch,
  onSort,
  sortActive,
  filterActive,
}: DepartmentTabsProps) => {
  const theme = useTheme();
  const activeColor = theme.palette.secondary.main;
  const activeBg = theme.palette.secondary.light + "22";
  const iconColor = theme.palette.text.secondary;

  const activeDepartments = departments.filter((d) => d.is_active);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selected ?? false}
          onChange={(_, value) => onChange(value as number)}
        >
          {activeDepartments.map((dept) => (
            <Tab key={dept.id} label={dept.name} value={dept.id} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by Equipment name"
          onChange={(e) => onSearch?.(e.target.value)}
          sx={{
            minWidth: 300,
            flex: 1,
            maxWidth: 400,
          }}
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
          onClick={onSort}
          sx={{
            ...iconButtonSx,
            borderColor: sortActive ? activeColor : "#E5E7EB",
            backgroundColor: sortActive ? activeBg : "#fff",
          }}
        >
          <Sort
            fontSize="small"
            sx={{ color: sortActive ? activeColor : iconColor }}
          />
        </IconButton>

        <IconButton
          size="small"
          sx={{
            ...iconButtonSx,
            borderColor: filterActive ? activeColor : "#E5E7EB",
            backgroundColor: filterActive ? activeBg : "#fff",
          }}
        >
          <FilterAltIcon
            fontSize="small"
            sx={{ color: filterActive ? activeColor : iconColor }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DepartmentTabs;
