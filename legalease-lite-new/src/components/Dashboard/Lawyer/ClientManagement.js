
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { authAPI, casesAPI } from '../../../services/api';

function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientCases, setClientCases] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // In a real app, you would have an API endpoint to get all clients
      // For now, we'll simulate this by getting all users with role 'client'
      const response = await authAPI.getUsers(); // This endpoint would need to be created
      setClients(response.data.users || []);
    } catch (error) {
      setError('Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  const loadClientCases = async (clientId) => {
    try {
      const response = await casesAPI.getAll();
      const clientCases = response.data.cases.filter(caseItem => caseItem.clientId === clientId);
      setClientCases(clientCases);
    } catch (error) {
      console.error('Error loading client cases:', error);
    }
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    await loadClientCases(client._id);
    setOpenViewDialog(true);
  };

  const handleCreateClient = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setError(formErrors[Object.keys(formErrors)[0]]);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'client',
        isActive: formData.isActive
      };

      // Create client (this would use a special admin endpoint)
      await authAPI.createUser(clientData);
      
      setSuccess('Client created successfully');
      setOpenDialog(false);
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', isActive: true });
      loadClients();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating client');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClientStatus = async (clientId, isActive) => {
    try {
      await authAPI.updateUserStatus(clientId, isActive);
      setSuccess(`Client ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadClients();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error updating client status');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

try {
      await authAPI.deleteUser(clientId);
      setSuccess('Client deleted successfully');
      loadClients();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error deleting client');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    return errors;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Client Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Client
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cases</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>
                  <Typography variant="subtitle2">{client.name}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    {client.email}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    {client.phone || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(client.isActive)} 
                    size="small" 
                    color={getStatusColor(client.isActive)} 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={client.caseCount || 0} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewClient(client)}
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleUpdateClientStatus(client._id, !client.isActive)}
                    size="small"


>
                    <Switch checked={client.isActive} size="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClient(client._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {clients.length === 0 && !loading && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography textAlign="center" color="textSecondary">
              No clients found. Add your first client to get started.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add Client Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name *"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email Address *"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number *"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password *"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm Password *"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Active Account"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateClient} 
            variant="contained" 
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Client'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Client Details</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedClient.name}</Typography>

</Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{selectedClient.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{selectedClient.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip 
                    label={getStatusText(selectedClient.isActive)} 
                    size="small" 
                    color={getStatusColor(selectedClient.isActive)} 
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Cases ({clientCases.length})
              </Typography>
              
              {clientCases.length === 0 ? (
                <Typography color="textSecondary">No cases found for this client.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Case Title</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientCases.map((caseItem) => (
                        <TableRow key={caseItem._id}>
                          <TableCell>{caseItem.title}</TableCell>
                          <TableCell>
                            <Chip label={caseItem.category} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={caseItem.status} 
                              size="small" 
                              color={
                                caseItem.status === 'Open' ? 'primary' :
                                caseItem.status === 'Closed' ? 'default' :
                                caseItem.status === 'In Progress' ? 'secondary' : 'warning'
                              } 
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(caseItem.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClientManagement;