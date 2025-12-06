import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, Box, Button, IconButton, Checkbox, FormControlLabel, Select } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const AddParameterPopup: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  

  const [dropdownValue, setDropdownValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [percentage, setPercentage] = useState("");
  const [integerValue, setIntegerValue] = useState("");
  const [integerError, setIntegerError] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDataType("");
      setMinValue("");
      setMaxValue("");
      setDropdownValue("");
      setTextValue("");
      setSelectedOptions([]);
      setPercentage("");
      setIntegerValue("");
    }
  }, [open]);

  const handleAdd = () => {
    onAdd({ name, dataType, minValue, maxValue, dropdownValue, textValue, selectedOptions, percentage, integerValue });
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
        Add Parameter
        <IconButton onClick={onClose} sx={{ width: "28px", height: "28px" }}>
          <CloseIcon sx={{ fontSize: "18px", color: "#7A7A7A" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {/* Name */}
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
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
      
      "& .MuiOutlinedInput-root": { 
        height: "50px", 
        paddingTop: "0", 
        paddingBottom: "0",

        "& fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&:hover fieldset": {
          borderColor: "#CFD1D4",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#CFD1D4 !important",
        },
      },
    }}
        />

        {/* Data Type */}
        <TextField
          label="Data Type"
          select
          fullWidth
          size="small"
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
             width: "380px", 
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#232323 !important", 
      },
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
      
      "& .MuiOutlinedInput-root": {
        height: "50px",
        paddingTop: "0", 
        paddingBottom: "0",

        "& fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&:hover fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&.Mui-focused fieldset": {
          borderColor: "#CFD1D4 !important", 
        },
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

        {/* CONDITIONAL FIELDS */}
        {/* Decimal → show Min & Max */}
        {dataType === "Decimal" && (
          <Box sx={{ display: "flex", gap: "16px", justifyContent: "space-between" }}>
  {/* Min °C TextField */}
  <TextField
    label="Min °C"
    
    size="small" 
    value={minValue}
    onChange={(e) => setMinValue(e.target.value)}
    InputLabelProps={{ shrink: true }}
    sx={{
      
      width: "182px",     
      "& .MuiInputLabel-root": { color: "#5F646F !important" },
      "& .MuiInputLabel-root.Mui-focused": { color: "#5F646F !important" },
      
      "& .MuiOutlinedInput-root": {
       
        height: "50px", 
        borderRadius: "10px",
        
        "& fieldset": { 
          borderColor: "#CFD1D4",
          borderWidth: "1px", 
        },
        "&:hover fieldset": { borderColor: "#CFD1D4" },
        "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
      },
      
      "& .MuiInputBase-input": { 
        color: "#5F646F", 
        padding: "10px 10px",
      },
    }}
  />

  {/* Max °C TextField */}
  <TextField
    label="Max °C"
    size="small"
    value={maxValue}
    onChange={(e) => setMaxValue(e.target.value)}
    InputLabelProps={{ shrink: true }}
    sx={{
      width: "182px",

      "& .MuiInputLabel-root": { color: "#5F646F !important" },
      "& .MuiInputLabel-root.Mui-focused": { color: "#5F646F !important" },
      
      "& .MuiOutlinedInput-root": {
        height: "50px", 
        borderRadius: "10px", 
        
        "& fieldset": { 
          borderColor: "#CFD1D4", 
          borderWidth: "1px", 
        },
        "&:hover fieldset": { borderColor: "#CFD1D4" },
        "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
      },
      
      "& .MuiInputBase-input": { 
        color: "#5F646F", 
        padding: "10px 16px",
      },
    }}
  />
</Box>
        )}

        {/* Select (Multiple Selection) → Checkboxes */}
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
                setSelectedOptions(selectedOptions.filter((o) => o !== opt));
              }
            }}
            sx={{
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#232323 !important", 
      },
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
      
      "& .MuiOutlinedInput-root": {
        paddingTop: "0", 
        paddingBottom: "0",

        "& fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&:hover fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&.Mui-focused fieldset": {
          borderColor: "#CFD1D4 !important", 
        },
      },
    }}
          />
        }
        label={opt}
        sx={{ color: "#5F646F" }}
      />
    ))}
  </Box>
)}



        {/* Dropdown → show another dropdown */}
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
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#232323 !important", 
      },
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
      
      "& .MuiOutlinedInput-root": {
        height: "50px", 
        paddingTop: "0", 
        paddingBottom: "0",

        "& fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&:hover fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&.Mui-focused fieldset": {
          borderColor: "#CFD1D4 !important", 
        },
      },
    }}
  >
    <MenuItem value="Option1">Drop1</MenuItem>
    <MenuItem value="Option2">Drop2</MenuItem>
    <MenuItem value="Option3">Drop3</MenuItem>
  </TextField>
)}



        {/* Text → Text Area */}
        {dataType === "Text" && (
  <Box sx={{ display: "flex", flexDirection: "row", gap: "10px" }}>
    <TextField
      label="Add Text Here"
      value={textValue}
      onChange={(e) => setTextValue(e.target.value)}
      fullWidth
      InputLabelProps={{ shrink: true }}
      sx={{
        width: "380px", 
        "& .MuiInputLabel-root.Mui-focused": {
        color: "#232323 !important", 
      },
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
              
        "& .MuiOutlinedInput-root": {
          height: "50px",
          borderRadius: "10px",

          "& fieldset": {
            borderColor: "#CFD1D4", 
            borderWidth: "1px",
          },
          "&:hover fieldset": {
            borderColor: "#CFD1D4",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#CFD1D4 !important", 
          },
        },

        "& textarea": {
          padding: "5px 16px !important", 
        },
      }}
    />
  </Box>
)}

{/* Text → Text Area */}
{dataType === "Percentage" && (
  <Box sx={{ display: "flex", flexDirection: "row", gap: "10px" }}>
    <TextField 
      label="Percentage" 
      fullWidth
      value={percentage}
      onChange={(e) => setPercentage(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{
         width: "380px", 
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#232323 !important", 
      },
      
      "& .MuiInputLabel-root": {
        color: "#5F646F !important",
      },
      
      "& .MuiOutlinedInput-root": {
       
        height: "50px", 
        paddingTop: "0", 
        paddingBottom: "0",

        "& fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&:hover fieldset": {
          borderColor: "#CFD1D4", 
        },
        "&.Mui-focused fieldset": {
          borderColor: "#CFD1D4 !important", 
        },
      },
    }}
    />
  </Box>
)}

    {/* Integer → Text Area */}
{dataType === "Integer" && (
  <Box sx={{ display: "flex", flexDirection: "row", gap: "10px" }}>
    <TextField
      label="Integer Value"
      fullWidth
      error={integerError}
      helperText={integerError ? "This field is required" : ""}
      value={integerValue}
      onChange={(e) => {
        setIntegerValue(e.target.value);
        setIntegerError(e.target.value.trim() === "");
      }}
      InputLabelProps={{ shrink: true }}
      sx={{
        width: "380px",
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#232323 !important",
        },
        "& .MuiInputLabel-root": {
          color: "#5F646F !important",
        },
        "& .MuiOutlinedInput-root": {
          height: "50px",
          paddingTop: "0",
          paddingBottom: "0",
          "& fieldset": {
            borderColor: "#CFD1D4",
          },
          "&:hover fieldset": {
            borderColor: "#CFD1D4",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#CFD1D4 !important",
          },
        },
      }}
    />
  </Box>
)}



    {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              width: "120px",
              borderRadius: "10px",
              borderColor: "#505050",
              alignItems: "left",
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
              alignItems: "left",
              "&:hover": { background: "#2f2f2f" },
            }}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddParameterPopup;
