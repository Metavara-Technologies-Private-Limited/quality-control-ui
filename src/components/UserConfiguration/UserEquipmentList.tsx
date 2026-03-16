import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";
import { mockEquipments } from "@/utils/mockData";
import type { Equipment } from "@/types";

const UserEquipmentList = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    // Enhanced mock data with location
    const enhancedEquipments: Equipment[] = mockEquipments.map(
      (eq, idx) =>
        ({
          ...eq,
          equipment_type: "Incubator",
          status: "active" as const,
          // Add location field
          location: `Lab ${String.fromCharCode(65 + (idx % 3))}`,
        }) as Equipment & { location: string },
    );
    setEquipments(enhancedEquipments);
  };

  const filteredEquipments = equipments.filter(
    (eq) =>
      eq.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq as any).location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <TextField
          placeholder="Search by Equipment Name, Type, or Location"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: "100%", sm: 400 } }}
        />
      </Box>

      <Card>
        <CardContent>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Equipment Name</TableCell>
                  <TableCell>Equipment Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell>{equipment.equipment_name}</TableCell>
                    <TableCell>{equipment.equipment_type || "N/A"}</TableCell>
                    <TableCell>
                      {(equipment as any).location || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={equipment.status || "active"}
                        size="small"
                        color={
                          equipment.status === "active"
                            ? "success"
                            : equipment.status === "maintenance"
                              ? "warning"
                              : "default"
                        }
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="View Details">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Edit">
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEquipments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: "#6b7280" }}
                    >
                      No equipment found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserEquipmentList;
