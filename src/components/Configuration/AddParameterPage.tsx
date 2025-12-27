import React, { useEffect, useState } from 'react';
import { Box, Menu, MenuItem } from '@mui/material';
import { Typography, Button, Chip, TextField, IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import AddParameterPopup from './AddParameterPopup';
import { MoreHoriz } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { equipmentApi } from '@/services/api';
import { fetchClinic } from '@/store/clinicSlice';
import { useToast } from '../Common/ToastProvider';

const normalizeDropdownValue = (data: any): string[] => {
  if (Array.isArray(data)) {
    // Case 1: Already an array
    return data.map(String).filter(Boolean);
  }
  if (typeof data === 'string' && data.trim()) {
    // Case 2: Comma-separated string - split, trim, and filter out any empty results
    return data
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const AddParameterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { data: clinic } = useSelector((state: RootState) => state.clinic);

  const { equipmentName, departmentId, equipment, mode } =
    location.state as any;

  const departmentName =
    clinic?.department?.find((d) => d.id === departmentId)?.name ?? '';

  const [draftEquipmentName, setDraftEquipmentName] = useState(equipmentName);
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [openParamPopup, setOpenParamPopup] = useState(false);
  const [parameters, setParameters] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuParamIndex, setMenuParamIndex] = useState<number | null>(null);
  const open = Boolean(anchorEl);
  const equipmentQuantity = Array.from({ length: count }, (_, i) => i + 1);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [equipmentTable, setEquipmentTable] = useState<any[]>([]);
  const isEditMode = mode === 'edit';
  const editingEquipment = equipment;

  const [nextSrNo, setNextSrNo] = useState(1);

  const [paramToEdit, setParamToEdit] = useState<any>(null);
  const [editingParamIndex, setEditingParamIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!isEditMode || !editingEquipment) return;

    setDraftEquipmentName(editingEquipment.equipment_name);

    const table = editingEquipment.equipment_details.map((d: any) => {
      const num = Number(d.equipment_num.split('-').pop());
      return {
        id: d.id,
        sr: num,
        equipmentNum: num,
        make: d.make,
        model: d.model,
      };
    });

    setEquipmentTable(table);
    setCount(table.length);
    setNextSrNo(table.length + 1);

    const loadedParams = editingEquipment.parameters.map((p: any) => ({
      equipmentParameterId: p.id,
      name: p.parameter_name,
      dataType: p.parameter_values[0]?.content?.data_type,
      minValue: p.parameter_values[0]?.content?.min_value,
      maxValue: p.parameter_values[0]?.content?.max_value,
      dropdownValue: normalizeDropdownValue(
        p.parameter_values[0]?.content?.dropdown
      ),
    }));

    setParameters(loadedParams);
  }, [isEditMode, editingEquipment]);

  const toggleSelection = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num]
    );
  };

  // Watch for count changes and auto-adjust equipment table
  useEffect(() => {
    if (isEditMode) return;

    if (equipmentTable.length === 0) return;

    const currentMaxNum = Math.max(
      ...equipmentTable.map((row) => row.equipmentNum),
      0
    );

    if (count > currentMaxNum) {
      // add rows ONLY in add mode
      const newEntries: {
        sr: number;
        equipmentNum: number;
        make: string;
        model: string;
      }[] = [];

      for (let i = currentMaxNum + 1; i <= count; i++) {
        newEntries.push({
          sr: nextSrNo + newEntries.length,
          equipmentNum: i,
          make: '',
          model: '',
        });
      }

      if (newEntries.length) {
        setEquipmentTable((prev) => [...prev, ...newEntries]);
        setNextSrNo((prev) => prev + newEntries.length);
      }
    }

    if (count < currentMaxNum) {
      setEquipmentTable((prev) => prev.filter((r) => r.equipmentNum <= count));
      setSelected((prev) => prev.filter((n) => n <= count));
    }
  }, [count, isEditMode]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuParamIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuParamIndex(null);
  };

  const handleEditParameter = () => {
    if (menuParamIndex !== null) {
      const param = parameters[menuParamIndex];
      setParamToEdit(param);
      setEditingParamIndex(menuParamIndex);
      setOpenParamPopup(true);
    }
    handleClose();
  };

  const handleDeleteParameter = () => {
    if (menuParamIndex !== null) {
      setParameters((prev) => prev.filter((_, i) => i !== menuParamIndex));
    }
    handleClose();
  };

  const handleSaveEquipmentDetails = () => {
    if (!make.trim() || !model.trim()) {
      showToast('Please enter both Make and Model', 'error');
      return;
    }

    setEquipmentTable((prev) => {
      let updated = [...prev];
      let nextSr = nextSrNo;

      selected.forEach((num) => {
        const index = updated.findIndex((row) => row.equipmentNum === num);

        if (index >= 0) {
          // 🔁 UPDATE existing row
          updated[index] = {
            ...updated[index],
            make,
            model,
          };
        } else {
          // ➕ ADD new row
          updated.push({
            sr: nextSr,
            equipmentNum: num,
            make,
            model,
          });
          nextSr++;
        }
      });

      setNextSrNo(nextSr);
      return updated;
    });

    setMake('');
    setModel('');
    setSelected([]);
  };

  useEffect(() => {
    if (selected.length === 0) {
      setMake('');
      setModel('');
      return;
    }

    const selectedRows = equipmentTable.filter((row) =>
      selected.includes(row.equipmentNum)
    );

    // If nothing exists yet → blank (new rows)
    if (selectedRows.length === 0) {
      setMake('');
      setModel('');
      return;
    }

    const firstMake = selectedRows[0]?.make || '';
    const firstModel = selectedRows[0]?.model || '';

    const sameMake = selectedRows.every(
      (row) => (row.make || '') === firstMake
    );
    const sameModel = selectedRows.every(
      (row) => (row.model || '') === firstModel
    );

    setMake(sameMake ? firstMake : '');
    setModel(sameModel ? firstModel : '');
  }, [selected, equipmentTable]);

  const headerStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 600,
    color: '#4B5563',
    borderBottom: '1px solid #E5E7EB',
  };

  const cellStyle: React.CSSProperties = {
    padding: '10px',
    fontSize: '14px',
    color: '#4B5563',
  };

  const handleClearAll = () => {
    setSelected([]);
    setCount(1);
    setMake('');
    setModel('');
    setEquipmentTable([]);
    setParameters([]);
    setNextSrNo(1);
    // localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
  };

  const handleAddParameter = (data: any) => {
    if (editingParamIndex !== null) {
      // Update existing parameter
      setParameters((prev) =>
        prev.map((p, i) => (i === editingParamIndex ? data : p))
      );
      setEditingParamIndex(null);
      setParamToEdit(null);
    } else {
      // Add new parameter
      setParameters((prev) => [...prev, data]);
    }
    setOpenParamPopup(false);
  };

  const buildParameterContent = (p: any) => {
    switch (p.dataType) {
      case 'Decimal':
        return {
          data_type: 'Decimal',
          min_value: p.minValue,
          max_value: p.maxValue,
        };

      case 'Integer':
        return {
          data_type: 'Integer',
          integer_value: p.integerValue,
        };

      case 'Percentage':
        return {
          data_type: 'Percentage',
          percentage: p.percentageValue,
        };

      case 'Text':
        return {
          data_type: 'Text',
          text: p.textValue,
        };

      case 'Dropdown':
      case 'Select':
        return {
          data_type: p.dataType,
          dropdown: Array.isArray(p.dropdownValue)
            ? p.dropdownValue
            : normalizeDropdownValue(p.dropdownValue),
        };

      default:
        return { data_type: p.dataType };
    }
  };

  const draftEquipmentPayload = {
    equipment_name: draftEquipmentName,
    parameters: parameters.map((p) => ({
      parameter_name: p.name,
      is_active: true,
      parameter_values: [
        {
          content: buildParameterContent(p),
        },
      ],
    })),
    equipment_details: equipmentTable.map((row) => ({
      equipment_num: `${draftEquipmentName}-${row.sr}`,
      make: row.make,
      model: row.model,
    })),
  };

  const handleFinalSave = async () => {
    try {
      if (isEditMode) {
        await equipmentApi.update(
          departmentId,
          editingEquipment.id,
          draftEquipmentPayload
        );
      } else {
        await equipmentApi.create(departmentId, draftEquipmentPayload);
      }

      if (clinic?.id) await dispatch(fetchClinic(clinic.id));

      alert('Equipment created successfully');
      navigate('/configuration/equipment');
    } catch (err) {
      console.error(err);
      alert('Failed to save equipment');
    }
  };

  // Render parameter details based on data type (UPDATED LOGIC HERE)
  const renderParameterContent = (p: any) => {
    const dataType = p.dataType || p.data_type;

    switch (dataType) {
      case 'Min/Max':
      case 'Decimal':
        return (
          <Typography
            sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
          >
            Min {p.min_value || p.minValue} °C – Max {p.max_value || p.maxValue}{' '}
            °C
          </Typography>
        );

      case 'Integer':
        return (
          <Typography
            sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
          >
            Integer Value: {p.integerValue || p.integer_value}
          </Typography>
        );

      case 'Percentage':
        return (
          <Typography
            sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
          >
            Parameter Value: {p.percentageValue || p.percentage}
          </Typography>
        );

      case 'Text':
        return (
          <Typography
            sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
          >
            Text Value: {p.textValue || p.text}
          </Typography>
        );

      case 'Dropdown':
      case 'Select':
        // Since the useEffect now correctly populates p.dropdownValue as an array, use it directly
        let options = normalizeDropdownValue(
          p.dropdownValue ??
            p.dropdown ??
            p.content?.dropdown ??
            p.parameter_values?.[0]?.content?.dropdown
        );

        // Fallback for old data structure if p.dropdownValue is missing
        if (options.length === 0) {
          options = normalizeDropdownValue(p.selectedOptions || p.dropdown);
        }

        // Only show Selection if there are options
        if (options.length === 0) {
          return null;
        }

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              mt: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
            >
              Selection:
            </Typography>
            {options.map((val: any, i: number) => (
              <Chip
                key={i}
                label={String(val)}
                size='small'
                sx={{ background: '#F3F4F6' }}
              />
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ p: 1, background: '#FFFFFF', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/configuration/equipment')}
            sx={{
              width: '32px',
              height: '32px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: '18px', color: '#4B5563' }} />
          </IconButton>

          <Typography sx={{ fontWeight: 700, fontSize: '20px' }}>
            {isEditMode ? 'Edit Equipment' : 'Add Equipment'}
          </Typography>
        </Box>

        <Box sx={{ height: '1px', background: '#E5E7EB', mt: 2, mb: 2 }}></Box>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {draftEquipmentName}
          <Chip
            label={departmentName}
            sx={{
              background: '#E0F1E6',
              color: '#3D8B61',
              fontWeight: 600,
              height: '22px',
            }}
          />
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
            Parameters (e.g. Temperature)
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => {
              setParamToEdit(null);
              setEditingParamIndex(null);
              setOpenParamPopup(true);
            }}
          >
            <Typography sx={{ color: '#2563EB', fontSize: '14px' }}>
              +
            </Typography>
            <Typography
              sx={{ color: '#2563EB', fontSize: '14px', fontWeight: 500 }}
            >
              Add Parameters
            </Typography>
          </Box>
        </Box>

        {parameters.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {parameters.map((p, index) => (
              <Box
                key={index}
                sx={{
                  width: '260px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  p: 2,
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {/* Header row */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                    {p.name || p.parameter_name}
                  </Typography>

                  {/* 3 dots menu button */}
                  <IconButton
                    size='small'
                    onClick={(e) => handleMenuOpen(e, index)}
                    sx={{
                      padding: '4px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                    }}
                  >
                    <MoreHoriz sx={{ fontSize: '18px', color: '#6B7280' }} />
                  </IconButton>
                </Box>

                {/* Data Type */}
                <Typography
                  sx={{ fontSize: '12px', color: '#6B7280', mt: 0.5 }}
                >
                  Data Type : {p.dataType || p.data_type}
                </Typography>

                {/* Divider */}
                <Box
                  sx={{
                    height: '1px',
                    background: '#E5E7EB',
                    mt: 1.2,
                    mb: 1.2,
                  }}
                />

                {/* Render content based on data type */}
                {renderParameterContent(p)}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height: '1px', background: '#E5E7EB', mt: 2 }}></Box>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
              #No. of {draftEquipmentName}s :
            </Typography>

            {/* Minus Button */}
            <Button
              variant='outlined'
              onClick={() => setCount((c) => (c > 1 ? c - 1 : c))}
              sx={{
                minWidth: '38px',
                height: '32px',
                borderRadius: '8px',
                color: '#565656',
                borderColor: '#CFCFCF',
                textTransform: 'none',
                fontSize: '20px',
                fontWeight: 500,
                px: 0,
              }}
            >
              –
            </Button>

            {/* Value Box */}
            <Box
              sx={{
                width: '48px',
                height: '32px',
                border: '1px solid #CFCFCF',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 600,
                color: '#565656',
                background: '#FFFFFF',
                fontSize: '14px',
              }}
            >
              {String(count).padStart(2, '0')}
            </Box>

            {/* Plus Button */}
            <Button
              variant='outlined'
              onClick={() => setCount((c) => c + 1)}
              sx={{
                minWidth: '38px',
                height: '32px',
                borderRadius: '8px',
                color: '#565656',
                borderColor: '#CFCFCF',
                textTransform: 'none',
                fontSize: '20px',
                fontWeight: 500,
                px: 0,
              }}
            >
              +
            </Button>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '14px', fontWeight: 600, mt: 3 }}>
          Select {draftEquipmentName}s
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          {equipmentQuantity.map((num) => (
            <Box
              key={num}
              onClick={() => toggleSelection(num)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                borderColor: '#E2E3E5',
                background: '#FAFAFA',
                transition: '0.2s',
              }}
            >
              {selected.includes(num) ? (
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    background: '#DEEFE1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width='13'
                    height='13'
                    fill='#3D8B61'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20.285 6.708l-11.285 11.292-5.285-5.292 1.414-1.414 3.871 3.879 9.871-9.878z' />
                  </svg>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: '1.8px solid #D1D5DB',
                  }}
                />
              )}

              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4B5563',
                }}
              >
                {draftEquipmentName} {num}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Details Section Title */}
        {selected.length > 0 && (
          <Typography
            sx={{
              mt: 4,
              fontSize: '15px',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Details of{' '}
            {selected.map((n) => `${draftEquipmentName} ${n}`).join(', ')}
          </Typography>
        )}

        {/* Make & Model Inputs */}
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <TextField
              placeholder='Enter Make'
              label='Make'
              value={make}
              onChange={(e) => setMake(e.target.value)}
              fullWidth
              size='small'
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { color: '#5F646F !important' },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#5F646F !important',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#CFD1D4' },
                  '&:hover fieldset': { borderColor: '#CFD1D4' },
                  '&.Mui-focused fieldset': { borderColor: '#CFD1D4' },
                },
                '& .MuiInputBase-input': { color: '#5F646F' },
              }}
            />

            <TextField
              placeholder='Enter Model'
              label='Model'
              value={model}
              onChange={(e) => setModel(e.target.value)}
              fullWidth
              size='small'
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputLabel-root': { color: '#5F646F !important' },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#5F646F !important',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#CFD1D4' },
                  '&:hover fieldset': { borderColor: '#CFD1D4' },
                  '&.Mui-focused fieldset': { borderColor: '#CFD1D4' },
                },
                '& .MuiInputBase-input': { color: '#5F646F' },
              }}
            />
          </Box>
        )}
        {selected.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              onClick={handleSaveEquipmentDetails}
              sx={{
                borderRadius: '8px',
                background: '#383838',
                textTransform: 'none',
                '&:hover': { background: '#2f2f2f' },
              }}
            >
              Save
            </Button>
          </Box>
        )}
        {equipmentTable.length > 0 && (
          <Box
            sx={{
              mt: 4,
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', height: '42px' }}>
                  <th style={headerStyle}>Sr. No.</th>
                  <th style={headerStyle}>{draftEquipmentName} Name</th>
                  <th style={headerStyle}>Make</th>
                  <th style={headerStyle}>Model</th>
                </tr>
              </thead>

              <tbody>
                {equipmentTable.map((row) => (
                  <tr
                    key={row.sr}
                    style={{ height: '42px', borderTop: '1px solid #E5E7EB' }}
                  >
                    <td style={cellStyle}>{row.sr}</td>
                    <td style={cellStyle}>
                      {draftEquipmentName} {row.equipmentNum}
                    </td>
                    <td style={cellStyle}>{row.make}</td>
                    <td style={cellStyle}>{row.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
        <Box
          sx={{ mt: 10, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
        >
          <Button
            variant='outlined'
            onClick={handleClearAll}
            sx={{
              borderRadius: '10px',
              borderColor: '#505050',
              '&:hover': { borderColor: '#505050', backgroundColor: 'white' },
              color: '#505050',
              textTransform: 'none',
            }}
          >
            Clear All
          </Button>
          <Button
            variant='contained'
            onClick={handleFinalSave}
            sx={{
              borderRadius: '10px',
              background: '#383838',
              textTransform: 'none',
              '&:hover': { background: '#2f2f2f' },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '96px',
            borderRadius: '8px',
            ml: '-60px',
            mt: '10px',
            boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem
          onClick={handleEditParameter}
          sx={{
            width: '96px',
            height: '33px',
            p: '8px',
            gap: '6px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteParameter}
          sx={{ width: '96px', height: '33px', p: '8px', gap: '6px' }}
        >
          Delete
        </MenuItem>
      </Menu>
      <AddParameterPopup
        open={openParamPopup}
        onClose={() => {
          setOpenParamPopup(false);
          setParamToEdit(null);
          setEditingParamIndex(null);
        }}
        onAdd={handleAddParameter}
        initialData={paramToEdit}
      />
    </Box>
  );
};

export default AddParameterPage;
