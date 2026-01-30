import React from "react";
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";

interface ParameterCardProps {
  parameter: any;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (index: number, newStatus: boolean) => void;
  renderParameterContent: (param: any) => React.ReactNode;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  parameter,
  index,
  onEdit,
  onDelete,
  onStatusChange,
  renderParameterContent,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit(index);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    onDelete(index);
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = () => {
    const isCurrentlyActive = parameter.is_active !== false;
    onStatusChange(index, !isCurrentlyActive);
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          width: "260px",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          background: "#FFFFFF",
          p: 2,
          boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
          position: "relative",
          opacity: parameter.is_active === false ? 0.5 : 1,
        }}
      >
        {/* Status Pill */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            px: 1.2,
            py: 0.3,
            borderRadius: "999px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backgroundColor:
              parameter.is_active === false ? "#FEE2E2" : "#DCFCE7",
            color: parameter.is_active === false ? "#B91C1C" : "#15803D",
          }}
        >
          {parameter.is_active === false ? "Inactive" : "Active"}
        </Box>

        {/* Parameter Name */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontWeight: 600, maxWidth: "80%" }}>
            {parameter.name || parameter.title}
          </Typography>
        </Box>

        {/* Data Type */}
        <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
          Data Type : {parameter.data_type || parameter.field_type}
        </Typography>

        {/* Divider */}
        <Box
          sx={{
            height: "1px",
            background: "#E5E7EB",
            mt: 1,
            mb: 0.5,
          }}
        />

        {/* Content & Menu Button Container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "35px",
            pr: 0.5,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>{renderParameterContent(parameter)}</Box>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              width: 32,
              height: 32,
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              zIndex: 2,
              ml: 1,
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleStatusChange}>
          {parameter.is_active !== false ? "Inactivate" : "Activate"}
        </MenuItem>
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem sx={{ color: "error.main" }} onClick={handleDeleteClick}>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Parameter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this parameter?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ParameterCard;
