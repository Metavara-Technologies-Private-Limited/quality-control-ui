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
  // DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Checkbox,
  MenuItem,
  IconButton,
} from "@mui/material";

import {
  TimePicker,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import AddEquipmentDialog from "@/pages/Quality_Control/Configuration/AddEquipmentDialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Assignee } from "@/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { eventApi } from "@/services/api";

type SelectedEquipment = {
  equipment: {
    id: number;
    equipment_name: string;
    make?: string;
    model?: string;
    parameters: {
      id: number;
      name: string;
    }[];
  };
};

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

/* ================= CONSTANTS ================= */
// const assigneeOptions = [
//   "John Doe",
//   "Jane Smith",
//   "Alice Johnson",
//   "Bob Williams",
//   "Michael Brown",
// ];

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
  weekly: 2,
  monthly: 3,
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
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>([]);
  const [addedAssignees, setAddedAssignees] = useState<Assignee[]>([]);

  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    ""
  );

  const [addedEquipments, setAddedEquipments] = useState<SelectedEquipment[]>(
    []
  );
  console.info("addedEquipments", addedEquipments);

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data
  );
  const departments = clinic ? clinic.department : [];

  const allEquipments =
    clinic && selectedDepartmentId
      ? clinic.department
          .filter((dep) => dep.id === selectedDepartmentId)
          .flatMap((dep) =>
            dep.equipments.map((eq) => ({ ...eq, department: dep }))
          )
      : [];

  const filteredAssignees = selectedDepartmentId
    ? assigneeOptions.filter(
        (a) =>
          a.department_name ===
          departments.find((d) => d.id === selectedDepartmentId)?.name
      )
    : [];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddAssignees = () => {
    setAddedAssignees((prev) => {
      const map = new Map<number, Assignee>();
      prev.forEach((a) => map.set(a.id, a));
      selectedAssignees.forEach((a) => map.set(a.id, a));
      return Array.from(map.values());
    });

    setSelectedAssignees([]);
    setAssigneeDialogOpen(false);
  };

  const handleSave = async () => {
    if (!clinic?.id || !selectedDepartmentId || !fromTime || !toTime) {
      toast.warn("Please fill required fields");
      return;
    }

    try {
      await eventApi.create({
        department_id: selectedDepartmentId,
        event_name: eventName,
        description,

        assignment_id: addedAssignees[0]?.id ?? null,

        equipment_ids: addedEquipments.map(
          (e: SelectedEquipment) => e.equipment.id
        ),

        // optional – remove if not needed
        parameter_ids: addedEquipments.flatMap((e: SelectedEquipment) =>
          e.equipment.parameters.map((p) => p.id)
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
        <Typography fontWeight={600} mb={3}>
          Create Event
        </Typography>

        {/* EVENT INFO */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Event Name"
              size="small"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Description"
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Department"
              value={selectedDepartmentId}
              onChange={(e) => {
                setSelectedDepartmentId(Number(e.target.value));
                setAddedEquipments([]); // reset dependent data
                setAddedAssignees([]);
              }}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider />

        {/* SCHEDULE */}
        <Typography fontWeight={600} mt={3}>
          Select Schedule
        </Typography>

        <RadioGroup
          row
          value={schedule}
          onChange={(e) => setSchedule(e.target.value as any)}
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
          {/* ONE TIME */}
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
                    onChange={setStartDate}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* DAILY */}
          {schedule === "daily" && (
            <>
              <Typography fontWeight={600} mt={2}>
                Daily Details
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
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </Grid>
                <Grid item xs={4}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth size="small" label="Recur Day" />
                </Grid>
              </Grid>
            </>
          )}

          {/* WEEKLY */}
          {schedule === "weekly" && (
            <>
              <Typography fontWeight={600} mt={2}>
                Weekly Details
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
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </Grid>
                <Grid item xs={4}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recur Every Weeks On"
                    value={recurWeeks}
                    onChange={(e) => setRecurWeeks(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography fontWeight={600} mt={2}>
                Days
              </Typography>

              <Stack direction="row" spacing={2} mt={1}>
                {days.map((d) => (
                  <FormControlLabel
                    key={d}
                    control={
                      <Checkbox
                        checked={selectedDays.includes(d)}
                        onChange={() => toggleDay(d)}
                        sx={{
                          color: "#D1D5DB",
                          "&.Mui-checked": { color: "#8BC34A" },
                        }}
                      />
                    }
                    label={d}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* MONTHLY */}
          {schedule === "monthly" && (
            <>
              <Typography fontWeight={600} mt={2}>
                Monthly Details
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
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </Grid>
                <Grid item xs={4}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </Grid>

                {/* MONTH NAME DROPDOWN */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Months"
                    select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {monthNames.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* DAY */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Day"
                    select
                    value={monthDay}
                    onChange={(e) => setMonthDay(e.target.value)}
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
            </>
          )}
        </LocalizationProvider>

        <Divider sx={{ my: 3 }} />

        {/* EQUIPMENT */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600} color="#111827">
            Equipment
          </Typography>

          <Button
            onClick={() => setEquipmentDialogOpen(true)}
            disabled={!selectedDepartmentId}
            sx={{
              color: "#2563EB", // ✅ exact screenshot blue
              fontWeight: 500,
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            + Add Equipment
          </Button>
        </Box>

        <Box mt={2} border="1px solid #E5E7EB" borderRadius="12px">
          {addedEquipments.map((e) => (
            <Box
              key={e.equipment.id}
              px={2}
              py={1.5}
              display="flex"
              alignItems="flex-start"
              gap={2}
              borderBottom="1px solid #F1F5F9"
              sx={{
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              {/* LEFT PANEL – EQUIPMENT BOX */}
              <Box width={220}>
                <Typography fontSize={14} fontWeight={600} color="#111827">
                  {e.equipment.equipment_name}
                </Typography>

                {/* <Typography fontSize={12} color="#6B7280">
          Make: {e.equipment.make || "-"}
        </Typography>

        <Typography fontSize={12} color="#6B7280">
          Model: {e.equipment.model || "-"}
        </Typography> */}
              </Box>

              {/* RIGHT PANEL – PARAMETERS */}
              <Box display="flex" gap={1} flexWrap="wrap">
                {e.equipment.parameters.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.name}
                    size="small"
                    sx={{
                      backgroundColor: "#F5F7FA",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ASSIGNEE */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography fontWeight={600} color="#111827">
            Assignee
          </Typography>

          <Button
            disabled={!selectedDepartmentId}
            onClick={() => setAssigneeDialogOpen(true)}
            sx={{
              color: "#2563EB", // ✅ exact screenshot blue
              fontWeight: 500,
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            + Add Assignee
          </Button>
        </Box>

        <Stack direction="row" spacing={1} mt={1}>
          {addedAssignees.map((a) => (
            <Chip
              key={a.id}
              label={a.emp_name}
              sx={{
                backgroundColor: "#F5F7FA",
                color: "#111827",
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>

        {/* ACTIONS */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          {/* CLEAR ALL */}
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "#D1D5DB",
              color: "#374151",
              fontWeight: 500,
              px: 3,
              height: "44px",
              "&:hover": {
                borderColor: "#9CA3AF",
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            Clear All
          </Button>

          {/* SAVE */}
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              backgroundColor: "#4B4B4B", // ✅ exact screenshot dark grey
              color: "#FFFFFF",
              fontWeight: 500,
              px: 4,
              height: "44px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#3F3F3F",
                boxShadow: "none",
              },
            }}
          >
            Save
          </Button>
        </Box>

        {/* ASSIGNEE DIALOG */}
        {/* ASSIGNEE DIALOG */}
        <Dialog
          open={assigneeDialogOpen}
          onClose={() => setAssigneeDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              width: 520,
            },
          }}
        >
          {/* HEADER WITH ARROW / CLOSE ICON */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            borderBottom="1px solid #E5E7EB"
          >
            <Typography fontSize={18} fontWeight={600} color="#111827">
              Select Assignees
            </Typography>

            <IconButton
              onClick={() => setAssigneeDialogOpen(false)}
              sx={{ color: "#6B7280" }}
            >
              ✕
            </IconButton>
          </Box>

          {/* CONTENT */}
          <DialogContent sx={{ px: 3, pt: 3 }}>
            <Autocomplete
              multiple
              options={filteredAssignees}
              value={selectedAssignees}
              onChange={(_, v) => setSelectedAssignees(v)}
              getOptionLabel={(option) => option.emp_name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Assignees"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      minHeight: 52,
                    },
                  }}
                />
              )}
            />
          </DialogContent>

          {/* ACTIONS */}
          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setAssigneeDialogOpen(false)}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                color: "#374151",
                px: 3,
                height: 44,
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddAssignees}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                backgroundColor: "#4B4B4B",
                color: "#FFFFFF",
                px: 4,
                height: 44,
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#3F3F3F",
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
              const map = new Map<number, any>();

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
