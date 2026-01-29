import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TextField,
  MenuItem,
  Box,
  Stack,
  Checkbox,
} from "@mui/material";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Dispatch, SetStateAction } from "react";
import { COLORS, days, monthNames } from "./CreateEvent";


interface ScheduleSectionProps {
  schedule: "one" | "daily" | "weekly" | "monthly";
  setSchedule: Dispatch<SetStateAction<"one" | "daily" | "weekly" | "monthly">>;
  fromTime: Dayjs | null;
  toTime: Dayjs | null;
  handleFromTimeChange: (time: Dayjs | null) => void;
  handleToTimeChange: (time: Dayjs | null) => void;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  handleStartDateChange: (date: Dayjs | null) => void;
  handleEndDateChange: (date: Dayjs | null) => void;
  recurWeeks: string;
  setRecurWeeks: Dispatch<SetStateAction<string>>;
  selectedDays: string[];
  toggleDay: (day: string) => void;
  month: string;
  setMonth: Dispatch<SetStateAction<string>>;
  monthDay: string;
  setMonthDay: Dispatch<SetStateAction<string>>;
}

const ScheduleSection = ({
  schedule,
  setSchedule,
  fromTime,
  toTime,
  handleFromTimeChange,
  handleToTimeChange,
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
  recurWeeks,
  setRecurWeeks,
  selectedDays,
  toggleDay,
  month,
  setMonth,
  monthDay,
  setMonthDay,
}: ScheduleSectionProps) => {
  return (
    <>
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
                onChange={handleFromTimeChange}
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
            <Grid item xs={4}>
              <TimePicker
                label="To Time"
                value={toTime}
                onChange={handleToTimeChange}
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
            <Grid item xs={4}>
              <DatePicker
                label="Date"
                value={startDate}
                onChange={handleStartDateChange}
                minDate={dayjs()}
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
                onChange={handleFromTimeChange}
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
                onChange={handleToTimeChange}
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
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate ?? dayjs()}
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
                onChange={handleFromTimeChange}
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
                onChange={handleToTimeChange}
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
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate ?? dayjs()}
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
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate ?? dayjs()}
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
              <TimePicker
                label="From Time"
                value={fromTime}
                onChange={handleFromTimeChange}
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
                onChange={handleToTimeChange}
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
                      <Typography sx={{ fontSize: "13px", color: "#111827" }}>
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
    </>
  );
};

export default ScheduleSection;
