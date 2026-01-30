import React, { useState, useEffect, useRef } from "react";
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
import { COLORS } from "./colors";
import { formatDueDateDisplay } from "./FormatDueDateDisplay";
import { trackIcons } from "./trackIcons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  SubTask,
  Task,
  TASK_STATUS_MAP,
  TaskStatus,
  TaskUpdatePayload,
} from "@/types";

import { DatePicker } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete";
import { taskApi } from "@/services/api";
import dayjs from "dayjs";

type UITask = Task & {
  status_label: "To - Do" | "In Progress" | "Completed";
  due?: string;
  documents?: {
    id: number;
    document_name: string;
    created_at: string;
  }[];
};
interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: UITask | null;
  onUpdated: () => void;
}
const STATUS_OPTIONS = ["To - Do", "In Progress", "Completed"];
const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  onClose,
  task,
  onUpdated,
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [, forceTick] = useState(0);

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
    setDetailsTab(0);
  }, [open, task?.id]); 

  useEffect(() => {
    if (task?.timer_status !== "RUNNING") return;

    const i = setInterval(() => {
      forceTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(i);
  }, [task?.timer_status]);

  useEffect(() => {
    if (!open || !task) return;
    requestAnimationFrame(() => {
      if (!editorRef.current) return;

      editorRef.current.innerHTML = task.description?.trim()
        ? task.description
        : '<p style="color:#aaa;font-style:italic;">No description yet. Click to edit…</p>';

      setTaskDetails(task.description || "");
    });
  }, [open, task?.id]);

  useEffect(() => {
    if (!open) return;
    setSelectedFiles([]);
  }, [open, task?.id]);

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
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        insertImageFromUpload(file); 
      }
    });

    setSelectedFiles((prev) => [...prev, ...files]); 
    e.target.value = "";
  };

  const tabs = ["Description", "Sub Tasks"];
  const toISO = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  console.log("task", task);
  const handleSaveDetails = async () => {
    if (!task) return;

    const payload: TaskUpdatePayload = {
      task_event: task.task_event,
      assignment: task.assignment ?? null,
      name: task.name,
      description: taskDetails,
      status:
        taskStatus === TaskStatus.COMPLETED
          ? 2
          : taskStatus === TaskStatus.IN_PROGRESS
            ? 1
            : 0,
      due_date: toISO(task.due_date)!,
      sub_tasks: subTasks.map((st) => ({
        id: st.id,
        name: st.name,
        status: st.status,
        due_date: toISO(st.due_date)!,
        assignment: st.assignment ?? null,
      })),
      documents: selectedFiles.map((file) => ({
        document_name: file.name,
        data: "BASE64_DATA",
      })),
    };

    await taskApi.update(task.id, payload);
    toast.success("Task updated");
    onClose();
    onUpdated(); 
  };

  const handleAddSubTask = () => {
    if (!newSubTask.name || !newSubTask.due_date) {
      toast.error("Sub-task name and due date required");
      return;
    }

    const dueDate = newSubTask.due_date; 

    setSubTasks((prev) => [
      ...prev,
      {
        name: newSubTask.name,
        status: newSubTask.status,
        due_date: dueDate.toISOString(), 
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
    null,
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

  const handleTimerStart = async () => {
    if (!task) return;
    await taskApi.startTimer(task.id);
    onUpdated();
  };

  const handleTimerPause = async () => {
    if (!task) return;
    await taskApi.pauseTimer(task.id);
    onUpdated();
  };

  const handleTimerStop = async () => {
    if (!task) return;
    await taskApi.stopTimer(task.id);
    onUpdated();
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
                    {trackIcons(task.timer_status ?? "IDLE", {
                      onStart: handleTimerStart,
                      onPause: handleTimerPause,
                      onStop: handleTimerStop,
                    })}

                    <Typography fontSize={13}>
                      {formatSeconds(getTaskTime(task))}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />
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

              {task.documents && task.documents.length > 0 && (
                <Box mt={3}>
                  <Typography fontSize={14} fontWeight={600} mb={1}>
                    Attachments
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {task.documents.map((doc) => (
                      <Box
                        key={doc.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                          bgcolor: "#F9FAFB",
                        }}
                      >
                        <CloudUploadOutlinedIcon
                          sx={{ fontSize: 16, color: "#6B7280" }}
                        />
                        <Typography fontSize={13}>
                          {doc.document_name}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Documents / Attachments */}
              {selectedFiles.length > 0 && (
                <Box mt={2}>
                  <Typography fontSize={14} fontWeight={600}>
                    New Attachments
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedFiles.map((file, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          bgcolor: "#F3F4F6",
                          fontSize: 13,
                        }}
                      >
                        {file.name}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="*/*"
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
                    Choose Files
                  </span>
                </Typography>
                <Typography fontSize={12} color="#999">
                  Any file type • Multiple files supported
                </Typography>
              </Box>
            </Stack>

            {/* Sub Tasks Tab */}
            {detailsTab === 1 && (
              <Stack spacing={3}>
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
                      display: "inline-block",
                      alignItems: "center",
                      cursor: "pointer",
                      justifyContent: "flex-start",
                      width: "fit-content", 
                      "&:hover": {
                        opacity: 0.7, 
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
                        Add Sub-Task
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
                                  }) 
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
