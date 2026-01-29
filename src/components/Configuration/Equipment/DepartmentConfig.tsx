import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import type { Department } from '@/types';

interface DepartmentConfigProps {
  readOnly?: boolean;
}

const DepartmentConfig: React.FC<DepartmentConfigProps> = ({ readOnly = false }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { mockDepartments } = await import('@/utils/mockData');
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditing(dept);
      reset(dept);
    } else {
      setEditing(null);
      reset({ name: '', is_active: true });
    }
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        setDepartments(departments.map(d => d.id === editing.id ? { ...d, ...data } : d));
      } else {
        const newDept: Department = {
          id: Math.max(...departments.map(d => d.id), 0) + 1,
          ...data,
          clinic_id: 1,
          created_at: new Date().toISOString(),
        };
        setDepartments([...departments, newDept]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  if (showForm) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleClose} sx={{ color: '#6b7280' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {editing ? `Edit Department` : 'Add Department'}
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Department Name"
                  fullWidth
                  variant="outlined"
                  {...register('name', { required: 'Department name is required' })}
                  error={!!errors.name}
                  helperText={errors.name?.message as string}
                  disabled={readOnly}
                />
                <FormControlLabel
                  control={<Switch defaultChecked {...register('is_active')} disabled={readOnly} />}
                  label="Active"
                />
              </Box>

              {!readOnly && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      '&:hover': {
                        borderColor: '#9ca3af',
                        backgroundColor: '#f9fafb',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: '#14b8a6',
                      '&:hover': { backgroundColor: '#0d9488' },
                      textTransform: 'none',
                    }}
                  >
                    {editing ? 'Update' : 'Create'}
                  </Button>
                </Box>
              )}
              {readOnly && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#d1d5db',
                      color: '#374151',
                    }}
                  >
                    Back
                  </Button>
                </Box>
              )}
            </form>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: '#14b8a6',
              '&:hover': { backgroundColor: '#0d9488' },
              textTransform: 'none',
            }}
          >
            Add Department
          </Button>
        </Box>
      )}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell align="right">
                      {!readOnly && (
                        <>
                          <IconButton size="small" onClick={() => handleOpen(dept)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(dept.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepartmentConfig;
