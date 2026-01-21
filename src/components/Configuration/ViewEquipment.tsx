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

  if (content.history?.length) {
    content = content.history[content.history.length - 1];
  }

  switch (content.data_type) {
    case "Integer":
    case "Min/Max":
    case "Decimal":
      return `Min ${content.min_value ?? "-"} ${content.unit ?? ""} – Max ${
        content.max_value ?? "-"
      } ${content.unit ?? ""}`;

    case "Percentage":
      return content.percentage ?? "-";

    case "Text":
      return content.text ?? "-";

    case "Boolean":
      return content.boolean_type === "yesno" ? "Yes/No" : "True/False";

    case "Dropdown":
    case "Select":
      return (content.dropdown ?? []).join(", ");

    default:
      return "-";
  }
};

/* ------------------ Component ------------------ */

const ViewEquipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: clinic } = useSelector((state: RootState) => state.clinic);

  const isEnvironment = location.pathname.includes("/environment");

  const entityId = isEnvironment
    ? location.state?.environmentId
    : location.state?.equipmentId;

  if (!clinic || !entityId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No data found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  let name = "";
  let parameters: Parameter[] = [];
  let equipmentDetails: EquipmentDetail[] = [];
  let departmentName = "";

  if (isEnvironment) {
    const department = clinic.department.find((d) =>
      d.environments?.some((env) => env.id === entityId),
    );

    const environment = department?.environments?.find(
      (env) => env.id === entityId,
    );

    if (!environment || !department) return null;

    name = environment.environment_name;
    parameters = environment.parameters ?? [];
    departmentName = department.name;
  } else {
    const department = clinic.department.find((d) =>
      d.equipments.some((e) => e.id === entityId),
    );

    const equipment = department?.equipments.find((e) => e.id === entityId);

    if (!equipment || !department) return null;

    name = equipment.equipment_name;
    parameters = equipment.parameters ?? [];
    equipmentDetails = equipment.equipment_details ?? [];
    departmentName = department.name;
  }

  return (
    <Box sx={{ p: 3, background: "#FFFFFF", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ArrowBackIcon
          onClick={() =>
            navigate(
              isEnvironment
                ? "/configuration/environment"
                : "/configuration/equipment",
            )
          }
          sx={{
            mr: 1,
            cursor: "pointer",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "4px",
          }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {isEnvironment ? "Environment" : "Equipments"}
        </Typography>
      </Box>

      {/* Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{name}</Typography>
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
          {parameters.map((p, i) => (
            <Box
              key={i}
              sx={{
                width: 216,
                height: 90,
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                px: 2,
                py: 1.5,
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                {p.parameter_name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#374151" }}>
                {renderParameterDetails(p)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="#6B7280">No parameters added</Typography>
      )}

      {/* Equipment Units (ONLY for equipment) */}
      {!isEnvironment && (
        <>
          <Box sx={{ height: 1, background: "#E5E7EB", my: 3 }} />

          <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 16 }}>
            Units ({equipmentDetails.length})
          </Typography>

          {equipmentDetails.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr. No.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Make</TableCell>
                  <TableCell>Model</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentDetails.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{row.equipment_num}</TableCell>
                    <TableCell>{row.make || "-"}</TableCell>
                    <TableCell>{row.model || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="#9CA3AF">No units found</Typography>
          )}
        </>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          onClick={() =>
            navigate(
              isEnvironment
                ? "/configuration/environment/add-parameter"
                : "/configuration/equipment/add-parameter",
              {
                state: isEnvironment
                  ? { environmentId: entityId }
                  : { equipmentId: entityId },
              },
            )
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

export default ViewEquipment;
