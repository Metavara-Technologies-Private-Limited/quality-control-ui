import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import type { Parameter } from "@/types";
import { Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface ParameterTabsProps {
  parameters: Parameter[];
  selected: number | null;
  onSelect: (parameterId: number) => void;
  loading?: boolean;
  departmentName?: string;
}

const ParameterTabs = ({
  parameters,
  selected,
  onSelect,
  loading = false,
  departmentName,
}: ParameterTabsProps) => {
  const navigate = useNavigate();
  if (loading || parameters.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          sx={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}
        >
          Parameters :
        </Typography>

        <Box
          sx={{
            backgroundColor: "#fafafa",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tabs
            value={selected}
            onChange={(_, value: number) => onSelect(value)}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                minHeight: 40,
                fontSize: "0.875rem",
                color: "#9e9e9e",
                px: 2,
                "&:hover": { color: "#000000" },
              },
              "& .Mui-selected": {
                backgroundColor: "#ffffff",
                borderRadius: 1,
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
                m: 0.8,
                color: "#E17E61 !important",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            {parameters.map((param) => (
              <Tab
                key={param.id}
                label={param.parameter_name}
                value={param.id}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Edit />}
        onClick={() => {
          const slug = departmentName?.toLowerCase().replace(/\s+/g, "");
          navigate(slug ? `/qc-lab/${slug}/equipments` : "/qc-lab");
        }}
      >
        Record
      </Button>
    </Box>
  );
};

export default ParameterTabs;
