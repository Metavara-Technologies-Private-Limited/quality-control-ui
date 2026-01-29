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
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, Search } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import type { TestType } from '@/types';

interface TestTypeConfigProps {
  readOnly?: boolean;
}

const TestTypeConfig: React.FC<TestTypeConfigProps> = ({ readOnly = false }) => {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TestType | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadTestTypes();
  }, []);

  const loadTestTypes = async () => {
    setTestTypes([
      {
        id: 1,
        test_type_name: 'Temperature Monitoring',
        description: 'Daily temperature checks for incubators',
        parameters: [1, 2],
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        test_type_name: 'Humidity Control',
        description: 'Humidity level monitoring and control',
        parameters: [3],
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        test_type_name: 'Gas Concentration',
        description: 'CO₂ and gas mix concentration tests',
        parameters: [2, 4, 5],
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleOpen = (testType?: TestType) => {
    if (testType) {
      setEditing(testType);
      reset(testType);
    } else {
      setEditing(null);
      reset({ test_type_name: '', description: '', parameters: [] });
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
        setTestTypes(testTypes.map(t => t.id === editing.id ? { ...t, ...data } : t));
      } else {
        const newTestType: TestType = {
          id: Math.max(...testTypes.map(t => t.id), 0) + 1,
          ...data,
          parameters: [],
          created_at: new Date().toISOString(),
        };
        setTestTypes([...testTypes, newTestType]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving test type:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test type?')) {
      setTestTypes(testTypes.filter(t => t.id !== id));
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
              {editing ? `Edit Test Type` : 'Add Test Type'}
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Test Type Name"
                  fullWidth
                  variant="outlined"
                  {...register('test_type_name', { required: 'Test type name is required' })}
                  error={!!errors.test_type_name}
                  helperText={errors.test_type_name?.message as string}
                  disabled={readOnly}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  {...register('description', { required: 'Description is required' })}
                  error={!!errors.description}
                  helperText={errors.description?.message as string}
                  disabled={readOnly}
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
                    {editing ? 'Update' : 'Add'}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Search"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {!readOnly && (
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
            Add Test Type
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Type Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Parameters</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testTypes.map((testType) => (
                  <TableRow key={testType.id}>
                    <TableCell>{testType.test_type_name}</TableCell>
                    <TableCell>{testType.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {testType.parameters.map((paramId) => (
                          <Chip
                            key={paramId}
                            label={`Param ${paramId}`}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {!readOnly && (
                        <>
                          <IconButton size="small" onClick={() => handleOpen(testType)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(testType.id)}>
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

export default TestTypeConfig;
