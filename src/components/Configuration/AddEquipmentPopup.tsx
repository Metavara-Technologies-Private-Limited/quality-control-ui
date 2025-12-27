import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
  IconButton,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddEquipmentPopup: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic?.department ?? [];

  const [equipmentName, setEquipmentName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const tempEquipmentId = crypto.randomUUID();

  const handleAdd = () => {
    if (!equipmentName || !departmentId) {
      alert('Please enter all fields');
      return;
    }
    onClose();
    navigate('/configuration/equipment/add-parameter', {
      state: {
        tempEquipmentId,
        equipmentName,
        departmentId,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          '& .MuiDialogTitle-root + .MuiDialogContent-root': { pt: '6px' },
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Add Equipments
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label='Equipment Name'
          fullWidth
          variant='outlined'
          size='small'
          value={equipmentName}
          onChange={(e) => setEquipmentName(e.target.value)}
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
          label='Department'
          select
          fullWidth
          size='small'
          variant='outlined'
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(Number(e.target.value));
          }}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiInputLabel-root': { color: '#5F646F !important' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#CFD1D4' },
              '&:hover fieldset': { borderColor: '#CFD1D4' },
              '&.Mui-focused fieldset': { borderColor: '#CFD1D4' },
            },
          }}
        >
          {departments
            .filter((d) => d.is_active)
            .map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
        </TextField>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}
        >
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{
              color: '#505050',
              width: '100px',
              borderRadius: '10px',
              borderColor: '#505050',
              '&:hover': { borderColor: '#505050', backgroundColor: 'white' },
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleAdd}
            sx={{
              width: '100px',
              borderRadius: '10px',
              background: '#383838',
              textTransform: 'none',
              '&:hover': { background: '#2f2f2f' },
            }}
            disabled={!equipmentName || !departmentId}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentPopup;
