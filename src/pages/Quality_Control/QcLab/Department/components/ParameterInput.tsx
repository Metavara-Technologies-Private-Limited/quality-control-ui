// department/components/ParameterInput.tsx

import { TextField, MenuItem } from "@mui/material";
import { Parameter } from "@/types";

interface ParameterInputProps {
  parameter: Parameter;
  value: string;
  onChange: (value: string) => void;
}

export default function ParameterInput({
  parameter,
  value,
  onChange,
}: ParameterInputProps) {
  const cfg = parameter.config;
  if (!cfg) return null;

  const commonProps = {
  fullWidth: true,
  value: value ?? "",
  onChange: (e: any) => onChange(e.target.value),
  label: `${parameter.parameter_name || parameter.env_parameter_name}${
    cfg.unit ? ` (${cfg.unit})` : ""
  }`,
  placeholder: "Type here",
  InputLabelProps: { shrink: true },

  sx: {
    /* ---------------------INPUT BOX ---------------*/
    "& .MuiOutlinedInput-root": {
      height: "48px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: 500,
      backgroundColor: "#FFFFFF",

      "& fieldset": {
        borderColor: "#9e9e9e",
        borderWidth: "1.5px",
      },

      "&:hover fieldset": {
        borderColor: "#232323",
      },

      "&.Mui-focused fieldset": {
        borderColor: '#828282', 
      },
    },

    /* INPUT TEXT */
    "& .MuiInputBase-input": {
      padding: "12px 14px",
      color: "#0F172A",
    },

    /* PLACEHOLDER */
    "& .MuiInputBase-input::placeholder": {
      color: "#9e9e9e",
      opacity: 1,
      fontWeight: 500,
      fontSize: "16px",
    },

    /* LABEL */
    "& .MuiInputLabel-root": {
  fontSize: "16px",
  fontWeight: 400,
  color: "#232323",
  textTransform: "capitalize",
},

"& .MuiInputLabel-root.Mui-focused": {
  color: "#232323", 
},

    /* DROPDOWN ICON */
    "& .MuiSelect-icon": {
      color: "#232323",
      right: 10,
    },
  },
};


  switch (cfg.data_type) {
    case "Integer":
    case "Decimal":
      return <TextField {...commonProps} type="number" />;

    case "Text":
      return <TextField {...commonProps} type="text" />;

    case "Dropdown":
    case "Select":
      return (
        <TextField {...commonProps} select>
          <MenuItem value="">Select</MenuItem>
          {(cfg.dropdown || []).map((opt: string) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );

    case "Boolean":
      return (
        <TextField {...commonProps} select>
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      );

    default:
      return null;
  }
}
