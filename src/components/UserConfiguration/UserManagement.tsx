import { useState, useEffect } from 'react';
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
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';

interface User {
  id: number;
  user_name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Mock data
    setUsers([
      {
        id: 1,
        user_name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
        status: 'active',
      },
      {
        id: 2,
        user_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Lab Manager',
        status: 'active',
      },
      {
        id: 3,
        user_name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        role: 'Technician',
        status: 'active',
      },
      {
        id: 4,
        user_name: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        role: 'Viewer',
        status: 'inactive',
      },
      {
        id: 5,
        user_name: 'David Brown',
        email: 'david.brown@example.com',
        role: 'Technician',
        status: 'active',
      },
    ]);
  };

  const handleOpen = (user?: User) => {
    if (user) {
      setEditing(user);
      reset(user);
    } else {
      setEditing(null);
      reset({ user_name: '', email: '', role: '', status: 'active' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        setUsers(users.map(u => u.id === editing.id ? { ...u, ...data } : u));
      } else {
        const newUser: User = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          ...data,
        };
        setUsers([...users, newUser]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter((user) =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Search by User Name, Email, or Role"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{
            backgroundColor: '#14b8a6',
            '&:hover': { backgroundColor: '#0d9488' },
          }}
        >
          Add User
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.user_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'default'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(user.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#6b7280' }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="User Name"
              fullWidth
              variant="outlined"
              {...register('user_name', { required: 'User name is required' })}
              error={!!errors.user_name}
              helperText={errors.user_name?.message as string}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              type="email"
              variant="outlined"
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message as string}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                {...register('role', { required: 'Role is required' })}
                defaultValue={editing?.role || ''}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Lab Manager">Lab Manager</MenuItem>
                <MenuItem value="Technician">Technician</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                {...register('status')}
                defaultValue={editing?.status || 'active'}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#14b8a6' }}>
              {editing ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

