import React from "react";
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  IconButton,
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
  /** Whether this card's checkbox is ticked */
  isSelected?: boolean;
  /** Called when the checkbox is clicked */
  onToggleSelect?: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (index: number, newStatus: boolean) => void;
  renderParameterContent: (param: any) => React.ReactNode;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  parameter,
  index,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onStatusChange,
  renderParameterContent,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
          width: { xs: "100%", sm: "260px" },
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          background: "#FFFFFF",
          p: 2,
          boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
          position: "relative",
          opacity: parameter.is_active === false ? 0.5 : 1,
        }}
      >
        {/* ── Active / Inactive pill ── */}
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

        {/* ── Checkbox + Parameter name row ── */}
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 1, pr: "70px" }}
        >
          {/* Checkbox — only rendered when onToggleSelect is provided */}
          {onToggleSelect && (
            <Box
              onClick={onToggleSelect}
              sx={{ mt: "2px", cursor: "pointer", flexShrink: 0 }}
            >
              {isSelected ? (
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    background: "#DEEFE1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    fill="#3D8B61"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.285 6.708l-11.285 11.292-5.285-5.292 1.414-1.414 3.871 3.879 9.871-9.878z" />
                  </svg>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    border: "1.8px solid #D1D5DB",
                  }}
                />
              )}
            </Box>
          )}

          <Typography
            sx={{ fontWeight: 600, fontSize: "14px", wordBreak: "break-word" }}
          >
            {parameter.name || parameter.title}
          </Typography>
        </Box>

        {/* ── Data type label ── */}
        <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
          Data Type : {parameter.data_type || parameter.field_type}
        </Typography>

        {/* ── Divider ── */}
        <Box sx={{ height: "1px", background: "#E5E7EB", mt: 1, mb: 0.5 }} />

        {/* ── Content & menu button ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            minHeight: "35px",
            pr: 0.5,
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
            {renderParameterContent(parameter)}
          </Box>

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
              flexShrink: 0,
              "&:hover": { backgroundColor: "#F9FAFB" },
            }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ── Context menu ── */}
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

      {/* ── Delete confirmation ── */}
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
