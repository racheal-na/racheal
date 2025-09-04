import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { appointmentsAPI, casesAPI } from '../../services/api';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    caseId: ''
  });

  useEffect(() => {
    loadMyAppointments();
    loadMyCases();
  }, []);

  const loadMyAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      setError('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadMyCases = async () => {
    try {
      const response = await casesAPI.getAll();
      setCases(response.data.cases || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      await appointmentsAPI.create(formData);
      setOpenDialog(false);
      setFormData({ title: '', description: '', date: '', time: '', caseId: '' });
      loadMyAppointments();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating appointment request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'success';
      case 'Completed': return 'primary';
      case 'Cancelled': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const isUpcoming = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate >= today && appointment.status === 'Scheduled';
  };

  if (loading) {
    return <Typography>Loading your appointments...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Appointments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Request Appointment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Upcoming Appointments */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Upcoming Appointments
      </Typography>
      
      <Grid container spacing={3}>
        {appointments.filter(isUpcoming).map((appointment) => (
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
                  With: {appointment.adminId?.name || 'Lawyer'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Case: {appointment.caseId?.title || 'General Inquiry'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Location: {appointment.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Past Appointments */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Past Appointments
      </Typography>
      
      <Grid container spacing={3}>
        {appointments.filter(apt => !isUpcoming(apt)).map((appointment) => (
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
                  With: {appointment.adminId?.name || 'Lawyer'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request New Appointment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title *"
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
            label="Preferred Date *"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Preferred Time *"
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
            label="Related Case (Optional)"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAppointment} variant="contained">
            Request Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyAppointments;