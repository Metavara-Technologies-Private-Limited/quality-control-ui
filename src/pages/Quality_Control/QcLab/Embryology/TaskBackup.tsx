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
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Menu,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { EVENTS } from "./utils/taskpage/data/events";
import { CustomStepIndicator } from "./utils/taskpage/CustomStepIndicator";


const COLORS = {
  border: "#E5E7EB",
  bgLight: "#F9FAFB",
  rowBg: "#FAFAFA",
  progress: "#F2B277",
  complete: "#4CAF6A",
  todo: "#9CA3AF",
  danger: "#FF4D4F",
  dark: "#2F2F2F",
  textSecondary: "#9CA3AF",
  activeBorder: "#FCA5A5",
  tomorrow: "#4CAF50",
};

const STATUS_OPTIONS = ["To Do", "In Progress", "Completed"];

// const EVENTS = [
//   { name: "Daily Maintenance", count: 11, assigned: 50, unassigned: 4 },
//   { name: "Weekly Maintenance", count: 21, assigned: 50, unassigned: 4 },
//   { name: "Monthly Maintenance", count: 31, assigned: 50, unassigned: 4 },
//   { name: "Yearly Maintenance", count: 10, assigned: 4, unassigned: 20 }
// ];

const TASKS_BY_EVENT_INITIAL = {
  "Daily Maintenance": [
    { name: "Calibrate and Maintain Equipment", time: "06:40 min.", status: "In Progress", due: "Tomorrow", description:"test desc" },
    { name: "Monitor Environmental Conditions", time: "12:40 min.", status: "Completed", due: "Today at 7:45pm", description:"test2 descs" },
    { name: "Verify Culture Media Quality", time: "10:40 min.", status: "In Progress", due: "24 Aug, 2023" },
    { name: "Check Cryotank Levels", time: "12:40 min.", status: "Completed", due: "Tomorrow" },
    { name: "Review Standard Operating Procedures (SOPs)", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Conduct Training and Competency Assessments", time: "10:40 min.", status: "In Progress", due: "Today at 7:45pm" },
    { name: "Perform Proficiency Testing", time: "10:40 min.", status: "In Progress", due: "Today at 7:45pm" }
  ],
  "Weekly Maintenance": [
    { name: "Empty humid pans from the incubators. Rinse them thoroughly with distilled water and refill with distilled water", time: "10:40 min.", status: "In Progress", due: "Tomorrow" },
    { name: "Replenish water on all hood circulators", time: "12:40 min.", status: "Completed", due: "Today at 7:45pm" },
    { name: "Replenish water in waterbath", time: "10:40 min.", status: "In Progress", due: "24 Aug, 2023" },
    { name: "Clean all microscope lenses with lens tissue", time: "12:40 min.", status: "Completed", due: "Tomorrow" },
    { name: "Check eyewash stations", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Clean floor", time: "10:40 min.", status: "In Progress", due: "Today at 7:45pm" },
    { name: "Perform a complete stock check and initiate ordering of any supplies needed", time: "12:40 min.", status: "Completed", due: "25 Aug, 2023" }
  ],
  "Monthly Maintenance": [
    { name: "Clean Floors", time: "10:40 min.", status: "In Progress", due: "Tomorrow" },
    { name: "Check Eye Wash Station", time: "12:40 min.", status: "Completed", due: "Today at 7:45pm" },
    { name: "Replace Humidification flasks for each MINC", time: "10:40 min.", status: "In Progress", due: "24 Aug, 2023" },
    { name: "Replace Charcoal Filters for MINC", time: "12:40 min.", status: "Completed", due: "Tomorrow" },
    { name: "Clean Centrifuges", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Clean Waterbath with 70% Ethanol and Change Water", time: "10:40 min.", status: "In Progress", due: "Today at 7:45pm" }
  ],
  "Yearly Maintenance": [
    { name: "Equipment Calibration and Maintenance", time: "10:40 min.", status: "In Progress", due: "Tomorrow" },
    { name: "Validation of New Protocols", time: "12:40 min.", status: "Completed", due: "Today at 7:45pm" },
    { name: "Review of Standard Operating Procedures (SOPs)", time: "10:40 min.", status: "In Progress", due: "24 Aug, 2023" },
    { name: "Proficiency Testing", time: "12:40 min.", status: "Completed", due: "Tomorrow" },
    { name: "Inventory Management", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Toxicity Testing", time: "10:40 min.", status: "In Progress", due: "Today at 7:45pm" },
    { name: "Quality Control Documentation Review", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Staff Training and Competency Assessment", time: "10:40 min.", status: "In Progress", due: "24 Aug, 2023" },
    { name: "Accreditation Readiness", time: "12:40 min.", status: "Completed", due: "24 Aug, 2023" },
    { name: "Review of Incident Reports", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" },
    { name: "Environmental Monitoring Review", time: "12:40 min.", status: "Completed", due: "24 Aug, 2023" },
    { name: "Equipment Preventive Maintenance", time: "00:00 min.", status: "To Do", due: "24 Aug, 2023" }
  ]
};

const ASSIGNEES = ["Joe Smith", "Jane Doe", "John Doe"];

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [addTaskStep, setAddTaskStep] = useState(1);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedMaintenance, setSelectedMaintenance] = useState(selectedEvent);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState("To Do");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const addTaskEditorRef = React.useRef<HTMLDivElement>(null);
  const savedRangeRef = React.useRef<Range | null>(null);
  const taskDetailsEditorRef = React.useRef<HTMLDivElement>(null);

  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [newSubTask, setNewSubTask] = useState({
    name: "",
    status: "To Do",
    due: null as dayjs.Dayjs | null,
    assignee: ""
  });

  const [openTaskDetails, setOpenTaskDetails] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState(0);
  const [taskDetails, setTaskDetails] = useState("");
  const [taskStatus, setTaskStatus] = useState(""); 

  const [activeFormats, setActiveFormats] = useState([]);
  const [selectedColor, setSelectedColor] = useState("inherit");
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  const toggleFormat = (command: string) => {
    document.execCommand(command, false);
    checkFormats();
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const applyColor = (color: string) => {
    restoreSelection();
    document.execCommand("foreColor", false, color);
    setShowColorPicker(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  };

  const insertImageFromUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      document.execCommand("insertImage", false, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setTaskDetails("");
    setActiveFormats([]);
    setSelectedColor("inherit");
    setTaskDetailsErrors({ description: "" });
  };

 const handleSaveDetails = () => {
  if (!validateTaskDetails()) return;

  if (selectedTaskDetails && selectedEvent !== undefined) {
    setTasksByEvent(prev => {
      const eventTasks = prev[selectedEvent] || [];
      const updated = eventTasks.map((task, idx) =>
        idx === index   
          ? {
              ...task,
              description: taskDetailsEditorRef.current?.innerHTML || "",
              status: taskStatus  
            }
          : task
      );

      return {
        ...prev,
        [selectedEvent]: updated
      };
    });

    toast.success("Task updated successfully");
  }

  setOpenTaskDetails(false);
};

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          insertImageFromUpload(file);
        }
      });
      event.target.value = '';
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

  const formatDueDateDisplay = (due: string) => {
    if (!due) return { text: "", color: "#111" };
    const date = dayjs(due);
    if (!date.isValid()) return { text: due, color: "#111" };
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    if (date.isSame(today)) return { text: "Today", color: COLORS.danger };
    if (date.isSame(tomorrow)) return { text: "Tomorrow", color: COLORS.tomorrow };
    return { text: date.format("DD MMM, YYYY"), color: "#111" };
  };

  const validateStep1 = () => {
    const errors = {
      name: newTaskName.trim() === "" ? "Task name is required" : "",
      maintenance: selectedMaintenance === "" ? "Maintenance is required" : "",
      assignee: selectedAssignee === "" ? "Assignee is required" : "",
      dueDate: !dueDate ? "Due date is required" : "",
      status: newTaskStatus === "" ? "Status is required" : ""
    };
    setMainErrors(prev => ({ ...prev, ...errors }));
    const valid = !Object.values(errors).some(v => !!v);
    if (!valid) toast.error("Please fill all required fields");
    return valid;
  };

  const validateStep2 = () => {
    const html = addTaskEditorRef.current?.innerHTML || "";
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (!text) {
      setMainErrors(prev => ({ ...prev, description: "Description is required" }));
      toast.error("Description is required");
      return false;
    }
    setMainErrors(prev => ({ ...prev, description: "" }));
    setNewTaskDescription(html);
    return true;
  };

  const validateSubTask = () => {
    const errors = {
      name: newSubTask.name.trim() === "" ? "Sub-task name is required" : "",
      status: newSubTask.status === "" ? "Status is required" : "",
      due: !newSubTask.due ? "Due date is required" : "",
      assignee: newSubTask.assignee === "" ? "Assignee is required" : ""
    };
    setSubTaskErrors(errors);
    const valid = !Object.values(errors).some(v => !!v);
    if (!valid) toast.error("Please fill all sub-task fields");
    return valid;
  };

  const validateTaskDetails = () => {
    const desc = taskDetailsEditorRef.current?.innerText?.trim() || "";
    if (!desc) {
      setTaskDetailsErrors({ description: "Description is required" });
      toast.error("Description cannot be empty");
      return false;
    }
    setTaskDetailsErrors({ description: "" });
    return true;
  };

  const statusPill = (status: string, onIconClick?: (event: React.MouseEvent<HTMLElement>) => void) => {
    const bg =
      status === "Completed"
        ? COLORS.complete
        : status === "In Progress"
        ? COLORS.progress
        : COLORS.todo;

    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", height: 22, borderRadius: 8, bgcolor: bg, color: "#fff", overflow: "hidden" }}>
        <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
          {status}
        </Typography>
        <Box
          sx={{
            width: 14,
            minWidth: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "1px solid rgba(255,255,255,0.35)",
            cursor: onIconClick ? "pointer" : "default"
          }}
          onClick={onIconClick ? (e) => {
            e.stopPropagation();
            onIconClick(e);
          } : undefined}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 9, color: "#fff" }} />
        </Box>
      </Box>
    );
  };

  const trackIcons = (status: string) => {
    if (status === "In Progress") {
      return (
        <>
          <PauseCircleFilledRoundedIcon sx={{ fontSize: 22, color: "#5B8DEF" }} />
          <StopCircleRoundedIcon sx={{ fontSize: 22, color: "#D14343" }} />
        </>
      );
    }
    if (status === "Completed") {
      return <CheckCircleRoundedIcon sx={{ fontSize: 22, color: COLORS.complete }} />;
    }
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#5B8DEF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PlayArrowRoundedIcon sx={{ fontSize: 11, color: "#fff" }} />
      </Box>
    );
  };

 const handleStatusClick = (event: React.MouseEvent<HTMLElement>, taskIndex: number) => {
  event.stopPropagation(); 
  setStatusAnchorEl(event.currentTarget);
  setStatusTaskIndex(taskIndex); 
};


const handleStatusSelect = (newStatus: string) => {
  if (statusTaskIndex === null) return;

  
  setTasksByEvent(prev => {
    const eventTasks = prev[selectedEvent] || [];
    const updated = eventTasks.map((task, idx) =>
      idx === statusTaskIndex
        ? { ...task, status: newStatus }
        : task
    );

    return {
      ...prev,
      [selectedEvent]: updated
    };
  });

  
  setTaskStatus(newStatus);

  toast.success(`Status changed to ${newStatus}`);
  setStatusAnchorEl(null);
  setStatusTaskIndex(null);
};

  // const CustomStepIndicator = () => (
  //   <Box
  //     sx={{
  //       border: "1px solid #E2E8F0",
  //       borderRadius: "12px",
  //       bgcolor: "#FFFFFF",
  //       py: 1.5,
  //       px: 3,
  //       mb: 4,
  //     }}
  //   >
  //     <Stack direction="row" alignItems="center" justifyContent="center">
  //       <Stack direction="row" alignItems="center" spacing={1}>
  //         {addTaskStep > 1 ? (
  //           <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
  //         ) : (
  //           <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 1 ? "#FF8A65" : "#E2E8F0", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>1</Box>
  //         )}
  //         <Typography sx={{ color: addTaskStep >= 1 ? (addTaskStep === 1 ? "#FF8A65" : "#4CAF50") : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Event details</Typography>
  //       </Stack>
  //       <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />
  //       <Stack direction="row" alignItems="center" spacing={1}>
  //         {addTaskStep > 2 ? (
  //           <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
  //         ) : (
  //           <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 2 ? "#FF8A65" : "#E2E8F0", color: addTaskStep === 2 ? "#FFF" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>2</Box>
  //         )}
  //         <Typography sx={{ color: addTaskStep >= 2 ? (addTaskStep === 2 ? "#FF8A65" : "#4CAF50") : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Description</Typography>
  //       </Stack>
  //       <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />
  //       <Stack direction="row" alignItems="center" spacing={1}>
  //         <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 3 ? "#FF8A65" : "#E2E8F0", color: addTaskStep === 3 ? "#FFF" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>3</Box>
  //         <Typography sx={{ color: addTaskStep === 3 ? "#FF8A65" : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Sub Tasks</Typography>
  //       </Stack>
  //     </Stack>
  //   </Box>
  // );

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
        {/* <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar> */}

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
                            {/* <PlayArrowRoundedIcon sx={{ fontSize: 9, color: "#fff" }} /> */}
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

        {/* <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={() => setStatusAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {STATUS_OPTIONS.map(s => (
            <MenuItem key={s} onClick={() => handleStatusSelect(s)}>{s}</MenuItem>
          ))}
        </Menu> */}

        <Dialog open={openAddEvent} onClose={() => setOpenAddEvent(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} pt={1}>
            <Typography fontSize={20} fontWeight={700}>Add New Event</Typography>
            <IconButton onClick={() => setOpenAddEvent(false)}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              placeholder="Calibrate & Maintain Equipment"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              error={!!eventError}
              helperText={eventError}
            />
            <Stack direction="row" spacing={2} mt={3}>
              <Button fullWidth sx={{ bgcolor: "#F3F4F6", color: "#111", borderRadius: "10px", height: 44 }} onClick={() => setOpenAddEvent(false)}>Cancel</Button>
              <Button
                fullWidth
                sx={{
                  bgcolor: "#4B4B4B",
                  color: "#FFF",
                  borderRadius: "10px",
                  height: 44,
                  "&:hover": {
                    bgcolor: "#333333",
                    color: "#FFF"
                  }
                }}
                onClick={() => {
                  if (!newEventName.trim()) {
                    setEventError("Event name is required");
                    toast.error("Event name is required");
                    return;
                  }
                  const newEvent = { name: newEventName.trim(), count: 0, assigned: 0, unassigned: 0 };
                  setEvents(prev => [...prev, newEvent]);
                  setTasksByEvent(prev => ({ ...prev, [newEventName.trim()]: [] }));
                  setSelectedEvent(newEventName.trim());
                  setNewEventName("");
                  setEventError("");
                  setOpenAddEvent(false);
                  toast.success("Event created successfully");
                }}
              >
                Save
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAddTask}
          onClose={() => setOpenAddTask(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "24px", p: 2 }
          }}
        >
          <DialogContent sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontSize={24} fontWeight={800} color="#111">
                Add New Task
              </Typography>
              <IconButton onClick={() => setOpenAddTask(false)} sx={{ color: "#E0E0E0", bgcolor: "#E0E0E0", '&:hover': { bgcolor: "#D0D0D0" }, width: 32, height: 32 }}>
                <CloseIcon sx={{ fontSize: 18, color: "white" }} />
              </IconButton>
            </Stack>

            <CustomStepIndicator addTaskStep={addTaskStep} />

            {addTaskStep === 1 && (
              <Stack spacing={3}>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Name</Typography>
                    <TextField
                      fullWidth
                      placeholder="Calibrate & Maintain Equipment"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      error={!!mainErrors.name}
                      helperText={mainErrors.name}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Maintenance</Typography>
                    <FormControl fullWidth error={!!mainErrors.maintenance}>
                      <Select
                        value={selectedMaintenance}
                        onChange={(e) => setSelectedMaintenance(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: "12px" }}
                      >
                        {events.map((e) => (
                          <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>
                        ))}
                      </Select>
                      {mainErrors.maintenance && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{mainErrors.maintenance}</Typography>}
                    </FormControl>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Assignee</Typography>
                    <FormControl fullWidth error={!!mainErrors.assignee}>
                      <Select
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: "12px" }}
                      >
                        <MenuItem value="" disabled>Select assignee</MenuItem>
                        {ASSIGNEES.map((a) => (
                          <MenuItem key={a} value={a}>{a}</MenuItem>
                        ))}
                      </Select>
                      {mainErrors.assignee && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{mainErrors.assignee}</Typography>}
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Due Date</Typography>
                    <DatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!mainErrors.dueDate,
                          helperText: mainErrors.dueDate,
                          sx: { "& .MuiOutlinedInput-root": { borderRadius: "12px" } },
                          InputProps: {
                            endAdornment: <InputAdornment position="end"><CalendarTodayIcon /></InputAdornment>
                          }
                        }
                      }}
                    />
                  </Box>
                </Stack>
{/* 
                <Box>
                  <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Status</Typography>
                  <FormControl fullWidth error={!!mainErrors.status}>
                    <Select
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value)}
                      sx={{ borderRadius: "12px" }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                    {mainErrors.status && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{mainErrors.status}</Typography>}
                  </FormControl>
                </Box> */}
              </Stack>
            )}

            {addTaskStep === 2 && (
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Details</Typography>
                  <Box sx={{ border: `1px solid ${mainErrors.description ? '#d32f2f' : '#E0E0E0'}`, borderRadius: "12px", overflow: "hidden" }}>
                    <Box
                      contentEditable
                      suppressContentEditableWarning
                      ref={addTaskEditorRef}
                      onMouseUp={() => { saveSelection(); checkFormats(); }}
                      onKeyUp={() => { saveSelection(); checkFormats(); }}
                      sx={{
                        minHeight: 200,
                        p: 2,
                        outline: "none",
                        fontSize: 14,
                        lineHeight: 1.6
                      }}
                    />
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={1} bgcolor="#FAFAFA">
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat('bold')} sx={{ color: activeFormats.includes('bold') ? '#FF8A65' : 'inherit' }}>
                          <FormatBoldIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat('italic')} sx={{ color: activeFormats.includes('italic') ? '#FF8A65' : 'inherit' }}>
                          <FormatItalicIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat('underline')} sx={{ color: activeFormats.includes('underline') ? '#FF8A65' : 'inherit' }}>
                          <FormatUnderlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveSelection();
                            setShowColorPicker(!showColorPicker);
                          }}
                          sx={{ color: selectedColor !== 'inherit' ? selectedColor : 'inherit' }}
                        >
                          <FormatColorTextIcon fontSize="small" />
                        </IconButton>
                        {showColorPicker && (
                          <Box
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.preventDefault()}
                            sx={{
                              position: 'absolute',
                              bottom: '40px',
                              left: '0px',
                              bgcolor: 'white',
                              p: 1,
                              borderRadius: '8px',
                              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                              display: 'flex',
                              gap: 1,
                              zIndex: 9999,
                              mb: 1,
                              border: '1px solid #E0E0E0'
                            }}
                          >
                            {['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#E57373'].map(color => (
                              <Box
                                key={color}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyColor(color);
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: color,
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  '&:hover': { transform: 'scale(1.1)' }
                                }}
                              />
                            ))}
                            <Box
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                applyColor('inherit');
                              }}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: '#F3F4F6',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: '#666'
                              }}
                            >X</Box>
                          </Box>
                        )}
                        <IconButton size="small" onClick={() => toggleFormat('justifyLeft')}>
                          <FormatAlignLeftIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => toggleFormat('justifyFull')}>
                          <FormatAlignJustifyIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={insertLink}>
                          <InsertLinkIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                          <ImageIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileUpload}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  {mainErrors.description && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>{mainErrors.description}</Typography>}
                </Box>

                <Box
                  sx={{
                    border: "2px dashed #E0E0E0",
                    borderRadius: "12px",
                    height: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    bgcolor: "#FAFAFA",
                    position: 'relative'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(file => {
                      console.log("Dropped file:", file.name);
                      if (file.type.startsWith('image/')) {
                        insertImageFromUpload(file);
                      }
                    });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "#444", mb: 1 }} />
                  <Typography fontSize={14} color="#666">
                    Drag & Drop or <span style={{ color: "#2196F3", fontWeight: 600 }}>Choose to Upload</span>
                  </Typography>
                  <Typography fontSize={12} color="#999">File format png, jpeg, pdf, etc.</Typography>
                </Box>
              </Stack>
            )}

            {addTaskStep === 3 && (
              <Stack spacing={3}>
                <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "16px", p: 3 }}>
                  <Typography mb={2} fontWeight={500} color="#666">Add New Sub-Task</Typography>
                  <Stack direction="row" spacing={3} mb={2}>
                    <Box flex={1}>
                      <Typography fontSize={12} color="#999" mb={0.5}>Name</Typography>
                      <TextField
                        fullWidth
                        value={newSubTask.name}
                        onChange={(e) => setNewSubTask({ ...newSubTask, name: e.target.value })}
                        placeholder="Calibrate & Maintain Equipment"
                        size="small"
                        error={!!subTaskErrors.name}
                        helperText={subTaskErrors.name}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography fontSize={12} color="#999" mb={0.5}>Status</Typography>
                      <FormControl fullWidth size="small" error={!!subTaskErrors.status}>
                        <Select
                          value={newSubTask.status}
                          onChange={(e) => setNewSubTask({ ...newSubTask, status: e.target.value })}
                          sx={{ borderRadius: "8px" }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                        {subTaskErrors.status && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{subTaskErrors.status}</Typography>}
                      </FormControl>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={3} mb={3}>
                    <Box flex={1}>
                      <Typography fontSize={12} color="#999" mb={0.5}>Due Date</Typography>
                      <DatePicker
                        value={newSubTask.due}
                        onChange={(val) => setNewSubTask({ ...newSubTask, due: val })}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!subTaskErrors.due,
                            helperText: subTaskErrors.due,
                            sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px" } },
                            InputProps: { endAdornment: <InputAdornment position="end"><CalendarTodayIcon /></InputAdornment> }
                          }
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography fontSize={12} color="#999" mb={0.5}>Assignee</Typography>
                      <FormControl fullWidth size="small" error={!!subTaskErrors.assignee}>
                        <Select
                          value={newSubTask.assignee}
                          onChange={(e) => setNewSubTask({ ...newSubTask, assignee: e.target.value })}
                          displayEmpty
                          sx={{ borderRadius: "8px" }}
                        >
                          <MenuItem value="" disabled>Select Assignee</MenuItem>
                          {ASSIGNEES.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                        </Select>
                        {subTaskErrors.assignee && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{subTaskErrors.assignee}</Typography>}
                      </FormControl>
                    </Box>
                  </Stack>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#4B4B4B", color: "#FFF", borderRadius: "8px", textTransform: "none", px: 4 }}
                      onClick={() => {
                        if (!validateSubTask()) return;
                        setSubTasks([...subTasks, { ...newSubTask, due: newSubTask.due ? newSubTask.due.format("DD/MM/YYYY") : "" }]);
                        setNewSubTask({ name: "", status: "To Do", due: null, assignee: "" });
                        setSubTaskErrors({ name: "", status: "", due: "", assignee: "" });
                        toast.success("Sub-task added successfully");
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Stack direction="row" px={2}>
                    <Typography width="40%" fontSize={12} color="#999">Name</Typography>
                    <Typography width="20%" fontSize={12} color="#999">Status</Typography>
                    <Typography width="25%" fontSize={12} color="#999">Due Date</Typography>
                    <Typography width="15%" />
                  </Stack>
                  {subTasks.map((task, index) => (
                    <Box key={index} sx={{ bgcolor: "#F9FAFB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center" }}>
                      <Typography width="40%" fontWeight={600} fontSize={14}>{task.name}</Typography>
                      <Box width="20%">
                        {statusPill(task.status)}
                      </Box>
                      <Typography width="25%" fontSize={14} color={formatDueDateDisplay(task.due).color}>{formatDueDateDisplay(task.due).text}</Typography>
                      <Stack direction="row" spacing={2} width="15%" justifyContent="flex-end" alignItems="center">
                        <Avatar src="/broken-image.jpg" sx={{ width: 24, height: 24 }} />
                        <IconButton size="small" onClick={() => setSubTasks(subTasks.filter((_, i) => i !== index))}>
                          <DeleteOutlineIcon color="error" fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            )}

            <Stack direction="row" spacing={2} mt={4}>
              <Button
                fullWidth
                onClick={() => setOpenAddTask(false)}
                sx={{
                  height: 50,
                  borderRadius: "12px",
                  bgcolor: "#F5F5F5",
                  color: "#111",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  "&:hover": { bgcolor: "#EEEEEE" }
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  if (addTaskStep === 1) {
                    if (validateStep1()) setAddTaskStep(2);
                    return;
                  }
                  if (addTaskStep === 2) {
                    if (validateStep2()) setAddTaskStep(3);
                    return;
                  }
                  if (addTaskStep === 3) {
                    const newTask = {
                      name: newTaskName.trim(),
                      time: "00:00 min.",
                      status: newTaskStatus,
                      due: dueDate ? dueDate.format("YYYY-MM-DD") : "",
                      description: newTaskDescription,
                    };

                    setTasksByEvent(prev => ({
                      ...prev,
                      [selectedMaintenance]: [...(prev[selectedMaintenance] || []), newTask]
                    }));

                    setEvents(prev => prev.map(e =>
                      e.name === selectedMaintenance
                        ? { ...e, count: e.count + 1 }
                        : e
                    ));

                    setOpenAddTask(false);
                    setAddTaskStep(1);
                    setNewTaskName("");
                    setSelectedMaintenance(selectedEvent);
                    setSelectedAssignee("");
                    setDueDate(null);
                    setNewTaskStatus("To Do");
                    setNewTaskDescription("");
                    setSubTasks([]);
                    setShowSuccess(true);
                    toast.success("Task created successfully");
                  }
                }}
                sx={{
                  height: 50,
                  borderRadius: "12px",
                  bgcolor: "#4B4B4B",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  "&:hover": { bgcolor: "#333333" }
                }}
              >
                {addTaskStep < 3 ? "Next" : "Save"}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Task Details Dialog - NOW WITH STATUS DROPDOWN */}
        <Dialog
          open={openTaskDetails}
          onClose={() => setOpenTaskDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
        >
          {selectedTaskDetails && (
            <DialogContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography fontSize={20} fontWeight={700}>
                  {selectedTaskDetails.name}
                </Typography>
                <IconButton onClick={() => setOpenTaskDetails(false)} sx={{ bgcolor: "#E0E0E0", color: "#FFF", width: 30, height: 30 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Divider sx={{ mb: 3 }} />

           <Stack spacing={2} mb={3}>
  <Stack direction="row" spacing={4} alignItems="center">
    {/* Assignee - unchanged */}
    <Stack direction="row" alignItems="center" spacing={1} width="50%">
      <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>Assignee :</Typography>
      <Avatar sx={{ width: 24, height: 24 }} />
      <Typography fontWeight={500}>Joe Smith</Typography>
    </Stack>

    {/* Status - same pill design as list view */}
   {/* Status Section */}
<Stack direction="row" alignItems="center" spacing={1} width="50%">
  <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>Status :</Typography>
  
  <Box
    onClick={(e) => handleStatusClick(e, index)}
    sx={{ cursor: "pointer" }}
  >
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        borderRadius: 8,
        bgcolor: 
          taskStatus === "Completed" ? COLORS.complete :
          taskStatus === "In Progress" ? COLORS.progress :
          COLORS.todo,
        color: "#fff",
        overflow: "hidden"
      }}
    >
      <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
        {taskStatus}
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
        <PlayArrowRoundedIcon sx={{ fontSize: 9, color: "#fff" }} />
      </Box>
    </Box>
  </Box>
</Stack>

{/* ← This Menu MUST be here (or at root level) so it appears when clicked */}
<Menu
  anchorEl={statusAnchorEl}
  open={Boolean(statusAnchorEl)}
  onClose={() => setStatusAnchorEl(null)}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
>
  {STATUS_OPTIONS.map((option) => (
    <MenuItem
      key={option}
      onClick={() => {
        setTaskStatus(option);           
        toast.success(`Status changed to ${option}`);
        setStatusAnchorEl(null);
      }}
    >
      {option}
    </MenuItem>
  ))}
</Menu>
  </Stack>

  {/* Due Date & Track Time - unchanged */}
  <Stack direction="row" spacing={4} alignItems="center">
    <Stack direction="row" alignItems="center" spacing={1} width="50%">
      <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>Due Date :</Typography>
      <CalendarTodayIcon sx={{ fontSize: 18, color: "#111" }} />
      <Typography fontWeight={500}>
        {formatDueDateDisplay(selectedTaskDetails.due).text}
      </Typography>
    </Stack>

    <Stack direction="row" alignItems="center" spacing={1} width="50%">
      <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>Track Time :</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {trackIcons(selectedTaskDetails.status)}
        <Typography fontWeight={500}>{selectedTaskDetails.time}</Typography>
      </Stack>
    </Stack>
  </Stack>
</Stack>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={detailsTab} onChange={(_, v) => setDetailsTab(v)}>
                  <Tab label="Description" sx={{ textTransform: "none", fontWeight: 600, color: detailsTab === 0 ? "#FF8A65" : "inherit" }} />
                  <Tab label="Sub Tasks" sx={{ textTransform: "none", fontWeight: 600 }} />
                </Tabs>
              </Box>

              {detailsTab === 0 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography sx={{ mb: 1, fontSize: 13, color: "#666" }}>Details</Typography>
                    <Box sx={{ border: `1px solid ${taskDetailsErrors.description ? '#d32f2f' : '#E0E0E0'}`, borderRadius: "12px", overflow: "hidden" }}>
                      <Box
                        contentEditable
                        suppressContentEditableWarning
                        ref={taskDetailsEditorRef}
                        onInput={(e) => setTaskDetails((e.target as HTMLDivElement).innerHTML)}
                        onKeyUp={checkFormats}
                        onMouseUp={checkFormats}
                        onFocus={checkFormats}
                        sx={{
                          minHeight: 200,
                          p: 2,
                          outline: 'none',
                          fontSize: 14,
                          lineHeight: 1.6,
                          caretColor: '#FF8A65',
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" p={1} bgcolor="#FAFAFA" borderTop="1px solid #E0E0E0">
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleFormat('bold')}
                            sx={{ color: activeFormats.includes('bold') ? '#FF8A65' : 'inherit' }}
                          >
                            <FormatBoldIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleFormat('italic')}
                            sx={{ color: activeFormats.includes('italic') ? '#FF8A65' : 'inherit' }}
                          >
                            <FormatItalicIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleFormat('underline')}
                            sx={{ color: activeFormats.includes('underline') ? '#FF8A65' : 'inherit' }}
                          >
                            <FormatUnderlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.stopPropagation();
                              saveSelection();
                              setShowColorPicker(!showColorPicker);
                            }}
                            sx={{ color: selectedColor !== 'inherit' ? selectedColor : 'inherit' }}
                          >
                            <FormatColorTextIcon fontSize="small" />
                          </IconButton>
                          {showColorPicker && (
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.preventDefault()}
                              sx={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '0px',
                                bgcolor: 'white',
                                p: 1,
                                borderRadius: '8px',
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                gap: 1,
                                zIndex: 9999,
                                mb: 1,
                                border: '1px solid #E0E0E0'
                              }}
                            >
                              {['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#E57373'].map(color => (
                                <Box
                                  key={color}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyColor(color);
                                  }}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: color,
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                />
                              ))}
                              <Box
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyColor('inherit');
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: '#F3F4F6',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  color: '#666'
                                }}
                              >X</Box>
                            </Box>
                          )}
                          <IconButton size="small" onClick={() => toggleFormat('justifyLeft')}>
                            <FormatAlignLeftIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => toggleFormat('justifyFull')}>
                            <FormatAlignJustifyIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={insertLink}>
                            <InsertLinkIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                            <ImageIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                    {taskDetailsErrors.description && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>{taskDetailsErrors.description}</Typography>}
                  </Box>

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    multiple
                  />

                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: "2px dashed #E0E0E0",
                      borderRadius: "12px",
                      height: 120,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#FFF",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#F5F5F5" }
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: "#444", mb: 1 }} />
                    <Typography fontSize={14} color="#666">
                      Drag & Drop or <span style={{ color: "#2196F3", fontWeight: 600 }}>Choose to Upload</span>
                    </Typography>
                    <Typography fontSize={12} color="#999">File format png, jpeg, pdf, etc.</Typography>
                  </Box>
                </Stack>
              )}

              {detailsTab === 1 && (
                <Box p={2}>
                  {subTasks.length > 0 ? (
                    <Stack spacing={2}>
                      {subTasks.map((task, idx) => (
                        <Box key={idx} sx={{ bgcolor: "#F9FAFB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center" }}>
                          <Typography width="40%" fontWeight={600} fontSize={14}>{task.name}</Typography>
                          <Box width="20%">
                            {statusPill(task.status)}
                          </Box>
                          <Typography width="25%" fontSize={14} color={formatDueDateDisplay(task.due).color}>
                            {formatDueDateDisplay(task.due).text}
                          </Typography>
                          <Stack direction="row" spacing={2} width="15%" justifyContent="flex-end" alignItems="center">
                            <Avatar sx={{ width: 24, height: 24 }} />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="#666">No sub tasks available.</Typography>
                  )}
                </Box>
              )}

              <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
                <Button
                  sx={{ bgcolor: "#F3F4F6", color: "#111", borderRadius: "8px", px: 4, textTransform: "none", fontWeight: 600 }}
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  sx={{ bgcolor: "#4B4B4B", color: "#FFF", borderRadius: "8px", px: 4, textTransform: "none", fontWeight: 600, '&:hover': { bgcolor: "#333" } }}
                  onClick={handleSaveDetails}
                >
                  Save
                </Button>
              </Stack>
            </DialogContent>
          )}
        </Dialog>

       
      </Box>
      </div>
    </LocalizationProvider>
  );
}