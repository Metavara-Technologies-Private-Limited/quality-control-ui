import React, { useState, useMemo } from "react";
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
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
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
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  activeBorder: "#FCA5A5"
};

/* ================= EVENTS (DO NOT TOUCH CONTENT) ================= */
const EVENTS = [
  { name: "Daily Maintenance", count: 11, assigned: 50, unassigned: 4 },
  { name: "Weekly Maintenance", count: 21, assigned: 50, unassigned: 4 },
  { name: "Monthly Maintenance", count: 31, assigned: 50, unassigned: 4 },
  { name: "Yearly Maintenance", count: 10, assigned: 4, unassigned: 20 }
];

const TASKS_BY_EVENT: Record<string, any[]> = {
  "Daily Maintenance": [
    { name: "Calibrate and Maintain Equipment", time: "06:40 min.", status: "In Progress", due: "Tomorrow" },
    { name: "Monitor Environmental Conditions", time: "12:40 min.", status: "Completed", due: "Today at 7:45pm" },
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

export default function Task() {
  const [selectedEvent, setSelectedEvent] = useState("Daily Maintenance");
  const [activeFilter, setActiveFilter] = useState("All");
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");

  const [events, setEvents] = useState(EVENTS);
  const [tasksByEvent, setTasksByEvent] = useState(TASKS_BY_EVENT);

  const [openAddTask, setOpenAddTask] = useState(false);
  const [addTaskStep, setAddTaskStep] = useState(1);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedMaintenance, setSelectedMaintenance] = useState(selectedEvent);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Sub-tasks state
  const [subTasks, setSubTasks] = useState([
    { id: 1, name: "LJ Graph", status: "In Progress", due: "Today at 7:45pm", assignee: "Joe Smith" },
    { id: 2, name: "Check all QC analyses to accumulate", status: "To Do", due: "25 Aug, 2023", assignee: "Jane Doe" },
    { id: 3, name: "Liquid Flow Cleaning", status: "To Do", due: "25 Aug, 2023", assignee: "John Doe" }
  ]);
  const [newSubTask, setNewSubTask] = useState({ name: "", status: "In - Progress", due: "", assignee: "" });

  const ASSIGNEES = ["Joe Smith", "Jane Doe", "John Doe"];

  const showStatus = activeFilter === "All";
  const filteredTasks = useMemo(() => {
    const tasks = tasksByEvent[selectedEvent] || [];
    if (activeFilter === "All") return tasks;
    if (activeFilter === "To-Do") return tasks.filter(t => t.status === "To Do");
    if (activeFilter === "In-Progress") return tasks.filter(t => t.status === "In Progress");
    if (activeFilter === "Complete") return tasks.filter(t => t.status === "Completed");
    return tasks;
  }, [activeFilter, selectedEvent, tasksByEvent]);

  const statusPill = (status) => {
    const bg =
      status === "Completed"
        ? COLORS.complete
        : status === "In Progress"
        ? COLORS.progress
        : COLORS.todo;
    
    // Normalize status text for display
    let displayText = "To - Do";
    if (status === "In Progress" || status === "In - Progress") displayText = "In - Progress";
    if (status === "Completed") displayText = "Completed";
    
    // Normalize bg color for "In - Progress"
    const finalBg = status === "In - Progress" ? COLORS.progress : bg;

    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", height: 22, borderRadius: 8, bgcolor: finalBg, color: "#fff", overflow: "hidden" }}>
        <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
          {displayText}
        </Typography>
        <Box sx={{ width: 14, minWidth: 14, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.35)" }}>
          <PlayArrowRoundedIcon sx={{ fontSize: 9, color: "#fff" }} />
        </Box>
      </Box>
    );
  };

  const trackIcons = (status) => {
    if (status === "In Progress" || status === "In - Progress") {
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

  const renderStepIndicator = () => (
    <Box
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        bgcolor: "#FFFFFF",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 4,
        mb: 4,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={4} width="100%" justifyContent="center">
        {["Event details", "Description", "Sub Tasks"].map((step, index) => {
          const stepNum = index + 1;
          const isActive = addTaskStep >= stepNum;
          return (
            <React.Fragment key={step}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: isActive ? "#4CAF50" : "#E2E8F0", // Green for active/completed steps based on image
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isActive ? <CheckCircleRoundedIcon sx={{ fontSize: 24, color: "#4CAF50", bgcolor: "white", borderRadius: "50%" }} /> : stepNum}
                  {!isActive && stepNum}
                  {isActive && <Box sx={{ position: "absolute", width: 24, height: 24, bgcolor: "#4CAF50", borderRadius: "50%", zIndex: -1 }} />}
                </Box>
                {/* Override the Check icon logic above to match the image precisely - Image 1 shows Check for completed, Number for active/pending */}
                
                 {/* Re-implementing based on Image 1/2/3 specific look */}
              </Stack>
            </React.Fragment>
          );
        })}
      </Stack>
      {/* 
        The Step Indicator in the images is actually quite specific:
        - Image 1: Step 1 Checked (Green), Step 2 Active (Red/Orange Num), Step 3 Inactive (Grey Num).
        Let's rewrite the renderStepIndicator to match the image structure exactly.
      */}
    </Box>
  );
  
  // Custom Step Indicator based on images
  const CustomStepIndicator = () => (
     <Box
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        bgcolor: "#FFFFFF",
        py: 1.5,
        px: 3,
        mb: 4,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="center">
        {/* Step 1 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {addTaskStep > 1 ? (
             <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
          ) : (
            <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 1 ? "#FF8A65" : "#E2E8F0", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>1</Box>
          )}
          <Typography sx={{ color: addTaskStep >= 1 ? (addTaskStep === 1 ? "#FF8A65" : "#4CAF50") : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Event details</Typography>
        </Stack>

        <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />

        {/* Step 2 */}
        <Stack direction="row" alignItems="center" spacing={1}>
           {addTaskStep > 2 ? (
             <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
          ) : (
             <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 2 ? "#FF8A65" : "#E2E8F0", color: addTaskStep === 2 ? "#FFF" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>2</Box>
          )}
          <Typography sx={{ color: addTaskStep >= 2 ? (addTaskStep === 2 ? "#FF8A65" : "#4CAF50") : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Description</Typography>
        </Stack>

        <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />

        {/* Step 3 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: addTaskStep === 3 ? "#FF8A65" : "#E2E8F0", color: addTaskStep === 3 ? "#FFF" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>3</Box>
          <Typography sx={{ color: addTaskStep === 3 ? "#FF8A65" : "#9CA3AF", fontWeight: 500, fontSize: 14 }}>Sub Tasks</Typography>
        </Stack>
      </Stack>
    </Box>
  );

  return (
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
              onClick={() => setOpenAddEvent(true)}
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
                    color: activeFilter === label ? "#FFF" : "#111"
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
            {filteredTasks.map((t, i) => (
              <Stack key={i} direction="row" alignItems="center" sx={{ py: 1.2, px: 1, bgcolor: COLORS.rowBg, borderRadius: "8px" }}>
                <Typography width="42%" sx={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>{t.name}</Typography>
                <Stack direction="row" spacing={1.2} width="20%" alignItems="center">
                  {trackIcons(t.status)}
                  <Typography fontSize={13}>{t.time}</Typography>
                </Stack>
                {showStatus && <Box width="16%">{statusPill(t.status)}</Box>}
                <Typography width={showStatus ? "14%" : "30%"} sx={{ whiteSpace: "nowrap", color: t.due.includes("Today") ? COLORS.danger : "#111" }}>{t.due}</Typography>
                <Box width="8%" display="flex" justifyContent="flex-end">
                  <Avatar sx={{ width: 28, height: 28 }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Add Event Dialog */}
        <Dialog open={openAddEvent} onClose={() => setOpenAddEvent(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} pt={1}>
            <Typography fontSize={20} fontWeight={700}>Add New Event</Typography>
            <IconButton onClick={() => setOpenAddEvent(false)}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <DialogContent>
            <TextField fullWidth label="Name" placeholder="Calibrate & Maintain Equipment" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
            <Stack direction="row" spacing={2} mt={3}>
              <Button fullWidth sx={{ bgcolor: "#F3F4F6", color: "#111", borderRadius: "10px", height: 44 }} onClick={() => setOpenAddEvent(false)}>Cancel</Button>
              <Button fullWidth sx={{ bgcolor: "#4B4B4B", color: "#FFF", borderRadius: "10px", height: 44 }} onClick={() => {
                if (newEventName.trim()) {
                  const newEvent = { name: newEventName.trim(), count: 0, assigned: 0, unassigned: 0 };
                  setEvents(prev => [...prev, newEvent]);
                  setTasksByEvent(prev => ({ ...prev, [newEventName.trim()]: [] }));
                  setSelectedEvent(newEventName.trim());
                }
                setNewEventName("");
                setOpenAddEvent(false);
              }}>Save</Button>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
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
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontSize={24} fontWeight={800} color="#111">
                Add New Task
              </Typography>
              <IconButton onClick={() => setOpenAddTask(false)} sx={{ color: "#E0E0E0", bgcolor: "#E0E0E0", '&:hover': { bgcolor: "#D0D0D0" }, width: 32, height: 32 }}>
                <CloseIcon sx={{ fontSize: 18, color: "white" }} />
              </IconButton>
            </Stack>

            <CustomStepIndicator />

            {/* STEP 1: Event Details */}
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
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Maintenance</Typography>
                    <FormControl fullWidth>
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
                    </FormControl>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Assignee</Typography>
                    <FormControl fullWidth>
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
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Due Date</Typography>
                    <TextField
                      fullWidth
                      placeholder="dd/mm/yyyy"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><CalendarTodayIcon /></InputAdornment>
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Box>
                </Stack>
              </Stack>
            )}

            {/* STEP 2: Description */}
            {addTaskStep === 2 && (
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>Details</Typography>
                  <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", overflow: "hidden" }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      placeholder="Type details here..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      sx={{ 
                        "& .MuiOutlinedInput-root": { 
                          border: "none", 
                          "& fieldset": { border: "none" } 
                        },
                        p: 2 
                      }}
                    />
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={1} bgcolor="#FAFAFA">
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small"><FormatBoldIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatItalicIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatUnderlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatColorTextIcon fontSize="small" sx={{ color: "#E57373" }} /></IconButton>
                        <IconButton size="small"><FormatAlignLeftIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatSizeIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatAlignJustifyIcon fontSize="small" /></IconButton>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small"><InsertLinkIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><ImageIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><MoreHorizIcon fontSize="small" /></IconButton>
                      </Stack>
                    </Stack>
                  </Box>
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
                    bgcolor: "#FAFAFA"
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "#444", mb: 1 }} />
                  <Typography fontSize={14} color="#666">
                    Drag & Drop or <span style={{ color: "#2196F3", fontWeight: 600 }}>Choose to Upload</span>
                  </Typography>
                  <Typography fontSize={12} color="#999">File format png, jpeg, pdf, etc.</Typography>
                </Box>
              </Stack>
            )}

            {/* STEP 3: Sub Tasks */}
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
                          onChange={(e) => setNewSubTask({...newSubTask, name: e.target.value})}
                          placeholder="Calibrate & Maintain Equipment" 
                          size="small"
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} 
                        />
                      </Box>
                      <Box flex={1}>
                        <Typography fontSize={12} color="#999" mb={0.5}>Status</Typography>
                        <Select
                          fullWidth
                          value={newSubTask.status}
                          onChange={(e) => setNewSubTask({...newSubTask, status: e.target.value})}
                          size="small"
                          sx={{ borderRadius: "8px" }}
                        >
                          <MenuItem value="To Do">To - Do</MenuItem>
                          <MenuItem value="In - Progress">In - Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </Box>
                   </Stack>
                   <Stack direction="row" spacing={3} mb={3}>
                      <Box flex={1}>
                        <Typography fontSize={12} color="#999" mb={0.5}>Due Date</Typography>
                        <TextField 
                          fullWidth 
                          value={newSubTask.due}
                          onChange={(e) => setNewSubTask({...newSubTask, due: e.target.value})}
                          placeholder="23/12/2025" 
                          size="small"
                          InputProps={{ endAdornment: <InputAdornment position="end"><CalendarTodayIcon fontSize="small" /></InputAdornment> }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} 
                        />
                      </Box>
                      <Box flex={1}>
                        <Typography fontSize={12} color="#999" mb={0.5}>Assignee</Typography>
                        <Select
                          fullWidth
                          value={newSubTask.assignee}
                          onChange={(e) => setNewSubTask({...newSubTask, assignee: e.target.value})}
                          displayEmpty
                          size="small"
                          sx={{ borderRadius: "8px" }}
                        >
                          <MenuItem value="" disabled>Select Assignee</MenuItem>
                          {ASSIGNEES.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                        </Select>
                      </Box>
                   </Stack>
                   <Box display="flex" justifyContent="flex-end">
                      <Button 
                        variant="contained" 
                        sx={{ bgcolor: "#4B4B4B", color: "#FFF", borderRadius: "8px", textTransform: "none", px: 4 }}
                        onClick={() => {
                          if (newSubTask.name) {
                            setSubTasks([...subTasks, { ...newSubTask, id: Date.now() }]);
                            setNewSubTask({ name: "", status: "To Do", due: "", assignee: "" });
                          }
                        }}
                      >
                        Save
                      </Button>
                   </Box>
                </Box>

                {/* Subtasks List */}
                <Stack spacing={2}>
                  <Stack direction="row" px={2}>
                    <Typography width="40%" fontSize={12} color="#999">Name</Typography>
                    <Typography width="20%" fontSize={12} color="#999">Status</Typography>
                    <Typography width="25%" fontSize={12} color="#999">Due Date</Typography>
                    <Typography width="15%" />
                  </Stack>
                  {subTasks.map((task) => (
                    <Box key={task.id} sx={{ bgcolor: "#F9FAFB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center" }}>
                      <Typography width="40%" fontWeight={600} fontSize={14}>{task.name}</Typography>
                      <Box width="20%">
                        {statusPill(task.status)}
                      </Box>
                      <Typography width="25%" fontSize={14} color={task.due.includes("Today") ? COLORS.danger : "#111"}>{task.due}</Typography>
                      <Stack direction="row" spacing={2} width="15%" justifyContent="flex-end" alignItems="center">
                         <Avatar src="/broken-image.jpg" sx={{ width: 24, height: 24 }} />
                         <IconButton size="small" onClick={() => setSubTasks(subTasks.filter(t => t.id !== task.id))}>
                           <DeleteOutlineIcon color="error" fontSize="small" />
                         </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Navigation Buttons */}
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
                    if (addTaskStep < 3) {
                      setAddTaskStep(p => p + 1);
                    } else {
                      // Final Save Logic
                      if (newTaskName.trim() && selectedMaintenance) {
                         const newTask = {
                           name: newTaskName.trim(),
                           time: "00:00 min.",
                           status: "To Do",
                           due: dueDate || "Tomorrow"
                         };
                         setTasksByEvent(prev => ({
                           ...prev,
                           [selectedMaintenance]: [...(prev[selectedMaintenance] || []), newTask]
                         }));
                         setEvents(prev => prev.map(e => 
                           e.name === selectedMaintenance 
                             ? { ...e, count: e.count + 1, assigned: selectedAssignee ? e.assigned + 1 : e.assigned, unassigned: selectedAssignee ? e.unassigned : e.unassigned + 1 } 
                             : e
                         ));
                       }
                       setNewTaskName("");
                       setSelectedMaintenance(selectedEvent);
                       setSelectedAssignee("");
                       setDueDate("");
                       setNewTaskDescription("");
                       setSubTasks([]); // Clear subtasks
                       setAddTaskStep(1);
                       setOpenAddTask(false);
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

      </Box>
    </Box>
  );
}