import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  FormControl,
  Select,
  InputAdornment,
  TextField,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import { toast } from "react-toastify";
import { COLORS } from "./data/colors";
import { STATUS_OPTIONS } from "./data/data";
import { formatDueDateDisplay } from "./formatDueDateDisplay";
import { trackIcons } from "./trackIcons";
// import { statusPill } from './statusPill';
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  SubTask,
  Task,
  TASK_STATUS_MAP,
  TaskStatus,
  TaskUpdatePayload,
} from "@/types";
// import dayjs from 'dayjs';
import { DatePicker } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete";
import { taskApi } from "@/services/api";
import dayjs from "dayjs";

type UITask = Task & {
  status_label: "To - Do" | "In Progress" | "Completed";
  due?: string;
};
interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: UITask | null;
  onUpdated: () => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  // openTaskDetails,
  onClose,
  task,
  onUpdated,
  // taskIndex,
  // selectedEvent,
  // setTasksByEvent,
}) => {
  const assignees = useSelector((state: RootState) => state.assignees.data);
  const [detailsTab, setDetailsTab] = useState(0);
  const [taskDetails, setTaskDetails] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("inherit");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [taskDetailsErrors, setTaskDetailsErrors] = useState({
    description: "",
  });
  const [subTasks, setSubTasks] = useState<SubTask[]>(task?.sub_tasks || []);
  const [newSubTask, setNewSubTask] = useState<{
    name: string;
    status: number;
    due_date: dayjs.Dayjs | null;
    assignee: number | "";
  }>({
    name: "",
    status: 0,
    due_date: null,
    assignee: "",
  });
  const [showSubTaskForm, setShowSubTaskForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subTaskToDelete, setSubTaskToDelete] = useState<SubTask | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assignedUser = task
    ? assignees.find((u) => u.id === task.assignment)
    : null;

  useEffect(() => {
    if (!open || !task) return;

    setTaskStatus(task.status);
    setTaskDetails(task.description || "");
    setSubTasks(task.sub_tasks || []);
    setDetailsTab(1);
  }, [open, task?.id]); // 👈 important: task.id, not task object

  // // Editor content setup when tab changes to description
  // useEffect(() => {
  //   if (!open || detailsTab !== 0 || !editorRef.current) return;

  //   const editor = editorRef.current;
  //

  //   if (taskDetails?.trim()) {
  //     editor.innerHTML = taskDetails;
  //   } else {
  //     editor.innerHTML =
  //       '<p style="color:#aaa; font-style:italic;">No description saved yet. Click to edit...</p>';
  //   }

  //   // Place cursor at the end
  //   try {
  //     const range = document.createRange();
  //     range.selectNodeContents(editor);
  //     range.collapse(false);
  //     const sel = window.getSelection();
  //     sel?.removeAllRanges();
  //     sel?.addRange(range);
  //     editor.focus();
  //   } catch (err) {
  //     console.warn("Cursor positioning failed:", err);
  //   }

  //   checkFormats();
  // }, [open, detailsTab, taskDetails]);

  const hydratedTaskIdRef = useRef<number | null>(null);

useLayoutEffect(() => {
  if (!open || detailsTab !== 0 || !editorRef.current || !task) return;

  if (hydratedTaskIdRef.current === task.id) return;

  const editor = editorRef.current;

  editor.innerHTML =
    taskDetails?.trim()
      ? taskDetails
      : '<p style="color:#aaa;font-style:italic;">No description yet. Click to edit…</p>';

  hydratedTaskIdRef.current = task.id;
}, [open, detailsTab, task?.id]); // 👈 NOT taskDetails


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

  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState("bold")) formats.push("bold");
    if (document.queryCommandState("italic")) formats.push("italic");
    if (document.queryCommandState("underline")) formats.push("underline");
    setActiveFormats(formats);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRangeRef.current);
    }
  };

  const toggleFormat = (command: string) => {
    document.execCommand(command, false);
    checkFormats();
  };

  const applyColor = (color: string) => {
    restoreSelection();
    document.execCommand("foreColor", false, color);
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) document.execCommand("createLink", false, url);
  };

  const insertImageFromUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      document.execCommand("insertImage", false, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          insertImageFromUpload(file);
        }
      });
      e.target.value = "";
    }
  };

  const tabs = ["Description", "Sub Tasks"];

  // const validateTaskDetails = () => {
  //   const desc = editorRef.current?.innerText?.trim() || '';
  //   if (!desc) {
  //     setTaskDetailsErrors({ description: 'Description is required' });
  //     toast.error('Description cannot be empty');
  //     return false;
  //   }
  //   setTaskDetailsErrors({ description: '' });
  //   return true;
  // };

  const toISO = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  console.log("task", task);
  const handleSaveDetails = async () => {
    if (!task) return;

    const payload: TaskUpdatePayload = {
      event: task.event,
      assignment: task.assignment ?? null,

      name: task.name,

      // ✅ USE LOCAL EDITOR STATE
      description: taskDetails,

      // ✅ USE ENUM (map label → enum)
      status:
        taskStatus === TaskStatus.COMPLETED
          ? 2
          : taskStatus === TaskStatus.IN_PROGRESS
          ? 1
          : 0,

      // ✅ SAFE DATE
      due_date: toISO(task.due_date)!,

      // ✅ USE LOCAL SUBTASK STATE
      sub_tasks: subTasks.map((st) => ({
        id: st.id,
        name: st.name,
        status: st.status,
        due_date: toISO(st.due_date)!,
        assignment: st.assignment ?? null,
      })),
    };

    await taskApi.update(task.id, payload);
    toast.success("Task updated");
    onClose(); // ✅ close dialog
    onUpdated(); // ✅ refetch tasks in parent
  };

  const handleAddSubTask = () => {
    if (!newSubTask.name || !newSubTask.due_date) {
      toast.error("Sub-task name and due date required");
      return;
    }

    const dueDate = newSubTask.due_date; // ✅ TS now knows it's not null

    setSubTasks((prev) => [
      ...prev,
      {
        name: newSubTask.name,
        status: newSubTask.status,
        due_date: dueDate.toISOString(), // ✅ safe
        assignment: newSubTask.assignee === "" ? null : newSubTask.assignee,
      },
    ]);

    setNewSubTask({
      name: "",
      status: TaskStatus.TODO,
      due_date: null,
      assignee: "",
    });

    setShowSubTaskForm(false);
    toast.success("Sub-task saved");
  };

  const confirmDeleteSubTask = () => {
    if (!subTaskToDelete) return;

    setSubTasks((prev) => prev.filter((t) => t !== subTaskToDelete));

    setSubTaskToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setTaskDetails("");
    setActiveFormats([]);
    setSelectedColor("inherit");
    setTaskDetailsErrors({ description: "" });
  };

  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusSelect = (label: string) => {
    const status =
      label === "Completed"
        ? TaskStatus.COMPLETED
        : label === "In Progress"
        ? TaskStatus.IN_PROGRESS
        : TaskStatus.TODO;

    setTaskStatus(status);
    setStatusAnchorEl(null);
  };

  if (!open || !task) return null;

  return (
    <>
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option} onClick={() => handleStatusSelect(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px" },
        }}
      >
        <DialogContent>
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography fontSize={20} fontWeight={700}>
                {task.name}
              </Typography>
              <IconButton
                onClick={onClose}
                sx={{
                  bgcolor: "#E0E0E0",
                  color: "#FFF",
                  width: 30,
                  height: 30,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Task Info */}
            <Stack spacing={2} mb={3}>
              <Stack direction="row" spacing={4} alignItems="center">
                {/* Assignee */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width="50%"
                >
                  <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                    Assignee :
                  </Typography>
                  {assignedUser ? (
                    <>
                      <Avatar>{assignedUser.emp_name?.[0]}</Avatar>
                      <Typography>{assignedUser.emp_name}</Typography>
                    </>
                  ) : (
                    <Typography color="#999">Unassigned</Typography>
                  )}
                </Stack>

                {/* Status */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width="50%"
                >
                  <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                    Status :
                  </Typography>

                  <Box onClick={handleStatusClick} sx={{ cursor: "pointer" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 22,
                        borderRadius: 8,
                        bgcolor:
                          taskStatus === TaskStatus.COMPLETED
                            ? COLORS.complete
                            : taskStatus === TaskStatus.IN_PROGRESS
                            ? COLORS.progress
                            : COLORS.todo,
                        color: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        sx={{
                          px: 1.2,
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#fff",
                        }}
                      >
                        {TASK_STATUS_MAP[taskStatus]}
                      </Typography>
                      <Box
                        sx={{
                          width: 14,
                          minWidth: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderLeft: "1px solid rgba(255,255,255,0.35)",
                          cursor: "pointer",
                        }}
                      >
                        <PlayArrowRoundedIcon
                          sx={{ fontSize: 9, color: "#fff" }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={4} alignItems="center">
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width="50%"
                >
                  <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                    Due Date :
                  </Typography>
                  <CalendarTodayIcon sx={{ fontSize: 18, color: "#111" }} />
                  <Typography fontWeight={500}>
                    {formatDueDateDisplay(task.due ?? "").text}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  width="50%"
                >
                  <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                    Track Time :
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {trackIcons(task.timer_status || "")}
                    <Typography fontSize={13}>
                      {formatSeconds(getTaskTime(task))}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Tabs */}
            {/* <Box sx={{  mb: 2 }}>
              <Tabs value={detailsTab} onChange={(_, v) => setDetailsTab(v)}>
                <Tab
                  label="Description"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: detailsTab === 0 ? '#FF8A65' : 'inherit',
                  }}
                />
                <Tab label="Sub Tasks" sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>
            </Box> */}

            <Box>
              <div
                style={{
                  display: "inline-flex",
                  backgroundColor: "#F2F2F2",
                  borderRadius: "12px",
                  padding: "4px",
                  marginBottom: "15px",
                  gap: "4px",
                }}
              >
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setDetailsTab(index)}
                    style={{
                      padding: "8px 15px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: detailsTab === index ? "700" : "600",
                      backgroundColor:
                        detailsTab === index ? "#FFFFFF" : "transparent",
                      color: detailsTab === index ? "#E17E61" : "#94a3b8",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </Box>

            {/* Description Tab */}
            {/* {detailsTab === 0 && ( */}
            <Stack sx={{ display: detailsTab === 0 ? "flex" : "none" }}>
              <Box>
                <Typography
                  sx={{ mb: 1, pl: "5px", fontSize: 13, color: "#666" }}
                >
                  Details
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${
                      taskDetailsErrors.description ? "#d32f2f" : "#E0E0E0"
                    }`,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    contentEditable
                    suppressContentEditableWarning
                    ref={editorRef}
                    onInput={(e) =>
                      setTaskDetails((e.target as HTMLDivElement).innerHTML)
                    }
                    onKeyUp={() => {
                      saveSelection();
                      checkFormats();
                    }}
                    onMouseUp={() => {
                      saveSelection();
                      checkFormats();
                    }}
                    onFocus={checkFormats}
                    sx={{
                      minHeight: 200,
                      p: 2,
                      outline: "none",
                      fontSize: 14,
                      lineHeight: 1.6,
                      caretColor: "#FF8A65",
                    }}
                  />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    p={1}
                    bgcolor="#FAFAFA"
                    borderTop="1px solid #E0E0E0"
                  >
                    {/* Formatting toolbar - left */}
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat("bold")}
                        sx={{
                          color: activeFormats.includes("bold")
                            ? "#FF8A65"
                            : "inherit",
                        }}
                      >
                        <FormatBoldIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat("italic")}
                        sx={{
                          color: activeFormats.includes("italic")
                            ? "#FF8A65"
                            : "inherit",
                        }}
                      >
                        <FormatItalicIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat("underline")}
                        sx={{
                          color: activeFormats.includes("underline")
                            ? "#FF8A65"
                            : "inherit",
                        }}
                      >
                        <FormatUnderlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        sx={{
                          color:
                            selectedColor !== "inherit"
                              ? selectedColor
                              : "inherit",
                        }}
                      >
                        <FormatColorTextIcon fontSize="small" />
                      </IconButton>

                      {showColorPicker && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: "40px",
                            left: 0,
                            bgcolor: "white",
                            p: 1,
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                            display: "flex",
                            gap: 1,
                            zIndex: 9999,
                            border: "1px solid #E0E0E0",
                          }}
                        >
                          {[
                            "#000000",
                            "#FF0000",
                            "#0000FF",
                            "#008000",
                            "#FFA500",
                            "#800080",
                            "#E57373",
                          ].map((color) => (
                            <Box
                              key={color}
                              onClick={() => applyColor(color)}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: color,
                                cursor: "pointer",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                            />
                          ))}
                          <Box
                            onClick={() => applyColor("inherit")}
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: "#F3F4F6",
                              cursor: "pointer",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: "bold",
                              color: "#666",
                            }}
                          >
                            X
                          </Box>
                        </Box>
                      )}

                      <IconButton
                        size="small"
                        onClick={() => toggleFormat("justifyLeft")}
                      >
                        <FormatAlignLeftIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => toggleFormat("justifyFull")}
                      >
                        <FormatAlignJustifyIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {/* Right side actions */}
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={insertLink}>
                        <InsertLinkIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                      >
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

                {taskDetailsErrors.description && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1 }}
                  >
                    {taskDetailsErrors.description}
                  </Typography>
                )}
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                multiple
              />

              {/* Drag & Drop area */}
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
                  "&:hover": { bgcolor: "#F5F5F5" },
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 36, color: "#444", mb: 1 }}
                />
                <Typography fontSize={14} color="#666">
                  Drag & Drop or{" "}
                  <span style={{ color: "#2196F3", fontWeight: 600 }}>
                    Choose to Upload
                  </span>
                </Typography>
                <Typography fontSize={12} color="#999">
                  File format png, jpeg, pdf, etc.
                </Typography>
              </Box>
            </Stack>
            {/* )} */}

            {/* Sub Tasks Tab */}
            {detailsTab === 1 && (
              <Stack spacing={3}>
                {/* Sub-tasks list */}
                <Stack spacing={1}>
                  <Stack direction="row" px={2}>
                    <Typography width="40%" fontSize={12} color="#999">
                      Name
                    </Typography>
                    <Typography width="20%" fontSize={12} color="#999">
                      Status
                    </Typography>
                    <Typography width="25%" fontSize={12} color="#999">
                      Due Date
                    </Typography>
                    <Typography width="15%" />
                  </Stack>

                  {subTasks.map((st, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: "#F9FAFB",
                        borderRadius: "12px",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography width="40%" fontWeight={600} fontSize={14}>
                        {st.name}
                      </Typography>
                      <Box width="20%">
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 8,
                            bgcolor:
                              st.status === TaskStatus.COMPLETED
                                ? COLORS.complete
                                : st.status === TaskStatus.IN_PROGRESS
                                ? COLORS.progress
                                : COLORS.todo,
                            color: "#fff",
                            fontSize: 12,
                          }}
                        >
                          {TASK_STATUS_MAP[st.status]}
                        </Box>
                      </Box>
                      <Typography width="25%" fontSize={14}>
                        {formatDueDateDisplay(st.due_date ?? "").text}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        width="15%"
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSubTaskToDelete(st);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}

                  {/* Add Sub Task Button */}
                  <Box
                    sx={{
                      px: 1,
                      py: 2,
                      display: "inline-block", // Prevent stretching across the full width
                      alignItems: "center",
                      cursor: "pointer",
                      justifyContent: "flex-start",
                      width: "fit-content", // Adjust width to content size
                      "&:hover": {
                        opacity: 0.7, // Apply hover effect
                      },
                    }}
                    onClick={() => setShowSubTaskForm((prev) => !prev)}
                  >
                    <Typography fontWeight={600} fontSize={14} color="#4B4B4B">
                      + Add Sub Task
                    </Typography>
                  </Box>

                  {/* Edit/Add sub-task form */}
                  {showSubTaskForm && (
                    <Box
                      sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: "16px",
                        p: 3,
                        mt: 2,
                      }}
                    >
                      <Typography mb={2} fontWeight={500} color="#666">
                        Edit Sub-Task
                      </Typography>

                      <Stack direction="row" spacing={3} mb={2}>
                        <Box flex={1}>
                          <Typography fontSize={12} color="#999" mb={0.5}>
                            Name
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={newSubTask.name}
                            onChange={(e) =>
                              setNewSubTask({
                                ...newSubTask,
                                name: e.target.value,
                              })
                            }
                            // error={!!errors.subName}
                            // helperText={errors.subName}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                              },
                            }}
                          />
                        </Box>

                        <Box flex={1}>
                          <Typography fontSize={12} color="#999" mb={0.5}>
                            Status
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Select
                              value={newSubTask.status}
                              onChange={
                                (e) =>
                                  setNewSubTask({
                                    ...newSubTask,
                                    status: Number(e.target.value),
                                  }) // Convert to number
                              }
                              sx={{ borderRadius: "8px" }}
                            >
                              {STATUS_OPTIONS.map((s, idx) => (
                                <MenuItem key={idx} value={idx}>
                                  {s}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={3} mb={3}>
                        <Box flex={1}>
                          <Typography fontSize={12} color="#999" mb={0.5}>
                            Due Date
                          </Typography>
                          <DatePicker
                            value={newSubTask.due_date}
                            onChange={(val) =>
                              setNewSubTask({ ...newSubTask, due_date: val })
                            }
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                // error: !!errors.subDue,
                                // helperText: errors.subDue,
                                sx: {
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                  },
                                },
                                InputProps: {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <CalendarTodayIcon />
                                    </InputAdornment>
                                  ),
                                },
                              },
                            }}
                          />
                        </Box>

                        <Box flex={1}>
                          <Typography fontSize={12} color="#999" mb={0.5}>
                            Assignee
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Select
                              value={newSubTask.assignee}
                              onChange={(e) =>
                                setNewSubTask({
                                  ...newSubTask,
                                  assignee:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                })
                              }
                              displayEmpty
                              sx={{ borderRadius: "8px" }}
                            >
                              <MenuItem value="" disabled>
                                Select Assignee
                              </MenuItem>
                              {assignees.map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                  {a.emp_name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Stack>

                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: "#4B4B4B",
                            color: "#FFF",
                            borderRadius: "8px",
                            textTransform: "none",
                            px: 4,
                          }}
                          onClick={handleAddSubTask}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Stack>
            )}

            {/* Action Buttons */}
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
              <Button
                sx={{
                  bgcolor: "#F3F4F6",
                  color: "#111",
                  borderRadius: "8px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                sx={{
                  bgcolor: "#4B4B4B",
                  color: "#FFF",
                  borderRadius: "8px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#333" },
                }}
                onClick={handleSaveDetails}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Sub Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this sub-task?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteSubTask} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskDetailsDialog;
