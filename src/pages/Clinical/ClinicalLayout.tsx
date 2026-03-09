import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * ClinicalLayout
 * Mirrors LabLayout exactly — acts as a shell around the
 * DepartmentLayout outlet for the Clinical section.
 */
const ClinicalLayout = () => {
  return (
    <Box>
      <Outlet />
    </Box>
  );
};

export default ClinicalLayout;