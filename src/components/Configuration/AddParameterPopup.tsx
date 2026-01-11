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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  initialData?: any;
}

const AddParameterPopup: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const [dropdownValue, setDropdownValue] = useState("");
  const [text, setText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [percentage, setPercentage] = useState("");
  const [integerValue, setIntegerValue] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setDataType(initialData.data_type || "");
        setMinValue(initialData.min_value || "");
        setMaxValue(initialData.max_value || "");
        setText(initialData.text || "");
        setPercentage(initialData.percentage || "");
        setIntegerValue(initialData.integer_value || "");

        // Handle dropdown - can be array or single value
        if (Array.isArray(initialData.dropdown)) {
          setSelectedOptions(initialData.dropdown);
          setDropdownValue("");
        } else if (initialData.dropdown) {
          setDropdownValue(initialData.dropdown);
          setSelectedOptions([]);
        } else {
          setSelectedOptions([]);
          setDropdownValue("");
        }
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  const resetForm = () => {
    setName("");
    setDataType("");
    setMinValue("");
    setMaxValue("");
    setDropdownValue("");
    setText("");
    setSelectedOptions([]);
    setPercentage("");
    setIntegerValue("");
  };

  const resetTypeValues = () => {
    setMinValue("");
    setMaxValue("");
    setDropdownValue("");
    setText("");
    setSelectedOptions([]);
    setPercentage("");
    setIntegerValue("");
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Please enter Parameter Name");
      return;
    }

    if (!dataType) {
      toast.error("Please select Data Type");
      return;
    }

    if (dataType === "Integer" && !integerValue.trim()) {
      toast.error("Please enter Integer Value");
      return;
    }

    // ✅ Use snake_case to match backend
    const payload: any = {
      name,
      data_type: dataType,
    };

    if (dataType === "Decimal") {
      payload.min_value = minValue;
      payload.max_value = maxValue;
    }

    if (dataType === "Select") {
      payload.dropdown = selectedOptions;
    }

    if (dataType === "Dropdown") {
      payload.dropdown = [dropdownValue];
    }

    if (dataType === "Text") {
      payload.text = text;
    }

    if (dataType === "Percentage") {
      payload.percentage = percentage;
    }

    if (dataType === "Integer") {
      payload.integer_value = integerValue;
    }

    onAdd(payload);
    onClose();
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
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        <TextField
          label="Data Type"
          select
          fullWidth
          size="small"
          value={dataType}
          onChange={(e) => {
            setDataType(e.target.value);
            if (!initialData) resetTypeValues();
          }}
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
        >
          <MenuItem value="Decimal">Decimal</MenuItem>
          <MenuItem value="Select">Multiple Selection</MenuItem>
          <MenuItem value="Text">Text</MenuItem>
          <MenuItem value="Dropdown">Dropdown</MenuItem>
          <MenuItem value="Percentage">Percentage</MenuItem>
          <MenuItem value="Integer">Integer</MenuItem>
        </TextField>

        {dataType === "Decimal" && (
          <Box sx={{ display: "flex", gap: "16px" }}>
            <TextField
              label="Min °C"
              size="small"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: "182px",
                "& .MuiInputLabel-root": { color: "#5F646F !important" },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5F646F !important",
                },
                "& .MuiOutlinedInput-root": {
                  height: "50px",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#CFD1D4" },
                },
              }}
            />
            <TextField
              label="Max °C"
              size="small"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: "182px",
                "& .MuiInputLabel-root": { color: "#5F646F !important" },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5F646F !important",
                },
                "& .MuiOutlinedInput-root": {
                  height: "50px",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#CFD1D4" },
                },
              }}
            />
          </Box>
        )}

        {dataType === "Select" && (
          <Box sx={{ display: "flex", flexDirection: "row", gap: 3, ml: 1 }}>
            {["Option 1", "Option 2", "Option 3"].map((opt) => (
              <FormControlLabel
                key={opt}
                control={
                  <Checkbox
                    color="default"
                    checked={selectedOptions.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, opt]);
                      } else {
                        setSelectedOptions(
                          selectedOptions.filter((o) => o !== opt)
                        );
                      }
                    }}
                  />
                }
                label={opt}
                sx={{ color: "#5F646F" }}
              />
            ))}
          </Box>
        )}

        {dataType === "Dropdown" && (
          <TextField
            label="Select Option"
            select
            fullWidth
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "380px",
              "& .MuiOutlinedInput-root": {
                height: "50px",
                "& fieldset": { borderColor: "#CFD1D4" },
              },
            }}
          >
            <MenuItem value="Lasted">Lasted</MenuItem>
            <MenuItem value="Popular">Popular</MenuItem>
            <MenuItem value="Recommended">Recommended</MenuItem>
          </TextField>
        )}

        {dataType === "Text" && (
          <TextField
            label="Add Text Here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "380px",
              "& .MuiOutlinedInput-root": {
                height: "50px",
                borderRadius: "10px",
                "& fieldset": { borderColor: "#CFD1D4" },
              },
            }}
          />
        )}

        {dataType === "Percentage" && (
          <TextField
            label="Percentage"
            fullWidth
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "380px",
              "& .MuiOutlinedInput-root": {
                height: "50px",
                "& fieldset": { borderColor: "#CFD1D4" },
              },
            }}
          />
        )}

        {dataType === "Integer" && (
          <TextField
            label="Integer Value"
            fullWidth
            value={integerValue}
            onChange={(e) => setIntegerValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "380px",
              "& .MuiOutlinedInput-root": {
                height: "50px",
                "& fieldset": { borderColor: "#CFD1D4" },
              },
            }}
          />
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mr: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              width: "120px",
              borderRadius: "10px",
              borderColor: "#505050",
              "&:hover": { borderColor: "#505050", backgroundColor: "white" },
              color: "#505050",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              width: "120px",
              borderRadius: "10px",
              background: "#383838",
              textTransform: "none",
              "&:hover": { background: "#2f2f2f" },
            }}
          >
            {initialData ? "Update" : "Add"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddParameterPopup;
