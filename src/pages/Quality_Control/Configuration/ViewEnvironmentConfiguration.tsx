import {
  Box,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import { EquipmentDetail, Parameter } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

/* ------------------ Helpers ------------------ */

const renderParameterDetails = (p: Parameter) => {
  let content = p.config;
  if (!content) return "-";

  if (
    content.history &&
    Array.isArray(content.history) &&
    content.history.length > 0
  ) {
    content = content.history[content.history.length - 1];
  }

  switch (content.data_type) {
    case "Integer":
    case "Min/Max":
    case "Decimal":
      return (
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
          Min {content.min_value ?? "-"} {content.unit || ""} – Max{" "}
          {content.max_value ?? "-"} {content.unit || ""}
        </Typography>
      );

    case "Percentage":
      return (
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
          {content.percentage ?? "-"}%
        </Typography>
      );

    case "Text":
      return (
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
          {content.text ?? "-"}
        </Typography>
      );

    case "Boolean":
      return (
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
          {content.boolean_type === "yesno" ? "Yes/No" : "True/False"}
        </Typography>
      );

    case "Dropdown":
    case "Select": {
      const options: string[] = content.dropdown ?? [];
      if (!options.length) return "-";

      return (
        <Box component="span">
          {options.map((val, i) => (
            <Chip
              key={i}
              label={val}
              size="small"
              sx={{ background: "transparent" }}
            />
          ))}
        </Box>
      );
    }

    default:
      return "-";
  }
};

/* ------------------ Component ------------------ */

const ViewConfigurationEnvironment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: clinic } = useSelector((state: RootState) => state.clinic);

  const environmentId = location.state?.environmentId;

  const environment =
    clinic?.department
      ?.flatMap((d) => d.equipments)
      .find((e) => e.id === environmentId) ?? null;

  if (!environment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No environment data found</Typography>
        <Button
          onClick={() => navigate("/configuration/environment")}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const department = clinic?.department.find((d) =>
    d.equipments.some((e) => e.id === environmentId),
  );

  const departmentName = department?.name ?? "Unknown Department";

  const parameters: Parameter[] = environment.parameters ?? [];
  const environmentDetails: EquipmentDetail[] =
    environment.equipment_details ?? [];

  const environmentName = environment.equipment_name;

  return (
    <Box sx={{ p: 3, background: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ArrowBackIcon
          onClick={() => navigate("/configuration/environment")}
          sx={{
            mr: 1,
            cursor: "pointer",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "4px",
          }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          Environment
        </Typography>
      </Box>

      {/* Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
          {environmentName}
        </Typography>
        <Chip
          label={departmentName}
          size="small"
          sx={{
            background: "#E0F1E6",
            color: "#3D8B61",
            fontWeight: 600,
            height: "22px",
          }}
        />
      </Box>

      {/* Parameters */}
      <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 16 }}>
        Parameters ({parameters.length})
      </Typography>

      {parameters.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {parameters.map((p, index) => (
            <Box
              key={index}
              sx={{
                width: 216,
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                p: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                {p.parameter_name}
              </Typography>
              <Typography sx={{ fontSize: 14 }}>
                Range: {renderParameterDetails(p)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="#6B7280">No parameters added</Typography>
      )}

      <Box sx={{ height: 1, background: "#E5E7EB", my: 3 }} />

      {/* Units */}
      <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 16 }}>
        {environmentName} Units ({environmentDetails.length})
      </Typography>

      {environmentDetails.length > 0 ? (
        <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#F9FAFB" }}>
                <TableCell>Sr. No.</TableCell>
                <TableCell>{environmentName} Name</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {environmentDetails.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{row.equipment_num}</TableCell>
                  <TableCell>{row.make || "-"}</TableCell>
                  <TableCell>{row.model || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Typography sx={{ color: "#9CA3AF" }}>No units found</Typography>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          onClick={() =>
            navigate("/configuration/environment/add-parameter", {
              state: { environment },
            })
          }
          sx={{
            borderRadius: "10px",
            background: "#505050",
            textTransform: "none",
            "&:hover": { background: "#232323" },
          }}
        >
          Edit
        </Button>
      </Box>
    </Box>
  );
};

export default ViewConfigurationEnvironment;
