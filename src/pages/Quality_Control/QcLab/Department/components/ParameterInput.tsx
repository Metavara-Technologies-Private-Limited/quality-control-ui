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
      "& .MuiOutlinedInput-root": {
        height: 50,
        fontSize: 16,
        fontWeight: 500,
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
