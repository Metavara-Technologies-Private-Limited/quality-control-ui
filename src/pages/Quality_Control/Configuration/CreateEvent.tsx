import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  Autocomplete,
  Checkbox,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  TimePicker,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import AddEquipmentDialog, {
  SelectedEquipmentData,
} from "@/pages/Quality_Control/Configuration/AddEquipmentDialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Assignee } from "@/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { eventApi } from "@/services/api";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import { useNavigate } from "react-router-dom";

/* ================= COLORS ================= */
const COLORS = {
  primary: "#F36F45",
  text: "#2B2B2B",
  muted: "#6B7280",
  border: "#ECEEF0",
  bg: "#F6F6F6",
  link: "#2FB5A9",
  button: "#4B4B4B",
  chip: "#F5F7FA",
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type ScheduleType = "one" | "daily" | "weekly" | "monthly";

const scheduleTypeMap: Record<ScheduleType, number> = {
  one: 1,
  daily: 2,
  weekly: 3,
  monthly: 4,
};

/* ================= COMPONENT ================= */
const CreateEvent = () => {
  const [schedule, setSchedule] = useState<
    "one" | "daily" | "weekly" | "monthly"
  >("one");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");

  const [fromTime, setFromTime] = useState<Dayjs | null>(dayjs());
  const [toTime, setToTime] = useState<Dayjs | null>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const [recurWeeks, setRecurWeeks] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Sun", "Mon"]);

  const [month, setMonth] = useState("");
  const [monthDay, setMonthDay] = useState("");

  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(
    null,
  );
  const [addedAssignee, setAddedAssignee] = useState<Assignee | null>(null);

  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);

  // Updated type to use SelectedEquipmentData from dialog
  const [addedEquipments, setAddedEquipments] = useState<
    SelectedEquipmentData[]
  >([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic ? clinic.department : [];
  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data,
  );

  const navigate = useNavigate();

  //date handlers
  const handleStartDateChange = (date: Dayjs | null) => {
    if (!date) {
      setStartDate(null);
      return;
    }

    // If endDate exists and new startDate is after endDate → reset endDate
    if (endDate && date.isAfter(endDate, "day")) {
      toast.warn("Start date cannot be after end date");
      setEndDate(null);
    }

    setStartDate(date);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    if (!date) {
      setEndDate(null);
      return;
    }

    // If startDate exists and endDate is before startDate → reject
    if (startDate && date.isBefore(startDate, "day")) {
      toast.warn("End date cannot be before start date");
      return;
    }

    setEndDate(date);
  };

  const handleClearAll = () => {
    setEventName("");
    setDescription("");
    setAddedEquipments([]);
    setSelectedAssignee(null);
    setAddedAssignee(null);
  };

  // Get all equipments from all departments
  const allEquipments =
    clinic && selectedDepartmentId
      ? clinic.department
          .filter((dep) => dep.id === selectedDepartmentId)
          .flatMap((dep) =>
            dep.equipments.map((eq) => ({ ...eq, department: dep })),
          )
      : [];

  // Use all assignees without department filtering
  const filteredAssignees = selectedDepartmentId
    ? assigneeOptions.filter(
        (a) =>
          a.department_name ===
          departments.find((d) => d.id === selectedDepartmentId)?.name,
      )
    : [];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleAddAssignee = () => {
    if (selectedAssignee) {
      setAddedAssignee(selectedAssignee);
      setSelectedAssignee(null);
      setAssigneeDialogOpen(false);
    }
  };

  // Helper function to get only selected parameters for display
  const getSelectedParameters = (item: SelectedEquipmentData) => {
    const selectedParamIds = item.parameters.map((p) => p.id);
    return item.equipment.parameters.filter((p) =>
      selectedParamIds.includes(p.id),
    );
  };

  const handleSave = async () => {
    if (
      !clinic?.id ||
      !selectedDepartmentId ||
      !eventName.trim() ||
      !description.trim() ||
      !fromTime ||
      !toTime ||
      !addedAssignee ||
      addedEquipments.length === 0
    ) {
      toast.warn("Please fill required fields");
      return;
    }

    try {
      await eventApi.create({
        department_id: selectedDepartmentId,
        event_name: eventName,
        description,

        assignment_id: addedAssignee?.id ?? null,

        // Only send selected equipment IDs
        equipment_ids: addedEquipments.map((e) => e.equipment.id),

        // Only send selected parameter IDs
        parameter_ids: addedEquipments.flatMap((e) =>
          e.parameters.map((p) => p.id),
        ),

        schedule: {
          type: scheduleTypeMap[schedule],
          from_time: fromTime.toISOString(),
          to_time: toTime.toISOString(),

          one_time_date:
            schedule === "one" ? startDate?.toISOString() : undefined,

          start_date: schedule !== "one" ? startDate?.toISOString() : undefined,

          end_date: schedule !== "one" ? endDate?.toISOString() : undefined,

          days: schedule === "weekly" ? selectedDays : undefined,

          recurring_duration:
            schedule === "weekly" ? Number(recurWeeks) : undefined,
        },
      });

      toast.success("Event created successfully");
      setTimeout(() => {
        navigate("/configuration/events", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create event");
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: COLORS.bg }}>
      <ToastContainer />
      <Card
        sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.border}` }}
      >
        <Box mb={2}>
          <Box display="flex" flexDirection="column" gap="12px">
            <IconButton
              onClick={() => navigate("../events")}
              sx={{
                width: 24,
                height: 24,
                padding: "10px",
                opacity: 1,
                color: "#374151",
                borderRadius: 1,
                boxShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                backgroundColor: "#fff",
              }}
            >
              <TurnLeftIcon sx={{ fontSize: 24, padding: "3px" }} />
            </IconButton>

            <Divider />

            <Typography
              sx={{
                fontFamily: "Montserrat",
                fontWeight: 700,
                fontStyle: "normal", // Bold is controlled by fontWeight
                fontSize: "20px",
                lineHeight: "145%",
                letterSpacing: "0%",
                color: "#111827",
              }}
            >
              Create Event
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontStyle: "normal", // Bold handled by fontWeight
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "0%",
            mb: 3,
            color: "#111827", // optional, remove if not needed
          }}
        >
          Event Name
        </Typography>

        {/* EVENT INFO */}
        <Grid container columnGap="24px" mb={3}>
          <Grid item>
            <TextField
              label="Name"
              size="small"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
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
                width: "380px",

                "& .MuiOutlinedInput-root": {
                  height: "50px",
                  backgroundColor: "#FFFFFF",

                  "& fieldset": {
                    borderColor: "#D1D5DB",
                  },
                  "&:hover fieldset": {
                    borderColor: "#D1D5DB", // no hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D1D5DB", // no focus
                  },
                },
              }}
            />
          </Grid>

          <Grid item>
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
                width: "380px",

                "& .MuiOutlinedInput-root": {
                  height: "50px",
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
          <Grid item xs={6} sx={{ maxWidth: "380px" }}>
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
                width: "380px", // match Name/Description
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

        <Divider />

        {/* SCHEDULE SECTIONS */}
        <Typography fontWeight={700} mt={3}>
          Select Schedule
        </Typography>

        <RadioGroup
          row
          value={schedule}
          onChange={(e) => setSchedule(e.target.value as any)}
          sx={{ gap: 12 }}
        >
          {[
            { label: "One Time", value: "one" },
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ].map((o) => (
            <FormControlLabel
              key={o.value}
              value={o.value}
              control={
                <Radio
                  sx={{
                    color: "#D1D5DB",
                    "&.Mui-checked": { color: COLORS.primary },
                  }}
                />
              }
              label={o.label}
            />
          ))}
        </RadioGroup>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {schedule === "one" && (
            <>
              <Typography fontWeight={600} mt={2}>
                One Time Details
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={4}>
                  <TimePicker
                    label="From Time"
                    value={fromTime}
                    onChange={setFromTime}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TimePicker
                    label="To Time"
                    value={toTime}
                    onChange={setToTime}
                  />
                </Grid>
                <Grid item xs={4}>
                  <DatePicker
                    label="Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    minDate={dayjs()}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {schedule === "daily" && (
            <>
              <Typography fontWeight={600} mt={2} mb={2} color="#111827">
                Daily Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="From Time"
                    value={fromTime}
                    onChange={setFromTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="To Time"
                    value={toTime}
                    onChange={setToTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    minDate={dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate ?? dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recur Day"
                    select
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Everyday">Everyday</MenuItem>
                    <MenuItem value="Weekdays">Weekdays</MenuItem>
                    <MenuItem value="Weekends">Weekends</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          )}

          {schedule === "weekly" && (
            <>
              <Typography fontWeight={600} mb={2} color="#111827">
                Weekly Details
              </Typography>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                  <TimePicker
                    label="From Time"
                    value={fromTime}
                    onChange={setFromTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TimePicker
                    label="To Time"
                    value={toTime}
                    onChange={setToTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    minDate={dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate ?? dayjs()}
                  />
                </Grid>
              </Grid>

              <Typography fontWeight={600} mb={2} color="#111827">
                Recur Every Weeks On
              </Typography>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Weeks"
                    value={recurWeeks}
                    onChange={(e) => setRecurWeeks(e.target.value)}
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Typography fontWeight={600} mb={2} color="#111827">
                Days
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
                {days.map((d) => (
                  <FormControlLabel
                    key={d}
                    control={
                      <Checkbox
                        checked={selectedDays.includes(d)}
                        onChange={() => toggleDay(d)}
                        sx={{
                          color: "#D1D5DB",
                          "&.Mui-checked": { color: "#22C55E" },
                        }}
                      />
                    }
                    label={d}
                    sx={{ color: "#111827", fontWeight: 500 }}
                  />
                ))}
              </Stack>
            </>
          )}

          {schedule === "monthly" && (
            <>
              <Typography fontWeight={600} mb={3} color="#111827">
                Monthly Details
              </Typography>

              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    minDate={dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate ?? dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="From Time"
                    value={fromTime}
                    onChange={setFromTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="To Time"
                    value={toTime}
                    onChange={setToTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Months"
                    select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {monthNames.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography
                      fontWeight={600}
                      color="#111827"
                      sx={{ mb: 1.5, fontSize: "13px" }}
                    ></Typography>
                    <Stack direction="row" spacing={3}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={monthDay === "select"}
                            onChange={() => setMonthDay("select")}
                            size="small"
                            sx={{
                              color: "#D1D5DB",
                              "&.Mui-checked": { color: "#F36F45" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontSize: "13px", color: "#111827" }}
                          >
                            Days
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Radio
                            checked={monthDay === "on"}
                            onChange={() => setMonthDay("on")}
                            size="small"
                            sx={{
                              color: "#D1D5DB",
                              "&.Mui-checked": { color: "#F36F45" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontSize: "13px", color: "#111827" }}
                          >
                            On
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {monthDay === "select" && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Day"
                      select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#FFFFFF",
                        },
                      }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {[...Array(31)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </LocalizationProvider>

        <Divider sx={{ my: 3 }} />

        {/* EQUIPMENT SECTION - TABLE FORMAT */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography fontWeight={700} color="#111827">
            Equipment
          </Typography>

          <Button
            onClick={() => setEquipmentDialogOpen(true)}
            disabled={!selectedDepartmentId}
            sx={{
              color: selectedDepartmentId ? "#2563EB" : "#9CA3AF",
              fontWeight: 500,
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: selectedDepartmentId ? "pointer" : "not-allowed",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: selectedDepartmentId ? "underline" : "none",
              },
            }}
          >
            + Add Equipment
          </Button>
        </Box>

        {/* Equipment Table - ONLY SELECTED PARAMETERS */}
        <TableContainer
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#6B7280",
                    borderBottom: "1px solid #E5E7EB",
                    width: "200px",
                    py: 1.5,
                  }}
                >
                  Equipment Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#6B7280",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                  }}
                >
                  Parameters
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addedEquipments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{
                      textAlign: "center",
                      color: "#9CA3AF",
                      py: 4,
                      fontSize: "14px",
                    }}
                  >
                    No equipment added yet
                  </TableCell>
                </TableRow>
              ) : (
                addedEquipments.map((item, index) => {
                  // Get only the selected parameters
                  const selectedParams = getSelectedParameters(item);

                  return (
                    <TableRow
                      key={item.equipment.id}
                      sx={{
                        "&:last-child td": {
                          borderBottom: "none",
                        },
                        "&:hover": {
                          backgroundColor: "#F9FAFB",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#111827",
                          borderBottom:
                            index === addedEquipments.length - 1
                              ? "none"
                              : "1px solid #F1F5F9",
                          py: 1.5,
                          verticalAlign: "top",
                        }}
                      >
                        {item.equipment.equipment_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom:
                            index === addedEquipments.length - 1
                              ? "none"
                              : "1px solid #F1F5F9",
                          py: 1.5,
                        }}
                      >
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {selectedParams.length > 0 ? (
                            selectedParams.map((p) => (
                              <Chip
                                key={p.id}
                                label={p.name}
                                size="small"
                                sx={{
                                  backgroundColor: "#F3F4F6",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#374151",
                                  height: "28px",
                                  borderRadius: "6px",
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                  },
                                }}
                              />
                            ))
                          ) : (
                            <Typography
                              fontSize={12}
                              color="#9CA3AF"
                              fontStyle="italic"
                            >
                              No parameters selected
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ASSIGNEE SECTION */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography fontWeight={700} color="#000000">
            Assignee
          </Typography>

          <Button
            onClick={() => setAssigneeDialogOpen(true)}
            disabled={!selectedDepartmentId}
            sx={{
              color: selectedDepartmentId ? "#2563EB" : "#9CA3AF",
              fontWeight: 500,
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: selectedDepartmentId ? "pointer" : "not-allowed",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: selectedDepartmentId ? "underline" : "none",
              },
            }}
          >
            + Add Assignee
          </Button>
        </Box>

        <Stack direction="row" spacing={1} mt={1}>
          {addedAssignee && (
            <Chip
              label={addedAssignee.emp_name}
              onDelete={() => setAddedAssignee(null)}
              sx={{
                backgroundColor: "#F5F7FA",
                color: "#000000",
                fontWeight: 500,
              }}
            />
          )}
        </Stack>

        {/* ACTIONS */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={handleClearAll}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "#D1D5DB",
              color: "#000000",
              fontWeight: 500,
              px: 3,
              height: "44px",
              "&:hover": {
                borderColor: "#D1D5DB", // no hover effect
                backgroundColor: "#FFFFFF", // keep white background
              },
            }}
          >
            Clear All
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              backgroundColor: "#4B4B4B",
              color: "#FFFFFF",
              fontWeight: 500,
              px: 4,
              height: "44px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#4B4B4B", // no hover effect
                boxShadow: "none",
              },
            }}
          >
            Save
          </Button>
        </Box>

        {/* ASSIGNEE DIALOG */}
        <Dialog
          open={assigneeDialogOpen}
          onClose={() => setAssigneeDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: "16px", width: 520 },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            borderBottom="1px solid #E5E7EB"
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconButton
                onClick={() => setAssigneeDialogOpen(false)}
                sx={{
                  color: "#374151",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  width: 32,
                  height: 32,
                  "&:hover": { backgroundColor: "#F3F4F6" }, // optional hover
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              <Typography fontSize={18} fontWeight={600} color="#000000">
                Select Assignee
              </Typography>
            </Box>

            <IconButton
              onClick={() => setAssigneeDialogOpen(false)}
              sx={{ color: "#6B7280" }}
            >
              ✕
            </IconButton>
          </Box>

          <DialogContent sx={{ px: 3, pt: 3 }}>
            <Autocomplete
              options={filteredAssignees}
              value={selectedAssignee}
              onChange={(_, v) => setSelectedAssignee(v)}
              getOptionLabel={(option) => option.emp_name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Assignee"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      minHeight: 52,
                      color: "#000000",
                      "&:hover fieldset": { borderColor: "#D1D5DB" }, // no hover effect
                      "&.Mui-focused fieldset": { borderColor: "#D1D5DB" }, // keep focused border
                    },
                    "& .MuiInputLabel-root": { color: "#000000" },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </DialogContent>

          <DialogActions
            sx={{ px: 3, pb: 3, gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              onClick={() => setAssigneeDialogOpen(false)}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                color: "#000000",
                px: 3,
                height: 44,
                fontWeight: 500,
                backgroundColor: "#FFFFFF", // static background
                "&:hover": { backgroundColor: "#FFFFFF" }, // no hover
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddAssignee}
              disabled={!selectedAssignee}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                px: 4,
                height: 44,
                fontWeight: 500,
                "&:hover": { backgroundColor: "#000000" }, // no hover
                "&:disabled": {
                  backgroundColor: "#E5E7EB",
                  color: "#9CA3AF",
                },
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <AddEquipmentDialog
          open={equipmentDialogOpen}
          onClose={() => setEquipmentDialogOpen(false)}
          equipments={allEquipments}
          onAdd={(items) => {
            setAddedEquipments((prev) => {
              const map = new Map<number, SelectedEquipmentData>();

              prev.forEach((e) => {
                map.set(e.equipment.id, e);
              });

              items.forEach((e) => {
                map.set(e.equipment.id, e);
              });

              return Array.from(map.values());
            });
          }}
        />
      </Card>
    </Box>
  );
};

export default CreateEvent;
