import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { SelectedEquipmentData } from "@/components/Configuration/Events/AddEquipmentDialog";

interface EquipmentSectionProps {
  selectedDepartmentId: number | null;
  setEquipmentDialogOpen: Dispatch<SetStateAction<boolean>>;
  addedEquipments: SelectedEquipmentData[];
}

const EquipmentSection = ({
  selectedDepartmentId,
  setEquipmentDialogOpen,
  addedEquipments,
}: EquipmentSectionProps) => {
  // GROUP EQUIPMENTS (ONE ROW PER EQUIPMENT)
  const groupedEquipments = () => {
    const map = new Map<
      number,
      {
        equipment: SelectedEquipmentData["equipment"];
        units: SelectedEquipmentData["equipment_detail"][];
        parameters: number[];
      }
    >();

    addedEquipments.forEach((item) => {
      const eqId = item.equipment.id;
      if (!map.has(eqId)) {
        map.set(eqId, {
          equipment: item.equipment,
          units: [],
          parameters: [],
        });
      }
      const group = map.get(eqId)!;
      if (!group.units.find((u) => u.id === item.equipment_detail.id)) {
        group.units.push(item.equipment_detail);
      }
      item.parameters.forEach((p) => {
        if (!group.parameters.includes(p.id)) {
          group.parameters.push(p.id);
        }
      });
    });

    return Array.from(map.values());
  };

  const grouped = groupedEquipments();

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontWeight={700} color="#111827">
          Equipment
        </Typography>

        <Button
          onClick={() => setEquipmentDialogOpen(true)}
          disabled={!selectedDepartmentId}
          sx={{
            color: selectedDepartmentId ? "#2563EB" : "#9CA3AF",
            fontWeight: 500,
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: selectedDepartmentId ? "pointer" : "not-allowed",
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: selectedDepartmentId ? "underline" : "none",
            },
          }}
        >
          + Add Equipment
        </Button>
      </Box>

      <TableContainer
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#6B7280",
                  borderBottom: "1px solid #E5E7EB",
                  width: "260px",
                  py: 1.5,
                }}
              >
                Equipment Details
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#6B7280",
                  borderBottom: "1px solid #E5E7EB",
                  py: 1.5,
                }}
              >
                Parameters
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {grouped.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  sx={{
                    textAlign: "center",
                    color: "#9CA3AF",
                    py: 4,
                    fontSize: "14px",
                  }}
                >
                  No equipment added yet
                </TableCell>
              </TableRow>
            ) : (
              grouped.map((group) => {
                const selectedParams = group.equipment.parameters.filter((p) =>
                  group.parameters.includes(p.id),
                );

                return (
                  <TableRow
                    key={group.equipment.id}
                    sx={{
                      "&:hover": { backgroundColor: "#F9FAFB" },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111827",
                        verticalAlign: "top",
                        py: 1.5,
                      }}
                    >
                      <Typography fontWeight={600}>
                        {group.equipment.equipment_name}
                      </Typography>

                      <Typography fontSize={12} color="#6B7280" mt={0.5}>
                        {group.units.map((u) => u.name).join(", ")}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedParams.length > 0 ? (
                          selectedParams.map((p) => (
                            <Chip
                              key={p.id}
                              label={p.name}
                              size="small"
                              sx={{
                                backgroundColor: "#F3F4F6",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#374151",
                                height: "28px",
                                borderRadius: "6px",
                              }}
                            />
                          ))
                        ) : (
                          <Typography
                            fontSize={12}
                            color="#9CA3AF"
                            fontStyle="italic"
                          >
                            No parameters selected
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default EquipmentSection;
