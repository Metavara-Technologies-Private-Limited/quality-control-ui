import {
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, FilterList, Sort } from "@mui/icons-material";
import type { Department } from "@/types";

interface DepartmentTabsProps {
  departments: Department[];
  selected: number | null;
  onChange: (departmentId: number) => void;
  onSearch?: (value: string) => void;
}

const DepartmentTabs = ({
  departments,
  selected,
  onChange,
  onSearch,
}: DepartmentTabsProps) => {
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
          {departments
            .filter((d) => d.is_active)
            .map((dept) => (
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
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#ffffff",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "#e5e7eb",
              },
              "&:hover fieldset": {
                borderColor: "#d1d5db",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#14b8a6",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "#6B7280" }} />
              </InputAdornment>
            ),
          }}
        />

        <IconButton
          size="small"
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Sort fontSize="small" sx={{ color: "#6b7280" }} />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          <FilterList fontSize="small" sx={{ color: "#6B7280" }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DepartmentTabs;
