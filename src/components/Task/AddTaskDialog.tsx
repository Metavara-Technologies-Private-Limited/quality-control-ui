import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogContent,
  Avatar,
  InputLabel,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { CustomStepIndicator } from "./CustomStepIndicator";
import { taskApi } from "@/services/api";
import { TASK_STATUS_MAP, TaskStatus } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { formatDueDateDisplay } from "./FormatDueDateDisplay";
import { COLORS } from "./colors";

// Validation function for alphanumeric input starting with alphabets
const validateAlphanumericInput = (value: string): boolean => {
  if (value === "") return true; // Allow empty string
  // Check if first character is an alphabet
  if (!/^[A-Za-z]/.test(value)) return false;
  // Check if all characters are alphanumeric (letters, numbers, spaces)
  if (!/^[A-Za-z0-9\s]*$/.test(value)) return false;
  return true;
};

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  taskEvents: {
    id: number;
    name: string;
  }[];
  initialSelectedEvent: number | null;
  onTaskCreated: (newTask: any, eventName: string) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  onClose,
  taskEvents,
  initialSelectedEvent,
  onTaskCreated,
}) => {
  const assignees = useSelector((state: RootState) => state.assignees.data);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState<number | "">("");
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("inherit");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");

  // Step 3 - sub tasks
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [newSubTask, setNewSubTask] = useState({
    name: "",
    status: TaskStatus.TODO,
    due_date: null as dayjs.Dayjs | null,
    assignee: "" as number | "",
  });

  const INITIAL_ERRORS = {
    name: "",
    event: "",
    assignee: "",
    dueDate: "",
    description: "",
    subName: "",
    subStatus: "",
    subDue: "",
    subAssignee: "",
  };
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  useEffect(() => {
    if (open) {
      setStep(1);
      setName("");
      setAssignee("");
      setDueDate(null);
      setDescriptionHtml("");
      setSelectedFiles([]);
      setSubTasks([]);
      setNewSubTask({
        name: "",
        status: TaskStatus.TODO,
        due_date: null,
        assignee: "",
      });
      setErrors(INITIAL_ERRORS);
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [open, initialSelectedEvent]);

  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data,
  );

  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState("bold")) formats.push("bold");
    if (document.queryCommandState("italic")) formats.push("italic");
    if (document.queryCommandState("underline")) formats.push("underline");
    setActiveFormats(formats);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
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

  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      document.execCommand("insertImage", false, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      newFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          insertImage(file);
        }
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ────
  const validateStep1 = () => {
    const newErrors = {
      name: !name.trim()
        ? "Task name is required"
        : !validateAlphanumericInput(name)
          ? "Enter Alphanumeric only"
          : "",
      event: !selectedEventId ? "Event is required" : "",
      assignee: !assignee ? "Assignee is required" : "",
      dueDate: !dueDate ? "Due date is required" : "",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (newErrors.name) {
      toast.error(newErrors.name, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    return Object.values(newErrors).every((v) => !v);
  };

  const validateStep2 = () => {
    const text = editorRef.current?.innerText?.trim() || "";
    if (!text) {
      setErrors((prev) => ({
        ...prev,
        description: "Description is required",
      }));
      toast.error("Description is required", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    setErrors((prev) => ({ ...prev, description: "" }));
    setDescriptionHtml(editorRef.current?.innerHTML || "");
    return true;
  };

  const validateSubTask = () => {
    const newErrors = {
      subName: !newSubTask.name.trim()
        ? "Sub-Task name is required"
        : !validateAlphanumericInput(newSubTask.name)
          ? "Enter Alphanumeric only"
          : "",
      subStatus:
        newSubTask.status === undefined || newSubTask.status === null
          ? "Status is required"
          : "",
      subDue: !newSubTask.due_date ? "Due date is required" : "",
      subAssignee: !newSubTask.assignee ? "Assignee is required" : "",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (newErrors.subName) {
      toast.error(newErrors.subName, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    return Object.values(newErrors).every((v) => !v);
  };

  // ── Sub-task actions ────
  const handleAddSubTask = () => {
    if (!validateSubTask()) return;

    setSubTasks([
      ...subTasks,
      {
        name: newSubTask.name,
        status: newSubTask.status,
        due_date: newSubTask.due_date!.toISOString(),
        assignment: newSubTask.assignee === "" ? null : newSubTask.assignee,
      },
    ]);

    setNewSubTask({
      name: "",
      status: TaskStatus.TODO,
      due_date: null,
      assignee: "",
    });

    toast.success("Sub-task added", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleDeleteSubTask = (index: number) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== index));
    toast.info("Sub-task removed", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSaveTask = async () => {
    try {
      const payload: any = {
        task_event: Number(selectedEventId),
        assignment: assignee === "" ? null : assignee,
        name: name.trim(),
        description: descriptionHtml,
        due_date: dueDate!.toISOString(),
        status: TaskStatus.TODO,
        sub_tasks: subTasks,
        documents: selectedFiles.map((file) => ({
          document_name: file.name,
          data: "BINARY_OR_BASE64_DATA_PLACEHOLDER",
        })),
      };

      if (!payload.task_event || !payload.assignment) {
        toast.error("Event or assignee missing", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const createdTask = await taskApi.create(payload);
      toast.success("Task created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onTaskCreated(createdTask, String(selectedEventId));
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", p: 0 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            m={3}
          >
            <Typography fontSize={24} fontWeight={700} color="#111">
              Add New Task
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: "#E0E0E0",
                bgcolor: "#E0E0E0",
                "&:hover": { bgcolor: "#D0D0D0" },
                width: 32,
                height: 32,
              }}
            >
              <CloseIcon sx={{ fontSize: 18, color: "white" }} />
            </IconButton>
          </Stack>
          <Divider sx={{ width: "100%", mx: 0, my: 1 }} />

          <CustomStepIndicator addTaskStep={step} />

          {/* Step 1 */}
          {step === 1 && (
            <Stack spacing={3} m={3}>
              <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    placeholder="Calibrate & Maintain Equipment"
                    value={name}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (validateAlphanumericInput(newValue)) {
                        setName(newValue);
                        setErrors((prev) => ({ ...prev, name: "" }));
                      } else {
                        toast.error("Enter Alphanumeric only", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        });
                      }
                    }}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!errors.event}>
                    <InputLabel shrink>Maintenance</InputLabel>
                    <Select
                      value={selectedEventId}
                      onChange={(e) =>
                        setSelectedEventId(e.target.value as number)
                      }
                      displayEmpty
                      sx={{ borderRadius: "12px" }}
                      label="Maintenance"
                      notched
                    >
                      <MenuItem value="" disabled>
                        Select Event
                      </MenuItem>
                      {taskEvents.map((e) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!errors.assignee}>
                    <InputLabel shrink>Assignee</InputLabel>
                    <Select
                      value={assignee}
                      onChange={(e) =>
                        setAssignee(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      displayEmpty
                      sx={{ borderRadius: "12px" }}
                      label="Assignee"
                      notched
                    >
                      <MenuItem value="" disabled>
                        Select Assignee
                      </MenuItem>
                      {assigneeOptions.map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          {a.emp_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    disablePast
                    value={dueDate}
                    onChange={setDueDate}
                    format="DD/MM/YYYY"
                    label="Due Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dueDate,
                        helperText: errors.dueDate,
                        sx: {
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        },
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarTodayIcon />
                            </InputAdornment>
                          ),
                        },
                        InputLabelProps: { shrink: true },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Stack>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Stack spacing={3} m={3}>
              <Box>
                <Typography sx={{ mb: 1, fontSize: 14, color: "#666" }}>
                  Details
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${errors.description ? "#d32f2f" : "#E0E0E0"}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    contentEditable
                    suppressContentEditableWarning
                    ref={editorRef}
                    onMouseUp={() => {
                      saveSelection();
                      checkFormats();
                    }}
                    onKeyUp={() => {
                      saveSelection();
                      checkFormats();
                    }}
                    sx={{
                      minHeight: 200,
                      p: 2,
                      outline: "none",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  />

                  <Divider />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    p={1}
                    bgcolor="#FAFAFA"
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

                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={insertLink}>
                        <InsertLinkIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>

                {errors.description && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1 }}
                  >
                    {errors.description}
                  </Typography>
                )}
              </Box>

              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#555" }}>
                    Attached Files ({selectedFiles.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        icon={<AttachFileIcon />}
                        label={file.name}
                        onDelete={() => removeFile(index)}
                        color="default"
                        variant="outlined"
                        size="small"
                        sx={{ maxWidth: 240 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Drag & Drop area */}
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
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  files.forEach((file) => {
                    if (file.type.startsWith("image/")) insertImage(file);
                  });
                  setSelectedFiles((prev) => [...prev, ...files]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 40, color: "#444", mb: 1 }}
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

              <input
                type="file"
                ref={fileInputRef}
                accept="*/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                multiple
              />
            </Stack>
          )}

          {/* Step 3 - Sub Tasks */}
          {step === 3 && (
            <Stack spacing={3} m={3}>
              {/* Add new sub-task form */}
              <Box
                sx={{ border: "1px solid #E0E0E0", borderRadius: "16px", p: 3 }}
              >
                <Typography mb={3} fontWeight={500} color="#666">
                  Add New Sub-Task
                </Typography>

                <Stack direction="row" spacing={3} mb={2}>
                  <Box flex={1}>
                    <TextField
                      label="Name"
                      fullWidth
                      size="small"
                      value={newSubTask.name}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (validateAlphanumericInput(newValue)) {
                          setNewSubTask({ ...newSubTask, name: newValue });
                          setErrors((prev) => ({ ...prev, subName: "" }));
                        } else {
                          toast.error("Enter Alphanumeric only", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        }
                      }}
                      error={!!errors.subName}
                      helperText={errors.subName}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box flex={1}>
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.subStatus}
                    >
                      <InputLabel shrink>Status</InputLabel>
                      <Select
                        value={newSubTask.status}
                        onChange={(e) =>
                          setNewSubTask({
                            ...newSubTask,
                            status: Number(e.target.value) as TaskStatus,
                          })
                        }
                        sx={{ borderRadius: "8px" }}
                        label="Status"
                        notched
                      >
                        <MenuItem value={TaskStatus.TODO}>To - Do</MenuItem>
                        <MenuItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </MenuItem>
                        <MenuItem value={TaskStatus.COMPLETED}>
                          Completed
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={3} mb={3}>
                  <Box flex={1}>
                    <DatePicker
                      label="Due Date"
                      disablePast
                      value={newSubTask.due_date}
                      onChange={(val) =>
                        setNewSubTask({ ...newSubTask, due_date: val })
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.subDue,
                          helperText: errors.subDue,
                          sx: {
                            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                          },
                          InputProps: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CalendarTodayIcon />
                              </InputAdornment>
                            ),
                          },
                          InputLabelProps: { shrink: true },
                        },
                      }}
                    />
                  </Box>

                  <Box flex={1}>
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.subAssignee}
                    >
                      <InputLabel shrink>Assignee</InputLabel>
                      <Select
                        label="Assignee"
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
                        notched
                      >
                        <MenuItem value="" disabled>
                          Select Assignee
                        </MenuItem>
                        {assigneeOptions.map((a) => (
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

              {/* Sub-tasks list */}
              {subTasks.length > 0 && (
                <Stack spacing={1}>
                  <Stack direction="row" px={2}>
                    <Typography width="35%" fontSize={12} color="#999">
                      Name
                    </Typography>
                    <Typography width="18%" fontSize={12} color="#999">
                      Status
                    </Typography>
                    <Typography width="22%" fontSize={12} color="#999">
                      Due Date
                    </Typography>
                    <Typography width="20%" fontSize={12} color="#999">
                      Assignee
                    </Typography>
                    <Typography width="5%" />
                  </Stack>

                  {subTasks.map((st, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: "#F9FAFB",
                        borderRadius: "12px",
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography width="35%" fontWeight={500} fontSize={14}>
                        {st.name}
                      </Typography>

                      <Box width="18%">
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

                      <Typography width="22%" fontSize={14}>
                        {formatDueDateDisplay(st.due_date ?? "").text}
                      </Typography>

                      <Box width="20%">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            bgcolor: "#757575",
                          }}
                        >
                          {assignees
                            .find((u) => u.id === st.assignment)
                            ?.emp_name?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                      </Box>
                      <Box width="5%" textAlign="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSubTask(idx)}
                          sx={{
                            color: "#d32f2f",
                            "&:hover": { bgcolor: "#ffebee" },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} mt={4} m={3}>
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                height: 50,
                borderRadius: "12px",
                bgcolor: "#F5F5F5",
                color: "#111",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                "&:hover": { bgcolor: "#EEEEEE" },
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              onClick={() => {
                if (step < 3) {
                  handleNext();
                } else {
                  handleSaveTask();
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
                "&:hover": { bgcolor: "#333333" },
              }}
            >
              {step < 3 ? "Next" : "Save"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTaskDialog;
