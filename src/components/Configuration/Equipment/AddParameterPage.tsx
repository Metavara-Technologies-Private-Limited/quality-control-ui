import React, { CSSProperties, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Chip,
  TextField,
  IconButton,
} from "@mui/material";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import AddParameterPopup from "./AddParameterPopup";
import useAddParameterLogic from "./UseAddParameterLogic";
import ParameterCard from "./ParameterCard";

const AddParameterPage = () => {
  const logic = useAddParameterLogic();
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const {
    isEnvironment,
    isEquipment,
    equipmentName,
    departmentName,
    count,
    setCount,
    selected,
    toggleSelection,
    parameters,
    make,
    setMake,
    model,
    setModel,
    equipmentTable,
    isEditMode,
    environmentId,
    equipmentQuantity,
    normalizeDropdownValue,
    handleAddParameter,
    handleEditParameter,
    handleDeleteParameter,
    handleSaveEquipmentDetails,
    handleClearAll,
    handleFinalSave,
    handleParameterStatusChange,
    navigate,
    location,
  } = logic;

  const [openParamPopup, setOpenParamPopup] = useState(false);
  const [editingParamData, setEditingParamData] = useState<any>(null);

  const renderParameterContent = (p: any) => {
    let data_type = p.data_type || p.field_type;
    let config = p;

    if (p.history && Array.isArray(p.history) && p.history.length > 0) {
      config = p.history[p.history.length - 1];
      data_type = config.data_type;
    }

    switch (data_type) {
      case "Integer":
      case "Decimal":
      case "Min/Max":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Min {config.min_value ?? "-"} {config.unit ?? ""} – Max{" "}
            {config.max_value ?? "-"} {config.unit ?? ""}
          </Typography>
        );
      case "Percentage":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.percentage ?? "-"}%
          </Typography>
        );
      case "Text":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.text ?? "-"}
          </Typography>
        );
      case "Boolean":
        return (
          <Typography
            sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            {config.boolean_type === "yesno" ? "Yes/No" : "True/False"}
          </Typography>
        );
      case "Dropdown":
      case "Select":
        let options = normalizeDropdownValue(config.dropdown);
        if (options.length === 0) return null;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 0.5,
            }}
          >
            {options.map((val: any, i: number) => (
              <Chip
                key={i}
                label={String(val)}
                size="small"
                sx={{ background: "transparent" }}
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  const handleAddParameterClick = () => {
    setEditingParamData(null);
    setOpenParamPopup(true);
  };

  const handleEditParameterClick = (index: number) => {
    const editData = handleEditParameter(index);
    setEditingParamData(editData);
    setOpenParamPopup(true);
  };

  const handleCloseParamPopup = () => {
    setOpenParamPopup(false);
    setEditingParamData(null);
  };

  const confirmClearAll = () => {
    handleClearAll();
    setClearAllDialogOpen(false);
  };

  return (
    <Box>
      <ToastContainer />

      <Box sx={{ background: "#FFFFFF", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              width: 24,
              height: 24,
              padding: "10px",
              opacity: 1,
              color: "#374151",
              borderRadius: 1,
              mr: 1,
              boxShadow: "3px 3px 6px rgba(0,0,0,0.2)",
              backgroundColor: "#fff",
            }}
          >
            <TurnLeftIcon sx={{ fontSize: 24, padding: "3px" }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>
            {isEditMode
              ? isEnvironment
                ? "Edit Environment"
                : "Edit Equipment"
              : isEnvironment
                ? "Add Environment"
                : "Add Equipment"}
          </Typography>
        </Box>

        <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2, mb: 2 }}></Box>

        {/* Title Section */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {equipmentName}
          <Chip
            label={departmentName}
            variant="outlined"
            sx={{
              borderColor: "#47B35F",
              color: "#47B35F",
              fontWeight: 600,
              fontSize: "0.75rem",
              borderRadius: "12px",
              height: 22,
            }}
          />
        </Typography>

        {/* Parameters Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
            Parameters (e.g. Temperature)
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={handleAddParameterClick}
          >
            <Typography sx={{ color: "#2563EB", fontSize: "14px" }}>
              +
            </Typography>
            <Typography
              sx={{ color: "#2563EB", fontSize: "14px", fontWeight: 500 }}
            >
              Add Parameters
            </Typography>
          </Box>
        </Box>

        {/* Parameter Cards Grid */}
        {parameters.length > 0 && (
          <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {parameters.map((p, index) => (
              <ParameterCard
                key={p.id ? `param-${p.id}` : `param-${index}`}
                parameter={p}
                index={index}
                onEdit={handleEditParameterClick}
                onDelete={handleDeleteParameter}
                onStatusChange={handleParameterStatusChange}
                renderParameterContent={renderParameterContent}
              />
            ))}
          </Box>
        )}

        <Box sx={{ height: "1px", background: "#E5E7EB", mt: 2 }}></Box>

        {/* Equipment Quantity Controls */}
        {isEquipment && (
          <>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                  #No. of {equipmentName}s :
                </Typography>
                <QuantityControl count={count} onCountChange={setCount} />
              </Box>
            </Box>
          </>
        )}

        {/* Equipment Selection Chips */}
        {isEquipment && (
          <>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, mt: 3 }}>
              Select {equipmentName}s
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              {equipmentQuantity.map((num) => (
                <SelectionChip
                  key={num}
                  num={num}
                  equipmentName={equipmentName}
                  isSelected={selected.includes(num)}
                  onToggle={() => toggleSelection(num)}
                />
              ))}
            </Box>
          </>
        )}

        {/* Make & Model Inputs */}
        {isEquipment && selected.length > 0 && (
          <MakeModelSection
            selected={selected}
            equipmentName={equipmentName}
            make={make}
            setMake={setMake}
            model={model}
            setModel={setModel}
            onSave={handleSaveEquipmentDetails}
          />
        )}

        {/* Equipment Table */}
        {isEquipment && equipmentTable.length > 0 && (
          <EquipmentTable
            equipmentTable={equipmentTable}
            equipmentName={equipmentName}
          />
        )}

        {/* Footer Buttons */}
        <Box
          sx={{ mt: 10, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => setClearAllDialogOpen(true)}
            sx={{
              borderRadius: "10px",
              borderColor: "#505050",
              color: "#232323",
              textTransform: "none",
              "&:hover": {
                borderColor: "#232323",
              },
            }}
          >
            Clear All
          </Button>

          <Button
            variant="contained"
            onClick={handleFinalSave}
            sx={{
              borderRadius: "10px",
              background: "#505050",
              color: "#FFFFFF",
              textTransform: "none",
              px: 4,
              py: 1.2,
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#232323",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
      >
        <DialogTitle>Clear All Data</DialogTitle>
        <DialogContent>
          <Typography>Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmClearAll} color="error">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Parameter Popup */}
      <AddParameterPopup
        open={openParamPopup}
        onClose={handleCloseParamPopup}
        onAdd={handleAddParameter}
        initialData={editingParamData}
      />
    </Box>
  );
};

/* Sub-components */

interface QuantityControlProps {
  count: number;
  onCountChange: (count: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  count,
  onCountChange,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      bgcolor: "#FAFAFA",
      border: "1px solid #E2E3E5",
      borderRadius: 1,
      height: "30px",
      width: "97px",
    }}
  >
    <Button
      variant="text"
      onClick={() => onCountChange(count > 1 ? count - 1 : count)}
      sx={{
        flex: 1,
        fontWeight: 500,
        color: "#565656",
        fontSize: "20px",
        p: 0,
        minWidth: 0,
      }}
    >
      –
    </Button>

    <Box
      sx={{
        flex: 1,
        textAlign: "center",
        fontWeight: 600,
        color: "#565656",
        fontSize: "15px",
      }}
    >
      {String(count).padStart(2, "0")}
    </Box>

    <Button
      variant="text"
      onClick={() => onCountChange(count + 1)}
      sx={{
        flex: 1,
        fontWeight: 500,
        color: "#565656",
        fontSize: "20px",
        p: 0,
        minWidth: 0,
      }}
    >
      +
    </Button>
  </Box>
);

interface SelectionChipProps {
  num: number;
  equipmentName: string;
  isSelected: boolean;
  onToggle: () => void;
}

const SelectionChip: React.FC<SelectionChipProps> = ({
  num,
  equipmentName,
  isSelected,
  onToggle,
}) => (
  <Box
    onClick={onToggle}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      height: "36px",
      borderRadius: "8px",
      cursor: "pointer",
      border: "1px solid #E2E3E5",
      background: "#FAFAFA",
    }}
  >
    {isSelected ? (
      <Box
        sx={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          background: "#DEEFE1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="13" height="13" fill="#3D8B61" viewBox="0 0 24 24">
          <path d="M20.285 6.708l-11.285 11.292-5.285-5.292 1.414-1.414 3.871 3.879 9.871-9.878z" />
        </svg>
      </Box>
    ) : (
      <Box
        sx={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          border: "1.8px solid #D1D5DB",
        }}
      />
    )}
    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#4B5563" }}>
      {equipmentName} {num}
    </Typography>
  </Box>
);

interface MakeModelSectionProps {
  selected: number[];
  equipmentName: string;
  make: string;
  setMake: (make: string) => void;
  model: string;
  setModel: (model: string) => void;
  onSave: () => void;
}

const validateAlphanumericInput = (value: string): boolean => {
  if (value === "") return true; // Allow empty string
  // Check if first character is an alphabet
  if (!/^[A-Za-z]/.test(value)) return false;
  // Check if all characters are alphanumeric
  if (!/^[A-Za-z0-9]*$/.test(value)) return false;
  return true;
};

const MakeModelSection: React.FC<MakeModelSectionProps> = ({
  selected,
  equipmentName,
  make,
  setMake,
  model,
  setModel,
  onSave,
}) => (
  <>
    <Typography sx={{ mt: 4, fontSize: "15px", fontWeight: 600, mb: 2 }}>
      Details of {selected.map((n) => `${equipmentName} ${n}`).join(", ")}
    </Typography>
    <Box sx={{ display: "flex", gap: 3 }}>
      <TextField
        placeholder="Enter Make"
        label="Make"
        value={make}
        onChange={(e) => {
          if (validateAlphanumericInput(e.target.value)) {
            setMake(e.target.value);
          } else {
            toast.error("Enter Alphanumeric only");
          }
        }}
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        sx={{
          "& .MuiInputLabel-root": { color: "#5F646F !important" },
        }}
      />
      <TextField
        placeholder="Enter Model"
        label="Model"
        value={model}
        onChange={(e) => {
          if (validateAlphanumericInput(e.target.value)) {
            setModel(e.target.value);
          } else {
            toast.error("Enter Alphanumeric only");
          }
        }}
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        sx={{
          "& .MuiInputLabel-root": { color: "#5F646F !important" },
        }}
      />
    </Box>
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        onClick={onSave}
        sx={{
          borderRadius: "8px",
          backgroundColor: "#F3F3F3",
          color: "#505050",
          border: "1px solid #E5E7EB",
          px: 4,
          py: 1.2,
          fontSize: "16px",
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#EDEDED",
            color: "#232323",
            boxShadow: "none",
          },
        }}
      >
        Save
      </Button>
    </Box>
  </>
);

interface EquipmentTableProps {
  equipmentTable: any[];
  equipmentName: string;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipmentTable,
  equipmentName,
}) => (
  <Box
    sx={{
      mt: 4,
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden",
    }}
  >
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#F9FAFB", height: "42px" }}>
          <th style={{ ...headerStyle }}>Sr. No.</th>
          <th style={{ ...headerStyle }}>{equipmentName} Name</th>
          <th style={{ ...headerStyle }}>Make</th>
          <th style={{ ...headerStyle }}>Model</th>
        </tr>
      </thead>
      <tbody>
        {equipmentTable.map((row) => (
          <tr
            key={row.sr}
            style={{ height: "42px", borderTop: "1px solid #E5E7EB" }}
          >
            <td style={cellStyle}>{row.sr}</td>
            <td style={cellStyle}>
              {equipmentName} {row.equipmentNum}
            </td>
            <td style={cellStyle}>{row.make}</td>
            <td style={cellStyle}>{row.model}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
);

const headerStyle: CSSProperties = {
  padding: "10px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: 600,
  color: "#4B5563",
  borderBottom: "1px solid #E5E7EB",
};

const cellStyle: CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  color: "#4B5563",
};

export default AddParameterPage;
