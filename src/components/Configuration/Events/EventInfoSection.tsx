import { Grid, TextField, Typography, MenuItem } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { SelectedEquipmentData } from "@/components/Configuration/Events/AddEquipmentDialog";
import { Assignee } from "@/types";
import { toast } from "react-toastify";

interface EventInfoSectionProps {
  eventName: string;
  setEventName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: Dispatch<SetStateAction<number | null>>;
  departments: any[];
  setAddedEquipments: Dispatch<SetStateAction<SelectedEquipmentData[]>>;
  setAddedAssignee: Dispatch<SetStateAction<Assignee | null>>;
}

const EventInfoSection = ({
  eventName,
  setEventName,
  description,
  setDescription,
  selectedDepartmentId,
  setSelectedDepartmentId,
  departments,
  setAddedEquipments,
  setAddedAssignee,
}: EventInfoSectionProps) => {
  const handleEventNameChange = (value: string) => {
    const regex = /^[A-Za-z][A-Za-z0-9]*$/;

    if (value === "" || regex.test(value)) {
      setEventName(value);
      return;
    }

    toast.error("Enter alphanumeric only", {
      position: "top-right",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <Typography
        sx={{
          fontFamily: "Montserrat",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "100%",
          letterSpacing: "0%",
          mb: 3,
          color: "#111827",
        }}
      >
        Event Name
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Name"
            size="small"
            value={eventName}
            onChange={(e) => handleEventNameChange(e.target.value)}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: "#111827",
                "&.Mui-focused": {
                  color: "#111827",
                },
              },
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                "& fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&:hover fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#D1D5DB",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Description"
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: "#111827",
                "&.Mui-focused": {
                  color: "#111827",
                },
              },
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                "& fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&:hover fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#D1D5DB",
                },
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            size="small"
            label="Department"
            value={selectedDepartmentId}
            InputLabelProps={{
              shrink: true,
              sx: { color: "#111827", "&.Mui-focused": { color: "#111827" } },
            }}
            onChange={(e) => {
              setSelectedDepartmentId(Number(e.target.value));
              setAddedEquipments([]);
              setAddedAssignee(null);
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    "& .MuiMenuItem-root": {
                      color: "#111827",
                      "&:hover": { backgroundColor: "transparent" },
                    },
                  },
                },
              },
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                color: "#111827",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#D1D5DB" },
                "&.Mui-focused fieldset": { borderColor: "#D1D5DB" },
              },
            }}
          >
            {departments.map((dep) => (
              <MenuItem key={dep.id} value={dep.id} disableRipple>
                {dep.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </>
  );
};

export default EventInfoSection;
