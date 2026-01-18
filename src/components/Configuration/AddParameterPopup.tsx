import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Box,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  initialData?: any;
}

const UNIT_OPTIONS = [
  "°C",
  "°F",
  "µg/m³",
  "%",
  "ppm",
  "pH",
  "mg/L",
  "ml",
  "l",
  "kg",
  "g",
  "m",
  "cm",
];

const FIELD_TYPES = [
  "Integer",
  "Decimal",
  "Text",
  "Boolean",
  "Dropdown",
];

const AddParameterPopup: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
  initialData,
}) => {
  // Common fields
  const [title, setTitle] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [fieldType, setFieldType] = useState("");

  // Integer fields
  const [integerDefault, setIntegerDefault] = useState("");
  const [integerUnit, setIntegerUnit] = useState("");
  const [integerMin, setIntegerMin] = useState("");
  const [integerMax, setIntegerMax] = useState("");

  // Decimal fields
  const [decimalDefault, setDecimalDefault] = useState("");
  const [decimalUnit, setDecimalUnit] = useState("");
  const [decimalMin, setDecimalMin] = useState("");
  const [decimalMax, setDecimalMax] = useState("");

  // Text fields
  const [textType, setTextType] = useState("single");
  const [textValue, setTextValue] = useState("");

  // Boolean fields
  const [booleanType, setBooleanType] = useState("yesno");

  // Dropdown fields
  const [dropdownMode, setDropdownMode] = useState<"single" | "multi">("single");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [selectedDropdownValues, setSelectedDropdownValues] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        loadInitialData();
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

const loadInitialData = () => {
  if (!initialData) return;

  // Extract the actual data type
  const dataType = initialData.field_type || initialData.data_type;

  setTitle(initialData.title || initialData.name || "");
  setMandatory(initialData.mandatory || false);
  setFieldType(dataType);

  // Debug log to see what data we're receiving
  console.log("Loading initial data:", initialData);

  // Load type-specific data
  if (dataType === "Integer") {
    // Try multiple possible field names for default value
    const defaultVal = 
      initialData.default_value || 
      initialData.integer_value || 
      initialData.int_value || 
      "";
    
    setIntegerDefault(String(defaultVal));
    setIntegerUnit(initialData.unit || "");
    setIntegerMin(String(initialData.min_value || ""));
    setIntegerMax(String(initialData.max_value || ""));
  } 
  else if (dataType === "Decimal") {
    // Try multiple possible field names for default value
    const defaultVal = 
      initialData.default_value || 
      initialData.decimal_value || 
      "";
    
    setDecimalDefault(String(defaultVal));
    setDecimalUnit(initialData.unit || "");
    setDecimalMin(String(initialData.min_value || ""));
    setDecimalMax(String(initialData.max_value || ""));
  } 
  else if (dataType === "Text") {
    setTextType(initialData.text_type || "single");
    setTextValue(initialData.text || "");
  } 
  else if (dataType === "Boolean") {
    setBooleanType(initialData.boolean_type || "yesno");
  } 
  else if (dataType === "Dropdown") {
    // Normalize dropdown options
    let dropdownArray: string[] = [];
    
    if (Array.isArray(initialData.dropdown)) {
      dropdownArray = initialData.dropdown.map((d: any) => String(d)).filter(Boolean);
    } else if (typeof initialData.dropdown === "string") {
      dropdownArray = initialData.dropdown
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    
    setDropdownOptions(dropdownArray.length > 0 ? dropdownArray : ["Option 1", "Option 2"]);
    setDropdownMode(initialData.selection_type || "single");
  }
};

  const resetForm = () => {
    setTitle("");
    setMandatory(false);
    setFieldType("");
    setIntegerDefault("");
    setIntegerUnit("");
    setIntegerMin("");
    setIntegerMax("");
    setDecimalDefault("");
    setDecimalUnit("");
    setDecimalMin("");
    setDecimalMax("");
    setTextType("single");
    setTextValue("");
    setBooleanType("yesno");
    setDropdownMode("single");
    setDropdownOptions(["Option 1", "Option 2"]);
    setSelectedDropdownValues([]);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter Title");
      return false;
    }

    if (!fieldType) {
      toast.error("Please select Field Type");
      return false;
    }

    if (fieldType === "Integer") {
      if (!integerDefault.trim()) {
        toast.error("Please enter Default Value");
        return false;
      }
    }

    if (fieldType === "Decimal") {
      if (!decimalDefault.trim() || !decimalMin.trim() || !decimalMax.trim()) {
        toast.error("Please fill all Decimal fields");
        return false;
      }
    }

    if (fieldType === "Text" && !textValue.trim()) {
      toast.error("Please enter Text value");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const payload: any = {
      title,
      name: title,
      mandatory,
      field_type: fieldType,
      data_type: fieldType,
    };

    if (fieldType === "Integer") {
      payload.default_value = integerDefault;
      payload.unit = integerUnit;
      payload.min_value = integerMin;
      payload.max_value = integerMax;
    }

    if (fieldType === "Decimal") {
      payload.default_value = decimalDefault;
      payload.unit = decimalUnit;
      payload.min_value = decimalMin;
      payload.max_value = decimalMax;
    }

    if (fieldType === "Text") {
      payload.text_type = textType;
      payload.text = textValue;
    }

    if (fieldType === "Boolean") {
      payload.boolean_type = booleanType;
    }

    if (fieldType === "Dropdown") {
      payload.dropdown = dropdownOptions;
      payload.selection_type = dropdownMode;
    }

    onAdd(payload);
    resetForm();
    onClose();
  };

  // ✅ Handle selection mode change - clear selections when switching modes
  const handleDropdownModeChange = (newMode: "single" | "multi") => {
    setDropdownMode(newMode);
    setSelectedDropdownValues([]); // Clear selections when switching modes
  };

  const commonFieldSX = {
    width: "380px",
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#232323 !important",
    },
    "& .MuiInputLabel-root": {
      color: "#828282 !important",
    },
    "& .MuiOutlinedInput-root": {
      height: textType === "single" ? "50px" : "auto",
      paddingTop: textType === "multi" ? "12px" : "0",
      paddingBottom: textType === "multi" ? "12px" : "0",
      "& fieldset": { borderColor: "#CFD1D4" },
      "&:hover fieldset": { borderColor: "#CFD1D4" },
      "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
    },
  };
  
  const halfFieldSX = {
    ...commonFieldSX,
    width: "182px",  
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          "& .MuiDialogTitle-root + .MuiDialogContent-root": { pt: "6px" },
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        {initialData ? "Edit Parameter" : "Add Parameter"}
        <IconButton onClick={onClose} sx={{ width: "28px", height: "28px" }}>
          <CloseIcon sx={{ fontSize: "18px", color: "#7A7A7A" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {/* Title Field */}
        <TextField
          label="Title"
          fullWidth
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: "380px",
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#232323 !important",
            },
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              height: "50px",
              paddingTop: "0",
              paddingBottom: "0",
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
            },
          }}
        />

        {/* Mandatory Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={mandatory}
              onChange={(e) => setMandatory(e.target.checked)}
              color="success"
            />
          }
          label="Mandatory"
          sx={{
            color: "#828282",
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            mt: -2,
          }}
        />

        {/* Field Type Dropdown */}
        <TextField
          label="Field Type"
          select
          fullWidth
          size="small"
          value={fieldType}
          onChange={(e) => {
            const newType = e.target.value;
            setFieldType(newType);
            setIntegerUnit("");
            setDecimalUnit("");
          }}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: "380px",
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#232323 !important",
            },
            "& .MuiInputLabel-root": { color: "#828282 !important" },
            "& .MuiOutlinedInput-root": {
              height: "50px",
              paddingTop: "0",
              paddingBottom: "0",
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
            },
          }}
        >
          {FIELD_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* ============ INTEGER FIELD TYPE ============ */}
        {fieldType === "Integer" && (
          <>
            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Default Value"
                size="small"
                value={integerDefault}
                onChange={(e) => setIntegerDefault(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={halfFieldSX}
              />

              <TextField
                label="Unit"
                select
                size="small"
                value={integerUnit}
                onChange={(e) => setIntegerUnit(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={halfFieldSX}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Minimum Value"
                size="small"
                value={integerMin}
                onChange={(e) => setIntegerMin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, 
                  width: "182px",
                  height:"50px"
                }}
              />

              <TextField
                label="Maximum Value"
                size="small"
                value={integerMax}
                onChange={(e) => setIntegerMax(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, 
                  width: "182px",
                   height:"50px"
                 }}
              />
            </Box>
          </>
        )}

        {/* ============ DECIMAL FIELD TYPE ============ */}
        {fieldType === "Decimal" && (
          <>
            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Default Value"
                size="small"
                value={decimalDefault}
                onChange={(e) => setDecimalDefault(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={halfFieldSX}
              />

              <TextField
                label="Unit"
                select
                size="small"
                value={decimalUnit}
                onChange={(e) => setDecimalUnit(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={halfFieldSX}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Minimum Value"
                size="small"
                value={decimalMin}
                onChange={(e) => setDecimalMin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, width: "182px" }}
              />

              <TextField
                label="Maximum Value"
                size="small"
                value={decimalMax}
                onChange={(e) => setDecimalMax(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, width: "182px" }}
              />
            </Box>
          </>
        )}

        {/* ============ TEXT FIELD TYPE ============ */}
        {fieldType === "Text" && (
          <>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center", ml: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  checked={textType === "single"}
                  onChange={() => setTextType("single")}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: `2px solid ${textType === "single" ? "#232323" : "#d1d5db"}`,
                    backgroundColor: "#fff",
                    boxShadow:
                      textType === "single"
                        ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61"
                        : "none",
                    outline: "none",
                  }}
                />
                Single Line
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  checked={textType === "multi"}
                  onChange={() => setTextType("multi")}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: `2px solid ${textType === "multi" ? "#232323" : "#d1d5db"}`,
                    backgroundColor: "#fff",
                    boxShadow:
                      textType === "multi"
                        ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61"
                        : "none",
                    outline: "none",
                  }}
                />
                Multi Line
              </label>
            </Box>

            <TextField
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              fullWidth
              multiline={textType === "multi"}
              rows={textType === "multi" ? 4 : 1}
              sx={commonFieldSX}
            />
          </>
        )}

        {/* ============ BOOLEAN FIELD TYPE ============ */}
        {fieldType === "Boolean" && (
          <RadioGroup
            row
            value={booleanType}
            onChange={(e) => setBooleanType(e.target.value as "yesno" | "truefalse")}
            sx={{ ml: 1 }}
          >
            <FormControlLabel
              value="yesno"
              control={<Radio />}
              label="Yes/No"
            />
            <FormControlLabel
              value="truefalse"
              control={<Radio />}
              label="True/False"
            />
          </RadioGroup>
        )}

        {/* ============ DROPDOWN FIELD TYPE - FIXED SELECTION LOGIC ============ */}
        {fieldType === "Dropdown" && (
          <>
            {/* Selection Type */}
            <RadioGroup
              row
              value={dropdownMode}
              onChange={(e) =>
                handleDropdownModeChange(e.target.value as "single" | "multi")
              }
              sx={{ ml: 1 }}
            >
              <FormControlLabel
                value="single"
                control={<Radio />}
                label="Single Selection"
              />
              <FormControlLabel
                value="multi"
                control={<Radio />}
                label="Multi Selection"
              />
            </RadioGroup>

            {/* OPTIONS */}
            {dropdownOptions.map((opt, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {/* RADIO / CHECKBOX - Now functional */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "18px",
                  }}
                >
                  {dropdownMode === "single" ? (
                    <input
                      type="radio"
                      name="dropdown-single-selection"
                      checked={selectedDropdownValues.includes(opt)}
                      onChange={() => setSelectedDropdownValues([opt])}
                      style={{ 
                        margin: 0,
                        cursor: "pointer",
                        width: "16px",
                        height: "16px"
                      }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedDropdownValues.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDropdownValues([
                            ...selectedDropdownValues,
                            opt,
                          ]);
                        } else {
                          setSelectedDropdownValues(
                            selectedDropdownValues.filter((v) => v !== opt)
                          );
                        }
                      }}
                      style={{ 
                        margin: 0,
                        cursor: "pointer",
                        width: "16px",
                        height: "16px"
                      }}
                    />
                  )}
                </Box>

                {/* OPTION INPUT */}
                <TextField
                  value={opt}
                  onChange={(e) => {
                    const updated = [...dropdownOptions];
                    const oldValue = updated[idx];
                    updated[idx] = e.target.value;
                    setDropdownOptions(updated);
                    
                    // Update selected values if this option was selected
                    if (selectedDropdownValues.includes(oldValue)) {
                      setSelectedDropdownValues(
                        selectedDropdownValues.map(v => v === oldValue ? e.target.value : v)
                      );
                    }
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />

                {/* ADD */}
                <IconButton
                  onClick={() => setDropdownOptions([...dropdownOptions, ""])}
                  size="small"
                  sx={{ color: "#4A4A4A" }}
                >
                  +
                </IconButton>

                {/* DELETE */}
                {dropdownOptions.length > 1 && (
                  <IconButton
                    onClick={() => {
                      const removedOption = dropdownOptions[idx];
                      setDropdownOptions(
                        dropdownOptions.filter((_, i) => i !== idx)
                      );
                      // Remove from selections if it was selected
                      setSelectedDropdownValues(
                        selectedDropdownValues.filter(v => v !== removedOption)
                      );
                    }}
                    size="small"
                    sx={{ color: "#4A4A4A" }}
                  >
                    🗑
                  </IconButton>
                )}
              </Box>
            ))}
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, px: 2, mr: 2 }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              flex: 1,
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#F2F2F2",
              color: "#505050",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "16px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#F2F2F2",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              flex: 1,
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#505050",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "16px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#232323",
                boxShadow: "none",
              },
            }}
          >
            {initialData ? "Update" : "Save"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddParameterPopup;