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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import type { Parameter, Equipment, ParameterContent } from '@/types';

interface ParameterConfigProps {
  readOnly?: boolean;
}

const ParameterConfig: React.FC<ParameterConfigProps> = ({ readOnly = false }) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Parameter | null>(null);
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

  useEffect(() => {
    loadParameters();
    loadEquipments();
  }, []);

  const loadParameters = async () => {
    try {
      const { mockParameters } = await import('@/utils/mockData');
      setParameters(mockParameters);
    } catch (error) {
      console.error('Error loading parameters:', error);
    }
  };

  const loadEquipments = async () => {
    try {
      const { mockEquipments } = await import('@/utils/mockData');
      setEquipments(mockEquipments);
    } catch (error) {
      console.error('Error loading equipments:', error);
    }
  };

  const handleOpen = (parameter?: Parameter) => {
    if (parameter) {
      setEditing(parameter);
      reset({
        ...parameter,
        min_value: parameter.Content.min_value,
        max_value: parameter.Content.max_value,
        unit: parameter.Content.unit,
        warning_min: parameter.Content.control_limits.warning_min,
        warning_max: parameter.Content.control_limits.warning_max,
        critical_min: parameter.Content.control_limits.critical_min,
        critical_max: parameter.Content.control_limits.critical_max,
      });
    } else {
      setEditing(null);
      reset({
        parameter_name: '',
        equipment_id: '',
        is_active: true,
        min_value: '',
        max_value: '',
        unit: '',
        warning_min: '',
        warning_max: '',
        critical_min: '',
        critical_max: '',
      });
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
      const content: ParameterContent = {
        min_value: parseFloat(data.min_value),
        max_value: parseFloat(data.max_value),
        default_value: data.default_value ? parseFloat(data.default_value) : undefined,
        unit: data.unit,
        control_limits: {
          warning_min: parseFloat(data.warning_min),
          warning_max: parseFloat(data.warning_max),
          critical_min: parseFloat(data.critical_min),
          critical_max: parseFloat(data.critical_max),
        },
      };

      const equipment = equipments.find(e => e.id === parseInt(data.equipment_id));

      if (editing) {
        setParameters(parameters.map(p =>
          p.id === editing.id
            ? { ...p, ...data, equipment_id: parseInt(data.equipment_id), Content: content, equipment }
            : p
        ));
      } else {
        const newParam: Parameter = {
          id: Math.max(...parameters.map(p => p.id), 0) + 1,
          parameter_name: data.parameter_name,
          equipment_id: parseInt(data.equipment_id),
          is_active: data.is_active,
          Content: content,
          created_at: new Date().toISOString(),
          equipment,
        };
        setParameters([...parameters, newParam]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving parameter:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      setParameters(parameters.filter(p => p.id !== id));
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
              {editing ? `Edit Parameter` : 'Add Parameter'}
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Parameter Name"
                    {...register('parameter_name', { required: 'Parameter name is required' })}
                    error={!!errors.parameter_name}
                    helperText={errors.parameter_name?.message as string}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Equipment</InputLabel>
                    <Select
                      label="Equipment"
                      {...register('equipment_id', { required: 'Equipment is required' })}
                      defaultValue={editing?.equipment_id || ''}
                      disabled={readOnly}
                    >
                      {equipments.map((equipment) => (
                        <MenuItem key={equipment.id} value={equipment.id}>
                          {equipment.equipment_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Value"
                    type="number"
                    {...register('min_value', { required: 'Min value is required' })}
                    error={!!errors.min_value}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Value"
                    type="number"
                    {...register('max_value', { required: 'Max value is required' })}
                    error={!!errors.max_value}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Unit"
                    {...register('unit', { required: 'Unit is required' })}
                    error={!!errors.unit}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Default Value"
                    type="number"
                    {...register('default_value')}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked {...register('is_active')} disabled={readOnly} />}
                    label="Active"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Control Limits
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Warning Min"
                    type="number"
                    {...register('warning_min', { required: true })}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Warning Max"
                    type="number"
                    {...register('warning_max', { required: true })}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Critical Min"
                    type="number"
                    {...register('critical_min', { required: true })}
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Critical Max"
                    type="number"
                    {...register('critical_max', { required: true })}
                    disabled={readOnly}
                  />
                </Grid>
              </Grid>

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
            Add Parameter
          </Button>
        </Box>
      )}

      <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parameter Name</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Min Value</TableCell>
                  <TableCell>Max Value</TableCell>
                  <TableCell>Default Value</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parameters.map((param) => (
                  <TableRow key={param.id}>
                    <TableCell>{param.parameter_name}</TableCell>
                    <TableCell>{param.Content.unit}</TableCell>
                    <TableCell>{param.Content.min_value}</TableCell>
                    <TableCell>{param.Content.max_value}</TableCell>
                    <TableCell>{param.Content.default_value || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {!readOnly && (
                        <>
                          <IconButton size="small" onClick={() => handleOpen(param)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(param.id)}>
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

export default ParameterConfig;
