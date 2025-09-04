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
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { appointmentsAPI, casesAPI } from '../../../services/api';

function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    clientId: '',
    caseId: '',
    location: 'Office'
  });

  useEffect(() => {
    loadAppointments();
    loadClients();
    loadCases();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      setError('Error loading appointments');
    }
  };

  const loadClients = async () => {
    try {
      // Mock clients data
      const mockClients = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];
      setClients(mockClients);
    } catch (error) {
      setError('Error loading clients');
    }
  };

  const loadCases = async () => {
    try {
      const response = await casesAPI.getAll();
      setCases(response.data.cases || []);
    } catch (error) {
      setError('Error loading cases');
    }
  };

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      await appointmentsAPI.create(formData);
      setOpenDialog(false);
      setFormData({ 
        title: '', 
        description: '', 
        date: '', 
        time: '', 
        clientId: '', 
        caseId: '',
        location: 'Office'
      });
      loadAppointments();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating appointment');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Appointment Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Appointment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {appointment.title}
                  </Typography>
                  <Chip 
                    label={appointment.status} 
                    size="small" 
                    color={getStatusColor(appointment.status)} 
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </Typography>
                <Typography variant="body2" paragraph>
                  {appointment.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Client: {appointment.clientId?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Case: {appointment.caseId?.title || 'None'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Location: {appointment.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Time"
            type="time"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Client"
            fullWidth
            variant="outlined"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          >
            {clients.map((client) => (
              <MenuItem key={client._id} value={client._id}>
                {client.name} ({client.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            select
            label="Case (Optional)"
            fullWidth
            variant="outlined"
            value={formData.caseId}
            onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
          >
            <MenuItem value="">None</MenuItem>
            {cases.map((caseItem) => (
              <MenuItem key={caseItem._id} value={caseItem._id}>
                {caseItem.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            select
            label="Location"
            fullWidth
            variant="outlined"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          >
            <MenuItem value="Office">Office</MenuItem>
            <MenuItem value="Virtual">Virtual Meeting</MenuItem>
            <MenuItem value="Court">Court</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAppointment} variant="contained" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AppointmentManagement;