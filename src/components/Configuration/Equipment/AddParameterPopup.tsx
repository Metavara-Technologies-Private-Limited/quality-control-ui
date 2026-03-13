import React from "react";
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
import {
  useAddParameterPopupLogic,
  UNIT_OPTIONS,
  FIELD_TYPES,
} from "./AddParameterPopup.logic";

// ===== VALIDATIONS =====

const handleTitleChange = (value: string, setTitle: any) => {
  const regex = /^[A-Za-z][A-Za-z0-9]*$/;
  if (value === "" || regex.test(value)) {
    setTitle(value);
  } else {
    toast.error("Enter Alphanumeric only");
  }
};

const handleIntegerInput = (value: string, setter: any) => {
  const regex = /^[0-9]*$/;
  if (regex.test(value)) {
    setter(value);
  } else {
    toast.error("Enter Integers only");
  }
};

const handleDecimalInput = (value: string, setter: any) => {
  const regex = /^[0-9]*\.?[0-9]*$/;
  if (regex.test(value)) {
    setter(value);
  } else {
    toast.error("Enter Decimals only");
  }
};

const normalizeDecimal = (value: string, setter: any) => {
  if (value === "") return;
  if (!value.includes(".")) {
    setter(`${value}.0`);
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  initialData?: any;
}

// Style constants
const halfFieldSX = {
  flex: 1,
  "& .MuiInputLabel-root.Mui-focused": { color: "#232323 !important" },
  "& .MuiInputLabel-root": { color: "#828282 !important" },
  "& .MuiOutlinedInput-root": {
    height: "50px",
    paddingTop: "0",
    paddingBottom: "0",
    "& fieldset": { borderColor: "#CFD1D4" },
    "&:hover fieldset": { borderColor: "#CFD1D4" },
    "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
  },
};

const commonFieldSX = {
  "& .MuiInputLabel-root.Mui-focused": { color: "#232323 !important" },
  "& .MuiInputLabel-root": { color: "#828282 !important" },
  "& .MuiOutlinedInput-root": {
    height: "50px",
    paddingTop: "0",
    paddingBottom: "0",
    "& fieldset": { borderColor: "#CFD1D4" },
    "&:hover fieldset": { borderColor: "#CFD1D4" },
    "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
  },
};

// ✅ FIX: multiline variant — removes fixed height so textarea can expand naturally
const multilineFieldSX = {
  "& .MuiInputLabel-root.Mui-focused": { color: "#232323 !important" },
  "& .MuiInputLabel-root": { color: "#828282 !important" },
  "& .MuiOutlinedInput-root": {
    // NO height constraint — let rows prop control the height
    padding: "12px 14px",
    "& fieldset": { borderColor: "#CFD1D4" },
    "&:hover fieldset": { borderColor: "#CFD1D4" },
    "&.Mui-focused fieldset": { borderColor: "#CFD1D4 !important" },
    "& textarea": {
      padding: 0,
      resize: "vertical",  // allow user to resize vertically if needed
    },
  },
};

const AddParameterPopup: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
  initialData,
}) => {
  const {
    title,
    setTitle,
    mandatory,
    setMandatory,
    fieldType,
    setFieldType,
    integerDefault,
    setIntegerDefault,
    integerUnit,
    setIntegerUnit,
    integerMin,
    setIntegerMin,
    integerMax,
    setIntegerMax,
    decimalDefault,
    setDecimalDefault,
    decimalUnit,
    setDecimalUnit,
    decimalMin,
    setDecimalMin,
    decimalMax,
    setDecimalMax,
    textType,
    setTextType,
    textValue,
    setTextValue,
    booleanType,
    setBooleanType,
    dropdownMode,
    dropdownOptions,
    setDropdownOptions,
    selectedDropdownValues,
    setSelectedDropdownValues,
    handleDropdownModeChange,
    handleSave,
  } = useAddParameterPopupLogic({
    open,
    initialData,
    onAdd,
    onClose,
  });

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
          onChange={(e) => handleTitleChange(e.target.value, setTitle)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: "380px",
            "& .MuiInputLabel-root.Mui-focused": { color: "#232323 !important" },
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
            "& .MuiInputLabel-root.Mui-focused": { color: "#232323 !important" },
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
                label="Recommended"
                size="small"
                value={integerDefault}
                onChange={(e) => handleIntegerInput(e.target.value, setIntegerDefault)}
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
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: "16px", width: "100%" }}>
              <TextField
                label="Minimum Value"
                size="small"
                value={integerMin}
                onChange={(e) => handleIntegerInput(e.target.value, setIntegerMin)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, flex: 1 }}
              />
              <TextField
                label="Maximum Value"
                size="small"
                value={integerMax}
                onChange={(e) => handleIntegerInput(e.target.value, setIntegerMax)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, flex: 1 }}
              />
            </Box>
          </>
        )}

        {/* ============ DECIMAL FIELD TYPE ============ */}
        {fieldType === "Decimal" && (
          <>
            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Recommended"
                size="small"
                value={decimalDefault}
                onChange={(e) => handleDecimalInput(e.target.value, setDecimalDefault)}
                onBlur={() => normalizeDecimal(decimalDefault, setDecimalDefault)}
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
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: "16px" }}>
              <TextField
                label="Minimum Value"
                size="small"
                value={decimalMin}
                onChange={(e) => handleDecimalInput(e.target.value, setDecimalMin)}
                onBlur={() => normalizeDecimal(decimalMin, setDecimalMin)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, flex: 1 }}
              />
              <TextField
                label="Maximum Value"
                size="small"
                value={decimalMax}
                onChange={(e) => handleDecimalInput(e.target.value, setDecimalMax)}
                onBlur={() => normalizeDecimal(decimalMax, setDecimalMax)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...commonFieldSX, flex: 1 }}
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
                    boxShadow: textType === "single"
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
                    boxShadow: textType === "multi"
                      ? "inset 0 0 0 2px #fff, inset 0 0 0 14px #E17E61"
                      : "none",
                    outline: "none",
                  }}
                />
                Multi Line
              </label>
            </Box>

            {/* ✅ FIX: use multilineFieldSX for multi, commonFieldSX for single */}
            <TextField
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              fullWidth
              multiline={textType === "multi"}
              rows={textType === "multi" ? 4 : undefined}
              minRows={textType === "single" ? undefined : undefined}
              InputLabelProps={{ shrink: true }}
              sx={textType === "multi" ? multilineFieldSX : commonFieldSX}
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
            <FormControlLabel value="yesno" control={<Radio />} label="Yes/No" />
            <FormControlLabel value="truefalse" control={<Radio />} label="True/False" />
          </RadioGroup>
        )}

        {/* ============ DROPDOWN FIELD TYPE ============ */}
        {fieldType === "Dropdown" && (
          <>
            <RadioGroup
              row
              value={dropdownMode}
              onChange={(e) => handleDropdownModeChange(e.target.value as "single" | "multi")}
              sx={{ ml: 1 }}
            >
              <FormControlLabel value="single" control={<Radio />} label="Single Selection" />
              <FormControlLabel value="multi" control={<Radio />} label="Multi Selection" />
            </RadioGroup>

            {dropdownOptions.map((opt, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", minWidth: "18px" }}>
                  {dropdownMode === "single" ? (
                    <input
                      type="radio"
                      name="dropdown-single-selection"
                      checked={selectedDropdownValues.includes(opt)}
                      onChange={() => setSelectedDropdownValues([opt])}
                      style={{ margin: 0, cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedDropdownValues.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDropdownValues([...selectedDropdownValues, opt]);
                        } else {
                          setSelectedDropdownValues(
                            selectedDropdownValues.filter((v) => v !== opt),
                          );
                        }
                      }}
                      style={{ margin: 0, cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  )}
                </Box>

                <TextField
                  value={opt}
                  onChange={(e) => {
                    const updated = [...dropdownOptions];
                    const oldValue = updated[idx];
                    updated[idx] = e.target.value;
                    setDropdownOptions(updated);
                    if (selectedDropdownValues.includes(oldValue)) {
                      setSelectedDropdownValues(
                        selectedDropdownValues.map((v) => (v === oldValue ? e.target.value : v)),
                      );
                    }
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />

                <IconButton
                  onClick={() => setDropdownOptions([...dropdownOptions, ""])}
                  size="small"
                  sx={{ color: "#4A4A4A" }}
                >
                  +
                </IconButton>

                {dropdownOptions.length > 1 && (
                  <IconButton
                    onClick={() => {
                      const removedOption = dropdownOptions[idx];
                      setDropdownOptions(dropdownOptions.filter((_, i) => i !== idx));
                      setSelectedDropdownValues(
                        selectedDropdownValues.filter((v) => v !== removedOption),
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
              "&:hover": { backgroundColor: "#F2F2F2", boxShadow: "none" },
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
              "&:hover": { backgroundColor: "#232323", boxShadow: "none" },
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