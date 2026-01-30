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
  MenuItem,
  IconButton,
} from "@mui/material";

import {
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import AddEquipmentDialog, {
  SelectedEquipmentData,
} from "@/components/Configuration/Events/AddEquipmentDialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Assignee } from "@/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { eventApi } from "@/services/api";

import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import { useNavigate } from "react-router-dom";

import EventInfoSection from "./EventInfoSection";
import ScheduleSection from "./ScheduleSection";
import EquipmentSection from "./EquipmentSection";
import AssigneeDialog from "./AssigneeDialog";
import AssigneeSection from "./AssigneeSection";

/* ================= COLORS ================= */
export const COLORS = {
  primary: "#F36F45",
  text: "#2B2B2B",
  muted: "#6B7280",
  border: "#ECEEF0",
  bg: "#F6F6F6",
  link: "#2FB5A9",
  button: "#4B4B4B",
  chip: "#F5F7FA",
};

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const monthNames = [
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

export const scheduleTypeMap: Record<ScheduleType, number> = {
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

  // Time validation handlers
  const handleFromTimeChange = (time: Dayjs | null) => {
    if (!time) {
      setFromTime(null);
      return;
    }

    const now = dayjs();
    if (startDate && startDate.isSame(now, 'day')) {
      const selectedMinutes = time.hour() * 60 + time.minute();
      const currentMinutes = now.hour() * 60 + now.minute();
      
      if (selectedMinutes < currentMinutes) {
        toast.warn("From time cannot be in the past");
        return;
      }
    }

    if (toTime && time.isAfter(toTime)) {
      toast.warn("From time cannot be after To time");
      setToTime(null);
    }

    setFromTime(time);
  };

  const handleToTimeChange = (time: Dayjs | null) => {
    if (!time) {
      setToTime(null);
      return;
    }

    const now = dayjs();
    if (startDate && startDate.isSame(now, 'day')) {
      const selectedMinutes = time.hour() * 60 + time.minute();
      const currentMinutes = now.hour() * 60 + now.minute();
      
      if (selectedMinutes < currentMinutes) {
        toast.warn("To time cannot be in the past");
        return;
      }
    }

    if (fromTime) {
      const toMinutes = time.hour() * 60 + time.minute();
      const fromMinutes = fromTime.hour() * 60 + fromTime.minute();
      
      if (toMinutes <= fromMinutes) {
        toast.warn("To time must be greater than From time");
        return;
      }
    }

    setToTime(time);
  };

  // Date validation handlers

  const handleStartDateChange = (date: Dayjs | null) => {
    if (!date) {
      setStartDate(null);
      return;
    }

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

  const allEquipments =
    clinic && selectedDepartmentId
      ? clinic.department
          .filter((dep) => dep.id === selectedDepartmentId)
          .flatMap((dep) =>
            dep.equipments.map((eq) => ({ ...eq, department: dep })),
          )
      : [];

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
      const equipmentDetailsIds = Array.from(
        new Set(addedEquipments.map((e) => e.equipment_detail.id)),
      );

      const parameterIds = Array.from(
        new Set(addedEquipments.flatMap((e) => e.parameters.map((p) => p.id))),
      );

      await eventApi.create({
        department_id: selectedDepartmentId,
        event_name: eventName,
        description,
        assignment_id: addedAssignee?.id ?? null,
        equipment_details_ids: equipmentDetailsIds,
        parameter_ids: parameterIds,
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
    } catch (err: any) {
      console.error("Create event failed:", err);
      const errorMsg =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create event. Please check selected parameters.";
      toast.error(errorMsg);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          <EventInfoSection
            eventName={eventName}
            setEventName={setEventName}
            description={description}
            setDescription={setDescription}
            selectedDepartmentId={selectedDepartmentId}
            setSelectedDepartmentId={setSelectedDepartmentId}
            departments={departments}
            setAddedEquipments={setAddedEquipments}
            setAddedAssignee={setAddedAssignee}
          />

          <Divider />

          <ScheduleSection
            schedule={schedule}
            setSchedule={setSchedule}
            fromTime={fromTime}
            toTime={toTime}
            handleFromTimeChange={handleFromTimeChange}
            handleToTimeChange={handleToTimeChange}
            startDate={startDate}
            endDate={endDate}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
            recurWeeks={recurWeeks}
            setRecurWeeks={setRecurWeeks}
            selectedDays={selectedDays}
            toggleDay={toggleDay}
            month={month}
            setMonth={setMonth}
            monthDay={monthDay}
            setMonthDay={setMonthDay}
          />

          <Divider sx={{ my: 3 }} />

          <EquipmentSection
            selectedDepartmentId={selectedDepartmentId}
            setEquipmentDialogOpen={setEquipmentDialogOpen}
            addedEquipments={addedEquipments}
          />

          <AssigneeSection
            selectedDepartmentId={selectedDepartmentId}
            setAssigneeDialogOpen={setAssigneeDialogOpen}
            addedAssignee={addedAssignee}
            setAddedAssignee={setAddedAssignee}
          />

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
                  borderColor: "#D1D5DB",
                  backgroundColor: "#FFFFFF",
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
                  backgroundColor: "#4B4B4B",
                  boxShadow: "none",
                },
              }}
            >
              Save
            </Button>
          </Box>

          <AssigneeDialog
            open={assigneeDialogOpen}
            onClose={() => setAssigneeDialogOpen(false)}
            filteredAssignees={filteredAssignees}
            selectedAssignee={selectedAssignee}
            setSelectedAssignee={setSelectedAssignee}
            handleAddAssignee={handleAddAssignee}
          />

          <AddEquipmentDialog
            open={equipmentDialogOpen}
            onClose={() => setEquipmentDialogOpen(false)}
            equipments={allEquipments}
            onAdd={(items) => {
              setAddedEquipments((prev) => {
                const map = new Map<number, SelectedEquipmentData>();
                prev.forEach((e) => {
                  map.set(e.equipment_detail.id, e);
                });
                items.forEach((e) => {
                  map.set(e.equipment_detail.id, e);
                });
                return Array.from(map.values());
              });
            }}
          />
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateEvent;
