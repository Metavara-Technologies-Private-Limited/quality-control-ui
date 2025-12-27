import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { MoreHoriz } from '@mui/icons-material';
import ViewIcon from '@/assets/icons/eye.jpg';

import { useNavigate } from 'react-router-dom';
import AddEquipmentPopup from './AddEquipmentPopup';
import { equipmentApi } from '@/services/api';
import { fetchClinic } from '@/store/clinicSlice';

const EquipmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { data: clinic, loading } = useSelector(
    (state: RootState) => state.clinic
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null
  );
  const open = Boolean(anchorEl);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [openAddEquipmentPopup, setOpenAddEquipmentPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <div>Loading...</div>;
  if (!clinic) return <div>No data</div>;

  const equipments = clinic.department.flatMap((dep) =>
    dep.equipments.map((eq) => ({
      ...eq,
      department: dep,
    }))
  );

  const filteredEquipments = equipments.filter((item) =>
    item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCreatedDate = (dateString?: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString.replace(' ', 'T'));
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  };

  const handleDeleteEquipment = (equipmentId: number) => {
    setSelectedEquipmentId(equipmentId);
    setShowDeleteDialog(true);
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    if (!selectedEquipmentId) return;

    try {
      const equipment = equipments.find((e) => e.id === selectedEquipmentId);
      if (!equipment) return;

      await equipmentApi.delete(equipment.department.id, equipment.id);

      dispatch(fetchClinic(clinic.id));
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setShowDeleteDialog(false);
      setSelectedEquipmentId(null);
    }
  };

  const handleInactiveEquipment = (equipmentId: number) => {
    setSelectedEquipmentId(equipmentId);
    setShowInactiveDialog(true);
    setAnchorEl(null);
  };

  const confirmInactive = async () => {
    if (!selectedEquipmentId) return;

    try {
      const equipment = equipments.find((e) => e.id === selectedEquipmentId);
      if (!equipment) return;

      await equipmentApi.inactive(equipment.department.id, equipment.id);

      dispatch(fetchClinic(clinic.id));
    } catch (err) {
      console.error('Inactivate failed', err);
    } finally {
      setShowInactiveDialog(false);
      setSelectedEquipmentId(null);
    }
  };

  const handleActiveEquipment = (equipmentId: number) => {
    setSelectedEquipmentId(equipmentId);
    setShowActivateDialog(true);
    setAnchorEl(null);
  };

  const confirmActivate = async () => {
    if (!selectedEquipmentId) return;

    try {
      const equipment = equipments.find((e) => e.id === selectedEquipmentId);
      if (!equipment) return;

      await equipmentApi.activate(equipment.department.id, equipment.id);

      dispatch(fetchClinic(clinic.id));
    } catch (err) {
      console.error('Activate failed', err);
    } finally {
      setShowActivateDialog(false);
      setSelectedEquipmentId(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '20px' }}>
          Equipments
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size='small'
            variant='outlined'
            InputLabelProps={{ shrink: true }}
            placeholder='Search Equipments'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 260, background: '#fff' }}
          />

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setOpenAddEquipmentPopup(true)}
            sx={{
              background: '#505050',
              '&:hover': { background: '#505050' },
            }}
          >
            Add Equipments
          </Button>
        </Box>
      </Box>

      {/* Cards */}
      <Grid container spacing={2}>
        {filteredEquipments.map((item) => {
          const isInactive = item.is_active === false;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  boxShadow: 'none',
                  opacity: isInactive ? 0.5 : 1,
                  backgroundColor: isInactive ? '#F5F5F5' : '#fff',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Status Badge Top-Right */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: isInactive ? '#ffcccc' : '#d4f8d4',
                    color: isInactive ? '#b30000' : '#008000',
                    fontSize: '10px',
                    fontWeight: 700,
                    px: 1.3,
                    py: 0.5,
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {isInactive ? 'Inactive' : 'Active'}
                </Box>

                <CardContent sx={{ pb: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                    <b>{item.equipment_name}</b>
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                        Department:
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        <b>{item.department?.name}</b>
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                        Parameters:
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>
                        <b>{item.parameters.length}</b>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ height: 1, background: '#E5E7EB', mx: 2 }} />

                {/* Bottom Icons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    pt: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 14, color: '#4B5563', gap: 1, mr: 1 }}
                  >
                    <span style={{ color: '#9CA3AF' }}>Created:</span>{' '}
                    <b> {getCreatedDate(item.created_at)}</b>
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() =>
                        navigate('/configuration/equipment/view', {
                          state: { equipment: item },
                        })
                      }
                      sx={{
                        width: 32,
                        height: 32,
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                      }}
                    >
                      <img
                        src={ViewIcon}
                        alt='view'
                        style={{ width: 18, height: 18 }}
                      />
                    </IconButton>

                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedEquipmentId(item.id);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        border: isInactive
                          ? '2px solid #ffffffff'
                          : '1px solid #E5E7EB',
                        borderRadius: '8px',
                        backgroundColor: isInactive ? '#505050' : '#fff',
                        '&:hover': {
                          backgroundColor: isInactive
                            ? '#000000ff'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <MoreHoriz
                        fontSize='small'
                        sx={{
                          color: isInactive ? '#ffffffff' : 'inherit',
                          fontWeight: isInactive ? 700 : 400,
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {selectedEquipmentId &&
          (() => {
            const eq = equipments.find((e) => e.id === selectedEquipmentId);
            const isInactive = eq?.is_active === false;

            return isInactive ? (
              <MenuItem
                onClick={() => handleActiveEquipment(selectedEquipmentId)}
              >
                Activate
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => handleInactiveEquipment(selectedEquipmentId)}
              >
                Inactivate
              </MenuItem>
            );
          })()}

        <MenuItem
          onClick={() =>
            selectedEquipmentId && handleDeleteEquipment(selectedEquipmentId)
          }
          sx={{ color: '#d32f2f' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inactive Dialog */}
      <Dialog
        open={showInactiveDialog}
        onClose={() => setShowInactiveDialog(false)}
      >
        <DialogTitle>Confirm Inactivate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to inactivate this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInactiveDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmInactive}
            variant='contained'
            sx={{ background: 'red', '&:hover': { background: 'red' } }}
          >
            Inactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog
        open={showActivateDialog}
        onClose={() => setShowActivateDialog(false)}
      >
        <DialogTitle>Confirm Activate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to activate this equipment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActivateDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmActivate}
            variant='contained'
            sx={{ background: '#4caf50', '&:hover': { background: '#45a049' } }}
          >
            Activate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment Popup */}
      <AddEquipmentPopup
        open={openAddEquipmentPopup}
        onClose={() => setOpenAddEquipmentPopup(false)}
      />
    </Box>
  );
};

export default EquipmentPage;
