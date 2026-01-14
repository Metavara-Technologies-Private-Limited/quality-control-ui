import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
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

import { toast } from 'react-toastify';
import { COLORS } from './data/colors';
import { STATUS_OPTIONS } from './data/data';
import { formatDueDateDisplay } from './formatDueDateDisplay';
import { trackIcons } from './trackIcons';
import { statusPill } from './statusPill';

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: any | null;              // your task object
  taskIndex: number;
  selectedEvent: string;
  setTasksByEvent: React.Dispatch<React.SetStateAction<any>>;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  openTaskDetails,
  onClose,
  task,
  taskIndex,
  selectedEvent,
  setTasksByEvent,
}) => {
  const [detailsTab, setDetailsTab] = useState(0);
  const [taskDetails, setTaskDetails] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('inherit');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [taskDetailsErrors, setTaskDetailsErrors] = useState({ description: '' });

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize when dialog opens
  useEffect(() => {
    if (open && task) {
      setTaskStatus(task.status || 'To Do');
      setTaskDetails(task.description || '');
      setTaskDetailsErrors({ description: '' });
      setDetailsTab(0);
    }
  }, [open, task]);

  // Editor content setup when tab changes to description
  useEffect(() => {
    if (!open || detailsTab !== 0 || !editorRef.current) return;

    const editor = editorRef.current;
    editor.innerHTML = '';

    if (taskDetails?.trim()) {
      editor.innerHTML = taskDetails;
    } else {
      editor.innerHTML =
        '<p style="color:#aaa; font-style:italic;">No description saved yet. Click to edit...</p>';
    }

    // Place cursor at the end
    try {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      editor.focus();
    } catch (err) {
      console.warn('Cursor positioning failed:', err);
    }

    checkFormats();
  }, [open, detailsTab, taskDetails]);

  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
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
    document.execCommand('foreColor', false, color);
    setSelectedColor(color);
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
      document.execCommand('insertImage', false, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          insertImageFromUpload(file);
        }
      });
      e.target.value = '';
    }
  };

  const validateTaskDetails = () => {
    const desc = editorRef.current?.innerText?.trim() || '';
    if (!desc) {
      setTaskDetailsErrors({ description: 'Description is required' });
      toast.error('Description cannot be empty');
      return false;
    }
    setTaskDetailsErrors({ description: '' });
    return true;
  };

  const handleSaveDetails = () => {
    if (!validateTaskDetails() || !task) return;

    const newDescription = editorRef.current?.innerHTML || '';

    setTasksByEvent((prev: any) => {
      const eventTasks = prev[selectedEvent] || [];
      const updated = eventTasks.map((t: any, idx: number) =>
        idx === taskIndex
          ? {
              ...t,
              description: newDescription,
              status: taskStatus,
            }
          : t
      );

      return {
        ...prev,
        [selectedEvent]: updated,
      };
    });

    toast.success('Task updated successfully');
    onClose();
  };

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setTaskDetails('');
    setActiveFormats([]);
    setSelectedColor('inherit');
    setTaskDetailsErrors({ description: '' });
  };

  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusSelect = (newStatus: string) => {
    setTaskStatus(newStatus);
    toast.success(`Status changed to ${newStatus}`);
    setStatusAnchorEl(null);
  };

  if (!open || !task) return null;

  return (
    <>
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option} onClick={() => handleStatusSelect(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>

     <Dialog
  open={openTaskDetails}
  onClose={() => setOpenTaskDetails(false)}
    maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "24px", p: 2 }
          }}
>
    <DialogContent>
         <Box sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography fontSize={20} fontWeight={700}>
              {task.name}
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{ bgcolor: '#E0E0E0', color: '#FFF', width: 30, height: 30 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Task Info */}
          <Stack spacing={2} mb={3}>
            <Stack direction="row" spacing={4} alignItems="center">
              {/* Assignee */}
              <Stack direction="row" alignItems="center" spacing={1} width="50%">
                <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                  Assignee :
                </Typography>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Typography fontWeight={500}>Joe Smith</Typography>
              </Stack>

              {/* Status */}
              <Stack direction="row" alignItems="center" spacing={1} width="50%">
                <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                  Status :
                </Typography>

                <Box onClick={handleStatusClick} sx={{ cursor: 'pointer' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 22,
                      borderRadius: 8,
                      bgcolor:
                        taskStatus === 'Completed'
                          ? COLORS.complete
                          : taskStatus === 'In Progress'
                          ? COLORS.progress
                          : COLORS.todo,
                      color: '#fff',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
                      {taskStatus}
                    </Typography>
                    <Box
                      sx={{
                        width: 14,
                        minWidth: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: '1px solid rgba(255,255,255,0.35)',
                        cursor: 'pointer',
                      }}
                    >
                      <PlayArrowRoundedIcon sx={{ fontSize: 9, color: '#fff' }} />
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={4} alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1} width="50%">
                <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                  Due Date :
                </Typography>
                <CalendarTodayIcon sx={{ fontSize: 18, color: '#111' }} />
                <Typography fontWeight={500}>
                  {formatDueDateDisplay(task.due).text}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} width="50%">
                <Typography color="#9CA3AF" sx={{ minWidth: 80 }}>
                  Track Time :
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {trackIcons(task.status)}
                  <Typography fontWeight={500}>{task.time}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
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
          </Box>

          {/* Description Tab */}
          {detailsTab === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ mb: 1, fontSize: 13, color: '#666' }}>Details</Typography>
                <Box
                  sx={{
                    border: `1px solid ${
                      taskDetailsErrors.description ? '#d32f2f' : '#E0E0E0'
                    }`,
                    borderRadius: '12px',
                    overflow: 'hidden',
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
                      outline: 'none',
                      fontSize: 14,
                      lineHeight: 1.6,
                      caretColor: '#FF8A65',
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
                        onClick={() => toggleFormat('bold')}
                        sx={{
                          color: activeFormats.includes('bold') ? '#FF8A65' : 'inherit',
                        }}
                      >
                        <FormatBoldIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat('italic')}
                        sx={{
                          color: activeFormats.includes('italic') ? '#FF8A65' : 'inherit',
                        }}
                      >
                        <FormatItalicIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleFormat('underline')}
                        sx={{
                          color: activeFormats.includes('underline') ? '#FF8A65' : 'inherit',
                        }}
                      >
                        <FormatUnderlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        sx={{ color: selectedColor !== 'inherit' ? selectedColor : 'inherit' }}
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
                          {['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#E57373'].map(
                            (color) => (
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
                            )
                          )}
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

                      <IconButton size="small" onClick={() => toggleFormat('justifyLeft')}>
                        <FormatAlignLeftIcon fontSize="small" />
                      </IconButton>

                      <IconButton size="small" onClick={() => toggleFormat('justifyFull')}>
                        <FormatAlignJustifyIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {/* Right side actions */}
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

                {taskDetailsErrors.description && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {taskDetailsErrors.description}
                  </Typography>
                )}
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                multiple
              />

              {/* Drag & Drop area */}
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed #E0E0E0',
                  borderRadius: '12px',
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#FFF',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F5F5F5' },
                }}
              >
                <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: '#444', mb: 1 }} />
                <Typography fontSize={14} color="#666">
                  Drag & Drop or <span style={{ color: '#2196F3', fontWeight: 600 }}>Choose to Upload</span>
                </Typography>
                <Typography fontSize={12} color="#999">
                  File format png, jpeg, pdf, etc.
                </Typography>
              </Box>
            </Stack>
          )}

          {/* Sub Tasks Tab */}
          {detailsTab === 1 && (
            <Box p={2}>
              {task.subtasks?.length > 0 ? (
                <Stack spacing={2}>
                  {task.subtasks.map((sub: any, idx: number) => (
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
                        {sub.name}
                      </Typography>
                      <Box width="20%">{statusPill(sub.status)}</Box>
                      <Typography
                        width="25%"
                        fontSize={14}
                        color={formatDueDateDisplay(sub.due).color}
                      >
                        {formatDueDateDisplay(sub.due).text}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        width="15%"
                        justifyContent="flex-end"
                        alignItems="center"
                      >
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

          {/* Action Buttons */}
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
            <Button
              sx={{
                bgcolor: '#F3F4F6',
                color: '#111',
                borderRadius: '8px',
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
              }}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              sx={{
                bgcolor: '#4B4B4B',
                color: '#FFF',
                borderRadius: '8px',
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: '#333' },
              }}
              onClick={handleSaveDetails}
            >
              Save
            </Button>
          </Stack>
        </Box>
    </DialogContent>
       
      </Dialog>
    </>
  );
};

export default TaskDetailsDialog;