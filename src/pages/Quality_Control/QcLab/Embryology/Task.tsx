import React, { useState, useMemo, useRef, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogContent,
 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { EVENTS } from "./utils/taskpage/data/events";
import { COLORS } from "./utils/taskpage/data/colors";
import { TASKS_BY_EVENT_INITIAL } from "./utils/taskpage/data/task_initial_data";
import { formatDueDateDisplay } from "./utils/taskpage/formatDueDateDisplay";

import { trackIcons } from "./utils/taskpage/trackIcons";
import TaskDetailsDialog from "./utils/taskpage/TaskDetailsDIalog";
import AddTaskDialog from "./utils/taskpage/AddTaskDialog";
import { AddEventDialog } from "./utils/taskpage/AddEventDialog";
import { ArrowRightRounded } from "@mui/icons-material";

export default function Task() {
  const [index, setIndex] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState("Daily Maintenance");
  const [activeFilter, setActiveFilter] = useState("All");
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved ? JSON.parse(saved) : EVENTS;
  });
  const [tasksByEvent, setTasksByEvent] = useState(() => {
    const saved = localStorage.getItem("tasksByEvent");
    return saved ? JSON.parse(saved) : TASKS_BY_EVENT_INITIAL;
  });

  const [openAddTask, setOpenAddTask] = useState(false);
  const [addTaskStep, setAddTaskStep] = useState(1);
  const [selectedMaintenance, setSelectedMaintenance] = useState(selectedEvent)
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState("To Do");
  const [newTaskDescription, setNewTaskDescription] = useState();

  const savedRangeRef = React.useRef<Range | null>(null);
  const taskDetailsEditorRef = React.useRef<HTMLDivElement>(null);

  const [subTasks, setSubTasks] = useState<any[]>([]);
 

  const [openTaskDetails, setOpenTaskDetails] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState(0);
  const [taskDetails, setTaskDetails] = useState("");
  const [taskStatus, setTaskStatus] = useState(""); 

  const [activeFormats, setActiveFormats] = useState([]);
  

  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [statusTaskIndex, setStatusTaskIndex] = useState(null);

  
  
  
  
  

  const [mainErrors, setMainErrors] = useState({
    name: "",
    maintenance: "",
    assignee: "",
    dueDate: "",
    description: "",
    status: ""
  });

  const [subTaskErrors, setSubTaskErrors] = useState({
    name: "",
    status: "",
    due: "",
    assignee: ""
  });

  const [taskDetailsErrors, setTaskDetailsErrors] = useState({
    description: ""
  });

  const [eventError, setEventError] = useState("");

  
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("tasksByEvent", JSON.stringify(tasksByEvent));
  }, [tasksByEvent]);

  
  useEffect(() => {
    if (openTaskDetails && selectedTaskDetails) {
      setTaskStatus(selectedTaskDetails.status || "To Do");
    }
  }, [openTaskDetails, selectedTaskDetails]);


  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    setActiveFormats(formats);
  };

  useEffect(() => {
    if (!openTaskDetails || detailsTab !== 0 || !taskDetailsEditorRef.current) return;

    const editor = taskDetailsEditorRef.current;
    const raf1 = requestAnimationFrame(() => {
      const timeoutId = setTimeout(() => {
        if (!editor.isConnected) return;
        editor.innerHTML = '';
        if (taskDetails?.trim()) {
          editor.innerHTML = taskDetails;
        } else {
          editor.innerHTML = '<p style="color:#aaa; font-style:italic;">No description saved yet. Click to edit...</p>';
        }
        void editor.offsetHeight;
        try {
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          editor.focus();
        } catch (err) {
          console.warn("Cursor positioning failed:", err);
        }
        checkFormats();
      }, 0);
    });
    return () => cancelAnimationFrame(raf1);
  }, [openTaskDetails, detailsTab, taskDetails]);

 

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

 

  const showStatus = activeFilter === "All";

  const filteredTasks = useMemo(() => {
    const tasks = tasksByEvent[selectedEvent] || [];
    if (activeFilter === "All") return tasks;
    if (activeFilter === "To-Do") return tasks.filter(t => t.status === "To Do");
    if (activeFilter === "In-Progress") return tasks.filter(t => t.status === "In Progress");
    if (activeFilter === "Complete") return tasks.filter(t => t.status === "Completed");
    return tasks;
  }, [activeFilter, selectedEvent, tasksByEvent]);

 
 const handleStatusClick = (event: React.MouseEvent<HTMLElement>, taskIndex: number) => {
  event.stopPropagation(); 
  setStatusAnchorEl(event.currentTarget);
  setStatusTaskIndex(taskIndex); 
};





  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      
      <div>

       
         <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        <Box sx={{ width: "100%", p: "12px 6px" }}>

        <Box display="flex" gap={1.5}>
          <Box
            sx={{
              width: 300,
              minHeight: 520,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "14px",
              padding: "14px 14px 14px 24px",
              background: "#FFF"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography fontSize={22} fontWeight={700}>Events</Typography>
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
                  cursor: "pointer"
                }}
              >
                <AddIcon sx={{ fontSize: 16, color: "#323234ff" }} />
              </Box>
            </Stack>
            <Box sx={{ background: COLORS.bgLight, borderRadius: "12px", p: 1.5 }}>
              <Stack spacing={1.6}>
                {events.map(e => (
                  <Box
                    key={e.name}
                    onClick={() => setSelectedEvent(e.name)}
                    sx={{
                      p: "20px 16px",
                      borderRadius: "12px",
                      border: selectedEvent === e.name ? `1px solid ${COLORS.activeBorder}` : `1px solid ${COLORS.border}`,
                      background: "#FFF",
                      cursor: "pointer"
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={600}>{e.name}</Typography>
                      <Typography fontWeight={600}>{e.count}</Typography>
                    </Stack>
                    <Typography fontSize={12} color={COLORS.textSecondary}>
                      Assigned : {e.assigned} | Unassigned : {e.unassigned}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box flex={1} minWidth={0}>
            <Typography fontSize={20} fontWeight={700} mb={2}>{selectedEvent}</Typography>

            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Stack direction="row" gap="2px">
                {["All", "To-Do", "In-Progress", "Complete"].map((label, i) => (
                  <Button
                    key={label}
                    onClick={() => setActiveFilter(label)}
                    sx={{
                      height: 36,
                      width: 140,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: i === 0 ? "6px 0 0 6px" : i === 3 ? "0 6px 6px 0" : 0,
                      bgcolor: activeFilter === label ? COLORS.dark : "#FFF",
                      color: activeFilter === label ? "#FFF" : "#111",
                      fontWeight: 500,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: activeFilter === label ? COLORS.dark : "#F0F0F0",
                        color: activeFilter === label ? "#FFF" : "#111",
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
              <Button
                startIcon={<AddIcon sx={{ color: "#111" }} />}
                sx={{ height: 36, px: 3, bgcolor: "#F3F4F6", borderRadius: "6px", color: "#111" }}
                onClick={() => {
                  setOpenAddTask(true);
                  setSelectedMaintenance(selectedEvent);
                  setAddTaskStep(1);
                  setMainErrors({ name: "", maintenance: "", assignee: "", dueDate: "", description: "" });
                  setSubTaskErrors({ name: "", status: "", due: "", assignee: "" });
                  setNewTaskDescription("");
                  setSubTasks([]);
                  setDueDate(null);
                  setNewTaskStatus("To Do");
                }}
              >
                Add Task
              </Button>
            </Stack>

            <Stack direction="row" pb={1} pt={1}>
              <Typography width="42%" fontSize={13} color="#9CA3AF" fontWeight={500}>Name</Typography>
              <Typography width="20%" fontSize={13} color="#9CA3AF" fontWeight={500}>Track Time</Typography>
              {showStatus && <Typography width="16%" fontSize={13} color="#9CA3AF" fontWeight={500}>Status</Typography>}
              <Typography width={showStatus ? "14%" : "30%"} fontSize={13} color="#9CA3AF" fontWeight={500}>Due Date</Typography>
              <Typography width="8%" />
            </Stack>
            <Divider />

            <Stack spacing="2px" mt={1}>
              {filteredTasks.map((t, i) => {
                const dueInfo = formatDueDateDisplay(t.due);
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
                        backgroundColor: "#F3F4F6"
                      }
                    }}
                    onClick={() => {
                      setSelectedTaskDetails(t);
                      setIndex(i)
                      setTaskDetails(t.description || "<p style=\"color:#aaa; font-style:italic;\">No description saved yet. Click here to add details...</p>");
                      setOpenTaskDetails(true);
                      setDetailsTab(0);
                      setTaskDetailsErrors({ description: "" });
                    }}
                  >
                    <Typography
                      width="42%"
                      sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: 1.4
                      }}
                    >
                      {t.name}
                    </Typography>
                    <Stack direction="row" spacing={1.2} width="20%" alignItems="center">
                      {trackIcons(t.status)}
                      <Typography fontSize={13}>{t.time}</Typography>
                    </Stack>
                    {showStatus && (
                      <Box width="16%">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            height: 22,
                            borderRadius: 8,
                            bgcolor: t.status === "Completed" ? COLORS.complete : t.status === "In Progress" ? COLORS.progress : COLORS.todo,
                            color: "#fff",
                            overflow: "hidden"
                          }}
                          onClick={(e) => handleStatusClick(e, i)}
                        >
                          <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
                            {t.status}
                          </Typography>

                          <Box
                            sx={{
                              width: 14,
                              minWidth: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderLeft: "1px solid rgba(255,255,255,0.35)",
                              cursor: "pointer"
                            }}
                          >
                           <ArrowRightRounded sx={{ fontSize: 20, color: "#fff" }} />
                          </Box>
                        </Box>
                      </Box>
                    )}
                    <Typography width={showStatus ? "14%" : "30%"} sx={{ whiteSpace: "nowrap", color: dueInfo.color }}>
                      {dueInfo.text}
                    </Typography>
                    <Box width="8%" display="flex" justifyContent="flex-end">
                      <Avatar sx={{ width: 28, height: 28 }} />
                    </Box>
                  </Stack>
                );
              })}
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
  setEvents={setEvents}
  setTasksByEvent={setTasksByEvent}
  setSelectedEvent={setSelectedEvent}
/>

      <AddTaskDialog
  open={openAddTask}
  onClose={() => setOpenAddTask(false)}
  events={events}
  initialSelectedEvent={selectedEvent}
  onTaskCreated={(newTask, eventName) => {
    setTasksByEvent((prev) => ({
      ...prev,
      [eventName]: [...(prev[eventName] || []), newTask],
    }));

    setEvents((prev) =>
      prev.map((e) =>
        e.name === eventName ? { ...e, count: e.count + 1 } : e
      )
    );

    toast.success('Task created successfully');
  }}
/>

        {}
     <TaskDetailsDialog
  open={true}
  openTaskDetails={openTaskDetails}
  onClose={() => setOpenTaskDetails(false)}
  task={selectedTaskDetails}
  taskIndex={index}
  selectedEvent={selectedEvent}
  setTasksByEvent={setTasksByEvent}
/>

      </Box>
      </div>
    </LocalizationProvider>
  );
}
