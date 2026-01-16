import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { CustomStepIndicator } from './CustomStepIndicator';
import { STATUS_OPTIONS } from './data/data';
import { COLORS } from './data/colors';
import { eventApi, taskApi } from '@/services/api';
import { Task } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const STATUS_MAP: Record<string, number> = {
  'To Do': 0,
  'In Progress': 1,
  'Completed': 2,
};

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  events: any[];
  initialSelectedEvent: string;
  onTaskCreated: (newTask: any, eventName: string) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  onClose,
  // events,
  initialSelectedEvent,
  onTaskCreated,
}) => {
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState('');
  // const [selectedEvent, setSelectedEvent] = useState(initialSelectedEvent);
  const [assignee, setAssignee] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [status] = useState('To Do'); // fixed for new task

  // Step 2 - rich text editor
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('inherit');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const clinic = useSelector((s: RootState) => s.clinic.data);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");

  useEffect(() => {
    if (!clinic?.id) return;

    eventApi.listByClinic(clinic.id).then((res) => {
      const raw = res.data.results ?? res.data ?? [];
      setEvents(raw);
    });
  }, [clinic?.id]);


  // Step 3 - sub tasks
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [newSubTask, setNewSubTask] = useState({
    name: '',
    status: 'To Do',
    due: null as dayjs.Dayjs | null,
    assignee: '' as number | '',
  });

  // Errors
  const INITIAL_ERRORS = {
    name: '',
    event: '',
    assignee: '',
    dueDate: '',
    description: '',
    subName: '',
    subStatus: '',
    subDue: '',
    subAssignee: '',
  }
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setName('');
      // setSelectedEvent(initialSelectedEvent);
      setAssignee('');
      setDueDate(null);
      setDescriptionHtml('');
      setSubTasks([]);
      setNewSubTask({ name: '', status: 'To Do', due: null, assignee: '' });
      setErrors(INITIAL_ERRORS);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [open, initialSelectedEvent]);

  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data
  );  

  // Rich text editor format checking
  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
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
    document.execCommand('foreColor', false, color);
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  };

  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      document.execCommand('insertImage', false, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          insertImage(file);
        }
      });
      e.target.value = '';
    }
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {
      name: !name.trim() ? "Task name is required" : "",
      event: !selectedEventId ? "Event is required" : "",
      assignee: !assignee ? "Assignee is required" : "",
      dueDate: !dueDate ? "Due date is required" : "",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((v) => !v);
  };  

  const validateStep2 = () => {
    const text = editorRef.current?.innerText?.trim() || '';
    if (!text) {
      setErrors((prev) => ({ ...prev, description: 'Description is required' }));
      toast.error('Description is required');
      return false;
    }
    setErrors((prev) => ({ ...prev, description: '' }));
    setDescriptionHtml(editorRef.current?.innerHTML || '');
    return true;
  };

  const validateSubTask = () => {
    const newErrors = {
      subName: !newSubTask.name.trim() ? 'Sub-task name is required' : '',
      subStatus: !newSubTask.status ? 'Status is required' : '',
      subDue: !newSubTask.due ? 'Due date is required' : '',
      subAssignee: !newSubTask.assignee ? 'Assignee is required' : '',
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((v) => !v);
  };

  // Save new sub-task
  const handleAddSubTask = () => {
    if (!validateSubTask()) return;

    setSubTasks([
      ...subTasks,
      {
        ...newSubTask,
        due: newSubTask.due ? newSubTask.due.format('DD/MM/YYYY') : '',
      },
    ]);

    setNewSubTask({ name: '', status: 'To Do', due: null, assignee: '' });
    toast.success('Sub-task added');
  };

  // Final save
const handleSaveTask = async () => {
  try {
    const payload: Partial<Task> = {
      event: Number(selectedEventId),            // number
      assignment: Number(assignee),       // employee ID
      name: name.trim(),
      description: descriptionHtml
        .replace(/<[^>]*>/g, "")
        .slice(0, 500),
      due_date: dueDate?.toISOString(),
      status: STATUS_MAP[status],
      sub_tasks: subTasks.map(st => ({
        name: st.name,
        due_date: dayjs(st.due, "DD/MM/YYYY").toISOString(),
        status: STATUS_MAP[st.status],
      })),
    };

    if (!payload.event || !payload.assignment) {
      toast.error("Event or assignee missing");
      return;
    }

    const createdTask = await taskApi.create(payload);

    toast.success("Task created successfully");
    onTaskCreated(createdTask, JSON.stringify(selectedEventId));
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to create task");
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
        PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}
      >
        <DialogContent sx={{ p: 2 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography fontSize={24} fontWeight={800} color="#111">
              Add New Task
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: '#E0E0E0',
                bgcolor: '#E0E0E0',
                '&:hover': { bgcolor: '#D0D0D0' },
                width: 32,
                height: 32,
              }}
            >
              <CloseIcon sx={{ fontSize: 18, color: 'white' }} />
            </IconButton>
          </Stack>

          <CustomStepIndicator addTaskStep={step} />

          {/* Step 1 */}
          {step === 1 && (
            <Stack spacing={3}>
              <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ mb: 1, fontSize: 14, color: '#666' }}>
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Calibrate & Maintain Equipment"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ mb: 1, fontSize: 14, color: '#666' }}>
                    Maintenance
                  </Typography>
                  <FormControl fullWidth error={!!errors.event}>
                    <Select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value as number)}
                      displayEmpty
                      sx={{ borderRadius: "12px" }}
                    >
                      <MenuItem value="" disabled>
                        Select Event
                      </MenuItem>

                      {events.map((e) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.event_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ mb: 1, fontSize: 14, color: '#666' }}>
                    Assignee
                  </Typography>
                  <FormControl fullWidth error={!!errors.assignee}>
                  <Select
                      value={assignee}
                      onChange={(e) =>
                        setAssignee(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      displayEmpty
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="" disabled>
                        Select assignee
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
                  <Typography sx={{ mb: 1, fontSize: 14, color: '#666' }}>
                    Due Date
                  </Typography>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dueDate,
                        helperText: errors.dueDate,
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } },
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
              </Stack>
            </Stack>
          )}

          {/* Step 2 - Rich Text */}
          {step === 2 && (
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ mb: 1, fontSize: 14, color: '#666' }}>
                  Details
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${
                      errors.description ? '#d32f2f' : '#E0E0E0'
                    }`,
                    borderRadius: '12px',
                    overflow: 'hidden',
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
                      outline: 'none',
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
                    {/* Formatting tools */}
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat('bold')}
                        sx={{
                          color: activeFormats.includes('bold')
                            ? '#FF8A65'
                            : 'inherit',
                        }}
                      >
                        <FormatBoldIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat('italic')}
                        sx={{
                          color: activeFormats.includes('italic')
                            ? '#FF8A65'
                            : 'inherit',
                        }}
                      >
                        <FormatItalicIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat('underline')}
                        sx={{
                          color: activeFormats.includes('underline')
                            ? '#FF8A65'
                            : 'inherit',
                        }}
                      >
                        <FormatUnderlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        sx={{
                          color: selectedColor !== 'inherit' ? selectedColor : 'inherit',
                        }}
                      >
                        <FormatColorTextIcon fontSize="small" />
                      </IconButton>

                      {showColorPicker && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '40px',
                            left: 0,
                            bgcolor: 'white',
                            p: 1,
                            borderRadius: '8px',
                            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            gap: 1,
                            zIndex: 9999,
                            border: '1px solid #E0E0E0',
                          }}
                        >
                          {[
                            '#000000',
                            '#FF0000',
                            '#0000FF',
                            '#008000',
                            '#FFA500',
                            '#800080',
                            '#E57373',
                          ].map((color) => (
                            <Box
                              key={color}
                              onClick={() => applyColor(color)}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: color,
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                '&:hover': { transform: 'scale(1.1)' },
                              }}
                            />
                          ))}

                          <Box
                            onClick={() => applyColor('inherit')}
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
                              color: '#666',
                            }}
                          >
                            X
                          </Box>
                        </Box>
                      )}

                      <IconButton
                        size="small"
                        onClick={() => toggleFormat('justifyLeft')}
                      >
                        <FormatAlignLeftIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => toggleFormat('justifyFull')}
                      >
                        <FormatAlignJustifyIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {/* Right side tools */}
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

                {errors.description && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.description}
                  </Typography>
                )}
              </Box>

              {/* Drag & Drop area */}
              <Box
                sx={{
                  border: '2px dashed #E0E0E0',
                  borderRadius: '12px',
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: '#FAFAFA',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  files.forEach((file) => {
                    if (file.type.startsWith('image/')) insertImage(file);
                  });
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: '#444', mb: 1 }} />
                <Typography fontSize={14} color="#666">
                  Drag & Drop or{' '}
                  <span style={{ color: '#2196F3', fontWeight: 600 }}>
                    Choose to Upload
                  </span>
                </Typography>
                <Typography fontSize={12} color="#999">
                  File format png, jpeg, pdf, etc.
                </Typography>
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                multiple
              />
            </Stack>
          )}

          {/* Step 3 - Sub Tasks */}
          {step === 3 && (
            <Stack spacing={3}>
              {/* Add new sub-task form */}
              <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '16px', p: 3 }}>
                <Typography mb={2} fontWeight={500} color="#666">
                  Add New Sub-Task
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
                        setNewSubTask({ ...newSubTask, name: e.target.value })
                      }
                      error={!!errors.subName}
                      helperText={errors.subName}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography fontSize={12} color="#999" mb={0.5}>
                      Status
                    </Typography>
                    <FormControl fullWidth size="small" error={!!errors.subStatus}>
                      <Select
                        value={newSubTask.status}
                        onChange={(e) =>
                          setNewSubTask({ ...newSubTask, status: e.target.value })
                        }
                        sx={{ borderRadius: '8px' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>
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
                      value={newSubTask.due}
                      onChange={(val) =>
                        setNewSubTask({ ...newSubTask, due: val })
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!errors.subDue,
                          helperText: errors.subDue,
                          sx: { '& .MuiOutlinedInput-root': { borderRadius: '8px' } },
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
                    <FormControl fullWidth size="small" error={!!errors.subAssignee}>
                      <Select
                        value={newSubTask.assignee}
                        onChange={(e) =>
                          setNewSubTask({
                            ...newSubTask,
                            assignee: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }                                                
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
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
                      bgcolor: '#4B4B4B',
                      color: '#FFF',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                    }}
                    onClick={handleAddSubTask}
                  >
                    Save
                  </Button>
                </Box>
              </Box>

              {/* Sub-tasks list */}
              <Stack spacing={2}>
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
                      bgcolor: '#F9FAFB',
                      borderRadius: '12px',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography width="40%" fontWeight={600} fontSize={14}>
                      {st.name}
                    </Typography>
                    <Box width="20%">
                      {/* You can use statusPill here if you want */}
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 8,
                          bgcolor:
                            st.status === 'Completed'
                              ? COLORS.complete
                              : st.status === 'In Progress'
                              ? COLORS.progress
                              : COLORS.todo,
                          color: '#fff',
                          fontSize: 12,
                        }}
                      >
                        {st.status}
                      </Box>
                    </Box>
                    <Typography width="25%" fontSize={14}>
                      {st.due || '—'}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      width="15%"
                      justifyContent="flex-end"
                    >
                      <Avatar sx={{ width: 24, height: 24 }} />
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
              onClick={onClose}
              sx={{
                height: 50,
                borderRadius: '12px',
                bgcolor: '#F5F5F5',
                color: '#111',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 16,
                '&:hover': { bgcolor: '#EEEEEE' },
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
                borderRadius: '12px',
                bgcolor: '#4B4B4B',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 16,
                '&:hover': { bgcolor: '#333333' },
              }}
            >
              {step < 3 ? 'Next' : 'Save'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTaskDialog;