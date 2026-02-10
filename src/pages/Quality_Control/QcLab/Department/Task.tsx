import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { formatDueDateDisplay } from "@/components/Task/FormatDueDateDisplay";
import { trackIcons } from "@/components/Task/trackIcons";
import { AddEventDialog } from "@/components/Task/AddEventDialog";
import TaskDetailsDialog from "@/components/Task/TaskDetailsDialog";
import  AddTaskDialog  from "@/components/Task/AddTaskDialog";


import { ArrowRightRounded } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchTasksByClinic, selectUITasks } from "@/store/taskSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LayersIcon from "@mui/icons-material/Layers";
import { UITask } from "@/types";
import { useLocation } from "react-router-dom";
import { taskEventApi } from "@/services/api";
import {
  fetchTaskEventsByDepartment,
  selectUITaskEvents,
} from "@/store/taskEventSlice";
import { COLORS } from "@/components/Task/colors";

function Task() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const deptName = parts[1].toString();

  const dispatch = useDispatch<AppDispatch>();

  const { data: clinic } = useSelector((s: RootState) => s.clinic);
  const allTasks = useSelector(selectUITasks);
  const taskLoading = useSelector((s: RootState) => s.tasks.loading);
  const events = useSelector(selectUITaskEvents);
  const eventLoading = useSelector((s: RootState) => s.taskEvents.loading);

  const assignees = useSelector((state: RootState) => state.assignees.data);

  const [activeFilter, setActiveFilter] = useState("All");
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<UITask | null>(
    null,
  );
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openTaskDetails, setOpenTaskDetails] = useState(false);
  const [eventError, setEventError] = useState("");
  const [_now, setNow] = useState(Date.now());

  const departmentId = useMemo(() => {
    if (!clinic?.department?.length) return null;

    const dep = clinic.department.find(
      (d) => d.name.toLowerCase() === deptName.toLowerCase(),
    );

    return dep?.id ?? null;
  }, [clinic?.department, deptName]);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (departmentId) {
      dispatch(fetchTaskEventsByDepartment(departmentId));
    }
  }, [departmentId, dispatch]);

  useEffect(() => {
    if (events.length && selectedEventId === null) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    if (clinic?.id) {
      dispatch(fetchTasksByClinic(clinic.id));
    }
  }, [clinic?.id, dispatch]);

  const handleCreateEvent = async (name: string) => {
    if (!departmentId) return;

    try {
      await taskEventApi.create({
        name,
        dep: departmentId,
      });

      toast.success("Task Event created");
      dispatch(fetchTaskEventsByDepartment(departmentId));
    } catch {
      toast.error("Failed to create Task Event");
    }
  };

  const tasks = useMemo(() => {
    if (!selectedEventId) return [];
    return allTasks.filter((t) => t.task_event === selectedEventId);
  }, [allTasks, selectedEventId]);

  const eventTaskCounts = useMemo(() => {
    const counts: Record<number, { assigned: number; unassigned: number }> = {};

    allTasks.forEach((t) => {
      const eventId = t.task_event;
      if (!counts[eventId]) counts[eventId] = { assigned: 0, unassigned: 0 };

      if (t.assignment) {
        counts[eventId].assigned += 1;
      } else {
        counts[eventId].unassigned += 1;
      }
    });

    return counts;
  }, [allTasks]);

  const getTaskTime = (task: UITask) => {
    let tracked = task.total_tracked_sec ?? 0;
    if (task.timer_status === "RUNNING" && task.timer_started_at) {
      tracked +=
        (Date.now() - new Date(task.timer_started_at).getTime()) / 1000;
    }
    return tracked;
  };

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId],
  );

  const showStatus = activeFilter === "All";

  const filteredTasks = useMemo(() => {
    if (activeFilter === "All") return tasks;
    if (activeFilter === "To-Do")
      return tasks.filter((t) => t.status_label === "To - Do");
    if (activeFilter === "In-Progress")
      return tasks.filter((t) => t.status_label === "In Progress");
    if (activeFilter === "Complete")
      return tasks.filter((t) => t.status_label === "Completed");
    return tasks;
  }, [tasks, activeFilter]);

  const handleStatusClick = (
    event: React.MouseEvent<HTMLElement>,
    taskIndex: number,
  ) => {
    event.stopPropagation();
    console.log(taskIndex);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <Box sx={{ width: "100%" }}>
          <Box display="flex" gap={1.5}>
            <Box
              sx={{
                width: 300,
                minHeight: 520,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "14px",
                padding: "14px",
                background: "#FFF",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography fontSize={22} fontWeight={700}>
                  Events
                </Typography>
                <Box
                  onClick={() => {
                    setOpenAddEvent(true);
                    setNewEventName("");
                    setEventError("");
                  }}
                  sx={{
                    width: 18,
                    height: 18,
                    border: "2px solid #454444ff",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <AddIcon sx={{ fontSize: 16, color: "#323234ff" }} />
                </Box>
              </Stack>
              <Box
                sx={{
                  background: COLORS.bgLight,
                  borderRadius: "12px",
                  p: 1.5,
                }}
              >
                <Stack spacing={1.6}>
                  {eventLoading ? (
                    <Typography fontSize={13} color="#9CA3AF">
                      Loading events...
                    </Typography>
                  ) : events.length > 0 ? (
                    events.map((e) => (
                      <Box
                        key={e.id}
                        onClick={() => setSelectedEventId(e.id)}
                        sx={{
                          p: "20px 16px",
                          borderRadius: "12px",
                          border:
                            selectedEventId === e.id
                              ? `1px solid ${COLORS.activeBorder}`
                              : `1px solid ${COLORS.border}`,
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={600}>{e.name}</Typography>
                          <Typography fontWeight={600}>
                            {
                              allTasks.filter((t) => t.task_event === e.id)
                                .length
                            }
                          </Typography>
                        </Stack>

                        <Typography fontSize={12} color={COLORS.textSecondary}>
                          Assigned : {eventTaskCounts[e.id]?.assigned ?? 0} |
                          Unassigned : {eventTaskCounts[e.id]?.unassigned ?? 0}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography fontSize={13} color="#9CA3AF">
                      No events found.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>

            <Box flex={1} minWidth={0}>
              <Typography fontSize={20} fontWeight={700} mb={2}>
                {selectedEvent?.name}
              </Typography>

              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Stack direction="row" gap="2px">
                  {["All", "To-Do", "In-Progress", "Complete"].map(
                    (label, i) => {
                      let IconComponent = null;

                      switch (label) {
                        case "All":
                          IconComponent = LayersIcon;
                          break;
                        case "To-Do":
                          IconComponent = RadioButtonUncheckedIcon;
                          break;
                        case "In-Progress":
                          IconComponent = AutorenewIcon;
                          break;
                        case "Complete":
                          IconComponent = CheckCircleIcon;
                          break;
                      }
                      return (
                        <Button
                          key={label}
                          startIcon={
                            IconComponent ? (
                              <IconComponent fontSize="small" />
                            ) : null
                          }
                          onClick={() => setActiveFilter(label)}
                          sx={{
                            height: 36,
                            width: 140,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius:
                              i === 0
                                ? "6px 0 0 6px"
                                : i === 3
                                  ? "0 6px 6px 0"
                                  : 0,
                            bgcolor:
                              activeFilter === label ? COLORS.dark : "#FFF",
                            color: activeFilter === label ? "#FFF" : "#111",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              bgcolor:
                                activeFilter === label
                                  ? COLORS.dark
                                  : "#F0F0F0",
                              color: activeFilter === label ? "#FFF" : "#111",
                            },
                          }}
                        >
                          {label}
                        </Button>
                      );
                    },
                  )}
                </Stack>
                <Button
                  startIcon={
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        border: "1px solid #111",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AddIcon sx={{ fontSize: 16, color: "#111" }} />
                    </Box>
                  }
                  sx={{
                    height: 36,
                    px: 3,
                    bgcolor: "#F3F4F6",
                    borderRadius: "6px",
                    color: "#111",
                  }}
                  onClick={() => {
                    setOpenAddTask(true);
                  }}
                >
                  Add Task
                </Button>
              </Stack>

              <Stack direction="row" pb={1} pt={1}>
                <Typography
                  width="42%"
                  fontSize={13}
                  color="#9CA3AF"
                  fontWeight={500}
                >
                  Name
                </Typography>
                <Typography
                  width="20%"
                  fontSize={13}
                  color="#9CA3AF"
                  fontWeight={500}
                >
                  Track Time
                </Typography>
                {showStatus && (
                  <Typography
                    width="16%"
                    fontSize={13}
                    color="#9CA3AF"
                    fontWeight={500}
                  >
                    Status
                  </Typography>
                )}
                <Typography
                  width={showStatus ? "14%" : "30%"}
                  fontSize={13}
                  color="#9CA3AF"
                  fontWeight={500}
                >
                  Due Date
                </Typography>
                <Typography width="8%" />
              </Stack>
              <Divider />

              <Stack spacing="2px" mt={1}>
                {taskLoading ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    <Typography fontSize={13}>Loading tasks...</Typography>
                  </Box>
                ) : filteredTasks.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    <Typography fontSize={13}>
                      No tasks found for this event
                    </Typography>
                  </Box>
                ) : (
                  filteredTasks.map((t, i) => {
                    const dueInfo = formatDueDateDisplay(t.due_date ?? "");
                    return (
                      <Stack
                        key={i}
                        direction="row"
                        alignItems="center"
                        sx={{
                          py: 1.2,
                          px: 1,
                          bgcolor: COLORS.rowBg,
                          borderRadius: "8px",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#F3F4F6",
                          },
                        }}
                        onClick={() => {
                          setSelectedTaskDetails(t);
                          setOpenTaskDetails(true);
                        }}
                      >
                        <Typography
                          width="42%"
                          sx={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                          }}
                        >
                          {t.name}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          width="20%"
                          alignItems="center"
                        >
                          {trackIcons(t.timer_status || "IDLE")}
                          <Typography fontSize={13}>
                            {formatSeconds(getTaskTime(t))}
                          </Typography>
                        </Stack>

                        {showStatus && (
                          <Box width="16%">
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                height: 22,
                                borderRadius: 8,
                                bgcolor:
                                  t.status_label === "Completed"
                                    ? COLORS.complete
                                    : t.status_label === "In Progress"
                                      ? COLORS.progress
                                      : COLORS.todo,
                                color: "#fff",
                                overflow: "hidden",
                              }}
                              onClick={(e) => handleStatusClick(e, i)}
                            >
                              <Typography
                                sx={{
                                  px: 1.2,
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#fff",
                                }}
                              >
                                {t.status_label}
                              </Typography>

                              <Box
                                sx={{
                                  width: 14,
                                  minWidth: 14,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderLeft:
                                    "1px solid rgba(255,255,255,0.35)",
                                  cursor: "pointer",
                                }}
                              >
                                <ArrowRightRounded
                                  sx={{ fontSize: 20, color: "#fff" }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        )}
                        <Typography
                          width={showStatus ? "14%" : "30%"}
                          sx={{ whiteSpace: "nowrap", color: dueInfo.color }}
                        >
                          {dueInfo.text}
                        </Typography>
                        <Box
                          width="8%"
                          display="flex"
                          justifyContent="flex-end"
                        >
                          {t.assignment ? (
                            <Tooltip
                              title={
                                assignees.find((u) => u.id === t.assignment)
                                  ?.emp_name || ""
                              }
                              arrow
                            >
                              <Avatar sx={{ width: 28, height: 28 }}>
                                {assignees.find((u) => u.id === t.assignment)
                                  ?.emp_name?.[0] || "?"}
                              </Avatar>
                            </Tooltip>
                          ) : (
                            <Avatar
                              sx={{ width: 28, height: 28, bgcolor: "#ccc" }}
                            >
                              ?
                            </Avatar>
                          )}
                        </Box>
                      </Stack>
                    );
                  })
                )}
              </Stack>
            </Box>
          </Box>

          <AddEventDialog
            openAddEvent={openAddEvent}
            setOpenAddEvent={setOpenAddEvent}
            newEventName={newEventName}
            setNewEventName={setNewEventName}
            eventError={eventError}
            setEventError={setEventError}
            onCreate={handleCreateEvent}
          />

          <AddTaskDialog
            open={openAddTask}
            onClose={() => setOpenAddTask(false)}
            taskEvents={events}
            initialSelectedEvent={selectedEvent?.id ?? null}
            onTaskCreated={() => {
              if (clinic?.id) {
                dispatch(fetchTasksByClinic(clinic.id));
              }
            }}
          />

          <TaskDetailsDialog
            open={openTaskDetails}
            onClose={() => setOpenTaskDetails(false)}
            task={selectedTaskDetails}
            onUpdated={() => {
              if (clinic?.id) {
                dispatch(fetchTasksByClinic(clinic.id)); 
              }
              setOpenTaskDetails(false); 
              setSelectedTaskDetails(null);
            }}
          />
        </Box>
      </div>
    </LocalizationProvider>
  );
}

export default Task;